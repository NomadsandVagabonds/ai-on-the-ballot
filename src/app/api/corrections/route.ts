import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

interface SubmissionPayload {
  kind: "correction" | "clarification" | "question";
  subject: string;
  body: string;
  reply_to?: string;
}

export async function POST(request: NextRequest) {
  let payload: SubmissionPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload.subject?.trim() || !payload.body?.trim()) {
    return NextResponse.json(
      { error: "Missing subject or body" },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CORRECTIONS_NOTIFY_EMAIL;
  const from = process.env.CORRECTIONS_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    console.error("Missing email env vars");
    return NextResponse.json(
      { error: "Server email not configured" },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: `AI on the Ballot <${from}>`,
    to,
    subject: payload.subject,
    text: payload.body,
    ...(payload.reply_to && { replyTo: payload.reply_to }),
  });

  if (error) {
    console.error("Resend send failed:", error);
    return NextResponse.json(
      { error: "Failed to send submission" },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
