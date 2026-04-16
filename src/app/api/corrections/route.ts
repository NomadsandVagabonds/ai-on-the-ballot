import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CorrectionSubmission } from "@/types/domain";
import type { Database } from "@/types/database";

type CorrectionInsert =
  Database["public"]["Tables"]["corrections_log"]["Insert"];

export async function POST(request: NextRequest) {
  let body: CorrectionSubmission;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Validate required fields
  if (
    !body.candidate_name?.trim() ||
    !body.issue?.trim() ||
    !body.proposed_correction?.trim()
  ) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: candidate_name, issue, proposed_correction",
      },
      { status: 400 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();

    const row: CorrectionInsert = {
      candidate_name: body.candidate_name.trim(),
      issue: body.issue.trim(),
      proposed_correction: body.proposed_correction.trim(),
      source_url: body.source_url?.trim() || null,
      submitter_email: body.submitter_email?.trim() || null,
      status: "pending",
      is_public: false,
      nature_of_change: null,
      previous_value: null,
      new_value: null,
      reviewed_at: null,
    };

    const { error } = await supabase
      .from("corrections_log")
      .insert(row as never);

    if (error) {
      console.error("Failed to insert correction:", error);
      return NextResponse.json(
        { error: "Failed to submit correction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit correction" },
      { status: 500 }
    );
  }
}
