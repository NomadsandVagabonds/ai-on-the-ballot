-- 001_initial_schema.sql
-- Core tables for AI on the Ballot candidate tracker

-- candidates table
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  party TEXT NOT NULL CHECK (party IN ('D', 'R', 'I', 'L', 'G')),
  state TEXT NOT NULL,
  district TEXT,
  office_sought TEXT NOT NULL,
  committee_assignments TEXT[] DEFAULT '{}',
  election_year INT NOT NULL DEFAULT 2026,
  fec_id TEXT,
  is_incumbent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- races table
CREATE TABLE races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  chamber TEXT NOT NULL CHECK (chamber IN ('senate', 'house', 'governor')),
  district TEXT,
  election_year INT NOT NULL DEFAULT 2026,
  race_type TEXT NOT NULL DEFAULT 'regular' CHECK (race_type IN ('regular', 'special')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- race_candidates junction table
CREATE TABLE race_candidates (
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  PRIMARY KEY (race_id, candidate_id)
);

-- issues table
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- positions table (core join: candidate x issue)
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  stance TEXT NOT NULL CHECK (stance IN ('support', 'oppose', 'mixed', 'unclear', 'no_mention')),
  confidence TEXT NOT NULL DEFAULT 'medium' CHECK (confidence IN ('high', 'medium', 'low')),
  summary TEXT,
  full_quote TEXT,
  source_url TEXT,
  date_recorded DATE,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, issue_id)
);

-- legislative_activity table
CREATE TABLE legislative_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('bill_sponsored', 'bill_cosponsored', 'vote', 'hearing', 'letter', 'statement')),
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- corrections_log table
CREATE TABLE corrections_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_name TEXT NOT NULL,
  issue TEXT NOT NULL,
  proposed_correction TEXT NOT NULL,
  source_url TEXT,
  submitter_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  nature_of_change TEXT,
  previous_value TEXT,
  new_value TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER races_updated_at BEFORE UPDATE ON races FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER issues_updated_at BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER positions_updated_at BEFORE UPDATE ON positions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER legislative_activity_updated_at BEFORE UPDATE ON legislative_activity FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER corrections_log_updated_at BEFORE UPDATE ON corrections_log FOR EACH ROW EXECUTE FUNCTION update_updated_at();
