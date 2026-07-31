const fdToken = "e0370622d70648a884aaa022c149e789";
const afKey = "e23efda62c8b8db6ddc23af182a03c43";

function cleanName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/fc|rc|ud|sc|cf|ac|sd|fk|ap|women|w\b/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function matchTeams(fdHome, fdAway, afHome, afAway) {
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

async function test() {
  try {
    const date = "2026-07-30";
    
    // Fetch Football-Data
    const resFd = await fetch(`https://api.football-data.org/v4/matches?dateFrom=${date}&dateTo=2026-07-31`, {
      headers: { "X-Auth-Token": fdToken }
    });
    const fdJson = await resFd.json();
    const fdMatches = fdJson.matches || [];

    // Fetch API-Football
    const resAf = await fetch(`https://v3.football.api-sports.io/fixtures?date=${date}`, {
      headers: { "x-apisports-key": afKey }
    });
    const afJson = await resAf.json();
    const afMatches = afJson.response || [];

    console.log("=== MATCHING RESULTS ===");
    fdMatches.forEach((fd) => {
      const match = afMatches.find((af) =>
        matchTeams(fd.homeTeam.name, fd.awayTeam.name, af.teams.home.name, af.teams.away.name)
      );
      if (match) {
        console.log(`[OK] ${fd.homeTeam.name} vs ${fd.awayTeam.name} -> MATCHED with ${match.teams.home.name} vs ${match.teams.away.name}`);
      } else {
        console.log(`[FAIL] ${fd.homeTeam.name} vs ${fd.awayTeam.name} -> NO MATCH FOUND`);
      }
    });

  } catch (err) {
    console.error(err);
  }
}

test();
