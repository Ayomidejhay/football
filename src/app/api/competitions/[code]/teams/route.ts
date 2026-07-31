import { NextResponse } from "next/server";

const teamsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

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

    const now = Date.now();
    const cachedItem = teamsCache.get(code);

    if (cachedItem && now - cachedItem.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedItem.data);
    }

    const token = process.env.NEXT_PUBLIC_API_TOKEN || "e0370622d70648a884aaa022c149e789";
    const cleanToken = token.replace(/;$/, "");

    const res = await fetch(`https://api.football-data.org/v4/competitions/${code}/teams`, {
      headers: {
        "X-Auth-Token": cleanToken,
        "Content-Type": "application/json"
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      console.warn(`HTTP warning fetching teams for ${code}: ${res.status}`);
      return NextResponse.json(
        { error: `API responded with status ${res.status}`, code: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();
    teamsCache.set(code, { data, timestamp: now });

    return NextResponse.json(data);
  } catch (error) {
    console.warn("Failed to fetch teams details API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
