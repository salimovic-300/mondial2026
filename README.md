# Mondial 2026 Pro — World Cup 2026 Platform

> **Live demo:** https://mondial2026-ten.vercel.app

A full-featured, production-ready World Cup 2026 web application built with **React + Vite**. Covers all 48 teams, 12 groups, 16 stadiums, confirmed FIFA referees, a live standings engine, full knockout bracket simulation, and an interactive betting slip — in 3 languages (French / English / Arabic with RTL).

---

## Features

| Module | Details |
|---|---|
| **Groups (A–L)** | All 48 teams, real FIFA rankings, matchday schedule, score entry, live standings with FIFA tiebreakers (pts → GD → GF → rank) |
| **Knockout bracket** | Auto-generated from group results. 8 best 3rd-place teams advance. Simulates all rounds to the champion (with penalties). |
| **Stadiums** | All 16 venues (USA / Canada / Mexico), capacity, role (Opening, Final, Semis, 3rd place…), filterable by country |
| **Referees** | 52 FIFA-confirmed officials by confederation + key names (Marciniak, Faghani, Akarkad…) + tech overview (semi-auto offside, vest cams) |
| **Betting slip** | 3 markets: Outright winner · Match odds (live 1×2 calculator) · Group winner. Accumulator, stake input, potential payout |
| **Simulation** | One-tap full tournament simulation with realistic Elo-based engine (validated: 2,000 runs) |
| **Trilingual** | FR / EN / AR with full RTL layout for Arabic |
| **Persistent save** | All scores, bracket and bet slip saved to localStorage (survives page reloads and browser restarts) |
| **Pro tier** | Configurable upgrade prompt for live scores, push alerts, offline mode, private leagues |

---

## Quick Start

**Requirements:** Node.js 18+ · npm 9+

```bash
git clone https://github.com/salimovic-300/mondial2026.git
cd mondial2026
npm install
npm run dev
# → http://localhost:5173
```

**Production build:**
```bash
npm run build
# Output in /dist — deploy anywhere (Vercel, Netlify, shared hosting)
```

---

## Deploy to Vercel (30 seconds)

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repo at vercel.com for automatic deploys on every push.

---

## Rebranding (5 minutes, no code knowledge needed)

Open **`src/config.js`** and edit:

```js
appName: "Your App Name",
featuredTeam: { code: "FR", name: {...}, group: "I" },  // highlight any team
currency: { symbol: "$", defaultStake: 10 },
colors: { gradientFrom: "#003087", gradientTo: "#CE1126" },  // your brand colors
pro: { price: "9.99", paymentUrl: "https://your-payment-link.com" },
```

Save — Vite hot-reloads instantly. No other files need to be changed.

---

## Project Structure

```
mondial2026/
├── src/
│   ├── App.jsx          # Main application (all tabs, engine, UI)
│   ├── config.js        # Rebrand here
│   ├── index.css        # Minimal reset
│   └── main.jsx         # React entry point
├── public/
├── index.html
├── vite.config.js
└── package.json
```

---

## Tech Stack

- **React 19** — hooks only, no Redux, no router
- **Vite 8** — instant HMR, optimized production build (75 KB gzipped)
- **Zero dependencies** beyond React — no UI library, no chart lib, pure CSS-in-JS
- **localStorage** — zero backend required for core features

---

## Roadmap / Pro Extensions

- [ ] Live scores via API-Football (serverless Vercel route, API key in .env)
- [ ] Push notifications (Web Push API)
- [ ] PWA / offline mode (service worker)
- [ ] Private leagues (Supabase / Firebase backend)
- [ ] Official FIFA bracket seeding for 3rd-place teams

---

## License

Single application license — one deployment per purchase.
Multi-site / SaaS license available — contact for pricing.

---

*Built during the 2026 FIFA World Cup. Data: FIFA official draw (Dec 2025) + confirmed referee list (Apr 2026).*
