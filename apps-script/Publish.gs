/**
 * AI on the Ballot — Publisher
 * --------------------------------------------------------------------------
 * Adds a "AI on the Ballot" menu to this Google Sheet with a "Publish to
 * site" option. When clicked, this script reads the four data sheets,
 * packages them as JSON, and POSTs to the site's /api/publish endpoint.
 * The server normalizes everything (slugs, party, stance enums, UUIDs)
 * and upserts into Supabase, then revalidates the cache so changes are
 * live on the site within seconds.
 *
 * Setup (one-time):
 *   1. In this Google Sheet → Extensions → Apps Script.
 *   2. Replace the default code with the contents of this file.
 *   3. Top of file — set SITE_URL (e.g. https://aiontheballot.org)
 *      and PUBLISH_TOKEN (must match PUBLISH_TOKEN env on Vercel).
 *   4. Save (disk icon). Reload the spreadsheet.
 *   5. The "AI on the Ballot" menu now appears next to Help.
 *
 * Notes:
 *   - Sheet names expected: Candidates, Positions v2, Topics, Sources.
 *     Headers must match the schema (see SHEET_HEADERS below).
 *   - California rows are excluded server-side — leave them in the sheet
 *     if you like.
 *   - Token is stored in this script file. If you need to rotate it,
 *     change both this constant and the Vercel env var.
 */

// ----------- CONFIG ------------
const SITE_URL = "https://aiontheballot.org"; // change to https://localhost-tunnel-or-staging-url for testing
const PUBLISH_TOKEN = "REPLACE-WITH-PUBLISH_TOKEN-VALUE-FROM-VERCEL";
// -------------------------------

const SHEET_HEADERS = {
  Candidates: ["id", "name", "state", "party", "seat", "district", "incumbency", "amount raised", "notes"],
  "Positions v2": ["id", "candidateId", "topicId", "stance", "confidence", "summary", "lastUpdated", "coder", "notes"],
  Topics: ["id", "name", "shortName", "description", "includes", "excludes"],
  Sources: ["positionId", "type", "title", "url", "date", "excerpt"],
  "Corrections Log": ["Date of Correction", "Description"],
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("AI on the Ballot")
    .addItem("Publish to site", "publishToSite")
    .addSeparator()
    .addItem("Show count summary (no publish)", "showCountSummary")
    .addToUi();
}

/**
 * Read a sheet into an array of objects keyed by header name.
 * Empty rows (entire row blank) are dropped.
 */
function readSheet(name) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet) throw new Error(`Sheet "${name}" not found`);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const header = data[0].map((h) => String(h || "").trim());
  const expected = SHEET_HEADERS[name] || [];
  for (const col of expected) {
    if (header.indexOf(col) === -1) {
      throw new Error(`Sheet "${name}" missing required column: ${col}`);
    }
  }
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row.every((c) => c === "" || c === null)) continue;
    const obj = {};
    for (let j = 0; j < header.length; j++) {
      const key = header[j];
      if (!key) continue;
      let val = row[j];
      // Convert Date objects to YYYY-MM-DD ISO strings — the server-side
      // normalize() expects strings for date columns.
      if (val instanceof Date) {
        val = Utilities.formatDate(val, "UTC", "yyyy-MM-dd");
      }
      obj[key] = val === "" ? null : val;
    }
    rows.push(obj);
  }
  return rows;
}

function buildPayload() {
  return {
    topics: readSheet("Topics"),
    candidates: readSheet("Candidates"),
    positions: readSheet("Positions v2"),
    sources: readSheet("Sources"),
    corrections: readSheet("Corrections Log"),
  };
}

function showCountSummary() {
  try {
    const p = buildPayload();
    SpreadsheetApp.getUi().alert(
      "Sheet contents (no publish)",
      `Topics:      ${p.topics.length}\n` +
      `Candidates:  ${p.candidates.length}\n` +
      `Positions:   ${p.positions.length}\n` +
      `Sources:     ${p.sources.length}\n` +
      `Corrections: ${p.corrections.length}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error", String(e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function publishToSite() {
  const ui = SpreadsheetApp.getUi();
  if (PUBLISH_TOKEN.indexOf("REPLACE") !== -1) {
    ui.alert("Setup needed", "PUBLISH_TOKEN is still the placeholder. Open Extensions → Apps Script and set the real token at the top of the file.", ui.ButtonSet.OK);
    return;
  }

  const confirm = ui.alert(
    "Publish to AI on the Ballot",
    "This will push the current sheet contents to the live site. Continue?",
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;

  let payload;
  try {
    payload = buildPayload();
  } catch (e) {
    ui.alert("Sheet read failed", String(e), ui.ButtonSet.OK);
    return;
  }

  const startedAt = new Date();
  let response;
  try {
    response = UrlFetchApp.fetch(`${SITE_URL}/api/publish`, {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: `Bearer ${PUBLISH_TOKEN}` },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });
  } catch (e) {
    ui.alert("Network error", String(e), ui.ButtonSet.OK);
    return;
  }

  const code = response.getResponseCode();
  let body;
  try {
    body = JSON.parse(response.getContentText());
  } catch (_) {
    body = { raw: response.getContentText() };
  }

  if (code >= 200 && code < 300 && body.ok) {
    const c = body.counts || {};
    const elapsed = ((new Date().getTime() - startedAt.getTime()) / 1000).toFixed(1);
    ui.alert(
      "Published",
      `Site updated in ${elapsed}s.\n\n` +
      `Issues:      ${c.issues}\n` +
      `Candidates:  ${c.candidates}\n` +
      `Races:       ${c.races}\n` +
      `Positions:   ${c.positions}\n` +
      `Corrections: ${c.corrections}\n` +
      (body.warnings && body.warnings.length
        ? `\nWarnings (${body.warnings.length}):\n` + body.warnings.slice(0, 10).join("\n")
        : ""),
      ui.ButtonSet.OK
    );
  } else {
    ui.alert(
      "Publish failed (HTTP " + code + ")",
      JSON.stringify(body, null, 2).substring(0, 1500),
      ui.ButtonSet.OK
    );
  }
}
