const apiKey = "e23efda62c8b8db6ddc23af182a03c43";

async function test() {
  try {
    const url = "https://v3.football.api-sports.io/status";
    const res = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey
      }
    });
    const json = await res.json();
    console.log("Status response:", JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();
