-- Fix security issue: Set search_path on functions
-- Update the update_leaderboard function
CREATE OR REPLACE FUNCTION public.update_leaderboard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
        total_games = public.leaderboard.total_games + 1,
        wins = public.leaderboard.wins + CASE WHEN NEW.winner = NEW.player_x THEN 1 ELSE 0 END,
        losses = public.leaderboard.losses + CASE WHEN NEW.winner IS NOT NULL AND NEW.winner != NEW.player_x THEN 1 ELSE 0 END,
        draws = public.leaderboard.draws + CASE WHEN NEW.winner IS NULL THEN 1 ELSE 0 END,
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
        total_games = public.leaderboard.total_games + 1,
        wins = public.leaderboard.wins + CASE WHEN NEW.winner = NEW.player_o THEN 1 ELSE 0 END,
        losses = public.leaderboard.losses + CASE WHEN NEW.winner IS NOT NULL AND NEW.winner != NEW.player_o THEN 1 ELSE 0 END,
        draws = public.leaderboard.draws + CASE WHEN NEW.winner IS NULL THEN 1 ELSE 0 END,
        updated_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Update the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;