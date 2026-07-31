import { NextResponse } from "next/server";

// Simple in-memory cache to stay within the 100 requests/day limit
const externalCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function cleanName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/fc|rc|ud|sc|cf|ac|sd|fk|ap|women|w\b/g, "") // remove generic club suffixes
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function matchTeams(fdHome: string, fdAway: string, afHome: string, afAway: string) {
  const cleanFdHome = cleanName(fdHome);
  const cleanFdAway = cleanName(fdAway);
  const cleanAfHome = cleanName(afHome);
  const cleanAfAway = cleanName(afAway);

  // Split into words for substring checks (minimum 3 characters)
  const homeFdWords = cleanFdHome.split(" ").filter((w) => w.length >= 3);
  const awayFdWords = cleanFdAway.split(" ").filter((w) => w.length >= 3);
  
  const homeAfWords = cleanAfHome.split(" ").filter((w) => w.length >= 3);
  const awayAfWords = cleanAfAway.split(" ").filter((w) => w.length >= 3);

  // Check if at least one key word matches for both teams
  const homeMatch =
    cleanAfHome.includes(cleanFdHome) ||
    cleanFdHome.includes(cleanAfHome) ||
    homeFdWords.some((w) => cleanAfHome.includes(w)) ||
    homeAfWords.some((w) => cleanFdHome.includes(w));

  const awayMatch =
    cleanAfAway.includes(cleanFdAway) ||
    cleanFdAway.includes(cleanAfAway) ||
    awayFdWords.some((w) => cleanAfAway.includes(w)) ||
    awayAfWords.some((w) => cleanFdAway.includes(w));

  return homeMatch && awayMatch;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { searchParams } = new URL(request.url);
    const homeTeam = searchParams.get("homeTeam");
    const awayTeam = searchParams.get("awayTeam");
    const date = searchParams.get("date"); // YYYY-MM-DD format from client

    if (!id || !homeTeam || !awayTeam || !date) {
      return NextResponse.json(
        { error: "Missing required query parameters: homeTeam, awayTeam, date" },
        { status: 400 }
      );
    }

    const cacheKey = `${homeTeam}-${awayTeam}-${date}`;
    const now = Date.now();
    const cachedItem = externalCache.get(cacheKey);

    if (cachedItem && now - cachedItem.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedItem.data);
    }

    const apiKey = process.env.NEXT_PUBLIC_APIFOOTBALL_KEY || "e23efda62c8b8db6ddc23af182a03c43";
    const cleanKey = apiKey.trim();

    // 1. Fetch all fixtures for the given date
    const fixturesUrl = `https://v3.football.api-sports.io/fixtures?date=${date}`;
    const resFixtures = await fetch(fixturesUrl, {
      headers: {
        "x-apisports-key": cleanKey,
        "Content-Type": "application/json",
      },
    });

    if (!resFixtures.ok) {
      return NextResponse.json(
        { error: "API-Football fixtures endpoint error", status: resFixtures.status },
        { status: resFixtures.status }
      );
    }

    const fixturesJson = await resFixtures.json();
    const fixtures = fixturesJson.response || [];

    // 2. Find matching fixture using token comparison
    const matchedFixture = fixtures.find((f: any) =>
      matchTeams(homeTeam, awayTeam, f.teams.home.name, f.teams.away.name)
    );

    if (!matchedFixture) {
      return NextResponse.json({ error: "Fixture not found on API-Football" }, { status: 444 });
    }

    const fixtureId = matchedFixture.fixture.id;

    // 3. Fetch detailed statistics, lineups, and events for this fixture ID
    const detailsUrl = `https://v3.football.api-sports.io/fixtures?id=${fixtureId}`;
    const resDetails = await fetch(detailsUrl, {
      headers: {
        "x-apisports-key": cleanKey,
        "Content-Type": "application/json",
      },
    });

    if (!resDetails.ok) {
      return NextResponse.json(
        { error: "API-Football details endpoint error", status: resDetails.status },
        { status: resDetails.status }
      );
    }

    const detailsJson = await resDetails.json();
    const data = detailsJson.response?.[0];

    if (!data) {
      return NextResponse.json({ error: "No details found for fixture" }, { status: 444 });
    }

    // 4. Cache and return the payload
    externalCache.set(cacheKey, { data, timestamp: now });

    return NextResponse.json(data);
  } catch (error) {
    console.warn("Failed to fetch external match details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
