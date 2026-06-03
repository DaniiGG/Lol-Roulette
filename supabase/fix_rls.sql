-- ============================================
-- FIX: RLS policies - solo SELECT público con anon key
-- TODO el write se hace via API routes con service_role
-- ============================================

-- 1. challenges: solo lectura pública
DROP POLICY IF EXISTS "Users can create own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can update own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can delete own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can view own challenges" ON challenges;
DROP POLICY IF EXISTS "Enable all for anon key" ON challenges;

CREATE POLICY "Enable read for everyone"
ON challenges
FOR SELECT
USING (true);

-- 2. achievements: solo lectura pública
DROP POLICY IF EXISTS "Users can create own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can view own achievements" ON achievements;
DROP POLICY IF EXISTS "Enable all for anon key" ON achievements;

CREATE POLICY "Enable read for everyone"
ON achievements
FOR SELECT
USING (true);

-- 3. sessions: solo lectura pública (verify-session usa service role internamente)
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Service role can manage sessions" ON sessions;

CREATE POLICY "Enable read for everyone"
ON sessions
FOR SELECT
USING (true);

-- 4. users: lectura pública, escritura solo service role
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Enable read for everyone" ON users;
DROP POLICY IF EXISTS "Enable write for service role only" ON users;

CREATE POLICY "Enable read for everyone"
ON users
FOR SELECT
USING (true);