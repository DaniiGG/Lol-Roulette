ALTER TABLE challenge_sessions
ADD COLUMN IF NOT EXISTS processed_matches JSONB NOT NULL DEFAULT '[]'::jsonb;

NOTIFY pgrst, 'reload schema';