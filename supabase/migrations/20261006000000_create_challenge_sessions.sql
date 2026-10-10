-- Migration: Create challenge_sessions table for time-based challenges
-- This table tracks active and historical challenge sessions for users

CREATE TABLE IF NOT EXISTS challenge_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_type TEXT NOT NULL CHECK (challenge_type IN ('low_mastery', 'region', 'class')),
    challenge_config JSONB NOT NULL DEFAULT '{}',
    -- Challenge configuration examples:
    -- low_mastery: { "mastery_threshold": 10000 }
    -- region: { "region": "Demacia" }
    -- class: { "class": "Assassin" }
    
    duration_hours INT NOT NULL CHECK (duration_hours IN (3, 5)),
    xp_multiplier DECIMAL(3,2) NOT NULL DEFAULT 2.00,
    
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'failed')),
    
    valid_wins INT NOT NULL DEFAULT 0,
    bonus_xp INT NOT NULL DEFAULT 0,
    total_base_xp INT NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_challenge_sessions_user_status 
    ON challenge_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_challenge_sessions_expires_at 
    ON challenge_sessions(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_challenge_sessions_user_created 
    ON challenge_sessions(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE challenge_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for everyone" ON challenge_sessions;
DROP POLICY IF EXISTS "Users can insert own challenge_sessions" ON challenge_sessions;
DROP POLICY IF EXISTS "Users can update own challenge_sessions" ON challenge_sessions;

CREATE POLICY "Enable read for everyone"
ON challenge_sessions
FOR SELECT
USING (true);

CREATE POLICY "Users can insert own challenge_sessions"
ON challenge_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge_sessions"
ON challenge_sessions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_challenge_sessions_updated_at ON challenge_sessions;
CREATE TRIGGER update_challenge_sessions_updated_at
    BEFORE UPDATE ON challenge_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check and expire active challenge sessions
-- This can be called via cron job or edge function
CREATE OR REPLACE FUNCTION expire_challenge_sessions()
RETURNS INT AS $$
DECLARE
    expired_count INT := 0;
BEGIN
    UPDATE challenge_sessions
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' AND expires_at <= NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's active challenge session (enforces single active challenge)
CREATE OR REPLACE FUNCTION get_active_challenge_session(p_user_id UUID)
RETURNS SETOF challenge_sessions AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM challenge_sessions
    WHERE user_id = p_user_id 
    AND status = 'active'
    AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can start a new challenge (no active challenge)
CREATE OR REPLACE FUNCTION can_start_challenge(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    active_count INT;
BEGIN
    SELECT COUNT(*) INTO active_count
    FROM challenge_sessions
    WHERE user_id = p_user_id 
    AND status = 'active'
    AND expires_at > NOW();
    
    RETURN active_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION expire_challenge_sessions() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_active_challenge_session(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION can_start_challenge(UUID) TO authenticated, service_role;