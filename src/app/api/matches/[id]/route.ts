import { NextResponse } from "next/server";

// Simple in-memory cache to prevent hitting rate limits
const matchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds

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
    const cachedItem = matchCache.get(id);

    // If cached and cache is still valid, return cached data
    if (cachedItem && now - cachedItem.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedItem.data);
    }

    const token = process.env.NEXT_PUBLIC_API_TOKEN || "e0370622d70648a884aaa022c149e789";
    const cleanToken = token.replace(/;$/, "");

    const res = await fetch(`https://api.football-data.org/v4/matches/${id}`, {
      headers: {
        "X-Auth-Token": cleanToken,
        "Content-Type": "application/json"
      },
      next: { revalidate: 900 } // Next.js level cache for 15 mins
    });

    if (!res.ok) {
      console.warn(`HTTP warning fetching match details for ${id}: ${res.status}`);
      return NextResponse.json(
        { error: `API responded with status ${res.status}`, code: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Cache the successful response
    matchCache.set(id, { data, timestamp: now });

    return NextResponse.json(data);
  } catch (error) {
    console.warn("Failed to fetch match details API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
