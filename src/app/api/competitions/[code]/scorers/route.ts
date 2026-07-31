import { NextResponse } from "next/server";

const scorersCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

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

    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season");

    const now = Date.now();
    const cacheKey = season ? `${code}-${season}` : code;
    const cachedItem = scorersCache.get(cacheKey);

    if (cachedItem && now - cachedItem.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedItem.data);
    }

    const token = process.env.NEXT_PUBLIC_API_TOKEN || "e0370622d70648a884aaa022c149e789";
    const cleanToken = token.replace(/;$/, "");

    const url = season
      ? `https://api.football-data.org/v4/competitions/${code}/scorers?season=${season}`
      : `https://api.football-data.org/v4/competitions/${code}/scorers`;

    const res = await fetch(url, {
      headers: {
        "X-Auth-Token": cleanToken,
        "Content-Type": "application/json"
      },
      next: { revalidate: 900 }
    });

    if (!res.ok) {
      console.warn(`HTTP warning fetching scorers for ${code}: ${res.status}`);
      return NextResponse.json(
        { error: `API responded with status ${res.status}`, code: res.status },
        { status: res.status }
      );
    }

    let data = await res.json();

    // If scorers is empty and no season parameter was explicitly provided, fallback to 2025 or 2024
    if ((!data.scorers || data.scorers.length === 0) && !season) {
      console.log(`No scorers for current season of ${code}, attempting fallback to 2025...`);
      const fallbackRes = await fetch(`https://api.football-data.org/v4/competitions/${code}/scorers?season=2025`, {
        headers: {
          "X-Auth-Token": cleanToken,
          "Content-Type": "application/json"
        },
        next: { revalidate: 900 }
      });
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (fallbackData?.scorers && fallbackData.scorers.length > 0) {
          data = fallbackData;
        } else {
          console.log(`No scorers in 2025 either for ${code}, attempting fallback to 2024...`);
          const fallback2024Res = await fetch(`https://api.football-data.org/v4/competitions/${code}/scorers?season=2024`, {
            headers: {
              "X-Auth-Token": cleanToken,
              "Content-Type": "application/json"
            },
            next: { revalidate: 900 }
          });
          if (fallback2024Res.ok) {
            const fallback2024Data = await fallback2024Res.json();
            if (fallback2024Data?.scorers && fallback2024Data.scorers.length > 0) {
              data = fallback2024Data;
            }
          }
        }
      }
    }

    scorersCache.set(cacheKey, { data, timestamp: now });

    return NextResponse.json(data);
  } catch (error) {
    console.warn("Failed to fetch scorers details API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
