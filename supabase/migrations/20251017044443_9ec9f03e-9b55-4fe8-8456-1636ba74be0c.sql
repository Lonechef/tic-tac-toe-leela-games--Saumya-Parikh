-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create game status enum
CREATE TYPE game_status AS ENUM ('waiting', 'active', 'finished');

-- Create games table
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_x UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  player_o UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  current_turn TEXT DEFAULT 'X',
  board JSONB DEFAULT '["","","","","","","","",""]',
  status game_status DEFAULT 'waiting',
  winner UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  winner_symbol TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Games policies
CREATE POLICY "Users can view all games"
  ON public.games FOR SELECT
  USING (true);

CREATE POLICY "Users can create games"
  ON public.games FOR INSERT
  WITH CHECK (auth.uid() = player_x OR auth.uid() = player_o);

CREATE POLICY "Players can update their games"
  ON public.games FOR UPDATE
  USING (auth.uid() = player_x OR auth.uid() = player_o);

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on leaderboard
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Leaderboard policies
CREATE POLICY "Users can view leaderboard"
  ON public.leaderboard FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own leaderboard entry"
  ON public.leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leaderboard"
  ON public.leaderboard FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update leaderboard when game finishes
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'finished' AND OLD.status != 'finished' THEN
    -- Update player X stats
    IF NEW.player_x IS NOT NULL THEN
      INSERT INTO public.leaderboard (user_id, total_games, wins, losses, draws)
      VALUES (
        NEW.player_x,
        1,
        CASE WHEN NEW.winner = NEW.player_x THEN 1 ELSE 0 END,
        CASE WHEN NEW.winner IS NOT NULL AND NEW.winner != NEW.player_x THEN 1 ELSE 0 END,
        CASE WHEN NEW.winner IS NULL THEN 1 ELSE 0 END
      )
      ON CONFLICT (user_id) DO UPDATE SET
        total_games = leaderboard.total_games + 1,
        wins = leaderboard.wins + CASE WHEN NEW.winner = NEW.player_x THEN 1 ELSE 0 END,
        losses = leaderboard.losses + CASE WHEN NEW.winner IS NOT NULL AND NEW.winner != NEW.player_x THEN 1 ELSE 0 END,
        draws = leaderboard.draws + CASE WHEN NEW.winner IS NULL THEN 1 ELSE 0 END,
        updated_at = NOW();
    END IF;

    -- Update player O stats
    IF NEW.player_o IS NOT NULL THEN
      INSERT INTO public.leaderboard (user_id, total_games, wins, losses, draws)
      VALUES (
        NEW.player_o,
        1,
        CASE WHEN NEW.winner = NEW.player_o THEN 1 ELSE 0 END,
        CASE WHEN NEW.winner IS NOT NULL AND NEW.winner != NEW.player_o THEN 1 ELSE 0 END,
        CASE WHEN NEW.winner IS NULL THEN 1 ELSE 0 END
      )
      ON CONFLICT (user_id) DO UPDATE SET
        total_games = leaderboard.total_games + 1,
        wins = leaderboard.wins + CASE WHEN NEW.winner = NEW.player_o THEN 1 ELSE 0 END,
        losses = leaderboard.losses + CASE WHEN NEW.winner IS NOT NULL AND NEW.winner != NEW.player_o THEN 1 ELSE 0 END,
        draws = leaderboard.draws + CASE WHEN NEW.winner IS NULL THEN 1 ELSE 0 END,
        updated_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update leaderboard
CREATE TRIGGER on_game_finished
  AFTER UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION update_leaderboard();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_updated_at
  BEFORE UPDATE ON public.leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for games table
ALTER TABLE public.games REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;