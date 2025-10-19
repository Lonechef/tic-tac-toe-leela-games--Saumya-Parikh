-- Add name column to games table
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Unnamed Game';

-- Update the RLS policy if needed (the existing policies already cover this)
COMMENT ON COLUMN public.games.name IS 'Display name for the game';