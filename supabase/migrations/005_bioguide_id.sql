-- Add bioguide_id to candidates for official Congress photo lookup.
--
-- Bioguide IDs are the Library of Congress's unique identifiers for members
-- of Congress (format: 1 letter + 6 digits, e.g. "C001098" for Ted Cruz).
-- When present, the frontend resolves portraits from the public-domain
-- unitedstates/images repository instead of falling back to a monogram.
--
-- Only incumbents have bioguide IDs. Challengers remain null.

ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS bioguide_id TEXT;

-- Unique partial index — each bioguide ID appears at most once per election
-- cycle (a candidate can have only one Congress identity). NULLs are allowed
-- and unconstrained so challengers don't collide.
CREATE UNIQUE INDEX IF NOT EXISTS candidates_bioguide_id_unique
  ON candidates (bioguide_id)
  WHERE bioguide_id IS NOT NULL;

-- Format check — reject obviously malformed values at the DB layer.
ALTER TABLE candidates
  ADD CONSTRAINT candidates_bioguide_id_format
  CHECK (
    bioguide_id IS NULL
    OR bioguide_id ~ '^[A-Z][0-9]{6}$'
  );

COMMENT ON COLUMN candidates.bioguide_id IS
  'Library of Congress Bioguide ID. When set, frontend resolves portraits from https://unitedstates.github.io/images/congress/450x550/{bioguide_id}.jpg';
