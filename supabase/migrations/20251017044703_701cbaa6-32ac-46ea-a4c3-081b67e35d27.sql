-- Add foreign key constraint from leaderboard to profiles
ALTER TABLE public.leaderboard
DROP CONSTRAINT IF EXISTS leaderboard_user_id_fkey;

ALTER TABLE public.leaderboard
ADD CONSTRAINT leaderboard_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;