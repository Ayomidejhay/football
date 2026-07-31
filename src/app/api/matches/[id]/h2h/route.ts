import { NextResponse } from "next/server";

const h2hCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "Missing match ID" }, { status: 400 });
    }

    const now = Date.now();
    const cachedItem = h2hCache.get(id);

    if (cachedItem && now - cachedItem.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedItem.data);
    }

    const token = process.env.NEXT_PUBLIC_API_TOKEN || "e0370622d70648a884aaa022c149e789";
    const cleanToken = token.replace(/;$/, "");

    const res = await fetch(`https://api.football-data.org/v4/matches/${id}/head2head`, {
      headers: {
        "X-Auth-Token": cleanToken,
        "Content-Type": "application/json"
      },
      next: { revalidate: 900 }
    });

    if (!res.ok) {
      console.warn(`HTTP warning fetching H2H for match ${id}: ${res.status}`);
      return NextResponse.json(
        { error: `API responded with status ${res.status}`, code: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();
    h2hCache.set(id, { data, timestamp: now });

    return NextResponse.json(data);
  } catch (error) {
    console.warn("Failed to fetch H2H details API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
