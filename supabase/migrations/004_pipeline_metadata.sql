-- 004_pipeline_metadata.sql
-- Additive columns to support the automated research pipeline.
-- No breaking changes to existing queries or frontend code.

-- Track campaign/social presence and research status per candidate
ALTER TABLE candidates ADD COLUMN campaign_url TEXT;
ALTER TABLE candidates ADD COLUMN twitter_handle TEXT;
ALTER TABLE candidates ADD COLUMN bioguide_id TEXT;
ALTER TABLE candidates ADD COLUMN research_status TEXT DEFAULT 'pending'
  CHECK (research_status IN ('pending', 'in_progress', 'reviewed', 'published'));

-- Track how each position was researched and when it was reviewed
ALTER TABLE positions ADD COLUMN research_method TEXT
  CHECK (research_method IN ('manual', 'ai_assisted', 'derived_from_legislation', 'campaign_website'));
ALTER TABLE positions ADD COLUMN reviewed_at TIMESTAMPTZ;

-- Index for filtering candidates by research status
CREATE INDEX idx_candidates_research_status ON candidates(research_status);
