const apiKey = "e23efda62c8b8db6ddc23af182a03c43";

async function test() {
  try {
    const date = "2026-07-30";
    const resDate = await fetch(`https://v3.football.api-sports.io/fixtures?date=${date}`, {
      headers: { "x-apisports-key": apiKey }
    });
    const jsonDate = await resDate.json();
    if (!jsonDate.response) return;

    for (const fixture of jsonDate.response) {
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?id=${fixture.fixture.id}`, {
        headers: { "x-apisports-key": apiKey }
      });
      const json = await res.json();
      const data = json.response[0];
      if (data.statistics && data.statistics.length > 0 && data.lineups && data.lineups.length > 0) {
        console.log("=== FOUND MATCH WITH STATS & LINEUPS ===");
        console.log("League:", data.league.name);
        console.log("Match:", data.teams.home.name, "vs", data.teams.away.name);
        console.log("Fixture ID:", data.fixture.id);
        console.log("\nStatistics snippet of first team:");
        console.log(data.statistics[0].statistics.slice(0, 8));
        console.log("\nLineup structure snippet:");
        console.log("Formation:", data.lineups[0].formation);
        console.log("StartXI length:", data.lineups[0].startXI.length);
        console.log("Substitute length:", data.lineups[0].substitutes.length);
        console.log("First XI player:", data.lineups[0].startXI[0]);
        console.log("\nFirst event:");
        console.log(data.events[0]);
        break;
      }
    }
  } catch (err) {
    console.error(err);
  }
}

test();
