# Marking the November ballot — rollout steps

How the "who's actually on the November ballot" feature goes live, and what
each person needs to do. Written Aug 31, 2026.

## What's changing on the site

Race pages used to show the top five candidates by fundraising, with no
indication of who survived their primary. Now, once a race is marked, every
candidate stays listed: the ones on the November ballot lead the page on a
light green background, and the rest are greyed out with a small
**NOT ADVANCING** tag.

The tag deliberately says "not advancing" rather than "lost primary." The
sheet records only whether someone is on the November ballot, not why they
are absent (lost, withdrew, disqualified, never filed), so the site states
the fact it knows rather than guessing the cause.

**Nothing is inferred.** A race is only shown this way when the sheet says
so. Any race the sheet has not marked keeps the old fundraising-ranked
view, unchanged. The site will never assert that a real candidate lost
unless the sheet says they are not on the ballot.

## Step 0 — one-time database change (Justin, before the code ships)

The sheet's publish pipeline writes rows, not columns, so this one has to be
run by hand once. In the Supabase dashboard, SQL Editor, on the production
project:

```sql
ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS in_general_election BOOLEAN NOT NULL DEFAULT FALSE;
```

Additive and safe: it adds one column defaulting to false, touches no
existing data, and can be re-run harmlessly.

**This must happen before the new code is merged to main.** The publish
route sends `in_general_election` with every candidate, so if the code ships
before the column exists, Vinaya's next publish fails with a schema error.

## Steps for Vinaya

### 1. The column already exists — no new column needed

The Candidates sheet already has a **`general ballot`** column, and it
already has values in it (`Y`, `RUNOFF`, `GENERAL TBD`, `N`, `WRITE-IN`).
Nothing to add. The capitalization of the header no longer matters.

### 2. Mark the winners with `Y`

Only the exact value **`Y`** (or `y`) means "on the November ballot."
Every other value, and a blank cell, means not advancing.

### 3. Mark a whole race at once, or leave it alone

This is the one rule that matters most. The site decides per race:

- **No candidate in the race marked `Y`** → the race keeps the old view.
  Nobody is labeled. This is the safe state.
- **At least one candidate marked `Y`** → that race switches to the new
  view, and *everyone else in that race* is labeled NOT ADVANCING.

So if a Senate race has four candidates and only two are confirmed, marking
just those two tells the site the other two are out. If a race is genuinely
undecided or heading to a runoff, **leave the whole race unmarked** until
it resolves. Partial marking is the one way to publish something wrong.

### 4. Validate before publishing

In the sheet menu: **AI on the Ballot → Validate sheet (no publish)**. Same
checks as a real publish, but nothing is written. Fix anything it reports.

### 5. Publish

**AI on the Ballot → Publish to site.** Then spot-check a race you marked
on the live site to confirm it looks right.

### 6. Work at your own pace

Races light up one at a time as they are marked. There is no need to do all
of them in one sitting, and an unmarked race is never wrong, just less
informative. New York in particular needs attention: its current marks
predate the June primary, so every NY candidate is currently marked `Y`.

## Optional: distinguishing "lost" from "withdrew"

If it would be worth telling readers *why* someone is off the ballot, add a
column named **`not advancing reason`** with values `lost` or `withdrew`.
Say the word and we will wire it up so each candidate gets the specific
tag, falling back to "Not advancing" wherever the reason is blank. Not
built yet, so the column does nothing until we do that.

## If a publish fails

- `missing required column: general ballot` — the header was renamed or
  deleted. Restore a header named `general ballot` (any capitalization).
- `column candidates.in_general_election does not exist` — Step 0 above was
  not run on the production database yet.
- Anything else: hit **Validate sheet (no publish)** first, since it runs
  the same checks without writing, and send along whatever it reports.
