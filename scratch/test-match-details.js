const token = "e0370622d70648a884aaa022c149e789";

async function test() {
  try {
    const resMatches = await fetch("https://api.football-data.org/v4/matches", {
      headers: { "X-Auth-Token": token }
    });
    const matchesJson = await resMatches.json();
    if (!matchesJson.matches || matchesJson.matches.length === 0) return;

    const matchId = matchesJson.matches[0].id;
    const resDetail = await fetch(`https://api.football-data.org/v4/matches/${matchId}`, {
      headers: { "X-Auth-Token": token }
    });
    const detailJson = await resDetail.json();
    console.log("Full Match Detail JSON:", JSON.stringify(detailJson, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();
