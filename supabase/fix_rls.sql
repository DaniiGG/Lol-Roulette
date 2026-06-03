-- ============================================
-- FIX: RLS policies
-- Public anon key can read safe public data only.
-- Writes are handled by Next.js API routes with the service role key.
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- 1. challenges: public read, no anon writes.
DROP POLICY IF EXISTS "Users can create own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can update own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can delete own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can view own challenges" ON challenges;
DROP POLICY IF EXISTS "Enable all for anon key" ON challenges;
DROP POLICY IF EXISTS "Enable read for everyone" ON challenges;

CREATE POLICY "Enable read for everyone"
ON challenges
FOR SELECT
USING (true);

-- 2. achievements: public read, no anon writes.
DROP POLICY IF EXISTS "Users can create own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can view own achievements" ON achievements;
DROP POLICY IF EXISTS "Enable all for anon key" ON achievements;
DROP POLICY IF EXISTS "Enable read for everyone" ON achievements;

CREATE POLICY "Enable read for everyone"
ON achievements
FOR SELECT
USING (true);

-- 3. sessions: no public access. API routes use service_role internally.
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Service role can manage sessions" ON sessions;
DROP POLICY IF EXISTS "Enable read for everyone" ON sessions;
DROP POLICY IF EXISTS "Enable all for anon key" ON sessions;

-- 4. users: public read for leaderboard, no anon writes.
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Enable read for everyone" ON users;
DROP POLICY IF EXISTS "Enable write for service role only" ON users;
DROP POLICY IF EXISTS "Enable all for anon key" ON users;

CREATE POLICY "Enable read for everyone"
ON users
FOR SELECT
USING (true);
