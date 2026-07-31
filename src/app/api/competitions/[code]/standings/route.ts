import { getLeagueStandings } from "@/api";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const resolvedParams = await params;
    const { code } = resolvedParams;

    if (!code) {
      return NextResponse.json({ error: "Missing competition code" }, { status: 400 });
    }

    const data = await getLeagueStandings(code);
    if (data?.error) {
      return NextResponse.json(
        { error: `API responded with status ${data.error}` },
        { status: data.error === 429 ? 429 : 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.warn("Failed to fetch standings details API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
