-- Marks candidates who advanced past their primary onto the November
-- general-election ballot. Populated from the "general" (Y/N) column on
-- the Candidates sheet via /api/publish. Defaults false so races whose
-- primary results haven't been entered yet fall back to the primary view.
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS in_general_election BOOLEAN NOT NULL DEFAULT FALSE;
