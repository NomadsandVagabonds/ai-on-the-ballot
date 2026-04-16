-- 002_rls_policies.sql
-- Row Level Security policies for public read access

-- Enable RLS on all tables
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE legislative_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrections_log ENABLE ROW LEVEL SECURITY;

-- Public read for all data tables
CREATE POLICY "Public read" ON candidates FOR SELECT USING (true);
CREATE POLICY "Public read" ON races FOR SELECT USING (true);
CREATE POLICY "Public read" ON race_candidates FOR SELECT USING (true);
CREATE POLICY "Public read" ON issues FOR SELECT USING (true);
CREATE POLICY "Public read" ON positions FOR SELECT USING (true);
CREATE POLICY "Public read" ON legislative_activity FOR SELECT USING (true);

-- Corrections: public read only for accepted/public entries, anyone can insert
CREATE POLICY "Public read accepted" ON corrections_log FOR SELECT USING (is_public = true);
CREATE POLICY "Public insert" ON corrections_log FOR INSERT WITH CHECK (true);
