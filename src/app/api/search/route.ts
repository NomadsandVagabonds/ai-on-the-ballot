import { NextRequest, NextResponse } from "next/server";
import { search } from "@/lib/queries/search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await search(query);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
