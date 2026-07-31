const token = "e0370622d70648a884aaa022c149e789";

async function test() {
  try {
    const url = `https://api.football-data.org/v4/matches?dateFrom=2026-07-30&dateTo=2026-07-30`;
    const res = await fetch(url, {
      headers: { "X-Auth-Token": token }
    });
    const json = await res.json();
    console.log("Filters for single day:", json.filters);
    console.log("ResultSet for single day:", json.resultSet);
    console.log("Matches:", json.matches);
  } catch (err) {
    console.error(err);
  }
}

test();
