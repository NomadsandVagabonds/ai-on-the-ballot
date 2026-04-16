-- 003_indexes.sql
-- Performance indexes for common query patterns

CREATE INDEX idx_candidates_state ON candidates(state);
CREATE INDEX idx_candidates_slug ON candidates(slug);
CREATE INDEX idx_candidates_party ON candidates(party);
CREATE INDEX idx_candidates_last_name ON candidates(last_name);
CREATE INDEX idx_races_state ON races(state);
CREATE INDEX idx_races_chamber ON races(chamber);
CREATE INDEX idx_races_slug ON races(slug);
CREATE INDEX idx_positions_candidate ON positions(candidate_id);
CREATE INDEX idx_positions_issue ON positions(issue_id);
CREATE INDEX idx_positions_stance ON positions(stance);
CREATE INDEX idx_legislative_activity_candidate ON legislative_activity(candidate_id);
CREATE INDEX idx_corrections_status ON corrections_log(status);
CREATE INDEX idx_corrections_public ON corrections_log(is_public);
