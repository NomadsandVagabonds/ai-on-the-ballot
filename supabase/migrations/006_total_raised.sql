-- Add total_raised to candidates so Supabase can mirror data/tracker/candidates.json
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS total_raised BIGINT;
