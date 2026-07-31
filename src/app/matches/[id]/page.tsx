import { getMatchDetails, getMatchH2H } from "@/api";
import MatchInsightView from "./MatchInsightView";

interface PageProps {
  params: Promise<{ id: string }>;
}

function cleanName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/fc|rc|ud|sc|cf|ac|sd|fk|ap|women|w\b/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function matchTeams(fdHome: string, fdAway: string, afHome: string, afAway: string) {
  const cleanFdHome = cleanName(fdHome);
  const cleanFdAway = cleanName(fdAway);
  const cleanAfHome = cleanName(afHome);
  const cleanAfAway = cleanName(afAway);

  const homeFdWords = cleanFdHome.split(" ").filter((w) => w.length >= 3);
  const awayFdWords = cleanFdAway.split(" ").filter((w) => w.length >= 3);
  
  const homeAfWords = cleanAfHome.split(" ").filter((w) => w.length >= 3);
  const awayAfWords = cleanAfAway.split(" ").filter((w) => w.length >= 3);

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

export default async function MatchPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // 1. Fetch Football-Data match details & H2H concurrently
  const [matchDetails, h2hData] = await Promise.all([
    getMatchDetails(id),
    getMatchH2H(id)
  ]);

  let externalData = null;

  // 2. Fetch API-Football details directly on the server if matchDetails exists
  if (matchDetails && matchDetails.homeTeam && matchDetails.awayTeam) {
    const dateStr = matchDetails.utcDate.split("T")[0];
    const homeTeam = matchDetails.homeTeam.name;
    const awayTeam = matchDetails.awayTeam.name;
    const apiKey = process.env.NEXT_PUBLIC_APIFOOTBALL_KEY || "e23efda62c8b8db6ddc23af182a03c43";

    try {
      const resFixtures = await fetch(`https://v3.football.api-sports.io/fixtures?date=${dateStr}`, {
        headers: {
          "x-apisports-key": apiKey.trim(),
          "Content-Type": "application/json"
        },
        next: { revalidate: 900 } // Cache for 15 mins in Next.js fetch cache
      });

      if (resFixtures.ok) {
        const fixturesJson = await resFixtures.json();
        const fixtures = fixturesJson.response || [];
        const matched = fixtures.find((f: any) =>
          matchTeams(homeTeam, awayTeam, f.teams.home.name, f.teams.away.name)
        );

        if (matched) {
          const resDetails = await fetch(`https://v3.football.api-sports.io/fixtures?id=${matched.fixture.id}`, {
            headers: {
              "x-apisports-key": apiKey.trim(),
              "Content-Type": "application/json"
            },
            next: { revalidate: 900 }
          });
          if (resDetails.ok) {
            const detailsJson = await resDetails.json();
            externalData = detailsJson.response?.[0] || null;
          }
        }
      }
    } catch (err) {
      console.warn("Failed fetching API-Football details on RSC:", err);
    }
  }

  return (
    <section className="px-2 md:px-4 py-4 md:w-[600px] w-full">
      <MatchInsightView
        matchDetails={matchDetails}
        h2hData={h2hData}
        externalData={externalData}
      />
    </section>
  );
}
