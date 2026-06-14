/**
 * Vercel Serverless Function — /api/scores
 * Source: TheSportsDB (gratuit, sans clé API)
 * Coupe du Monde 2026 — ID league = 4429
 */

export const config = { runtime: "edge" };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const round = parseInt(searchParams.get("round") ?? "1");

  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=4429&r=${round}&s=2026`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!res.ok) throw new Error(`TheSportsDB error: ${res.status}`);
    const data = await res.json();

    const events = data.events ?? [];

    const fixtures = events.map((e) => ({
      id:      e.idEvent,
      date:    e.dateEvent + "T" + (e.strTime ?? "00:00:00") + "Z",
      status:  e.strStatus === "Match Finished" ? "FT" : e.strStatus === "In Progress" ? "1H" : "NS",
      home:    { name: e.strHomeTeam, code: isoCode(e.strHomeTeam), score: e.intHomeScore },
      away:    { name: e.strAwayTeam, code: isoCode(e.strAwayTeam), score: e.intAwayScore },
      group:   e.strGroup ?? "",
    }));

    return new Response(JSON.stringify({ fixtures, source: "thesportsdb" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message, fixtures: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}

function isoCode(name) {
  const MAP = {
    "Mexico":"MX","South Africa":"ZA","Korea Republic":"KR","Czech Republic":"CZ",
    "Canada":"CA","Bosnia and Herzegovina":"BA","Qatar":"QA","Switzerland":"CH",
    "Brazil":"BR","Morocco":"MA","Haiti":"HT","Scotland":"SCO",
    "United States":"US","Paraguay":"PY","Australia":"AU","Turkey":"TR",
    "Germany":"DE","Curacao":"CW","Ivory Coast":"CI","Ecuador":"EC",
    "Netherlands":"NL","Japan":"JP","Sweden":"SE","Tunisia":"TN",
    "Belgium":"BE","Egypt":"EG","Iran":"IR","New Zealand":"NZ",
    "Spain":"ES","Cape Verde":"CV","Saudi Arabia":"SA","Uruguay":"UY",
    "France":"FR","Senegal":"SN","Iraq":"IQ","Norway":"NO",
    "Argentina":"AR","Algeria":"DZ","Austria":"AT","Jordan":"JO",
    "Portugal":"PT","DR Congo":"CD","Uzbekistan":"UZ","Colombia":"CO",
    "England":"ENG","Croatia":"HR","Ghana":"GH","Panama":"PA",
  };
  return MAP[name] ?? name.slice(0,2).toUpperCase();
}
