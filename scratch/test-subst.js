const apiKey = "e23efda62c8b8db6ddc23af182a03c43";

async function test() {
  try {
    const fixtureId = 1508483; // Kansas City W vs Racing Louisville W
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?id=${fixtureId}`, {
      headers: { "x-apisports-key": apiKey }
    });
    const json = await res.json();
    const data = json.response[0];
    
    console.log("Substitution events:");
    const subEvents = data.events.filter(e => e.type.toLowerCase() === "subst");
    subEvents.forEach((e) => {
      console.log(`- Time: ${e.time.elapsed}', Player (Going out/in?): ${e.player.name}, Assist/Second Player (Going in/out?): ${e.assist.name}, Detail: ${e.detail}`);
    });
  } catch (err) {
    console.error(err);
  }
}

test();
