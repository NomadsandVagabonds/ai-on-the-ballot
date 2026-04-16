-- initial-data.sql
-- Seed data for AI on the Ballot: 5 tracked issues + 5 launch states

-- ============================================================
-- ISSUES (5 tracked AI policy areas)
-- ============================================================

INSERT INTO issues (id, slug, display_name, description, icon, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'export-control', 'Export Control & Compute Governance',
   'Policies governing the export of AI chips, models, and compute infrastructure to foreign nations. Includes semiconductor restrictions, licensing regimes, and allied compute-sharing agreements.',
   'shield', 1),
  ('a0000000-0000-0000-0000-000000000002', 'military-ai', 'Military & National Security AI',
   'Use of AI in defense applications including autonomous weapons, intelligence analysis, cybersecurity, and military decision-support systems.',
   'target', 2),
  ('a0000000-0000-0000-0000-000000000003', 'regulation', 'AI Regulation Philosophy',
   'Overall approach to regulating AI systems, including federal frameworks, agency oversight authority, liability rules, and preemption of state laws.',
   'scale', 3),
  ('a0000000-0000-0000-0000-000000000004', 'data-centers', 'Data Centers',
   'Policies on AI data center siting, permitting, energy usage, water consumption, and grid impact. Includes incentives, environmental review, and federal land use.',
   'server', 4),
  ('a0000000-0000-0000-0000-000000000005', 'children-safety', 'Children''s Online Safety',
   'Legislation addressing AI-generated content targeting minors, algorithmic recommendation systems, age verification, and children''s data privacy in AI systems.',
   'users', 5);


-- ============================================================
-- TEXAS (real candidates — funded data state)
-- ============================================================

-- TX Senate Race
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'TX-senate-2026', 'TX', 'senate', NULL, 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year, committee_assignments) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Ted Cruz', 'Ted', 'Cruz', 'ted-cruz-tx', 'R', 'TX', NULL, 'U.S. Senate', true, 2026,
   ARRAY['Commerce, Science, and Transportation', 'Judiciary', 'Foreign Relations']),
  ('c0000000-0000-0000-0000-000000000002', 'Colin Allred', 'Colin', 'Allred', 'colin-allred-tx', 'D', 'TX', NULL, 'U.S. Senate', false, 2026,
   ARRAY['Foreign Affairs', 'Transportation and Infrastructure']);

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002');

-- TX House District 23 (competitive border district)
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'TX-house-23-2026', 'TX', 'house', '23', 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year) VALUES
  ('c0000000-0000-0000-0000-000000000003', 'Tony Gonzales', 'Tony', 'Gonzales', 'tony-gonzales-tx', 'R', 'TX', '23', 'U.S. House', true, 2026),
  ('c0000000-0000-0000-0000-000000000004', 'Santos Limon', 'Santos', 'Limon', 'santos-limon-tx', 'D', 'TX', '23', 'U.S. House', false, 2026);

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004');

-- TX House District 32 (suburban Dallas)
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000003', 'TX-house-32-2026', 'TX', 'house', '32', 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year) VALUES
  ('c0000000-0000-0000-0000-000000000005', 'Colin Allred', 'Julie', 'Johnson', 'julie-johnson-tx', 'D', 'TX', '32', 'U.S. House', true, 2026),
  ('c0000000-0000-0000-0000-000000000006', 'Darrell Issa Jr.', 'Darrell', 'Issa Jr.', 'darrell-issa-jr-tx', 'R', 'TX', '32', 'U.S. House', false, 2026);

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000006');

-- TX House District 15 (Austin area)
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000004', 'TX-house-15-2026', 'TX', 'house', '15', 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year) VALUES
  ('c0000000-0000-0000-0000-000000000007', 'Monica De La Cruz', 'Monica', 'De La Cruz', 'monica-de-la-cruz-tx', 'R', 'TX', '15', 'U.S. House', true, 2026),
  ('c0000000-0000-0000-0000-000000000008', 'Michelle Vallejo', 'Michelle', 'Vallejo', 'michelle-vallejo-tx', 'D', 'TX', '15', 'U.S. House', false, 2026);

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000007'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000008');

-- TX Positions (Ted Cruz)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary, source_url, date_recorded) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'support', 'high',
   'Strong supporter of tightening chip export controls to China. Co-sponsored CHIPS Act provisions for allied compute sharing.',
   'https://www.cruz.senate.gov/', '2024-09-15'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'support', 'high',
   'Advocates expanding DoD AI capabilities. Supports autonomous systems for border security and national defense applications.',
   'https://www.cruz.senate.gov/', '2024-10-02'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'high',
   'Opposes broad federal AI regulation, favoring industry self-governance and sector-specific approaches over a comprehensive federal framework.',
   'https://www.cruz.senate.gov/', '2024-08-20'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'support', 'medium',
   'Supports data center expansion in Texas. Advocates streamlining permitting for energy infrastructure to support AI compute.',
   'https://www.cruz.senate.gov/', '2024-11-01'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'support', 'high',
   'Co-sponsored the KIDS Online Safety Act. Supports age verification requirements and algorithmic transparency for minors.',
   'https://www.cruz.senate.gov/', '2024-07-18');

-- TX Positions (Colin Allred)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary, source_url, date_recorded) VALUES
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'support', 'medium',
   'Supports export controls on advanced chips to adversaries while seeking to minimize impact on allied technology cooperation.',
   'https://allredforcongress.com/', '2024-09-10'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'mixed', 'medium',
   'Supports AI for defense modernization but emphasizes need for human oversight and ethical guardrails on autonomous weapons.',
   'https://allredforcongress.com/', '2024-10-15'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'support', 'medium',
   'Favors a federal AI regulatory framework with transparency requirements, bias audits, and sector-specific rules.',
   'https://allredforcongress.com/', '2024-08-25'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'mixed', 'low',
   'Supports data center growth but with environmental review requirements for energy and water usage impacts.',
   'https://allredforcongress.com/', '2024-11-05'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'support', 'high',
   'Strong advocate for children''s online safety legislation. Supports comprehensive protections against AI-generated harmful content targeting minors.',
   'https://allredforcongress.com/', '2024-07-22');

-- TX Positions (Tony Gonzales)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary, source_url, date_recorded) VALUES
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'support', 'medium',
   'Supports maintaining strict export controls on semiconductor technology to protect national security.',
   NULL, '2024-09-20'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'support', 'high',
   'As a Navy veteran, strongly supports AI applications in military and border security operations.',
   NULL, '2024-10-10'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'medium',
   'Prefers light-touch regulation that does not impede innovation or impose burdensome compliance on small businesses.',
   NULL, '2024-08-30'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'support', 'low',
   'Generally supportive of economic development including data centers in his district.',
   NULL, '2024-11-10'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium',
   'Supports protections for children online including AI-related safeguards.',
   NULL, '2024-07-25');

-- TX Positions (Santos Limon)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary, source_url, date_recorded) VALUES
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'unclear', 'low',
   'Has not publicly commented on AI export control policy.',
   NULL, '2024-10-01'),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'mixed', 'low',
   'General support for military modernization tempered by concerns about autonomous weapons proliferation.',
   NULL, '2024-10-01'),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'support', 'low',
   'Expressed general support for consumer protections in AI during campaign events.',
   NULL, '2024-10-01'),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'no_mention', 'low',
   'No public statements found on data center policy.',
   NULL, '2024-10-01'),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium',
   'Supports stronger online safety measures for children.',
   NULL, '2024-10-01');

-- TX Positions (Julie Johnson - TX-32)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary, source_url, date_recorded) VALUES
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'support', 'medium',
   'Supports bipartisan approach to maintaining U.S. technology leadership through strategic export controls.',
   NULL, '2024-09-25'),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'mixed', 'medium',
   'Supports defense modernization with human-in-the-loop requirements for lethal autonomous systems.',
   NULL, '2024-10-05'),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'support', 'medium',
   'Advocates for comprehensive AI oversight including transparency mandates and algorithmic accountability.',
   NULL, '2024-08-15'),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'mixed', 'low',
   'Acknowledges need for data center growth but concerned about energy grid strain in Texas.',
   NULL, '2024-11-08'),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'support', 'high',
   'Active supporter of COPPA 2.0 and other children''s data privacy protections in the AI era.',
   NULL, '2024-07-20');

-- TX Positions (Darrell Issa Jr. - TX-32)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary, source_url, date_recorded) VALUES
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'support', 'low',
   'Aligned with party position on maintaining export controls to protect national security.',
   NULL, '2024-09-28'),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'support', 'medium',
   'Supports increased defense spending on AI capabilities and military modernization.',
   NULL, '2024-10-08'),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'medium',
   'Opposes heavy-handed AI regulation, favoring market-driven innovation and voluntary industry standards.',
   NULL, '2024-08-18'),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'support', 'medium',
   'Supports streamlined permitting for data center construction to attract tech investment to Texas.',
   NULL, '2024-11-12'),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', 'support', 'low',
   'Broadly supports children''s safety online but cautious about government overreach in content regulation.',
   NULL, '2024-07-28');

-- TX Positions (Monica De La Cruz - TX-15)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary, source_url, date_recorded) VALUES
  ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'support', 'medium',
   'Supports export restrictions on advanced technology to adversaries, particularly China.',
   NULL, '2024-09-22'),
  ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'support', 'medium',
   'Supports AI integration in border security and defense. Member of the Homeland Security Committee.',
   NULL, '2024-10-12'),
  ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'medium',
   'Opposes broad federal AI regulation that could hamper innovation and economic competitiveness.',
   NULL, '2024-08-22'),
  ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000004', 'support', 'low',
   'Supports economic development in the Rio Grande Valley, including tech infrastructure.',
   NULL, '2024-11-15'),
  ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium',
   'Supports legislation protecting children from harmful online content and AI-generated deepfakes.',
   NULL, '2024-07-30');

-- TX Positions (Michelle Vallejo - TX-15)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary, source_url, date_recorded) VALUES
  ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'unclear', 'low',
   'Has not taken a public position on AI chip export controls.',
   NULL, '2024-10-01'),
  ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'oppose', 'low',
   'Expressed concerns about autonomous weapons and military AI spending at community town halls.',
   NULL, '2024-10-01'),
  ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', 'support', 'medium',
   'Supports strong federal oversight of AI systems, emphasizing protections for workers and consumers.',
   NULL, '2024-10-01'),
  ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', 'mixed', 'low',
   'Supports economic development but emphasizes environmental justice in data center siting near communities.',
   NULL, '2024-10-01'),
  ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium',
   'Advocates for children''s digital privacy and safety protections.',
   NULL, '2024-10-01');


-- ============================================================
-- NORTH CAROLINA (mock data)
-- ============================================================

-- NC Senate Race
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000010', 'NC-senate-2026', 'NC', 'senate', NULL, 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year, committee_assignments) VALUES
  ('c0000000-0000-0000-0000-000000000010', 'Thom Tillis', 'Thom', 'Tillis', 'thom-tillis-nc', 'R', 'NC', NULL, 'U.S. Senate', true, 2026,
   ARRAY['Judiciary', 'Banking, Housing, and Urban Affairs', 'Veterans'' Affairs']),
  ('c0000000-0000-0000-0000-000000000011', 'Patricia Cahill', 'Patricia', 'Cahill', 'patricia-cahill-nc', 'D', 'NC', NULL, 'U.S. Senate', false, 2026, '{}');

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000010'),
  ('b0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000011');

-- NC House District 13 (Research Triangle)
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000011', 'NC-house-13-2026', 'NC', 'house', '13', 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year) VALUES
  ('c0000000-0000-0000-0000-000000000012', 'Wiley Nickel', 'Wiley', 'Nickel', 'wiley-nickel-nc', 'D', 'NC', '13', 'U.S. House', true, 2026),
  ('c0000000-0000-0000-0000-000000000013', 'James Caldwell', 'James', 'Caldwell', 'james-caldwell-nc', 'R', 'NC', '13', 'U.S. House', false, 2026);

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000012'),
  ('b0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000013');

-- NC House District 1 (northeastern NC)
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000012', 'NC-house-1-2026', 'NC', 'house', '1', 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year) VALUES
  ('c0000000-0000-0000-0000-000000000014', 'Don Davis', 'Don', 'Davis', 'don-davis-nc', 'D', 'NC', '1', 'U.S. House', true, 2026),
  ('c0000000-0000-0000-0000-000000000015', 'Laurie Buckhout', 'Laurie', 'Buckhout', 'laurie-buckhout-nc', 'R', 'NC', '1', 'U.S. House', false, 2026);

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000014'),
  ('b0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000015');

-- NC Positions (Thom Tillis)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'support', 'high', 'Supports strong export controls as part of national security strategy against China.'),
  ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002', 'support', 'high', 'Supports expanded military AI applications and increased defense AI funding.'),
  ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'medium', 'Skeptical of comprehensive federal AI regulation. Prefers sector-specific, innovation-friendly approaches.'),
  ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000004', 'support', 'medium', 'Supports data center development in North Carolina and streamlined permitting.'),
  ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports online safety measures for children including KOSA provisions.');

-- NC Positions (Patricia Cahill)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'support', 'low', 'Broadly supports technology export controls aligned with allied interests.'),
  ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000002', 'mixed', 'low', 'Supports responsible defense AI use with strict ethical guidelines and human oversight.'),
  ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000003', 'support', 'medium', 'Favors comprehensive federal AI regulation including mandatory impact assessments.'),
  ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000004', 'mixed', 'low', 'Supports tech growth but emphasizes environmental sustainability in data center development.'),
  ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000005', 'support', 'high', 'Strong advocate for children''s online safety with specific AI-related protections.');

-- NC Positions (Wiley Nickel)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'support', 'medium', 'Supports strategic export controls while maintaining Research Triangle tech industry competitiveness.'),
  ('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000002', 'mixed', 'medium', 'Supports AI for defense modernization with clear accountability frameworks.'),
  ('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000003', 'support', 'medium', 'Advocates for balanced AI regulation that supports innovation while protecting consumers.'),
  ('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000004', 'support', 'high', 'Actively supports data center development in NC-13, citing local job creation.'),
  ('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports children''s online safety measures including AI content labeling.');

-- NC Positions (James Caldwell)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'support', 'low', 'Supports export controls to protect U.S. technological advantage.'),
  ('c0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000002', 'support', 'medium', 'Supports strong national defense including AI capabilities.'),
  ('c0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'medium', 'Opposes federal AI regulation that would burden businesses and slow innovation.'),
  ('c0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000004', 'support', 'medium', 'Supports data center development and reducing regulatory barriers for tech infrastructure.'),
  ('c0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000005', 'support', 'low', 'Supports protecting children online within a limited-government framework.');

-- NC Positions (Don Davis)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'support', 'medium', 'Supports maintaining U.S. technology leadership through strategic export policy.'),
  ('c0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000002', 'support', 'medium', 'As Air Force veteran, supports AI applications in military with proper oversight.'),
  ('c0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000003', 'support', 'low', 'Generally supports AI oversight measures.'),
  ('c0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000004', 'support', 'medium', 'Supports broadband and tech infrastructure investment in rural NC.'),
  ('c0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports protections for children in digital spaces.');

-- NC Positions (Laurie Buckhout)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'support', 'high', 'Former Army colonel with electronic warfare expertise. Strongly supports technology export controls.'),
  ('c0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000002', 'support', 'high', 'Strongly supports military AI capabilities based on defense background.'),
  ('c0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'medium', 'Prefers industry-led standards over government regulation for AI.'),
  ('c0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000004', 'support', 'low', 'Generally supports private sector infrastructure development.'),
  ('c0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports children''s safety online, aligned with party position.');


-- ============================================================
-- ARKANSAS (mock data)
-- ============================================================

-- AR Senate Race
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000020', 'AR-senate-2026', 'AR', 'senate', NULL, 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year, committee_assignments) VALUES
  ('c0000000-0000-0000-0000-000000000020', 'Tom Cotton', 'Tom', 'Cotton', 'tom-cotton-ar', 'R', 'AR', NULL, 'U.S. Senate', true, 2026,
   ARRAY['Armed Services', 'Intelligence', 'Judiciary']),
  ('c0000000-0000-0000-0000-000000000021', 'Natalie James', 'Natalie', 'James', 'natalie-james-ar', 'D', 'AR', NULL, 'U.S. Senate', false, 2026, '{}');

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000020'),
  ('b0000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000021');

-- AR House District 2 (Little Rock area)
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000021', 'AR-house-2-2026', 'AR', 'house', '2', 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year) VALUES
  ('c0000000-0000-0000-0000-000000000022', 'French Hill', 'French', 'Hill', 'french-hill-ar', 'R', 'AR', '2', 'U.S. House', true, 2026),
  ('c0000000-0000-0000-0000-000000000023', 'Marcus Jones', 'Marcus', 'Jones', 'marcus-jones-ar', 'D', 'AR', '2', 'U.S. House', false, 2026);

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000022'),
  ('b0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000023');

-- AR House District 4 (southern/western AR)
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000022', 'AR-house-4-2026', 'AR', 'house', '4', 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year) VALUES
  ('c0000000-0000-0000-0000-000000000024', 'Bruce Westerman', 'Bruce', 'Westerman', 'bruce-westerman-ar', 'R', 'AR', '4', 'U.S. House', true, 2026),
  ('c0000000-0000-0000-0000-000000000025', 'Angela Smith', 'Angela', 'Smith', 'angela-smith-ar', 'D', 'AR', '4', 'U.S. House', false, 2026);

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000024'),
  ('b0000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000025');

-- AR Positions (Tom Cotton)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000001', 'support', 'high', 'Leading voice on restricting AI chip exports to China. Member of Intelligence Committee.'),
  ('c0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000002', 'support', 'high', 'Strong supporter of military AI development. Advocates for AI in national defense and intelligence.'),
  ('c0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'high', 'Opposes federal AI regulation that could slow U.S. innovation relative to China.'),
  ('c0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000004', 'support', 'medium', 'Supports infrastructure development for AI compute capacity.'),
  ('c0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports targeted measures for children''s online safety.');

-- AR Positions (Natalie James)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000001', 'unclear', 'low', 'No clear public position on AI export controls.'),
  ('c0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000002', 'mixed', 'low', 'General concerns about military spending priorities but supports defense readiness.'),
  ('c0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000003', 'support', 'medium', 'Supports federal AI regulation with focus on worker and consumer protections.'),
  ('c0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000004', 'mixed', 'low', 'Open to data centers but wants environmental and community impact considerations.'),
  ('c0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports comprehensive children''s online safety legislation.');

-- AR Positions (French Hill)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000001', 'support', 'high', 'Active on the House Financial Services Committee in addressing AI-related technology controls.'),
  ('c0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000002', 'support', 'medium', 'Supports AI in defense applications.'),
  ('c0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'medium', 'Prefers market-based approaches to AI governance. Skeptical of comprehensive federal regulation.'),
  ('c0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000004', 'support', 'medium', 'Supports data center development as economic driver for Arkansas.'),
  ('c0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports children''s online safety legislation.');

-- AR Positions (Marcus Jones)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000001', 'unclear', 'low', 'No public position on export controls identified.'),
  ('c0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000002', 'mixed', 'low', 'Supports defense modernization but advocates for responsible AI deployment.'),
  ('c0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000003', 'support', 'low', 'Broadly supports AI oversight and consumer protections.'),
  ('c0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000004', 'no_mention', 'low', 'No public position on data center policy.'),
  ('c0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports children''s online safety protections.');

-- AR Positions (Bruce Westerman)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000001', 'support', 'medium', 'Supports export controls as part of broader national security framework.'),
  ('c0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000002', 'support', 'medium', 'Supports military modernization including AI capabilities.'),
  ('c0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'medium', 'As Chair of Natural Resources Committee, skeptical of regulation that impedes industry. Extends to AI.'),
  ('c0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000004', 'support', 'medium', 'Supports energy and infrastructure development, including data centers.'),
  ('c0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000005', 'support', 'low', 'Supports children''s safety measures online.');

-- AR Positions (Angela Smith)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000001', 'no_mention', 'low', 'No public statements on AI export controls found.'),
  ('c0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000002', 'unclear', 'low', 'No specific statements on military AI.'),
  ('c0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000003', 'support', 'low', 'General support for consumer protections in technology.'),
  ('c0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000004', 'no_mention', 'low', 'No public position on data center policy.'),
  ('c0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports stronger protections for children online.');


-- ============================================================
-- MISSISSIPPI (mock data)
-- ============================================================

-- MS Senate Race
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000030', 'MS-senate-2026', 'MS', 'senate', NULL, 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year, committee_assignments) VALUES
  ('c0000000-0000-0000-0000-000000000030', 'Roger Wicker', 'Roger', 'Wicker', 'roger-wicker-ms', 'R', 'MS', NULL, 'U.S. Senate', true, 2026,
   ARRAY['Armed Services', 'Commerce, Science, and Transportation']),
  ('c0000000-0000-0000-0000-000000000031', 'Tyrone Henderson', 'Tyrone', 'Henderson', 'tyrone-henderson-ms', 'D', 'MS', NULL, 'U.S. Senate', false, 2026, '{}');

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000030', 'c0000000-0000-0000-0000-000000000030'),
  ('b0000000-0000-0000-0000-000000000030', 'c0000000-0000-0000-0000-000000000031');

-- MS House District 2 (Mississippi Delta / Jackson)
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000031', 'MS-house-2-2026', 'MS', 'house', '2', 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year) VALUES
  ('c0000000-0000-0000-0000-000000000032', 'Bennie Thompson', 'Bennie', 'Thompson', 'bennie-thompson-ms', 'D', 'MS', '2', 'U.S. House', true, 2026),
  ('c0000000-0000-0000-0000-000000000033', 'Ronald Foster', 'Ronald', 'Foster', 'ronald-foster-ms', 'R', 'MS', '2', 'U.S. House', false, 2026);

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000031', 'c0000000-0000-0000-0000-000000000032'),
  ('b0000000-0000-0000-0000-000000000031', 'c0000000-0000-0000-0000-000000000033');

-- MS House District 3 (eastern MS)
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000032', 'MS-house-3-2026', 'MS', 'house', '3', 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year) VALUES
  ('c0000000-0000-0000-0000-000000000034', 'Michael Guest', 'Michael', 'Guest', 'michael-guest-ms', 'R', 'MS', '3', 'U.S. House', true, 2026),
  ('c0000000-0000-0000-0000-000000000035', 'Denise Parker', 'Denise', 'Parker', 'denise-parker-ms', 'D', 'MS', '3', 'U.S. House', false, 2026);

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000032', 'c0000000-0000-0000-0000-000000000034'),
  ('b0000000-0000-0000-0000-000000000032', 'c0000000-0000-0000-0000-000000000035');

-- MS Positions (Roger Wicker)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000001', 'support', 'high', 'Supports robust export controls. Ranking member on Armed Services with focus on technology competition.'),
  ('c0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000002', 'support', 'high', 'Leading advocate for military AI. Authored provisions in NDAA for AI defense modernization.'),
  ('c0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'medium', 'Cautious about regulation that could hamper U.S. AI competitiveness.'),
  ('c0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000004', 'support', 'medium', 'Supports infrastructure development including data centers for economic growth.'),
  ('c0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports children''s online safety legislation.');

-- MS Positions (Tyrone Henderson)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000001', 'unclear', 'low', 'No specific public statements on AI export controls.'),
  ('c0000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000002', 'mixed', 'low', 'Supports defense readiness but concerned about autonomous weapons accountability.'),
  ('c0000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000003', 'support', 'medium', 'Supports AI regulation focused on civil rights, algorithmic bias, and consumer protections.'),
  ('c0000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000004', 'mixed', 'low', 'Open to data centers with environmental protections and community benefit agreements.'),
  ('c0000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports children''s digital safety legislation.');

-- MS Positions (Bennie Thompson)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000001', 'support', 'medium', 'Supports export controls in context of homeland security and technology protection.'),
  ('c0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000002', 'mixed', 'medium', 'As former Homeland Security Committee Chair, supports responsible AI use in security with oversight.'),
  ('c0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000003', 'support', 'medium', 'Supports AI regulation with emphasis on civil rights and preventing algorithmic discrimination.'),
  ('c0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000004', 'mixed', 'low', 'Supports economic development but concerned about impacts on rural communities.'),
  ('c0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000005', 'support', 'high', 'Strong supporter of children''s online safety measures.');

-- MS Positions (Ronald Foster)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000033', 'a0000000-0000-0000-0000-000000000001', 'support', 'low', 'Generally aligned with party on export control policy.'),
  ('c0000000-0000-0000-0000-000000000033', 'a0000000-0000-0000-0000-000000000002', 'support', 'medium', 'Supports strong national defense including AI capabilities.'),
  ('c0000000-0000-0000-0000-000000000033', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'low', 'Skeptical of government regulation of technology.'),
  ('c0000000-0000-0000-0000-000000000033', 'a0000000-0000-0000-0000-000000000004', 'no_mention', 'low', 'No public statements on data center policy.'),
  ('c0000000-0000-0000-0000-000000000033', 'a0000000-0000-0000-0000-000000000005', 'support', 'low', 'Supports protecting children online.');

-- MS Positions (Michael Guest)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000034', 'a0000000-0000-0000-0000-000000000001', 'support', 'medium', 'Supports technology export controls aligned with national security interests.'),
  ('c0000000-0000-0000-0000-000000000034', 'a0000000-0000-0000-0000-000000000002', 'support', 'medium', 'Supports military AI applications. Member of Homeland Security Committee.'),
  ('c0000000-0000-0000-0000-000000000034', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'medium', 'Opposes overreaching federal regulation of AI, prefers targeted sector-specific rules.'),
  ('c0000000-0000-0000-0000-000000000034', 'a0000000-0000-0000-0000-000000000004', 'support', 'low', 'Supports economic development in Mississippi including tech infrastructure.'),
  ('c0000000-0000-0000-0000-000000000034', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports protections for children in digital environments.');

-- MS Positions (Denise Parker)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000035', 'a0000000-0000-0000-0000-000000000001', 'no_mention', 'low', 'No public statements on AI export controls.'),
  ('c0000000-0000-0000-0000-000000000035', 'a0000000-0000-0000-0000-000000000002', 'unclear', 'low', 'No specific statements on military AI.'),
  ('c0000000-0000-0000-0000-000000000035', 'a0000000-0000-0000-0000-000000000003', 'support', 'low', 'Expressed general support for technology accountability.'),
  ('c0000000-0000-0000-0000-000000000035', 'a0000000-0000-0000-0000-000000000004', 'no_mention', 'low', 'No public position on data center policy.'),
  ('c0000000-0000-0000-0000-000000000035', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports children''s safety protections online.');


-- ============================================================
-- ILLINOIS (mock data)
-- ============================================================

-- IL Senate Race
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000040', 'IL-senate-2026', 'IL', 'senate', NULL, 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year, committee_assignments) VALUES
  ('c0000000-0000-0000-0000-000000000040', 'Dick Durbin', 'Dick', 'Durbin', 'dick-durbin-il', 'D', 'IL', NULL, 'U.S. Senate', true, 2026,
   ARRAY['Judiciary', 'Appropriations']),
  ('c0000000-0000-0000-0000-000000000041', 'Mark Curran', 'Mark', 'Curran', 'mark-curran-il', 'R', 'IL', NULL, 'U.S. Senate', false, 2026, '{}');

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000040', 'c0000000-0000-0000-0000-000000000040'),
  ('b0000000-0000-0000-0000-000000000040', 'c0000000-0000-0000-0000-000000000041');

-- IL House District 6 (western suburbs Chicago)
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000041', 'IL-house-6-2026', 'IL', 'house', '6', 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year) VALUES
  ('c0000000-0000-0000-0000-000000000042', 'Sean Casten', 'Sean', 'Casten', 'sean-casten-il', 'D', 'IL', '6', 'U.S. House', true, 2026),
  ('c0000000-0000-0000-0000-000000000043', 'Keith Pekau', 'Keith', 'Pekau', 'keith-pekau-il', 'R', 'IL', '6', 'U.S. House', false, 2026);

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000041', 'c0000000-0000-0000-0000-000000000042'),
  ('b0000000-0000-0000-0000-000000000041', 'c0000000-0000-0000-0000-000000000043');

-- IL House District 11 (south suburban Chicago)
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000042', 'IL-house-11-2026', 'IL', 'house', '11', 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year) VALUES
  ('c0000000-0000-0000-0000-000000000044', 'Bill Foster', 'Bill', 'Foster', 'bill-foster-il', 'D', 'IL', '11', 'U.S. House', true, 2026),
  ('c0000000-0000-0000-0000-000000000045', 'Jerry Evans', 'Jerry', 'Evans', 'jerry-evans-il', 'R', 'IL', '11', 'U.S. House', false, 2026);

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000042', 'c0000000-0000-0000-0000-000000000044'),
  ('b0000000-0000-0000-0000-000000000042', 'c0000000-0000-0000-0000-000000000045');

-- IL House District 17 (central/western IL)
INSERT INTO races (id, slug, state, chamber, district, election_year, race_type) VALUES
  ('b0000000-0000-0000-0000-000000000043', 'IL-house-17-2026', 'IL', 'house', '17', 2026, 'regular');

INSERT INTO candidates (id, name, first_name, last_name, slug, party, state, district, office_sought, is_incumbent, election_year) VALUES
  ('c0000000-0000-0000-0000-000000000046', 'Eric Sorensen', 'Eric', 'Sorensen', 'eric-sorensen-il', 'D', 'IL', '17', 'U.S. House', true, 2026),
  ('c0000000-0000-0000-0000-000000000047', 'Regan Deering', 'Regan', 'Deering', 'regan-deering-il', 'R', 'IL', '17', 'U.S. House', false, 2026);

INSERT INTO race_candidates (race_id, candidate_id) VALUES
  ('b0000000-0000-0000-0000-000000000043', 'c0000000-0000-0000-0000-000000000046'),
  ('b0000000-0000-0000-0000-000000000043', 'c0000000-0000-0000-0000-000000000047');

-- IL Positions (Dick Durbin)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000040', 'a0000000-0000-0000-0000-000000000001', 'support', 'high', 'Supports export controls on advanced AI and semiconductor technologies.'),
  ('c0000000-0000-0000-0000-000000000040', 'a0000000-0000-0000-0000-000000000002', 'mixed', 'medium', 'Supports defense AI with strong human oversight requirements and ethical guidelines.'),
  ('c0000000-0000-0000-0000-000000000040', 'a0000000-0000-0000-0000-000000000003', 'support', 'high', 'Leading Senate voice on AI regulation. Held judiciary hearings on AI risks and governance.'),
  ('c0000000-0000-0000-0000-000000000040', 'a0000000-0000-0000-0000-000000000004', 'mixed', 'medium', 'Supports data center development with environmental considerations and labor standards.'),
  ('c0000000-0000-0000-0000-000000000040', 'a0000000-0000-0000-0000-000000000005', 'support', 'high', 'Strong advocate for children''s online safety. Led Senate hearings on AI and child safety.');

-- IL Positions (Mark Curran)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000041', 'a0000000-0000-0000-0000-000000000001', 'support', 'low', 'Generally supports maintaining technology controls for national security.'),
  ('c0000000-0000-0000-0000-000000000041', 'a0000000-0000-0000-0000-000000000002', 'support', 'medium', 'Supports strong national defense including AI capabilities.'),
  ('c0000000-0000-0000-0000-000000000041', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'medium', 'Opposes broad AI regulation, favoring innovation-friendly policies.'),
  ('c0000000-0000-0000-0000-000000000041', 'a0000000-0000-0000-0000-000000000004', 'support', 'low', 'Supports business-friendly policies for tech infrastructure.'),
  ('c0000000-0000-0000-0000-000000000041', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports protecting children from harmful online content.');

-- IL Positions (Sean Casten)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000042', 'a0000000-0000-0000-0000-000000000001', 'support', 'medium', 'Supports strategic export controls on advanced AI technologies.'),
  ('c0000000-0000-0000-0000-000000000042', 'a0000000-0000-0000-0000-000000000002', 'mixed', 'medium', 'Supports defense AI with transparency and accountability requirements.'),
  ('c0000000-0000-0000-0000-000000000042', 'a0000000-0000-0000-0000-000000000003', 'support', 'high', 'Engineer by background. Advocates for evidence-based AI regulation and safety testing.'),
  ('c0000000-0000-0000-0000-000000000042', 'a0000000-0000-0000-0000-000000000004', 'mixed', 'high', 'As clean energy advocate, concerned about data center energy usage but supports green data centers.'),
  ('c0000000-0000-0000-0000-000000000042', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports children''s online safety measures.');

-- IL Positions (Keith Pekau)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000043', 'a0000000-0000-0000-0000-000000000001', 'support', 'low', 'Supports maintaining U.S. technological advantages through trade policy.'),
  ('c0000000-0000-0000-0000-000000000043', 'a0000000-0000-0000-0000-000000000002', 'support', 'medium', 'Supports military modernization and AI in defense as former tech professional.'),
  ('c0000000-0000-0000-0000-000000000043', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'medium', 'Opposes burdensome federal AI regulation that could stifle the tech sector.'),
  ('c0000000-0000-0000-0000-000000000043', 'a0000000-0000-0000-0000-000000000004', 'support', 'medium', 'Supports tech infrastructure development and reduced regulatory barriers.'),
  ('c0000000-0000-0000-0000-000000000043', 'a0000000-0000-0000-0000-000000000005', 'support', 'low', 'Supports parental controls and children''s safety online.');

-- IL Positions (Bill Foster - physicist and congressman)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000044', 'a0000000-0000-0000-0000-000000000001', 'support', 'high', 'As a physicist, supports evidence-based export controls for dual-use technologies.'),
  ('c0000000-0000-0000-0000-000000000044', 'a0000000-0000-0000-0000-000000000002', 'mixed', 'high', 'Supports AI in defense with strong technical oversight. Advocates for AI safety testing in military applications.'),
  ('c0000000-0000-0000-0000-000000000044', 'a0000000-0000-0000-0000-000000000003', 'support', 'high', 'Only PhD physicist in Congress. Active advocate for science-based AI governance framework.'),
  ('c0000000-0000-0000-0000-000000000044', 'a0000000-0000-0000-0000-000000000004', 'support', 'medium', 'Supports data center development near Fermilab corridor with clean energy requirements.'),
  ('c0000000-0000-0000-0000-000000000044', 'a0000000-0000-0000-0000-000000000005', 'support', 'high', 'Supports comprehensive children''s online safety legislation including AI provisions.');

-- IL Positions (Jerry Evans)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000045', 'a0000000-0000-0000-0000-000000000001', 'unclear', 'low', 'No specific position on AI export controls identified.'),
  ('c0000000-0000-0000-0000-000000000045', 'a0000000-0000-0000-0000-000000000002', 'support', 'low', 'Supports strong national defense.'),
  ('c0000000-0000-0000-0000-000000000045', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'low', 'Generally opposes new federal regulations on technology.'),
  ('c0000000-0000-0000-0000-000000000045', 'a0000000-0000-0000-0000-000000000004', 'no_mention', 'low', 'No public position on data center policy.'),
  ('c0000000-0000-0000-0000-000000000045', 'a0000000-0000-0000-0000-000000000005', 'support', 'low', 'Supports children''s safety online.');

-- IL Positions (Eric Sorensen)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000046', 'a0000000-0000-0000-0000-000000000001', 'support', 'medium', 'Supports maintaining U.S. AI leadership through strategic trade controls.'),
  ('c0000000-0000-0000-0000-000000000046', 'a0000000-0000-0000-0000-000000000002', 'mixed', 'medium', 'Supports defense modernization with strong civilian oversight of autonomous systems.'),
  ('c0000000-0000-0000-0000-000000000046', 'a0000000-0000-0000-0000-000000000003', 'support', 'medium', 'Supports balanced AI regulation. Former meteorologist who values science-based policy.'),
  ('c0000000-0000-0000-0000-000000000046', 'a0000000-0000-0000-0000-000000000004', 'support', 'medium', 'Supports data center development in central Illinois for economic growth.'),
  ('c0000000-0000-0000-0000-000000000046', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports children''s online safety legislation.');

-- IL Positions (Regan Deering)
INSERT INTO positions (candidate_id, issue_id, stance, confidence, summary) VALUES
  ('c0000000-0000-0000-0000-000000000047', 'a0000000-0000-0000-0000-000000000001', 'support', 'low', 'Supports national security-oriented trade policy.'),
  ('c0000000-0000-0000-0000-000000000047', 'a0000000-0000-0000-0000-000000000002', 'support', 'medium', 'Supports strong defense and military modernization.'),
  ('c0000000-0000-0000-0000-000000000047', 'a0000000-0000-0000-0000-000000000003', 'oppose', 'medium', 'Opposes heavy federal regulation that could slow economic growth and innovation.'),
  ('c0000000-0000-0000-0000-000000000047', 'a0000000-0000-0000-0000-000000000004', 'support', 'medium', 'Supports tech infrastructure investment in her district.'),
  ('c0000000-0000-0000-0000-000000000047', 'a0000000-0000-0000-0000-000000000005', 'support', 'medium', 'Supports parental rights and children''s safety online.');


-- ============================================================
-- SAMPLE LEGISLATIVE ACTIVITY (select candidates)
-- ============================================================

INSERT INTO legislative_activity (candidate_id, activity_type, title, description, source_url, date) VALUES
  -- Ted Cruz
  ('c0000000-0000-0000-0000-000000000001', 'bill_cosponsored', 'CHIPS and Science Act Amendments',
   'Co-sponsored amendments to strengthen chip export restrictions and allied compute-sharing provisions.',
   'https://www.congress.gov/', '2024-06-15'),
  ('c0000000-0000-0000-0000-000000000001', 'bill_sponsored', 'Kids Online Safety Act (KOSA)',
   'Co-sponsored bipartisan legislation to protect children from harmful online content and algorithmic manipulation.',
   'https://www.congress.gov/', '2024-03-20'),
  ('c0000000-0000-0000-0000-000000000001', 'statement', 'Statement on AI Executive Order',
   'Criticized Biden administration AI executive order as government overreach that would slow innovation.',
   'https://www.cruz.senate.gov/', '2024-01-10'),

  -- Dick Durbin
  ('c0000000-0000-0000-0000-000000000040', 'hearing', 'Senate Judiciary Hearing on AI Oversight',
   'Chaired hearing examining AI risks to civil liberties and the need for a federal AI governance framework.',
   'https://www.judiciary.senate.gov/', '2024-05-08'),
  ('c0000000-0000-0000-0000-000000000040', 'bill_sponsored', 'AI Accountability Act',
   'Introduced legislation requiring impact assessments for high-risk AI systems in federal agencies.',
   'https://www.congress.gov/', '2024-04-15'),

  -- Tom Cotton
  ('c0000000-0000-0000-0000-000000000020', 'bill_cosponsored', 'RESTRICT Act',
   'Co-sponsored legislation to address technology threats from foreign adversaries including AI systems.',
   'https://www.congress.gov/', '2024-02-28'),
  ('c0000000-0000-0000-0000-000000000020', 'letter', 'Letter to Commerce Secretary on Chip Controls',
   'Led letter urging stronger enforcement of semiconductor export controls to China.',
   'https://www.cotton.senate.gov/', '2024-07-10'),

  -- Roger Wicker
  ('c0000000-0000-0000-0000-000000000030', 'bill_cosponsored', 'AI in Defense Act',
   'Co-sponsored legislation to accelerate AI adoption across Department of Defense.',
   'https://www.congress.gov/', '2024-03-05'),

  -- Bill Foster
  ('c0000000-0000-0000-0000-000000000044', 'bill_sponsored', 'AI Research and Development Act',
   'Introduced bill to increase federal funding for fundamental AI safety research.',
   'https://www.congress.gov/', '2024-04-22'),
  ('c0000000-0000-0000-0000-000000000044', 'hearing', 'House Science Committee AI Hearing',
   'Participated in hearing on AI technical standards and safety evaluation methodologies.',
   'https://science.house.gov/', '2024-06-12');
