import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  normalize,
  type PublishPayload,
  type NormalizedBundle,
} from "@/lib/publish/normalize";

// Generic untyped client — we operate on tables that aren't yet in the
// generated Database type. Loosen here rather than annotate every row.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, "public", "public", any, any>;

/**
 * POST /api/publish
 *
 * Receives raw spreadsheet rows from the Apps Script in Vinaya's Google
 * Sheet, normalizes them server-side (single source of truth for slug
 * rules, party normalization, stance enums, UUID derivation), upserts
 * into Supabase, and revalidates ISR-cached pages.
 *
 * Auth: bearer token in Authorization header, matched against
 * PUBLISH_TOKEN env var. The token is shared with the Apps Script;
 * rotate it by changing both Vercel env and the script.
 *
 * Payload shape: { candidates, topics, positions, sources? } — each is
 * an array of raw row objects keyed by sheet column name.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

interface PublishResult {
  ok: boolean;
  counts: {
    issues: number;
    candidates: number;
    races: number;
    race_candidates: number;
    positions: number;
  };
  warnings: string[];
  parity: Record<string, { sent: number; persisted: number; ok: boolean }>;
  error?: string;
}

function unauth(msg: string) {
  return NextResponse.json({ ok: false, error: msg }, { status: 401 });
}

async function chunkUpsert<T>(
  supabase: AnySupabaseClient,
  table: string,
  rows: T[],
  conflict: string,
  chunk = 500
): Promise<string | null> {
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    const { error } = await supabase
      .from(table)
      .upsert(slice as never, { onConflict: conflict });
    if (error) return `${table} @offset=${i}: ${error.message}`;
  }
  return null;
}

async function countSentPersisted(
  supabase: AnySupabaseClient,
  table: string,
  sentIds: string[]
): Promise<number> {
  if (sentIds.length === 0) return 0;
  // Chunk small enough that the resulting URL stays under the
  // PostgREST/proxy URL length cap (≈8KB). 500 UUIDs (~18KB encoded)
  // overflows; 100 (~3.7KB) is comfortably under.
  let total = 0;
  for (let i = 0; i < sentIds.length; i += 100) {
    const slice = sentIds.slice(i, i + 100);
    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .in("id", slice);
    if (error) return -1;
    total += count ?? 0;
  }
  return total;
}

async function countSentRaceCandidates(
  supabase: AnySupabaseClient,
  pairs: { race_id: string; candidate_id: string }[]
): Promise<number> {
  if (pairs.length === 0) return 0;
  // Easier check: ensure every candidate_id in `pairs` has a row
  const candIds = Array.from(new Set(pairs.map((p) => p.candidate_id)));
  let total = 0;
  for (let i = 0; i < candIds.length; i += 100) {
    const slice = candIds.slice(i, i + 100);
    const { count, error } = await supabase
      .from("race_candidates")
      .select("candidate_id", { count: "exact", head: true })
      .in("candidate_id", slice);
    if (error) return -1;
    total += count ?? 0;
  }
  return total;
}

async function persist(bundle: NormalizedBundle) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  const errs: string[] = [];
  let e: string | null;

  e = await chunkUpsert(supabase, "issues", bundle.issues, "id");
  if (e) errs.push(e);
  e = await chunkUpsert(supabase, "candidates", bundle.candidates, "id", 200);
  if (e) errs.push(e);
  e = await chunkUpsert(supabase, "races", bundle.races, "id");
  if (e) errs.push(e);
  e = await chunkUpsert(
    supabase,
    "race_candidates",
    bundle.race_candidates,
    "race_id,candidate_id"
  );
  if (e) errs.push(e);
  e = await chunkUpsert(supabase, "positions", bundle.positions, "id");
  if (e) errs.push(e);

  return { errs, supabase };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ---- Auth ----
  const expected = process.env.PUBLISH_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "PUBLISH_TOKEN not configured on server" },
      { status: 503 }
    );
  }
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (token !== expected) return unauth("Invalid bearer token");

  // ---- Parse + validate ----
  let payload: PublishPayload;
  try {
    payload = (await request.json()) as PublishPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  if (
    !Array.isArray(payload.candidates) ||
    !Array.isArray(payload.topics) ||
    !Array.isArray(payload.positions)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Body must be { candidates: [], topics: [], positions: [], sources?: [] }",
      },
      { status: 400 }
    );
  }

  // ---- Normalize ----
  const bundle = normalize(payload);

  // ---- Persist ----
  const { errs, supabase } = await persist(bundle);
  if (errs.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "One or more upserts failed",
        warnings: bundle.warnings,
        details: errs,
      },
      { status: 500 }
    );
  }

  // ---- Parity check ----
  // Verify every row we sent is now visible in the DB by id, rather than
  // comparing total table counts (which break on partial publishes).
  const parity: PublishResult["parity"] = {};
  let parityOk = true;
  const checks: Array<[string, number, Promise<number>]> = [
    [
      "issues",
      bundle.issues.length,
      countSentPersisted(supabase, "issues", bundle.issues.map((x) => x.id)),
    ],
    [
      "candidates",
      bundle.candidates.length,
      countSentPersisted(
        supabase,
        "candidates",
        bundle.candidates.map((x) => x.id)
      ),
    ],
    [
      "races",
      bundle.races.length,
      countSentPersisted(supabase, "races", bundle.races.map((x) => x.id)),
    ],
    [
      "race_candidates",
      bundle.race_candidates.length,
      countSentRaceCandidates(supabase, bundle.race_candidates),
    ],
    [
      "positions",
      bundle.positions.length,
      countSentPersisted(
        supabase,
        "positions",
        bundle.positions.map((x) => x.id)
      ),
    ],
  ];
  for (const [tbl, sent, p] of checks) {
    const persisted = await p;
    const ok = persisted >= sent;
    parity[tbl] = { sent, persisted, ok };
    if (!ok) parityOk = false;
  }

  // ---- ISR revalidation ----
  // Refresh every cached page so visitors see the new data within seconds.
  revalidatePath("/", "layout");

  const body: PublishResult = {
    ok: parityOk,
    counts: {
      issues: bundle.issues.length,
      candidates: bundle.candidates.length,
      races: bundle.races.length,
      race_candidates: bundle.race_candidates.length,
      positions: bundle.positions.length,
    },
    warnings: bundle.warnings,
    parity,
  };
  return NextResponse.json(body, { status: parityOk ? 200 : 500 });
}
