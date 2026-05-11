-- Published corrections log.
--
-- The existing corrections_log table was designed for a public-submitted
-- corrections form (candidate_name, issue, proposed_correction, status…).
-- That's a different concept than the curated list Vinaya maintains in
-- the spreadsheet's "Corrections Log" sheet, which is the published log
-- of changes shown on /corrections. Use a dedicated table so the two
-- don't collide.
CREATE TABLE IF NOT EXISTS published_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correction_date DATE NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS published_corrections_date_idx
  ON published_corrections (correction_date DESC);

-- Public read access; writes via service role only.
ALTER TABLE published_corrections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "published_corrections public read" ON published_corrections;
CREATE POLICY "published_corrections public read"
  ON published_corrections
  FOR SELECT
  USING (true);
