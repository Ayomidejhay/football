const token = "e0370622d70648a884aaa022c149e789";

async function test() {
  try {
    const resMatches = await fetch("https://api.football-data.org/v4/matches", {
      headers: { "X-Auth-Token": token }
    });
    const matchesJson = await resMatches.json();
    if (!matchesJson.matches || matchesJson.matches.length === 0) return;

    const matchId = matchesJson.matches[0].id;
    const resH2h = await fetch(`https://api.football-data.org/v4/matches/${matchId}/head2head`, {
      headers: { "X-Auth-Token": token }
    });
    const h2hJson = await resH2h.json();
    console.log("Root keys in H2H response:", Object.keys(h2hJson));
    if (h2hJson.match) {
      console.log("Match object keys:", Object.keys(h2hJson.match));
      console.log("Match object score:", h2hJson.match.score);
    }
  } catch (err) {
    console.error(err);
  }
}

test();
