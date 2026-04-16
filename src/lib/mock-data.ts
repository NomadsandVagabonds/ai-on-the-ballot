/**
 * Mock data layer for demo/preview mode.
 *
 * When Supabase is not configured, query functions fall back to this data
 * so the entire site renders with realistic content.
 */

import type {
  IssueRow,
  CandidateRow,
  PositionRow,
  LegislativeActivityRow,
  RaceRow,
  RaceCandidateRow,
} from "@/types/database";
import type {
  Candidate,
  CandidateSummary,
  RaceWithCandidates,
  ComparisonRow,
  PositionWithIssue,
  SearchResult,
} from "@/types/domain";

// ---------------------------------------------------------------------------
// Timestamp helpers
// ---------------------------------------------------------------------------
const NOW = "2026-04-15T00:00:00Z";

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------
export const MOCK_ISSUES: IssueRow[] = [
  {
    id: "00000000-0000-0000-0001-000000000001",
    slug: "export-control",
    display_name: "Export Control & Compute Governance",
    description:
      "Policies governing the export of AI chips, models, and computing infrastructure to foreign nations.",
    icon: null,
    sort_order: 1,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0001-000000000002",
    slug: "military-ai",
    display_name: "Military & National Security AI",
    description:
      "The use of artificial intelligence in defense systems, autonomous weapons, and intelligence operations.",
    icon: null,
    sort_order: 2,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0001-000000000003",
    slug: "regulation",
    display_name: "AI Regulation Philosophy",
    description:
      "Broad approach to AI governance: federal oversight, industry self-regulation, or state-level frameworks.",
    icon: null,
    sort_order: 3,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0001-000000000004",
    slug: "data-centers",
    display_name: "Data Centers",
    description:
      "Siting, permitting, energy, and environmental policy related to AI data center buildout.",
    icon: null,
    sort_order: 4,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0001-000000000005",
    slug: "children-safety",
    display_name: "Children's Online Safety",
    description:
      "Legislation and oversight protecting minors from AI-generated content, deepfakes, and algorithmic harms.",
    icon: null,
    sort_order: 5,
    created_at: NOW,
    updated_at: NOW,
  },
];

const issueMap = new Map(MOCK_ISSUES.map((i) => [i.id, i]));

// ---------------------------------------------------------------------------
// Candidates
// ---------------------------------------------------------------------------
export const MOCK_CANDIDATES: CandidateRow[] = [
  // --- Texas ---
  {
    id: "00000000-0000-0000-0002-000000000001",
    name: "Ted Cruz",
    first_name: "Ted",
    last_name: "Cruz",
    slug: "ted-cruz-tx",
    photo_url: null,
    party: "R",
    state: "TX",
    district: null,
    office_sought: "U.S. Senate",
    committee_assignments: ["Commerce, Science, and Transportation", "Judiciary"],
    election_year: 2026,
    fec_id: null,
    is_incumbent: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0002-000000000002",
    name: "Colin Allred",
    first_name: "Colin",
    last_name: "Allred",
    slug: "colin-allred-tx",
    photo_url: null,
    party: "D",
    state: "TX",
    district: null,
    office_sought: "U.S. Senate",
    committee_assignments: [],
    election_year: 2026,
    fec_id: null,
    is_incumbent: false,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0002-000000000003",
    name: "Tony Gonzales",
    first_name: "Tony",
    last_name: "Gonzales",
    slug: "tony-gonzales-tx",
    photo_url: null,
    party: "R",
    state: "TX",
    district: "23",
    office_sought: "U.S. House",
    committee_assignments: ["Appropriations"],
    election_year: 2026,
    fec_id: null,
    is_incumbent: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0002-000000000004",
    name: "Santos Limon",
    first_name: "Santos",
    last_name: "Limon",
    slug: "santos-limon-tx",
    photo_url: null,
    party: "D",
    state: "TX",
    district: "23",
    office_sought: "U.S. House",
    committee_assignments: [],
    election_year: 2026,
    fec_id: null,
    is_incumbent: false,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0002-000000000005",
    name: "Julie Johnson",
    first_name: "Julie",
    last_name: "Johnson",
    slug: "julie-johnson-tx",
    photo_url: null,
    party: "D",
    state: "TX",
    district: "32",
    office_sought: "U.S. House",
    committee_assignments: ["Science, Space, and Technology"],
    election_year: 2026,
    fec_id: null,
    is_incumbent: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0002-000000000006",
    name: "Antonio Swad",
    first_name: "Antonio",
    last_name: "Swad",
    slug: "antonio-swad-tx",
    photo_url: null,
    party: "R",
    state: "TX",
    district: "32",
    office_sought: "U.S. House",
    committee_assignments: [],
    election_year: 2026,
    fec_id: null,
    is_incumbent: false,
    created_at: NOW,
    updated_at: NOW,
  },

  // --- North Carolina ---
  {
    id: "00000000-0000-0000-0002-000000000007",
    name: "Thom Tillis",
    first_name: "Thom",
    last_name: "Tillis",
    slug: "thom-tillis-nc",
    photo_url: null,
    party: "R",
    state: "NC",
    district: null,
    office_sought: "U.S. Senate",
    committee_assignments: ["Judiciary", "Banking, Housing, and Urban Affairs"],
    election_year: 2026,
    fec_id: null,
    is_incumbent: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0002-000000000008",
    name: "Jeff Jackson",
    first_name: "Jeff",
    last_name: "Jackson",
    slug: "jeff-jackson-nc",
    photo_url: null,
    party: "D",
    state: "NC",
    district: null,
    office_sought: "U.S. Senate",
    committee_assignments: [],
    election_year: 2026,
    fec_id: null,
    is_incumbent: false,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0002-000000000009",
    name: "Don Davis",
    first_name: "Don",
    last_name: "Davis",
    slug: "don-davis-nc",
    photo_url: null,
    party: "D",
    state: "NC",
    district: "1",
    office_sought: "U.S. House",
    committee_assignments: ["Agriculture", "Armed Services"],
    election_year: 2026,
    fec_id: null,
    is_incumbent: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0002-000000000010",
    name: "Sandy Smith",
    first_name: "Sandy",
    last_name: "Smith",
    slug: "sandy-smith-nc",
    photo_url: null,
    party: "R",
    state: "NC",
    district: "1",
    office_sought: "U.S. House",
    committee_assignments: [],
    election_year: 2026,
    fec_id: null,
    is_incumbent: false,
    created_at: NOW,
    updated_at: NOW,
  },

  // --- Illinois ---
  {
    id: "00000000-0000-0000-0002-000000000011",
    name: "Dick Durbin",
    first_name: "Dick",
    last_name: "Durbin",
    slug: "dick-durbin-il",
    photo_url: null,
    party: "D",
    state: "IL",
    district: null,
    office_sought: "U.S. Senate",
    committee_assignments: ["Judiciary", "Appropriations"],
    election_year: 2026,
    fec_id: null,
    is_incumbent: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0002-000000000012",
    name: "Kathy Salvi",
    first_name: "Kathy",
    last_name: "Salvi",
    slug: "kathy-salvi-il",
    photo_url: null,
    party: "R",
    state: "IL",
    district: null,
    office_sought: "U.S. Senate",
    committee_assignments: [],
    election_year: 2026,
    fec_id: null,
    is_incumbent: false,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0002-000000000013",
    name: "Sean Casten",
    first_name: "Sean",
    last_name: "Casten",
    slug: "sean-casten-il",
    photo_url: null,
    party: "D",
    state: "IL",
    district: "6",
    office_sought: "U.S. House",
    committee_assignments: ["Financial Services", "Science, Space, and Technology"],
    election_year: 2026,
    fec_id: null,
    is_incumbent: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0002-000000000014",
    name: "Niki Conforti",
    first_name: "Niki",
    last_name: "Conforti",
    slug: "niki-conforti-il",
    photo_url: null,
    party: "R",
    state: "IL",
    district: "6",
    office_sought: "U.S. House",
    committee_assignments: [],
    election_year: 2026,
    fec_id: null,
    is_incumbent: false,
    created_at: NOW,
    updated_at: NOW,
  },

  // --- Arkansas ---
  {
    id: "00000000-0000-0000-0002-000000000015",
    name: "Tom Cotton",
    first_name: "Tom",
    last_name: "Cotton",
    slug: "tom-cotton-ar",
    photo_url: null,
    party: "R",
    state: "AR",
    district: null,
    office_sought: "U.S. Senate",
    committee_assignments: ["Intelligence", "Armed Services", "Judiciary"],
    election_year: 2026,
    fec_id: null,
    is_incumbent: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0002-000000000016",
    name: "Luke Beckmann",
    first_name: "Luke",
    last_name: "Beckmann",
    slug: "luke-beckmann-ar",
    photo_url: null,
    party: "D",
    state: "AR",
    district: null,
    office_sought: "U.S. Senate",
    committee_assignments: [],
    election_year: 2026,
    fec_id: null,
    is_incumbent: false,
    created_at: NOW,
    updated_at: NOW,
  },

  // --- Mississippi ---
  {
    id: "00000000-0000-0000-0002-000000000017",
    name: "Roger Wicker",
    first_name: "Roger",
    last_name: "Wicker",
    slug: "roger-wicker-ms",
    photo_url: null,
    party: "R",
    state: "MS",
    district: null,
    office_sought: "U.S. Senate",
    committee_assignments: ["Armed Services", "Commerce, Science, and Transportation"],
    election_year: 2026,
    fec_id: null,
    is_incumbent: true,
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0002-000000000018",
    name: "Ty Pinkins",
    first_name: "Ty",
    last_name: "Pinkins",
    slug: "ty-pinkins-ms",
    photo_url: null,
    party: "D",
    state: "MS",
    district: null,
    office_sought: "U.S. Senate",
    committee_assignments: [],
    election_year: 2026,
    fec_id: null,
    is_incumbent: false,
    created_at: NOW,
    updated_at: NOW,
  },
];

// ---------------------------------------------------------------------------
// Races
// ---------------------------------------------------------------------------
export const MOCK_RACES: RaceRow[] = [
  // Texas
  {
    id: "00000000-0000-0000-0003-000000000001",
    slug: "tx-sen-2026",
    state: "TX",
    chamber: "senate",
    district: null,
    election_year: 2026,
    race_type: "regular",
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0003-000000000002",
    slug: "tx-house-23-2026",
    state: "TX",
    chamber: "house",
    district: "23",
    election_year: 2026,
    race_type: "regular",
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0003-000000000003",
    slug: "tx-house-32-2026",
    state: "TX",
    chamber: "house",
    district: "32",
    election_year: 2026,
    race_type: "regular",
    created_at: NOW,
    updated_at: NOW,
  },
  // North Carolina
  {
    id: "00000000-0000-0000-0003-000000000004",
    slug: "nc-sen-2026",
    state: "NC",
    chamber: "senate",
    district: null,
    election_year: 2026,
    race_type: "regular",
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0003-000000000005",
    slug: "nc-house-1-2026",
    state: "NC",
    chamber: "house",
    district: "1",
    election_year: 2026,
    race_type: "regular",
    created_at: NOW,
    updated_at: NOW,
  },
  // Illinois
  {
    id: "00000000-0000-0000-0003-000000000006",
    slug: "il-sen-2026",
    state: "IL",
    chamber: "senate",
    district: null,
    election_year: 2026,
    race_type: "regular",
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: "00000000-0000-0000-0003-000000000007",
    slug: "il-house-6-2026",
    state: "IL",
    chamber: "house",
    district: "6",
    election_year: 2026,
    race_type: "regular",
    created_at: NOW,
    updated_at: NOW,
  },
  // Arkansas
  {
    id: "00000000-0000-0000-0003-000000000008",
    slug: "ar-sen-2026",
    state: "AR",
    chamber: "senate",
    district: null,
    election_year: 2026,
    race_type: "regular",
    created_at: NOW,
    updated_at: NOW,
  },
  // Mississippi
  {
    id: "00000000-0000-0000-0003-000000000009",
    slug: "ms-sen-2026",
    state: "MS",
    chamber: "senate",
    district: null,
    election_year: 2026,
    race_type: "regular",
    created_at: NOW,
    updated_at: NOW,
  },
];

// ---------------------------------------------------------------------------
// Race-Candidate junction
// ---------------------------------------------------------------------------
export const MOCK_RACE_CANDIDATES: RaceCandidateRow[] = [
  // TX Senate
  { race_id: "00000000-0000-0000-0003-000000000001", candidate_id: "00000000-0000-0000-0002-000000000001" },
  { race_id: "00000000-0000-0000-0003-000000000001", candidate_id: "00000000-0000-0000-0002-000000000002" },
  // TX-23
  { race_id: "00000000-0000-0000-0003-000000000002", candidate_id: "00000000-0000-0000-0002-000000000003" },
  { race_id: "00000000-0000-0000-0003-000000000002", candidate_id: "00000000-0000-0000-0002-000000000004" },
  // TX-32
  { race_id: "00000000-0000-0000-0003-000000000003", candidate_id: "00000000-0000-0000-0002-000000000005" },
  { race_id: "00000000-0000-0000-0003-000000000003", candidate_id: "00000000-0000-0000-0002-000000000006" },
  // NC Senate
  { race_id: "00000000-0000-0000-0003-000000000004", candidate_id: "00000000-0000-0000-0002-000000000007" },
  { race_id: "00000000-0000-0000-0003-000000000004", candidate_id: "00000000-0000-0000-0002-000000000008" },
  // NC-01
  { race_id: "00000000-0000-0000-0003-000000000005", candidate_id: "00000000-0000-0000-0002-000000000009" },
  { race_id: "00000000-0000-0000-0003-000000000005", candidate_id: "00000000-0000-0000-0002-000000000010" },
  // IL Senate
  { race_id: "00000000-0000-0000-0003-000000000006", candidate_id: "00000000-0000-0000-0002-000000000011" },
  { race_id: "00000000-0000-0000-0003-000000000006", candidate_id: "00000000-0000-0000-0002-000000000012" },
  // IL-06
  { race_id: "00000000-0000-0000-0003-000000000007", candidate_id: "00000000-0000-0000-0002-000000000013" },
  { race_id: "00000000-0000-0000-0003-000000000007", candidate_id: "00000000-0000-0000-0002-000000000014" },
  // AR Senate
  { race_id: "00000000-0000-0000-0003-000000000008", candidate_id: "00000000-0000-0000-0002-000000000015" },
  { race_id: "00000000-0000-0000-0003-000000000008", candidate_id: "00000000-0000-0000-0002-000000000016" },
  // MS Senate
  { race_id: "00000000-0000-0000-0003-000000000009", candidate_id: "00000000-0000-0000-0002-000000000017" },
  { race_id: "00000000-0000-0000-0003-000000000009", candidate_id: "00000000-0000-0000-0002-000000000018" },
];

// ---------------------------------------------------------------------------
// Positions  (PositionRow & { issue: IssueRow })
// ---------------------------------------------------------------------------

// Helper to generate a position entry
let posCounter = 0;
function pos(
  candidateId: string,
  issueId: string,
  stance: PositionRow["stance"],
  confidence: PositionRow["confidence"],
  summary: string | null,
  fullQuote?: string | null,
  sourceUrl?: string | null,
  dateRecorded?: string | null,
): PositionRow & { issue: IssueRow } {
  posCounter++;
  const id = `00000000-0000-0000-0004-${String(posCounter).padStart(12, "0")}`;
  return {
    id,
    candidate_id: candidateId,
    issue_id: issueId,
    stance,
    confidence,
    summary,
    full_quote: fullQuote ?? null,
    source_url: sourceUrl ?? null,
    date_recorded: dateRecorded ?? "2026-01-15",
    last_updated: NOW,
    created_at: NOW,
    updated_at: NOW,
    issue: issueMap.get(issueId)!,
  };
}

// Issue ID shortcuts
const EXPORT = "00000000-0000-0000-0001-000000000001";
const MILITARY = "00000000-0000-0000-0001-000000000002";
const REGULATION = "00000000-0000-0000-0001-000000000003";
const DATACENTERS = "00000000-0000-0000-0001-000000000004";
const CHILDREN = "00000000-0000-0000-0001-000000000005";

// Candidate ID shortcuts
const CRUZ = "00000000-0000-0000-0002-000000000001";
const ALLRED = "00000000-0000-0000-0002-000000000002";
const GONZALES = "00000000-0000-0000-0002-000000000003";
const LIMON = "00000000-0000-0000-0002-000000000004";
const J_JOHNSON = "00000000-0000-0000-0002-000000000005";
const SWAD = "00000000-0000-0000-0002-000000000006";
const TILLIS = "00000000-0000-0000-0002-000000000007";
const JACKSON = "00000000-0000-0000-0002-000000000008";
const DAVIS = "00000000-0000-0000-0002-000000000009";
const S_SMITH = "00000000-0000-0000-0002-000000000010";
const DURBIN = "00000000-0000-0000-0002-000000000011";
const SALVI = "00000000-0000-0000-0002-000000000012";
const CASTEN = "00000000-0000-0000-0002-000000000013";
const CONFORTI = "00000000-0000-0000-0002-000000000014";
const COTTON = "00000000-0000-0000-0002-000000000015";
const BECKMANN = "00000000-0000-0000-0002-000000000016";
const WICKER = "00000000-0000-0000-0002-000000000017";
const PINKINS = "00000000-0000-0000-0002-000000000018";

export const MOCK_POSITIONS: (PositionRow & { issue: IssueRow })[] = [
  // -------------------------------------------------------------------------
  // Ted Cruz (TX-R)
  // -------------------------------------------------------------------------
  pos(CRUZ, EXPORT, "support", "high",
    "Strong advocate for tightening export controls on advanced AI chips to China. Co-sponsored the CHIPS and Science Act provisions limiting technology transfer.",
    "We cannot allow our adversaries to access the most advanced computing technology. Export controls on AI chips are a matter of national security.",
    "#", "2025-11-20"),
  pos(CRUZ, MILITARY, "support", "high",
    "Supports robust funding for military AI programs and autonomous defense systems. Chairs the Commerce subcommittee on space and technology.",
    "American leadership in military AI is non-negotiable. Our warfighters deserve every technological advantage we can provide.",
    "#", "2025-10-05"),
  pos(CRUZ, REGULATION, "oppose", "high",
    "Opposes federal AI regulation, arguing it would stifle innovation and U.S. competitiveness. Favors industry self-governance with targeted enforcement.",
    null, "#", "2026-01-10"),
  pos(CRUZ, DATACENTERS, "support", "medium",
    "Supports streamlined permitting for data center construction in Texas. Advocates for energy grid modernization to support AI infrastructure.",
    null, "#", "2025-12-15"),
  pos(CRUZ, CHILDREN, "mixed", "medium",
    "Has expressed concern about AI-generated child exploitation material but is cautious about broad content regulation that could affect free speech.",
    null, null, "2025-09-22"),

  // -------------------------------------------------------------------------
  // Colin Allred (TX-D)
  // -------------------------------------------------------------------------
  pos(ALLRED, EXPORT, "support", "medium",
    "Supports maintaining export controls on advanced AI technology. Emphasizes a multilateral approach with allies to be effective.",
    null, "#", "2025-12-01"),
  pos(ALLRED, MILITARY, "mixed", "medium",
    "Supports AI in defense but calls for stronger human oversight of autonomous weapons systems. Advocates for congressional review of AI deployment in combat.",
    "We should embrace AI for defense, but a human being must always be in the loop when lethal force decisions are made.",
    "#", "2025-11-15"),
  pos(ALLRED, REGULATION, "support", "high",
    "Supports a federal framework for AI oversight, including transparency requirements for foundation models and algorithmic accountability.",
    null, "#", "2026-02-10"),
  pos(ALLRED, DATACENTERS, "mixed", "medium",
    "Supports data center development but insists on environmental review and community input. Concerned about water usage and grid strain in Texas.",
    null, null, "2026-01-05"),
  pos(ALLRED, CHILDREN, "support", "high",
    "Co-sponsored the Kids Online Safety Act. Supports age verification for AI-powered platforms and mandatory safety assessments.",
    "Every parent in Texas should know that Congress is working to keep their kids safe online, including from AI-generated threats.",
    "#", "2025-10-20"),

  // -------------------------------------------------------------------------
  // Tony Gonzales (TX-R)
  // -------------------------------------------------------------------------
  pos(GONZALES, EXPORT, "support", "medium",
    "Supports export controls as part of border and national security framework. Focused on preventing sensitive technology from reaching cartels and adversaries.",
    null, null, "2025-11-01"),
  pos(GONZALES, MILITARY, "support", "high",
    "Vocal supporter of AI-enabled border security systems and military AI investment as a member of the Appropriations Committee.",
    "As a Navy veteran, I know technology saves lives. AI on the border and on the battlefield is the future.",
    "#", "2025-12-10"),
  pos(GONZALES, REGULATION, "oppose", "medium",
    "Prefers light-touch regulation and opposes blanket federal AI mandates. Concerned about compliance burden on small tech firms in his district.",
    null, null, "2026-01-20"),
  pos(GONZALES, DATACENTERS, "support", "low",
    "Generally supportive of economic development from data centers in West Texas but has not taken a prominent position.",
    null, null, "2025-08-15"),
  pos(GONZALES, CHILDREN, "support", "medium",
    "Supports legislation to protect children online. Voted for the SHIELD Act provisions related to AI-generated CSAM.",
    null, "#", "2025-09-10"),

  // -------------------------------------------------------------------------
  // Santos Limon (TX-D)
  // -------------------------------------------------------------------------
  pos(LIMON, EXPORT, "unclear", "low",
    "Has not taken a public position on AI export control policy.",
    null, null, "2026-03-01"),
  pos(LIMON, MILITARY, "mixed", "low",
    "General support for defense spending but has expressed caution about autonomous weapons. Has not elaborated on AI-specific defense policy.",
    null, null, "2026-02-15"),
  pos(LIMON, REGULATION, "support", "medium",
    "Supports stronger consumer protections for AI systems, particularly in hiring and lending. Advocates for algorithmic transparency.",
    null, null, "2026-01-25"),
  pos(LIMON, DATACENTERS, "mixed", "medium",
    "Concerned about water and energy impacts of data center expansion in drought-prone areas of TX-23. Wants stronger environmental safeguards.",
    null, null, "2026-02-20"),
  pos(LIMON, CHILDREN, "support", "medium",
    "Supports stricter regulation of AI content targeting minors. Emphasizes digital literacy education in schools.",
    null, null, "2026-03-05"),

  // -------------------------------------------------------------------------
  // Julie Johnson (TX-D)
  // -------------------------------------------------------------------------
  pos(J_JOHNSON, EXPORT, "support", "medium",
    "Supports export controls as a member of the Science, Space, and Technology Committee. Favors strategic alignment with allied nations.",
    null, "#", "2025-11-10"),
  pos(J_JOHNSON, MILITARY, "mixed", "medium",
    "Supports AI R&D in defense but advocates for strong ethical guidelines and congressional oversight of autonomous systems.",
    null, null, "2025-12-05"),
  pos(J_JOHNSON, REGULATION, "support", "high",
    "Advocates for a comprehensive federal AI framework. Led a bipartisan House letter calling for mandatory impact assessments for high-risk AI systems.",
    "We need guardrails, not roadblocks. Smart regulation can protect consumers while allowing American AI innovation to thrive.",
    "#", "2026-01-30"),
  pos(J_JOHNSON, DATACENTERS, "support", "medium",
    "Supports data center development in the DFW area with clean energy requirements. Has hosted industry roundtables on sustainable AI infrastructure.",
    null, "#", "2025-10-25"),
  pos(J_JOHNSON, CHILDREN, "support", "high",
    "Strong proponent of children's online safety legislation. Supports mandatory age verification and parental notification for AI-powered platforms.",
    null, "#", "2025-11-30"),

  // -------------------------------------------------------------------------
  // Antonio Swad (TX-R)
  // -------------------------------------------------------------------------
  pos(SWAD, EXPORT, "support", "low",
    "Generally supportive of export controls on grounds of national security. Has not detailed a specific policy platform.",
    null, null, "2026-02-01"),
  pos(SWAD, MILITARY, "support", "medium",
    "Supports increased defense AI investment. Frames AI as critical to maintaining military superiority.",
    null, null, "2026-01-15"),
  pos(SWAD, REGULATION, "oppose", "high",
    "Opposes federal AI regulation. Argues the private sector should lead AI governance and that regulation would drive companies overseas.",
    "Government bureaucrats should not be telling our tech companies how to innovate. America leads in AI because of free enterprise, not regulation.",
    "#", "2026-02-25"),
  pos(SWAD, DATACENTERS, "support", "medium",
    "Supports fast-tracking data center permits. Views AI infrastructure as an economic driver for North Texas.",
    null, null, "2026-03-10"),
  pos(SWAD, CHILDREN, "mixed", "low",
    "Acknowledges concerns about children's online safety but has not committed to specific legislation.",
    null, null, "2026-03-15"),

  // -------------------------------------------------------------------------
  // Thom Tillis (NC-R)
  // -------------------------------------------------------------------------
  pos(TILLIS, EXPORT, "support", "high",
    "Co-authored bipartisan export control provisions targeting AI chipmakers. Advocates for closing loopholes in existing controls.",
    "Export controls are only as strong as their enforcement. We need to close the backdoor routes that let adversaries acquire advanced AI chips.",
    "#", "2025-10-10"),
  pos(TILLIS, MILITARY, "support", "high",
    "Supports military AI modernization and has backed defense appropriations for autonomous systems and AI-enabled intelligence.",
    null, "#", "2025-11-25"),
  pos(TILLIS, REGULATION, "mixed", "medium",
    "Open to targeted AI regulation, particularly around deepfakes and IP protection, but opposes broad horizontal AI legislation.",
    null, "#", "2026-01-05"),
  pos(TILLIS, DATACENTERS, "support", "high",
    "Strong proponent of data center development in North Carolina. Helped secure state incentives for major AI campus investments in the Research Triangle.",
    null, "#", "2025-12-20"),
  pos(TILLIS, CHILDREN, "support", "high",
    "Lead co-sponsor of the PROTECT Kids Online Act. Has held multiple Senate hearings on AI-generated content targeting minors.",
    "No child should be victimized by AI. We need federal legislation with real teeth to go after the platforms that allow it.",
    "#", "2025-09-15"),

  // -------------------------------------------------------------------------
  // Jeff Jackson (NC-D)
  // -------------------------------------------------------------------------
  pos(JACKSON, EXPORT, "support", "medium",
    "Supports export controls and emphasizes the importance of allied coordination. Has called for a multilateral export control regime for AI.",
    null, null, "2025-12-05"),
  pos(JACKSON, MILITARY, "mixed", "high",
    "Former military officer who supports AI in defense but has been vocal about the need for human oversight and accountability.",
    "I served in Afghanistan. I know the value of technology in combat. But autonomous killing machines without human judgment is a line we should not cross.",
    "#", "2025-11-01"),
  pos(JACKSON, REGULATION, "support", "high",
    "Advocates for a federal AI accountability framework. Proposes mandatory disclosure of AI use in government decision-making and financial services.",
    null, "#", "2026-02-15"),
  pos(JACKSON, DATACENTERS, "support", "medium",
    "Supports data center investment in North Carolina with workforce development requirements. Advocates for training programs tied to new facilities.",
    null, null, "2026-01-10"),
  pos(JACKSON, CHILDREN, "support", "high",
    "Supports comprehensive children's online safety legislation including AI-specific provisions. Active on social media raising awareness about AI risks to minors.",
    null, "#", "2025-10-30"),

  // -------------------------------------------------------------------------
  // Don Davis (NC-D)
  // -------------------------------------------------------------------------
  pos(DAVIS, EXPORT, "unclear", "low",
    "Has not taken a detailed public position on AI export controls.",
    null, null, "2026-03-01"),
  pos(DAVIS, MILITARY, "support", "medium",
    "As an Armed Services Committee member, supports defense modernization including AI-enabled systems. Focuses on military base impacts in NC-01.",
    null, "#", "2025-12-01"),
  pos(DAVIS, REGULATION, "support", "medium",
    "Generally supports federal oversight of AI systems, especially in agriculture and healthcare sectors relevant to his rural district.",
    null, null, "2026-01-20"),
  pos(DAVIS, DATACENTERS, "mixed", "low",
    "Has not taken a strong position. District is primarily rural and not a major data center market.",
    null, null, "2026-02-10"),
  pos(DAVIS, CHILDREN, "support", "medium",
    "Supports children's online safety measures. Has emphasized the need to protect rural communities with limited digital literacy resources.",
    null, null, "2025-11-10"),

  // -------------------------------------------------------------------------
  // Sandy Smith (NC-R)
  // -------------------------------------------------------------------------
  pos(S_SMITH, EXPORT, "support", "low",
    "Supports strong national security measures including export controls. Has not detailed AI-specific export policy.",
    null, null, "2026-02-05"),
  pos(S_SMITH, MILITARY, "support", "medium",
    "Supports military AI investment and a strong national defense. Emphasizes AI for border and homeland security.",
    null, null, "2026-01-15"),
  pos(S_SMITH, REGULATION, "oppose", "medium",
    "Opposes broad federal AI regulation. Frames AI oversight as government overreach that could harm small businesses.",
    null, null, "2026-02-20"),
  pos(S_SMITH, DATACENTERS, "support", "low",
    "Generally supportive of economic development but has not specifically addressed data center policy.",
    null, null, "2026-03-01"),
  pos(S_SMITH, CHILDREN, "support", "medium",
    "Supports protecting children online. Favors parental controls and industry responsibility over new federal mandates.",
    null, null, "2026-01-25"),

  // -------------------------------------------------------------------------
  // Dick Durbin (IL-D)
  // -------------------------------------------------------------------------
  pos(DURBIN, EXPORT, "support", "high",
    "As Judiciary Committee chair, has pushed for strengthened export controls on AI technology. Supports the bipartisan approach to restrict advanced chip exports.",
    null, "#", "2025-10-15"),
  pos(DURBIN, MILITARY, "mixed", "high",
    "Supports AI in defense but has led Senate hearings questioning the Pentagon's autonomous weapons programs. Advocates for strict human oversight requirements.",
    "We must ensure that the decision to take a human life is never delegated entirely to a machine. That is a moral line we cannot cross.",
    "#", "2025-11-20"),
  pos(DURBIN, REGULATION, "support", "high",
    "Lead sponsor of the AI Accountability Act. Proposes mandatory risk assessments, transparency requirements, and a federal AI oversight body.",
    "Every major technology in history has eventually required a regulatory framework. AI is no different, and waiting is not an option.",
    "#", "2026-02-01"),
  pos(DURBIN, DATACENTERS, "mixed", "medium",
    "Supports data center investment in Illinois but has raised concerns about energy consumption and environmental impact. Favors clean energy requirements.",
    null, null, "2025-12-10"),
  pos(DURBIN, CHILDREN, "support", "high",
    "Lead co-sponsor of children's AI safety provisions in the Senate. Has held multiple hearings with tech executives on AI risks to minors.",
    null, "#", "2025-09-25"),

  // -------------------------------------------------------------------------
  // Kathy Salvi (IL-R)
  // -------------------------------------------------------------------------
  pos(SALVI, EXPORT, "support", "low",
    "Supports export controls on national security grounds. Has not articulated a detailed AI export control platform.",
    null, null, "2026-02-10"),
  pos(SALVI, MILITARY, "support", "medium",
    "Supports military AI modernization and increased defense technology spending.",
    null, null, "2026-01-20"),
  pos(SALVI, REGULATION, "oppose", "high",
    "Opposes the AI Accountability Act and broad federal AI mandates. Argues regulation should be sector-specific and avoid stifling innovation.",
    "Illinois already has some of the most burdensome regulations in the country. We don't need Washington adding more red tape to our tech sector.",
    "#", "2026-02-28"),
  pos(SALVI, DATACENTERS, "support", "medium",
    "Supports data center development as an economic growth engine for Illinois. Opposes additional environmental restrictions on data center construction.",
    null, null, "2026-01-30"),
  pos(SALVI, CHILDREN, "support", "medium",
    "Supports protecting children online but prefers parental empowerment and industry self-regulation over federal mandates.",
    null, null, "2026-02-15"),

  // -------------------------------------------------------------------------
  // Sean Casten (IL-D)
  // -------------------------------------------------------------------------
  pos(CASTEN, EXPORT, "support", "medium",
    "Supports strategic export controls. As a member of the Science Committee, has advocated for coordinated multilateral approaches.",
    null, "#", "2025-11-05"),
  pos(CASTEN, MILITARY, "mixed", "medium",
    "Supports AI research in defense but wants stronger ethics guidelines. Concerned about autonomous weapons proliferation.",
    null, null, "2025-12-15"),
  pos(CASTEN, REGULATION, "support", "high",
    "Advocates for comprehensive AI legislation. Has introduced a bill requiring algorithmic impact assessments for financial services AI.",
    "We regulate every other technology that can harm consumers. AI should be no different.",
    "#", "2026-01-25"),
  pos(CASTEN, DATACENTERS, "mixed", "high",
    "Focuses on energy efficiency and clean power requirements for data centers. Former clean energy CEO who frames data centers as both opportunity and climate risk.",
    "Data centers are consuming more electricity than some small countries. If we're going to build this AI infrastructure, it has to run on clean energy.",
    "#", "2025-10-20"),
  pos(CASTEN, CHILDREN, "support", "high",
    "Co-sponsor of the Kids Online Safety Act. Supports mandatory safety assessments for AI systems that interact with minors.",
    null, "#", "2025-11-15"),

  // -------------------------------------------------------------------------
  // Niki Conforti (IL-R)
  // -------------------------------------------------------------------------
  pos(CONFORTI, EXPORT, "unclear", "low",
    "Has not taken a public position on AI export controls.",
    null, null, "2026-03-10"),
  pos(CONFORTI, MILITARY, "support", "low",
    "Supports strong national defense including AI modernization. Has not detailed specific AI defense policy positions.",
    null, null, "2026-02-20"),
  pos(CONFORTI, REGULATION, "oppose", "medium",
    "Opposes heavy-handed federal AI regulation. Favors innovation-friendly policies and industry-led standards.",
    null, null, "2026-03-01"),
  pos(CONFORTI, DATACENTERS, "support", "medium",
    "Supports data center construction in the suburbs as an economic development opportunity. Opposes what she calls excessive environmental review delays.",
    null, null, "2026-02-25"),
  pos(CONFORTI, CHILDREN, "support", "medium",
    "Supports protecting children online. Emphasizes parental rights and education-based approaches.",
    null, null, "2026-03-05"),

  // -------------------------------------------------------------------------
  // Tom Cotton (AR-R)
  // -------------------------------------------------------------------------
  pos(COTTON, EXPORT, "support", "high",
    "One of the Senate's most vocal advocates for strict AI export controls. Has introduced legislation to ban AI chip exports to China entirely.",
    "We are in a technology Cold War with China. Every advanced AI chip that reaches Beijing is a bullet aimed at American security.",
    "#", "2025-09-20"),
  pos(COTTON, MILITARY, "support", "high",
    "As a member of Armed Services and Intelligence committees, strongly supports military AI programs and autonomous defense systems.",
    null, "#", "2025-10-15"),
  pos(COTTON, REGULATION, "oppose", "high",
    "Opposes domestic AI regulation. Argues the U.S. should focus on winning the AI race against China rather than handicapping American companies.",
    null, "#", "2026-01-05"),
  pos(COTTON, DATACENTERS, "support", "medium",
    "Supports data center expansion and has advocated for Arkansas as a hub for AI infrastructure development.",
    null, null, "2025-12-01"),
  pos(COTTON, CHILDREN, "mixed", "medium",
    "Supports targeted legislation on AI-generated CSAM but has not backed broader children's online safety bills, citing free speech concerns.",
    null, null, "2025-11-10"),

  // -------------------------------------------------------------------------
  // Luke Beckmann (AR-D)
  // -------------------------------------------------------------------------
  pos(BECKMANN, EXPORT, "support", "low",
    "Generally supports export controls. Has not developed a detailed AI export control platform.",
    null, null, "2026-02-15"),
  pos(BECKMANN, MILITARY, "mixed", "low",
    "Supports a strong military but has expressed caution about autonomous weapons systems. Favors human oversight.",
    null, null, "2026-03-01"),
  pos(BECKMANN, REGULATION, "support", "medium",
    "Supports reasonable federal AI oversight. Emphasizes consumer protection and algorithmic fairness in hiring and lending.",
    null, null, "2026-02-20"),
  pos(BECKMANN, DATACENTERS, "mixed", "medium",
    "Supports economic development from data centers but wants local communities to share in the benefits. Concerned about water usage in rural Arkansas.",
    null, null, "2026-01-25"),
  pos(BECKMANN, CHILDREN, "support", "medium",
    "Supports children's online safety legislation. Frames the issue as protecting Arkansas families from predatory AI technology.",
    null, null, "2026-02-28"),

  // -------------------------------------------------------------------------
  // Roger Wicker (MS-R)
  // -------------------------------------------------------------------------
  pos(WICKER, EXPORT, "support", "high",
    "As ranking member of Commerce Committee, has championed export controls on AI computing hardware. Key voice on technology competition with China.",
    null, "#", "2025-10-25"),
  pos(WICKER, MILITARY, "support", "high",
    "Strong supporter of military AI and defense technology as the senior Armed Services member. Led efforts to increase AI research funding at DoD.",
    "Artificial intelligence will define the next generation of warfare. America must lead, or our adversaries will.",
    "#", "2025-11-15"),
  pos(WICKER, REGULATION, "oppose", "medium",
    "Opposes comprehensive federal AI regulation. Supports sector-specific approaches and industry self-governance.",
    null, null, "2026-01-10"),
  pos(WICKER, DATACENTERS, "support", "medium",
    "Supports data center development in Mississippi as an economic opportunity. Has backed incentive packages for tech investment in the state.",
    null, "#", "2025-12-05"),
  pos(WICKER, CHILDREN, "support", "medium",
    "Supports legislation to protect children from AI-generated harmful content. Has co-sponsored targeted enforcement measures.",
    null, null, "2025-10-05"),

  // -------------------------------------------------------------------------
  // Ty Pinkins (MS-D)
  // -------------------------------------------------------------------------
  pos(PINKINS, EXPORT, "unclear", "low",
    "Has not taken a public position on AI export control policy.",
    null, null, "2026-03-15"),
  pos(PINKINS, MILITARY, "support", "medium",
    "As a veteran, supports defense modernization including AI systems. Emphasizes veterans' role in guiding responsible military AI development.",
    null, null, "2026-02-10"),
  pos(PINKINS, REGULATION, "support", "medium",
    "Supports federal AI guardrails, especially around discriminatory algorithms in criminal justice and hiring systems.",
    null, null, "2026-02-25"),
  pos(PINKINS, DATACENTERS, "mixed", "low",
    "Interested in economic benefits of data centers for Mississippi but wants to ensure jobs and infrastructure benefits reach underserved communities.",
    null, null, "2026-03-05"),
  pos(PINKINS, CHILDREN, "support", "medium",
    "Supports children's online safety legislation. Emphasizes digital equity and access to safety tools for all families.",
    null, null, "2026-03-10"),
];

// ---------------------------------------------------------------------------
// Legislative Activity
// ---------------------------------------------------------------------------
let actCounter = 0;
function act(
  candidateId: string,
  activityType: LegislativeActivityRow["activity_type"],
  title: string,
  description: string | null,
  sourceUrl: string | null,
  date: string | null,
): LegislativeActivityRow {
  actCounter++;
  const id = `00000000-0000-0000-0005-${String(actCounter).padStart(12, "0")}`;
  return {
    id,
    candidate_id: candidateId,
    activity_type: activityType,
    title,
    description,
    source_url: sourceUrl,
    date,
    created_at: NOW,
    updated_at: NOW,
  };
}

export const MOCK_LEGISLATIVE_ACTIVITY: LegislativeActivityRow[] = [
  // Ted Cruz
  act(CRUZ, "bill_sponsored",
    "S. 1234 — AI Export Control Enhancement Act",
    "Legislation to expand the scope of AI chip export restrictions and close transshipment loopholes through third countries.",
    "#", "2025-11-15"),
  act(CRUZ, "hearing",
    "Senate Commerce Subcommittee Hearing on AI Competition",
    "Chaired a hearing examining U.S. competitiveness in AI and the role of export controls in maintaining technological leadership.",
    "#", "2025-10-20"),
  act(CRUZ, "vote",
    "Voted YES on NDAA Amendment 447 — Military AI Authorization",
    "Supported an amendment to the National Defense Authorization Act authorizing $2.5B for military AI research and development programs.",
    "#", "2025-12-10"),
  act(CRUZ, "statement",
    "Floor Statement on AI Innovation and Regulation",
    "Delivered a 20-minute Senate floor speech arguing against the AI Accountability Act, calling it a 'European-style regulatory straitjacket.'",
    "#", "2026-01-08"),

  // Colin Allred
  act(ALLRED, "bill_cosponsored",
    "S. 2456 — Kids Online Safety Act (KOSA)",
    "Co-sponsored the Kids Online Safety Act, which includes provisions for AI-powered platforms serving minors.",
    "#", "2025-10-15"),
  act(ALLRED, "hearing",
    "Senate Judiciary Subcommittee Hearing on AI and Civil Rights",
    "Testified about the impact of AI-driven hiring systems on employment discrimination in Texas.",
    "#", "2025-11-05"),
  act(ALLRED, "bill_sponsored",
    "S. 3012 — Algorithmic Accountability in Hiring Act",
    "Introduced legislation requiring companies using AI in hiring to conduct annual bias audits and publish results.",
    "#", "2026-02-01"),

  // Thom Tillis
  act(TILLIS, "bill_sponsored",
    "S. 987 — PROTECT Kids Online Act",
    "Lead sponsor of bipartisan legislation targeting AI-generated content exploiting minors, with enhanced criminal penalties.",
    "#", "2025-09-10"),
  act(TILLIS, "hearing",
    "Senate Judiciary Hearing on AI and Intellectual Property",
    "Led a hearing examining how AI-generated content affects copyright law and creative industries.",
    "#", "2025-10-30"),
  act(TILLIS, "vote",
    "Voted YES on Export Control Reauthorization Act",
    "Supported reauthorization and expansion of the Commerce Department's authority to restrict AI technology exports.",
    "#", "2025-11-20"),
  act(TILLIS, "letter",
    "Bipartisan Letter to FTC on AI Deepfake Enforcement",
    "Co-authored a letter with 12 senators urging the FTC to prioritize enforcement actions against AI-generated deepfakes.",
    "#", "2026-01-15"),

  // Dick Durbin
  act(DURBIN, "bill_sponsored",
    "S. 1567 — AI Accountability Act of 2026",
    "Comprehensive legislation requiring mandatory risk assessments, transparency disclosures, and establishing a Federal AI Oversight Office.",
    "#", "2026-01-20"),
  act(DURBIN, "hearing",
    "Senate Judiciary Committee Hearing on AI Oversight",
    "Chaired a full committee hearing featuring testimony from AI safety researchers, industry leaders, and civil liberties organizations.",
    "#", "2025-11-12"),
  act(DURBIN, "vote",
    "Voted YES on Amendment to Require AI Disclosure in Government",
    "Supported an amendment requiring all federal agencies to disclose when AI systems are used in decision-making affecting citizens.",
    "#", "2025-12-05"),
  act(DURBIN, "statement",
    "Op-Ed: Why America Needs AI Guardrails Now",
    "Published an op-ed in the Chicago Tribune laying out the case for the AI Accountability Act and federal AI oversight.",
    "#", "2026-02-14"),
];

// ---------------------------------------------------------------------------
// Helper: build CandidateSummary from CandidateRow
// ---------------------------------------------------------------------------
function buildSummary(c: CandidateRow): CandidateSummary {
  const candidatePositions = MOCK_POSITIONS.filter(
    (p) => p.candidate_id === c.id && p.stance !== "no_mention"
  );
  const posCount = candidatePositions.length;
  const issueCount = MOCK_ISSUES.length;

  // Build ordered stance array (one per issue, in sort order)
  const stances = MOCK_ISSUES.map((issue) => {
    const pos = MOCK_POSITIONS.find(
      (p) => p.candidate_id === c.id && p.issue_id === issue.id
    );
    return pos?.stance ?? ("no_mention" as const);
  });

  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    photo_url: c.photo_url,
    party: c.party,
    state: c.state,
    district: c.district,
    office_sought: c.office_sought,
    is_incumbent: c.is_incumbent,
    position_count: posCount,
    coverage_percentage: issueCount > 0 ? Math.round((posCount / issueCount) * 100) : 0,
    stances,
  };
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/** Get a single candidate by slug with positions and legislative activity */
export function getMockCandidateBySlug(slug: string): Candidate | null {
  const row = MOCK_CANDIDATES.find((c) => c.slug === slug);
  if (!row) return null;

  const positions = MOCK_POSITIONS
    .filter((p) => p.candidate_id === row.id)
    .sort((a, b) => a.issue.sort_order - b.issue.sort_order);

  const activity = MOCK_LEGISLATIVE_ACTIVITY
    .filter((a) => a.candidate_id === row.id)
    .sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return b.date.localeCompare(a.date);
    });

  return {
    ...row,
    positions,
    legislative_activity: activity,
  };
}

/** Get candidate summaries for a list of candidate IDs */
export function getMockCandidateSummaries(candidateIds: string[]): CandidateSummary[] {
  return MOCK_CANDIDATES
    .filter((c) => candidateIds.includes(c.id))
    .map(buildSummary);
}

/** Get all races for a state with their candidates */
export function getMockRacesByState(stateAbbr: string): RaceWithCandidates[] {
  const upperAbbr = stateAbbr.toUpperCase();
  const stateRaces = MOCK_RACES.filter((r) => r.state === upperAbbr);
  if (stateRaces.length === 0) return [];

  const chamberOrder: Record<string, number> = { senate: 0, governor: 1, house: 2 };

  return stateRaces
    .map((race) => {
      const candidateIds = MOCK_RACE_CANDIDATES
        .filter((rc) => rc.race_id === race.id)
        .map((rc) => rc.candidate_id);

      const candidates = MOCK_CANDIDATES
        .filter((c) => candidateIds.includes(c.id))
        .map(buildSummary)
        .sort((a, b) => a.name.localeCompare(b.name));

      return { ...race, candidates };
    })
    .sort((a, b) => {
      const chamberDiff = (chamberOrder[a.chamber] ?? 99) - (chamberOrder[b.chamber] ?? 99);
      if (chamberDiff !== 0) return chamberDiff;
      return (a.district ?? "").localeCompare(b.district ?? "");
    });
}

/** Get a single race by slug with candidates */
export function getMockRaceBySlug(slug: string): RaceWithCandidates | null {
  const race = MOCK_RACES.find((r) => r.slug === slug);
  if (!race) return null;

  const candidateIds = MOCK_RACE_CANDIDATES
    .filter((rc) => rc.race_id === race.id)
    .map((rc) => rc.candidate_id);

  const candidates = MOCK_CANDIDATES
    .filter((c) => candidateIds.includes(c.id))
    .map(buildSummary)
    .sort((a, b) => a.name.localeCompare(b.name));

  return { ...race, candidates };
}

/** Build comparison rows for a set of candidate IDs */
export function getMockComparisonData(candidateIds: string[]): ComparisonRow[] {
  if (candidateIds.length === 0) return [];

  return MOCK_ISSUES.map((issue) => ({
    issue,
    positions: candidateIds.map((candidateId) => {
      const pos = MOCK_POSITIONS.find(
        (p) => p.candidate_id === candidateId && p.issue_id === issue.id
      );
      return {
        candidate_id: candidateId,
        stance: pos?.stance ?? "no_mention",
        confidence: pos?.confidence ?? "low",
        summary: pos?.summary ?? null,
        source_url: pos?.source_url ?? null,
      };
    }),
  }));
}

/** Get all positions for a candidate with issue details */
export function getMockPositionsForCandidate(candidateId: string): PositionWithIssue[] {
  return MOCK_POSITIONS
    .filter((p) => p.candidate_id === candidateId)
    .sort((a, b) => a.issue.sort_order - b.issue.sort_order);
}

/** Search mock data by query string */
export function searchMockData(query: string): SearchResult[] {
  const lower = query.toLowerCase();
  const results: SearchResult[] = [];

  // Search candidates by name
  for (const c of MOCK_CANDIDATES) {
    if (c.name.toLowerCase().includes(lower)) {
      results.push({
        type: "candidate",
        label: c.name,
        sublabel: `${c.party} - ${c.state} - ${c.office_sought}`,
        slug: c.slug,
        url: `/candidate/${c.slug}`,
      });
    }
  }

  // Search races by slug or state
  for (const r of MOCK_RACES) {
    if (r.slug.toLowerCase().includes(lower) || r.state.toLowerCase().includes(lower)) {
      const chamberLabel =
        r.chamber === "senate"
          ? "Senate"
          : r.chamber === "governor"
            ? "Governor"
            : `House District ${r.district}`;
      results.push({
        type: "race",
        label: `${r.state} ${chamberLabel}`,
        sublabel: `${r.election_year} ${r.chamber === "senate" ? "U.S. Senate" : r.chamber === "governor" ? "Governor" : "U.S. House"}`,
        slug: r.slug,
        url: `/race/${r.slug}`,
      });
    }
  }

  return results.slice(0, 10);
}
