/**
 * Vercel Serverless Function — /api/scores
 * Proxies API-Football to keep the API key server-side (never exposed in the browser).
 *
 * Setup:
 *   1. Get a free key at https://dashboard.api-football.com
 *   2. In Vercel dashboard → Settings → Environment Variables:
 *      API_FOOTBALL_KEY = your_key_here
 *   3. Hit /api/scores?league=1&season=2026&round=1
 *
 * Response is cached 60 seconds via Vercel edge cache headers.
 */

const LEAGUE_ID = 1;   // FIFA World Cup on API-Football
const SEASON    = 2026;

export const config = { runtime: "edge" };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const round = searchParams.get("round") ?? "";

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API_FOOTBALL_KEY not configured", mock: true, fixtures: [] }),
      { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=60" } }
    );
  }

  const params = new URLSearchParams({ league: LEAGUE_ID, season: SEASON, timezone: "America/New_York" });
  if (round) params.set("round", `Group Stage - ${round}`);

  try {
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?${params}`, {
      headers: { "x-apisports-key": apiKey },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`API-Football error: ${res.status}`);
    const data = await res.json();

    // Normalise response for the frontend
    const fixtures = (data.response ?? []).map((f) => ({
      id:       f.fixture.id,
      date:     f.fixture.date,
      status:   f.fixture.status.short,   // NS, 1H, HT, 2H, FT, AET, PEN
      elapsed:  f.fixture.status.elapsed,
      home:     { name: f.teams.home.name, code: isoCode(f.teams.home.name), score: f.goals.home },
      away:     { name: f.teams.away.name, code: isoCode(f.teams.away.name), score: f.goals.away },
      group:    f.league.round?.replace("Group Stage - ", "") ?? "",
    }));

    return new Response(JSON.stringify({ fixtures }), {
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

/**
 * Maps full team names from API-Football to ISO 3166-1 alpha-2 codes.
 * Extend as needed for all 48 teams.
 */
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
