import React, { useState, useMemo, useEffect, useRef } from "react";

/* =========================================================================
   MONDIAL 2026 PRO — Plateforme tournoi  ·  USA · CANADA · MEXIQUE
   48 équipes / 12 groupes / 16 stades / arbitres FIFA confirmés.
   Moteur : classements live (départages FIFA) + meilleurs 3es + tableau
   final simulable jusqu'au champion. Trilingue FR/EN/AR. Sauvegarde auto.
   ========================================================================= */

/* ---------- Drapeaux ---------- */
const SPECIAL = {
  ENG: "🏴\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  SCO: "🏴\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
};
const flag = (c) =>
  SPECIAL[c] || c.toUpperCase().replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));

/* ---------- Données équipes ---------- */
const GROUPS = {
  A: [ {n:"Mexique",c:"MX",r:16,pot:1,host:1},{n:"Afrique du Sud",c:"ZA",r:56,pot:3},{n:"Corée du Sud",c:"KR",r:23,pot:2},{n:"Tchéquie",c:"CZ",r:42,pot:4} ],
  B: [ {n:"Canada",c:"CA",r:30,pot:1,host:1},{n:"Bosnie-Herz.",c:"BA",r:74,pot:4},{n:"Qatar",c:"QA",r:37,pot:3},{n:"Suisse",c:"CH",r:18,pot:2} ],
  C: [ {n:"Brésil",c:"BR",r:6,pot:1},{n:"Maroc",c:"MA",r:11,pot:2},{n:"Haïti",c:"HT",r:83,pot:4},{n:"Écosse",c:"SCO",r:36,pot:3} ],
  D: [ {n:"États-Unis",c:"US",r:15,pot:1,host:1},{n:"Paraguay",c:"PY",r:38,pot:3},{n:"Australie",c:"AU",r:24,pot:2},{n:"Turquie",c:"TR",r:27,pot:4} ],
  E: [ {n:"Allemagne",c:"DE",r:10,pot:1},{n:"Curaçao",c:"CW",r:82,pot:4},{n:"Côte d'Ivoire",c:"CI",r:40,pot:3},{n:"Équateur",c:"EC",r:22,pot:2} ],
  F: [ {n:"Pays-Bas",c:"NL",r:7,pot:1},{n:"Japon",c:"JP",r:17,pot:2},{n:"Suède",c:"SE",r:28,pot:4},{n:"Tunisie",c:"TN",r:41,pot:3} ],
  G: [ {n:"Belgique",c:"BE",r:8,pot:1},{n:"Égypte",c:"EG",r:33,pot:3},{n:"Iran",c:"IR",r:20,pot:2},{n:"Nouvelle-Zélande",c:"NZ",r:86,pot:4} ],
  H: [ {n:"Espagne",c:"ES",r:2,pot:1},{n:"Cap-Vert",c:"CV",r:70,pot:4},{n:"Arabie saoudite",c:"SA",r:58,pot:3},{n:"Uruguay",c:"UY",r:14,pot:2} ],
  I: [ {n:"France",c:"FR",r:1,pot:1},{n:"Sénégal",c:"SN",r:19,pot:2},{n:"Irak",c:"IQ",r:59,pot:4},{n:"Norvège",c:"NO",r:26,pot:3} ],
  J: [ {n:"Argentine",c:"AR",r:3,pot:1},{n:"Algérie",c:"DZ",r:35,pot:3},{n:"Autriche",c:"AT",r:25,pot:2},{n:"Jordanie",c:"JO",r:62,pot:4} ],
  K: [ {n:"Portugal",c:"PT",r:5,pot:1},{n:"RD Congo",c:"CD",r:57,pot:4},{n:"Ouzbékistan",c:"UZ",r:54,pot:3},{n:"Colombie",c:"CO",r:13,pot:2} ],
  L: [ {n:"Angleterre",c:"ENG",r:4,pot:1},{n:"Croatie",c:"HR",r:9,pot:2},{n:"Ghana",c:"GH",r:72,pot:4},{n:"Panama",c:"PA",r:31,pot:3} ],
};
const LETTERS = Object.keys(GROUPS);
const ALL_TEAMS = LETTERS.flatMap((g) => GROUPS[g].map((t) => ({ ...t, g })));

/* ---------- Stades (role = code traduit) ---------- */
const STADIUMS = [
  {s:"Estadio Azteca",city:"Mexico",co:"MX",cap:83264,role:"open"},
  {s:"MetLife Stadium",city:"New York / New Jersey",co:"US",cap:82500,role:"final"},
  {s:"AT&T Stadium",city:"Dallas",co:"US",cap:80000,role:"semi"},
  {s:"Mercedes-Benz Stadium",city:"Atlanta",co:"US",cap:75000,role:"semi"},
  {s:"Arrowhead Stadium",city:"Kansas City",co:"US",cap:76416,role:"qf"},
  {s:"NRG Stadium",city:"Houston",co:"US",cap:72220,role:"r16"},
  {s:"Levi's Stadium",city:"San Francisco",co:"US",cap:70909,role:"r16"},
  {s:"SoFi Stadium",city:"Los Angeles",co:"US",cap:70240,role:"qf"},
  {s:"Lincoln Financial Field",city:"Philadelphie",co:"US",cap:69328,role:"r16"},
  {s:"Lumen Field",city:"Seattle",co:"US",cap:68740,role:"r16"},
  {s:"Gillette Stadium",city:"Boston",co:"US",cap:64628,role:"qf"},
  {s:"Hard Rock Stadium",city:"Miami",co:"US",cap:65326,role:"third"},
  {s:"BC Place",city:"Vancouver",co:"CA",cap:54500,role:"qf"},
  {s:"Estadio BBVA",city:"Monterrey",co:"MX",cap:53500,role:"group"},
  {s:"Estadio Akron",city:"Guadalajara",co:"MX",cap:48071,role:"group"},
  {s:"BMO Field",city:"Toronto",co:"CA",cap:45000,role:"group"},
];

/* ---------- Arbitres ---------- */
const REF_COUNTS = [{conf:"UEFA",n:15},{conf:"CONMEBOL",n:12},{conf:"CONCACAF",n:9},{conf:"AFC",n:8},{conf:"CAF",n:7},{conf:"OFC",n:1}];
const REFS = [
  {conf:"UEFA",list:[{n:"Szymon Marciniak",c:"PL",k:"f2022"},{n:"Felix Zwayer",c:"DE"},{n:"Jérôme Brisard",c:"FR"},{n:"Ivan Bebek",c:"HR"},{n:"Luciano Maia",c:"PT"}]},
  {conf:"AFC",list:[{n:"Abdulrahman Al-Jassim",c:"QA"},{n:"Khalid Al-Turais",c:"SA"},{n:"Alireza Faghani",c:"AU"},{n:"Ma Ning",c:"CN"},{n:"Omar Al Ali",c:"AE"}]},
  {conf:"CAF",list:[{n:"Mostafa Akarkad",c:"MA",k:"mar"}]},
  {conf:"CONCACAF",list:[{n:"Iván Barton",c:"SV"},{n:"Walter López",c:"HN"}]},
  {conf:"OFC",list:[{n:"Campbell-Kirk Kawana-Waugh",c:"NZ",k:"ofc"}]},
];

/* ---------- Moteur statistique ---------- */
const rating = (r) => 2050 - Math.pow(r, 0.9) * 16;
function matchProbs(ra, rb) {
  const d = rating(ra) - rating(rb);
  const e = 1 / (1 + Math.pow(10, -d / 400));
  let pN = Math.max(0.13, Math.min(0.3, 0.3 - 0.0007 * Math.abs(d)));
  return { pA: e * (1 - pN), pN, pB: (1 - e) * (1 - pN) };
}
const toOdds = (p, m = 0.94) => Math.max(1.01, (1 / p) * m);
const fx = (v) => v.toFixed(2);
const pois = (l) => { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; };
function simMatch(a, b, ko) {
  const d = rating(a.r) - rating(b.r);
  const ga = pois(1.4 * Math.exp(d / 650)), gb = pois(1.4 * Math.exp(-d / 650));
  let pen = false, winner = null;
  if (ga > gb) winner = a; else if (gb > ga) winner = b;
  else if (ko) { pen = true; const p = matchProbs(a.r, b.r); winner = Math.random() < p.pA / (p.pA + p.pB) ? a : b; }
  return { hs: ga, as: gb, pen, winner };
}

/* cotes vainqueur final */
const outright = (() => {
  const w = ALL_TEAMS.map((t) => ({ t, w: Math.exp((rating(t.r) - 1900) / 95) }));
  const sum = w.reduce((s, x) => s + x.w, 0);
  return w.map((x) => ({ ...x.t, odds: toOdds(x.w / sum, 0.82) })).sort((a, b) => a.odds - b.odds);
})();
function groupWinnerOdds(L) {
  const ts = GROUPS[L], w = ts.map((t) => Math.exp((rating(t.r) - 1900) / 95));
  const s = w.reduce((a, x) => a + x, 0);
  return ts.map((t, i) => ({ ...t, odds: toOdds(w[i] / s, 0.9) }));
}

/* ---------- Calendrier round-robin ---------- */
const SCHED = [ [[0,1],[2,3]], [[0,2],[3,1]], [[3,0],[1,2]] ];
const MD_DATES = ["11–17 juin","18–23 juin","24–27 juin"];
function fixturesFor(L) {
  const ts = GROUPS[L], out = [];
  SCHED.forEach((md, mi) => md.forEach(([i, j]) => out.push({ id:`${L}-${mi}-${i}-${j}`, md:mi, h:ts[i], a:ts[j], hi:i, ai:j })));
  return out;
}
function computeStandings(L, sc) {
  const ts = GROUPS[L].map((t) => ({ ...t, Pld:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,Pts:0 }));
  fixturesFor(L).forEach((f) => {
    const s = sc[f.id]; if (!s) return;
    const h = s.h, a = s.a; if (h === "" || a === "" || h == null || a == null) return;
    const H = ts[f.hi], A = ts[f.ai], gh = +h, ga = +a;
    H.Pld++; A.Pld++; H.GF += gh; H.GA += ga; A.GF += ga; A.GA += gh;
    if (gh > ga) { H.W++; A.L++; H.Pts += 3; } else if (gh < ga) { A.W++; H.L++; A.Pts += 3; } else { H.D++; A.D++; H.Pts++; A.Pts++; }
  });
  ts.forEach((t) => (t.GD = t.GF - t.GA));
  ts.sort((x, y) => y.Pts - x.Pts || y.GD - x.GD || y.GF - x.GF || x.r - y.r);
  return ts;
}
const cmpTeam = (x, y) => y.Pts - x.Pts || y.GD - x.GD || y.GF - x.GF || x.r - y.r;
const groupComplete = (L, sc) => fixturesFor(L).every((f) => { const s = sc[f.id]; return s && s.h !== "" && s.a !== "" && s.h != null && s.a != null; });
const allComplete = (sc) => LETTERS.every((L) => groupComplete(L, sc));

/* meilleurs 3es */
function bestThirds(sc) {
  return LETTERS.map((L) => ({ ...computeStandings(L, sc)[2], g: L })).sort(cmpTeam);
}
/* tableau final */
function seedBracket(n) { let r = [1, 2]; while (r.length < n) { const m = r.length * 2, nr = []; r.forEach((x) => { nr.push(x); nr.push(m + 1 - x); }); r = nr; } return r; }
function qualifiers(sc) {
  const st = {}; LETTERS.forEach((L) => (st[L] = computeStandings(L, sc)));
  const winners = LETTERS.map((L) => ({ ...st[L][0], g: L, _t: 0 }));
  const runners = LETTERS.map((L) => ({ ...st[L][1], g: L, _t: 1 }));
  const thirds = bestThirds(sc).slice(0, 8).map((t) => ({ ...t, _t: 2 }));
  return [...winners, ...runners, ...thirds].sort((x, y) => x._t - y._t || cmpTeam(x, y));
}
function runKO(seeded) {
  const order = seedBracket(32);
  let cur = order.map((o) => seeded[o - 1]);
  const names = ["r32", "r16", "qf", "sf", "fin"], rounds = [];
  for (const nm of names) {
    const matches = [], next = [];
    for (let i = 0; i < cur.length; i += 2) { const a = cur[i], b = cur[i + 1], res = simMatch(a, b, true); matches.push({ a, b, ...res }); next.push(res.winner); }
    rounds.push({ name: nm, matches }); cur = next;
  }
  return { rounds, champion: cur[0] };
}

/* ---------- Stockage : localStorage (web) + repli mémoire ---------- */
const _mem = {};
const store = {
  async get(k) {
    try { const v = localStorage.getItem(k); if (v !== null) return v; } catch (e) {}
    return _mem[k] ?? null;
  },
  async set(k, v) {
    try { localStorage.setItem(k, v); return; } catch (e) {}
    _mem[k] = v;
  },
};

/* ---------- i18n ---------- */
const DICT = {
  fr: { app:"Mondial 2026", ed:"COUPE DU MONDE FIFA · 23ᵉ ÉDITION", live:"EN DIRECT", hosts:"USA · Canada · Mexique", dates:"11 juin → 19 juil",
    teams:"ÉQUIPES", groups:"GROUPES", stadiums:"STADES", matches:"MATCHS", opening:"MATCH D'OUVERTURE", final:"★ FINALE",
    favorites:"FAVORIS · VAINQUEUR FINAL", winnerFinal:"Vainqueur final", focus:"FOCUS MAROC · GROUPE C",
    focusTxt:"Les Lions de l'Atlas (11ᵉ FIFA) affrontent le Brésil, Haïti et l'Écosse. Le choc Brésil–Maroc est l'une des affiches de la phase de groupes.",
    moroccoRef:"Arbitrage marocain : Mostafa Akarkad (central) et Hamza El Fariq (VAR).",
    simAll:"⚡ Simuler tout le tournoi", reSimKO:"Re-simuler la phase finale", reset:"Réinitialiser", simGroup:"Simuler ce groupe",
    nav_a:"Aperçu", nav_g:"Groupes", nav_b:"Tableau", nav_p:"Paris", nav_m:"Plus",
    standings:"Classement", fixtures:"Calendrier", pos:"#", pld:"J", w:"G", d:"N", l:"P", gf:"bp", ga:"bc", gd:"diff", pts:"Pts",
    gwin:"VAINQUEUR DU GROUPE", top2:"Les 2 premiers + les 8 meilleurs 3ᵉ → 16ᵉ de finale (32 qualifiés).",
    bestThirds:"Meilleurs 3ᵉ", knockoutTitle:"Phase à élimination directe", champion:"CHAMPION DU MONDE", pens:"t.a.b.",
    needComplete:"Complète ou simule la phase de groupes pour générer le tableau final.",
    r32:"16ᵉ de finale", r16:"8ᵉ de finale", qf:"Quart de finale", sf:"Demi-finale", fin:"Finale",
    mWin:"Vainqueur final", mSim:"Simulateur match", mGroup:"Vainqueur groupe", pickTwo:"CHOISIS DEUX ÉQUIPES", pickDiff:"Choisis deux équipes différentes.", probs:"Probabilités",
    slip:"Mon bulletin", noSel:"Aucune sélection. Touche une cote pour l'ajouter.", totalOdds:"Cote totale", combo:"(combiné)", stake:"Mise", potWin:"Gain potentiel", clear:"Vider le bulletin", cur:"DH",
    stTitle:"Stades", stNote:"16 stades · 11 USA, 3 Mexique, 2 Canada · +1,1 M de places.", places:"places", all:"Tous",
    refTitle:"Corps arbitral", refBody:"52 arbitres, 88 assistants, 30 arbitres vidéo — 6 confédérations, 50 fédérations. Dont 6 femmes.",
    tech:"TECHNOLOGIE", techTxt:"Goal-line, hors-jeu semi-automatisé, ballon connecté, et caméras embarquées sur les arbitres (vue terrain inédite). VAR marocain : Hamza El Fariq.",
    refNote:"Sélection d'arbitres confirmés par la FIFA (liste partielle des 52).",
    plus:"Plus", language:"Langue", share:"Partager", shareTxt:"Mondial 2026 — groupes, tableau, stades & pronostics.", copied:"Lien copié ✓",
    about:"À propos", aboutTxt:"Plateforme tournoi Coupe du Monde 2026. Données réelles, moteur de simulation, multilingue. Prête pour déploiement web et licence.",
    resetSim:"Réinitialiser la simulation", proT:"PASSER À PRO", proTxt:"Débloque les fonctions premium pour une expérience complète.",
    proF:["Scores & classements en direct (API)","Alertes & notifications de match","Mode hors-ligne + sans publicité","Ligues privées de pronostics"],
    role_open:"Ouverture · 11 juin", role_final:"FINALE · 19 juillet", role_semi:"Demi-finale", role_qf:"Quart de finale", role_r16:"Huitième de finale", role_group:"Phase de groupes", role_third:"Match 3e place",
    f2022:"Finale 2022", mar:"Arbitre marocain", ofc:"Unique arbitre OFC", host:"🏟️ Pays hôte", betNote:"Outil de pronostic ludique. Les jeux d'argent comportent des risques. 18+." },
  en: { app:"World Cup 2026", ed:"FIFA WORLD CUP · 23rd EDITION", live:"LIVE", hosts:"USA · Canada · Mexico", dates:"Jun 11 → Jul 19",
    teams:"TEAMS", groups:"GROUPS", stadiums:"STADIUMS", matches:"MATCHES", opening:"OPENING MATCH", final:"★ FINAL",
    favorites:"FAVOURITES · OUTRIGHT WINNER", winnerFinal:"Outright winner", focus:"MOROCCO FOCUS · GROUP C",
    focusTxt:"The Atlas Lions (11th FIFA) face Brazil, Haiti and Scotland. Brazil–Morocco is a marquee group-stage tie.",
    moroccoRef:"Moroccan officials: Mostafa Akarkad (referee) and Hamza El Fariq (VAR).",
    simAll:"⚡ Simulate the whole tournament", reSimKO:"Re-simulate knockouts", reset:"Reset", simGroup:"Simulate this group",
    nav_a:"Home", nav_g:"Groups", nav_b:"Bracket", nav_p:"Bets", nav_m:"More",
    standings:"Standings", fixtures:"Fixtures", pos:"#", pld:"P", w:"W", d:"D", l:"L", gf:"GF", ga:"GA", gd:"GD", pts:"Pts",
    gwin:"GROUP WINNER", top2:"Top 2 + 8 best 3rd-placed → Round of 32 (32 qualify).",
    bestThirds:"Best 3rd-placed", knockoutTitle:"Knockout stage", champion:"WORLD CHAMPION", pens:"pens",
    needComplete:"Complete or simulate the group stage to generate the bracket.",
    r32:"Round of 32", r16:"Round of 16", qf:"Quarter-final", sf:"Semi-final", fin:"Final",
    mWin:"Outright winner", mSim:"Match simulator", mGroup:"Group winner", pickTwo:"PICK TWO TEAMS", pickDiff:"Pick two different teams.", probs:"Probabilities",
    slip:"Bet slip", noSel:"No selection. Tap an odd to add it.", totalOdds:"Total odds", combo:"(combo)", stake:"Stake", potWin:"Potential win", clear:"Clear slip", cur:"USD",
    stTitle:"Stadiums", stNote:"16 stadiums · 11 USA, 3 Mexico, 2 Canada · 1.1 M+ seats.", places:"seats", all:"All",
    refTitle:"Match officials", refBody:"52 referees, 88 assistants, 30 video officials — 6 confederations, 50 associations. Incl. 6 women.",
    tech:"TECHNOLOGY", techTxt:"Goal-line tech, advanced semi-automated offside, connected ball, and referee body-cams (on-field POV). Moroccan VAR: Hamza El Fariq.",
    refNote:"Selection of FIFA-confirmed referees (partial list of 52).",
    plus:"More", language:"Language", share:"Share", shareTxt:"World Cup 2026 — groups, bracket, stadiums & predictions.", copied:"Link copied ✓",
    about:"About", aboutTxt:"World Cup 2026 tournament platform. Real data, simulation engine, multilingual. Ready for web deployment and licensing.",
    resetSim:"Reset simulation", proT:"GO PRO", proTxt:"Unlock premium features for the full experience.",
    proF:["Live scores & standings (API)","Match alerts & notifications","Offline mode + ad-free","Private prediction leagues"],
    role_open:"Opening · Jun 11", role_final:"FINAL · Jul 19", role_semi:"Semi-final", role_qf:"Quarter-final", role_r16:"Round of 16", role_group:"Group stage", role_third:"3rd-place match",
    f2022:"2022 Final", mar:"Moroccan referee", ofc:"Sole OFC referee", host:"🏟️ Host", betNote:"Fun prediction tool. Gambling carries risks. 18+." },
  ar: { app:"مونديال 2026", ed:"كأس العالم FIFA · النسخة 23", live:"مباشر", hosts:"أمريكا · كندا · المكسيك", dates:"11 يونيو ← 19 يوليوز",
    teams:"منتخب", groups:"مجموعات", stadiums:"ملاعب", matches:"مباريات", opening:"مباراة الافتتاح", final:"★ النهائي",
    favorites:"المرشحون · الفائز باللقب", winnerFinal:"الفائز باللقب", focus:"تركيز المغرب · المجموعة C",
    focusTxt:"أسود الأطلس (11 عالمياً) يواجهون البرازيل وهايتي واسكتلندا. مواجهة البرازيل–المغرب من أبرز مباريات الدور الأول.",
    moroccoRef:"تحكيم مغربي: مصطفى أكركاد (حكم) وحمزة الفاريق (VAR).",
    simAll:"⚡ محاكاة كل البطولة", reSimKO:"إعادة محاكاة الإقصائيات", reset:"إعادة ضبط", simGroup:"محاكاة هذه المجموعة",
    nav_a:"الرئيسية", nav_g:"المجموعات", nav_b:"الجدول", nav_p:"الرهان", nav_m:"المزيد",
    standings:"الترتيب", fixtures:"البرنامج", pos:"#", pld:"ل", w:"ف", d:"ت", l:"خ", gf:"له", ga:"عليه", gd:"فارق", pts:"نقاط",
    gwin:"المتصدّر", top2:"الأول والثاني + أفضل 8 ثوالث ← دور الـ32 (32 متأهلاً).",
    bestThirds:"أفضل الثوالث", knockoutTitle:"الأدوار الإقصائية", champion:"بطل العالم", pens:"ركلات",
    needComplete:"أكمل أو حاكِ دور المجموعات لإنشاء الجدول.",
    r32:"دور الـ32", r16:"ثمن النهائي", qf:"ربع النهائي", sf:"نصف النهائي", fin:"النهائي",
    mWin:"الفائز باللقب", mSim:"محاكي المباراة", mGroup:"متصدّر المجموعة", pickTwo:"اختر منتخبين", pickDiff:"اختر منتخبين مختلفين.", probs:"الاحتمالات",
    slip:"قسيمتي", noSel:"لا توجد اختيارات. اضغط على الاحتمال لإضافته.", totalOdds:"الاحتمال الكلي", combo:"(مُجمّع)", stake:"المبلغ", potWin:"الربح المحتمل", clear:"إفراغ القسيمة", cur:"د.م",
    stTitle:"الملاعب", stNote:"16 ملعباً · 11 أمريكا، 3 المكسيك، 2 كندا · أكثر من 1.1 مليون مقعد.", places:"مقعد", all:"الكل",
    refTitle:"طاقم التحكيم", refBody:"52 حكماً، 88 مساعداً، 30 حكم فيديو — 6 اتحادات، 50 عضواً. منهم 6 نساء.",
    tech:"التقنية", techTxt:"تقنية خط المرمى، التسلل شبه الآلي، الكرة المتصلة، وكاميرات على الحكام (منظور أرضية الملعب). VAR مغربي: حمزة الفاريق.",
    refNote:"مجموعة من الحكام المعتمدين من FIFA (قائمة جزئية من 52).",
    plus:"المزيد", language:"اللغة", share:"مشاركة", shareTxt:"مونديال 2026 — المجموعات، الجدول، الملاعب والتوقعات.", copied:"تم نسخ الرابط ✓",
    about:"حول", aboutTxt:"منصة بطولة كأس العالم 2026. بيانات حقيقية، محرك محاكاة، متعددة اللغات. جاهزة للنشر والترخيص.",
    resetSim:"إعادة ضبط المحاكاة", proT:"الترقية إلى PRO", proTxt:"افتح الميزات المتقدمة للتجربة الكاملة.",
    proF:["النتائج والترتيب المباشر (API)","تنبيهات وإشعارات المباريات","وضع دون اتصال + بدون إعلانات","دوريات توقعات خاصة"],
    role_open:"الافتتاح · 11 يونيو", role_final:"النهائي · 19 يوليوز", role_semi:"نصف النهائي", role_qf:"ربع النهائي", role_r16:"ثمن النهائي", role_group:"دور المجموعات", role_third:"مباراة المركز الثالث",
    f2022:"نهائي 2022", mar:"حكم مغربي", ofc:"الحكم الوحيد لـ OFC", host:"🏟️ بلد مضيف", betNote:"أداة توقعات ترفيهية. القمار ينطوي على مخاطر. +18." },
};

/* =========================================================================
   STYLES
   ========================================================================= */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Cairo:wght@600;700&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.wc-app{--bg:#070A1A;--bg2:#0C1230;--card:#121A3D;--line:rgba(255,255,255,.08);--ink:#EEF1FF;--mut:#8B93C8;
 --mag:#FF2E7E;--gold:#FFC247;--teal:#2BE2C9;--vio:#7B5CFF;
 font-family:'Inter',system-ui,sans-serif;color:var(--ink);
 background:radial-gradient(120% 60% at 50% -10%,#15205a 0%,var(--bg) 55%);
 min-height:100vh;padding-bottom:118px;max-width:520px;margin:0 auto;position:relative}
.wc-app[dir=rtl]{font-family:'Cairo','Inter',sans-serif}
.wc-disp{font-family:'Oswald',sans-serif;letter-spacing:.5px;text-transform:uppercase}
.wc-app[dir=rtl] .wc-disp{font-family:'Cairo',sans-serif;letter-spacing:0}
.wc-fade{animation:wcfade .35s ease both}
@keyframes wcfade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.wc-fade,.wc-dot{animation:none}}
button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.wc-head{position:sticky;top:0;z-index:30;backdrop-filter:blur(14px);
 background:linear-gradient(180deg,rgba(7,10,26,.92),rgba(7,10,26,.55));border-bottom:1px solid var(--line);padding:13px 18px 11px;
 display:flex;align-items:center;justify-content:space-between;gap:10px}
.wc-eyebrow{font-size:10px;letter-spacing:2.2px;color:var(--mut);font-weight:600}
.wc-title{font-size:27px;font-weight:700;line-height:.95;margin:3px 0 0;
 background:linear-gradient(95deg,var(--mag),var(--vio) 45%,var(--teal));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.wc-sub{font-size:10.5px;color:var(--mut);margin-top:5px;display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.wc-live{display:inline-flex;align-items:center;gap:5px;color:var(--mag);font-weight:700;font-size:9.5px;letter-spacing:1px}
.wc-dot{width:7px;height:7px;border-radius:50%;background:var(--mag);animation:wcpulse 1.6s infinite}
@keyframes wcpulse{0%{box-shadow:0 0 0 0 rgba(255,46,126,.55)}70%{box-shadow:0 0 0 9px rgba(255,46,126,0)}100%{box-shadow:0 0 0 0 rgba(255,46,126,0)}}
.wc-lang{display:flex;gap:4px;background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:999px;padding:3px}
.wc-lang button{background:none;border:none;color:var(--mut);font-size:11px;font-weight:700;padding:4px 8px;border-radius:999px;cursor:pointer}
.wc-lang button.on{background:linear-gradient(135deg,var(--mag),var(--vio));color:#fff}
.wc-wrap{padding:16px 16px 8px}
.wc-card{background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.015));border:1px solid var(--line);border-radius:18px;padding:16px;margin-bottom:14px}
.wc-h2{font-size:12.5px;letter-spacing:1.4px;color:var(--mut);font-weight:700;margin:6px 4px 9px}
.wc-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.wc-stat{background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:14px;padding:12px 6px;text-align:center}
.wc-stat b{display:block;font-family:'Oswald';font-size:23px;font-weight:700}
.wc-stat span{font-size:9px;letter-spacing:.4px;color:var(--mut)}
.wc-cta{width:100%;border:none;border-radius:16px;padding:15px;font-weight:700;font-size:15px;cursor:pointer;color:#08122a;
 background:linear-gradient(135deg,var(--teal),var(--gold));box-shadow:0 8px 26px rgba(43,226,201,.28);margin-bottom:14px}
.wc-cta:active{transform:scale(.98)}
.wc-ghost{width:100%;border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--mut);border-radius:12px;padding:11px;font-weight:600;font-size:13px;cursor:pointer}
.wc-feat{border-radius:18px;padding:15px;margin-bottom:12px;border:1px solid var(--line)}
.wc-feat.open{background:linear-gradient(120deg,rgba(43,226,201,.16),rgba(123,92,255,.10))}
.wc-feat.final{background:linear-gradient(120deg,rgba(255,194,71,.18),rgba(255,46,126,.10))}
.wc-feat .lab{font-size:10px;letter-spacing:2px;font-weight:700;color:var(--gold)}
.wc-feat.open .lab{color:var(--teal)}
.wc-vs{display:flex;align-items:center;justify-content:center;gap:12px;margin:8px 0 4px}
.wc-vs .e{font-size:28px}
.wc-vs .x{font-family:'Oswald';font-weight:600;color:var(--mut)}
.wc-meta{text-align:center;font-size:11px;color:var(--mut)}
.wc-badge{font-family:'Oswald';font-weight:700;font-size:18px;width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(135deg,var(--vio),var(--mag));color:#fff}
.wc-chips{display:flex;gap:7px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none}
.wc-chips::-webkit-scrollbar{display:none}
.wc-chip{flex:0 0 auto;border:1px solid var(--line);background:rgba(255,255,255,.03);color:var(--mut);border-radius:999px;padding:7px 13px;font-size:12px;font-weight:600;cursor:pointer}
.wc-chip.on{background:linear-gradient(135deg,var(--mag),var(--vio));color:#fff;border-color:transparent}
.wc-tbl{width:100%;border-collapse:collapse;font-size:12px}
.wc-tbl th{font-size:9px;color:var(--mut);font-weight:600;padding:6px 3px;text-align:center}
.wc-tbl td{padding:8px 3px;text-align:center;border-top:1px solid var(--line);font-variant-numeric:tabular-nums}
.wc-tbl td.tn{text-align:start;font-weight:600;font-size:12.5px;white-space:nowrap}
.wc-tbl tr.q1 td:first-child{box-shadow:inset 3px 0 var(--teal)}
.wc-tbl tr.q3 td:first-child{box-shadow:inset 3px 0 var(--gold)}
.wc-tbl td .e{font-size:16px;margin-inline-end:5px;vertical-align:-2px}
.wc-fixmd{font-size:10px;color:var(--mut);letter-spacing:1px;font-weight:700;margin:12px 4px 4px}
.wc-fix{display:flex;align-items:center;gap:8px;padding:8px 2px;border-top:1px solid var(--line)}
.wc-fix .side{flex:1;display:flex;align-items:center;gap:6px;font-size:12.5px;min-width:0}
.wc-fix .side.r{justify-content:flex-end;text-align:end}
.wc-fix .side .e{font-size:17px}
.wc-fix .nm{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wc-score{width:30px;height:30px;text-align:center;background:var(--bg);border:1px solid var(--line);border-radius:8px;color:var(--ink);font-family:'Oswald';font-weight:600;font-size:14px;padding:0}
.wc-st{display:flex;align-items:center;gap:12px;padding:12px 4px;border-top:1px solid var(--line)}
.wc-st .e{font-size:22px}
.wc-st .info{flex:1;min-width:0}
.wc-st .nm{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wc-st .ci{font-size:11px;color:var(--mut)}
.wc-st .cap{font-family:'Oswald';font-size:14px;color:var(--teal)}
.wc-st .cl{font-size:9px;color:var(--mut)}
.wc-tagp{font-size:8.5px;font-weight:700;letter-spacing:.4px;padding:2px 7px;border-radius:6px;margin-top:3px;display:inline-block}
.tag-final{background:rgba(255,194,71,.2);color:var(--gold)}
.tag-open{background:rgba(43,226,201,.2);color:var(--teal)}
.tag-semi{background:rgba(123,92,255,.22);color:#b6a6ff}
.tag-third{background:rgba(255,46,126,.18);color:#ff8fb8}
.wc-oddrow{display:flex;align-items:center;gap:8px;padding:10px 4px;border-top:1px solid var(--line)}
.wc-oddrow .nm{flex:1;font-size:13px;font-weight:500;display:flex;align-items:center;gap:8px;min-width:0}
.wc-ob{min-width:54px;text-align:center;font-family:'Oswald';font-weight:600;font-size:14px;background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:10px;padding:7px 4px;cursor:pointer;color:var(--ink);transition:.15s}
.wc-ob:active{transform:scale(.94)}
.wc-ob.on{background:linear-gradient(135deg,var(--teal),var(--vio));border-color:transparent;color:#08122a}
.wc-3{display:flex;gap:6px}.wc-3 .wc-ob{flex:1;min-width:0}
.wc-tri-h{display:flex;gap:6px;font-size:9px;color:var(--mut);padding:0 4px 4px;text-align:center}.wc-tri-h span{flex:1}
select.wc-sel{width:100%;background:var(--bg2);color:var(--ink);border:1px solid var(--line);border-radius:12px;padding:11px 12px;font-size:13px;font-weight:500}
.wc-champ{background:linear-gradient(120deg,rgba(255,194,71,.25),rgba(255,46,126,.12));border:1px solid rgba(255,194,71,.4);border-radius:18px;padding:18px;text-align:center;margin-bottom:14px}
.wc-champ .lab{font-size:10px;letter-spacing:2.5px;color:var(--gold);font-weight:700}
.wc-champ .nm{font-family:'Oswald';font-size:26px;font-weight:700;margin-top:4px}
.wc-bm{display:flex;align-items:center;gap:8px;padding:9px 4px;border-top:1px solid var(--line);font-size:12.5px}
.wc-bm .t{flex:1;display:flex;align-items:center;gap:6px;min-width:0}
.wc-bm .t.win{font-weight:700;color:var(--teal)}
.wc-bm .e{font-size:16px}
.wc-bm .sc{font-family:'Oswald';font-weight:600;width:46px;text-align:center;color:var(--mut)}
.wc-slipbtn{position:fixed;left:50%;transform:translateX(-50%);bottom:88px;z-index:40;background:linear-gradient(135deg,var(--mag),var(--vio));color:#fff;border:none;border-radius:999px;padding:11px 18px;font-weight:700;font-size:13px;box-shadow:0 10px 30px rgba(255,46,126,.4);display:flex;align-items:center;gap:8px;cursor:pointer}
.wc-slipbtn .cnt{background:#fff;color:var(--mag);border-radius:999px;min-width:20px;height:20px;display:grid;place-items:center;font-size:11px}
.wc-sheet{position:fixed;inset:0;z-index:50;background:rgba(3,5,16,.6);backdrop-filter:blur(3px);display:flex;align-items:flex-end}
.wc-sheetinner{background:var(--bg2);border:1px solid var(--line);border-bottom:none;border-radius:22px 22px 0 0;width:100%;max-width:520px;margin:0 auto;padding:18px 16px 26px;max-height:80vh;overflow:auto;animation:wcup .3s ease both}
@keyframes wcup{from{transform:translateY(100%)}to{transform:none}}
.wc-selrow{display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid var(--line)}
.wc-selrow .l{flex:1;min-width:0}.wc-selrow .t1{font-size:13px;font-weight:600}.wc-selrow .t2{font-size:10.5px;color:var(--mut)}
.wc-selrow .od{font-family:'Oswald';font-weight:700;color:var(--teal);font-size:15px}
.wc-rm{background:none;border:none;color:var(--mut);font-size:18px;cursor:pointer;padding:0 4px}
.wc-stake{display:flex;align-items:center;gap:8px;margin:14px 0 6px}
.wc-stake input{flex:1;background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:12px;color:var(--ink);font-size:15px;font-family:'Oswald';font-weight:600}
.wc-payout{display:flex;justify-content:space-between;align-items:baseline;margin-top:8px}
.wc-payout .big{font-family:'Oswald';font-size:26px;font-weight:700;color:var(--gold)}
.wc-pro{background:linear-gradient(120deg,rgba(123,92,255,.18),rgba(255,46,126,.12));border:1px solid rgba(123,92,255,.35);border-radius:18px;padding:16px;margin-bottom:14px}
.wc-pro .pt{font-family:'Oswald';font-size:17px;font-weight:700;color:#cbbcff}
.wc-pro ul{margin:10px 0 0;padding:0;list-style:none}
.wc-pro li{font-size:12.5px;color:var(--ink);padding:5px 0;display:flex;gap:8px}
.wc-pro li::before{content:"✦";color:var(--gold)}
.wc-plusitem{display:flex;align-items:center;gap:12px;width:100%;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:9px;color:var(--ink);font-size:14px;font-weight:600;cursor:pointer;text-align:start}
.wc-plusitem .ic{font-size:18px}
.wc-nav{position:fixed;bottom:0;left:0;right:0;z-index:45;max-width:520px;margin:0 auto;background:rgba(8,11,28,.94);backdrop-filter:blur(14px);border-top:1px solid var(--line);display:grid;grid-template-columns:repeat(5,1fr);padding:8px 4px calc(8px + env(safe-area-inset-bottom))}
.wc-nb{background:none;border:none;color:var(--mut);font-size:9.5px;font-weight:600;display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 0;cursor:pointer}
.wc-nb svg{width:21px;height:21px}.wc-nb.on{color:var(--mag)}
.wc-note{font-size:10.5px;color:var(--mut);text-align:center;padding:6px 22px 0;line-height:1.55}
`;

const Ico = ({ d }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>);
const ICONS = { home:"M3 11l9-8 9 8M5 10v10h14V10", groups:"M4 5h16M4 12h16M4 19h16", bracket:"M6 4v6h6M6 14v6h6M12 7h6M12 17h6", bet:"M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", more:"M5 12h.01M12 12h.01M19 12h.01" };

/* =========================================================================
   APP
   ========================================================================= */
export default function App() {
  const [lang, setLang] = useState("fr");
  const [tab, setTab] = useState("apercu");
  const [openG, setOpenG] = useState("C");
  const [stFilter, setStFilter] = useState("all");
  const [sels, setSels] = useState([]);
  const [slip, setSlip] = useState(false);
  const [stake, setStake] = useState(100);
  const [betMkt, setBetMkt] = useState("vainqueur");
  const [tA, setTA] = useState("Brésil");
  const [tB, setTB] = useState("Maroc");
  const [gs, setGs] = useState({});   // group scores
  const [ko, setKo] = useState(null); // knockout result
  const [loaded, setLoaded] = useState(false);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const t = (k) => (DICT[lang] && DICT[lang][k]) ?? DICT.fr[k] ?? k;

  /* load */
  useEffect(() => { (async () => {
    try { const raw = await store.get("wc2026:v2"); if (raw) { const d = JSON.parse(raw);
      if (d.gs) setGs(d.gs); if (d.ko) setKo(d.ko); if (d.sels) setSels(d.sels);
      if (d.stake != null) setStake(d.stake); if (d.lang) setLang(d.lang); } } catch (e) {}
    setLoaded(true);
  })(); }, []);
  /* save */
  useEffect(() => { if (loaded) store.set("wc2026:v2", JSON.stringify({ gs, ko, sels, stake, lang })); },
    [gs, ko, sels, stake, lang, loaded]);

  const has = (id) => sels.some((s) => s.id === id);
  const toggle = (sel) => setSels((p) => p.some((s) => s.id === sel.id) ? p.filter((s) => s.id !== sel.id) : [...p, sel]);
  const totalOdds = sels.reduce((a, s) => a * s.odds, 1);
  const payout = stake > 0 ? stake * totalOdds : 0;
  const setScore = (id, side, v) => setGs((p) => ({ ...p, [id]: { ...(p[id] || { h: "", a: "" }), [side]: v === "" ? "" : Math.max(0, Math.min(20, +v)) } }));
  const simGroup = (L) => { setGs((p) => { const n = { ...p }; fixturesFor(L).forEach((f) => { const r = simMatch(f.h, f.a, false); n[f.id] = { h: r.hs, a: r.as }; }); return n; }); };
  const simAll = () => { const n = {}; LETTERS.forEach((L) => fixturesFor(L).forEach((f) => { const r = simMatch(f.h, f.a, false); n[f.id] = { h: r.hs, a: r.as }; })); setGs(n); setKo(runKO(qualifiers(n))); };
  const simKO = () => { if (allComplete(gs)) setKo(runKO(qualifiers(gs))); };
  const reset = () => { setGs({}); setKo(null); };

  const teamByName = (n) => ALL_TEAMS.find((x) => x.n === n);
  const simA = teamByName(tA), simB = teamByName(tB);
  const sim = useMemo(() => (simA && simB ? matchProbs(simA.r, simB.r) : null), [tA, tB]);

  const share = async () => { const data = { title: t("app"), text: t("shareTxt"), url: typeof location !== "undefined" ? location.href : "" };
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); alert(t("copied")); } } catch (e) {} };

  const navItems = [["apercu","nav_a",ICONS.home],["groupes","nav_g",ICONS.groups],["bracket","nav_b",ICONS.bracket],["paris","nav_p",ICONS.bet],["plus","nav_m",ICONS.more]];
  const isMore = tab === "plus" || tab === "stades" || tab === "arbitres";

  return (
    <div className="wc-app" dir={dir}>
      <style>{CSS}</style>

      <header className="wc-head">
        <div>
          <div className="wc-eyebrow">{t("ed")}</div>
          <h1 className="wc-title wc-disp">{t("app")}</h1>
          <div className="wc-sub">
            <span className="wc-live"><span className="wc-dot" /> {t("live")}</span>
            <span>🇺🇸🇨🇦🇲🇽 {t("hosts")}</span>
          </div>
        </div>
        <div className="wc-lang">
          {["fr","en","ar"].map((l) => (
            <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
          ))}
        </div>
      </header>

      {/* ===== APERÇU ===== */}
      {tab === "apercu" && (
        <div className="wc-wrap wc-fade">
          <button className="wc-cta" onClick={simAll}>{t("simAll")}</button>

          {ko && (
            <div className="wc-champ">
              <div className="lab">{t("champion")}</div>
              <div className="nm wc-disp">{flag(ko.champion.c)} {ko.champion.n}</div>
            </div>
          )}

          <div className="wc-stats" style={{ marginBottom: 16 }}>
            {[["48","teams"],["12","groups"],["16","stadiums"],["104","matches"]].map(([a,k]) => (
              <div className="wc-stat" key={k}><b className="wc-disp">{a}</b><span>{t(k)}</span></div>
            ))}
          </div>

          <div className="wc-feat open">
            <div className="lab">{t("opening")}</div>
            <div className="wc-vs"><span className="e">{flag("MX")}</span><span className="x wc-disp">Mexique — Afrique du Sud</span><span className="e">{flag("ZA")}</span></div>
            <div className="wc-meta">Estadio Azteca, Mexico</div>
          </div>
          <div className="wc-feat final">
            <div className="lab">{t("final")}</div>
            <div className="wc-vs"><span className="e">🏆</span><span className="x wc-disp">19/07</span><span className="e">🏆</span></div>
            <div className="wc-meta">MetLife Stadium · New York / New Jersey</div>
          </div>

          <h2 className="wc-h2 wc-disp">{t("favorites")}</h2>
          <div className="wc-card" style={{ padding: "6px 16px" }}>
            {outright.slice(0, 6).map((x, i) => (
              <div className="wc-oddrow" key={x.n} style={i === 0 ? { borderTop: "none" } : {}}>
                <div className="nm"><span style={{ color: "var(--mut)", width: 16, fontFamily: "Oswald" }}>{i + 1}</span><span style={{ fontSize: 20 }}>{flag(x.c)}</span>{x.n}</div>
                <button className={"wc-ob" + (has("out-" + x.c) ? " on" : "")} onClick={() => toggle({ id: "out-" + x.c, t1: x.n, t2: t("winnerFinal"), odds: x.odds })}>{fx(x.odds)}</button>
              </div>
            ))}
          </div>

          <h2 className="wc-h2 wc-disp">{t("focus")}</h2>
          <div className="wc-card">
            <div style={{ fontSize: 12.5, color: "var(--mut)", lineHeight: 1.65 }}>{t("focusTxt")}</div>
            <div className="wc-oddrow" style={{ marginTop: 4 }}>
              <div className="nm"><span style={{ fontSize: 20 }}>{flag("MA")}</span>Maroc · {t("winnerFinal")}</div>
              <span className="wc-ob" style={{ cursor: "default" }}>{fx(outright.find((x) => x.c === "MA").odds)}</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--gold)", marginTop: 8 }}>{t("moroccoRef")}</div>
          </div>

          <div className="wc-pro">
            <div className="pt">{t("proT")}</div>
            <div style={{ fontSize: 12.5, color: "var(--mut)", marginTop: 4 }}>{t("proTxt")}</div>
            <ul>{t("proF").map((f) => <li key={f}>{f}</li>)}</ul>
          </div>

          <p className="wc-note">{t("betNote")}</p>
        </div>
      )}

      {/* ===== GROUPES ===== */}
      {tab === "groupes" && (
        <div className="wc-wrap wc-fade">
          <div className="wc-chips">{LETTERS.map((g) => <button key={g} className={"wc-chip" + (openG === g ? " on" : "")} onClick={() => setOpenG(g)}>{t("groups").slice(0,1) === t("groups").slice(0,1) ? g : g}{" "}{g}</button>)}</div>

          <div className="wc-card">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div className="wc-badge wc-disp">{openG}</div>
              <div style={{ flex: 1 }}>
                <div className="wc-disp" style={{ fontSize: 16 }}>{t("standings")} · {openG}</div>
              </div>
              <button className="wc-ob" onClick={() => simGroup(openG)} style={{ fontSize: 11, minWidth: 0, padding: "7px 10px" }}>{t("simGroup")}</button>
            </div>
            <table className="wc-tbl">
              <thead><tr><th>{t("pos")}</th><th style={{ textAlign: "start" }}></th><th>{t("pld")}</th><th>{t("w")}</th><th>{t("d")}</th><th>{t("l")}</th><th>{t("gd")}</th><th>{t("pts")}</th></tr></thead>
              <tbody>
                {computeStandings(openG, gs).map((r, i) => (
                  <tr key={r.n} className={i < 2 ? "q1" : i === 2 ? "q3" : ""}>
                    <td>{i + 1}</td>
                    <td className="tn" style={r.c === "MA" ? { color: "var(--gold)" } : {}}><span className="e">{flag(r.c)}</span>{r.n}</td>
                    <td>{r.Pld}</td><td>{r.W}</td><td>{r.D}</td><td>{r.L}</td>
                    <td>{r.GD > 0 ? "+" + r.GD : r.GD}</td><td style={{ fontWeight: 700 }}>{r.Pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="wc-h2 wc-disp">{t("fixtures")}</h2>
          <div className="wc-card" style={{ padding: "6px 16px 14px" }}>
            {[0, 1, 2].map((mi) => (
              <div key={mi}>
                <div className="wc-fixmd">J{mi + 1} · {MD_DATES[mi]}</div>
                {fixturesFor(openG).filter((f) => f.md === mi).map((f) => {
                  const s = gs[f.id] || { h: "", a: "" };
                  return (
                    <div className="wc-fix" key={f.id}>
                      <div className="side r"><span className="nm">{f.h.n}</span><span className="e">{flag(f.h.c)}</span></div>
                      <input className="wc-score" inputMode="numeric" value={s.h} onChange={(e) => setScore(f.id, "h", e.target.value)} />
                      <span style={{ color: "var(--mut)", fontSize: 11 }}>:</span>
                      <input className="wc-score" inputMode="numeric" value={s.a} onChange={(e) => setScore(f.id, "a", e.target.value)} />
                      <div className="side"><span className="e">{flag(f.a.c)}</span><span className="nm">{f.a.n}</span></div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <h2 className="wc-h2 wc-disp">{t("gwin")} {openG}</h2>
          <div className="wc-card" style={{ padding: "6px 16px" }}>
            {groupWinnerOdds(openG).sort((a, b) => a.odds - b.odds).map((x, i) => (
              <div className="wc-oddrow" key={x.n} style={i === 0 ? { borderTop: "none" } : {}}>
                <div className="nm"><span style={{ fontSize: 19 }}>{flag(x.c)}</span>{x.n}</div>
                <button className={"wc-ob" + (has("gw-" + openG + x.c) ? " on" : "")} onClick={() => toggle({ id: "gw-" + openG + x.c, t1: x.n, t2: t("mGroup") + " " + openG, odds: x.odds })}>{fx(x.odds)}</button>
              </div>
            ))}
          </div>
          <p className="wc-note">{t("top2")}</p>
        </div>
      )}

      {/* ===== BRACKET ===== */}
      {tab === "bracket" && (
        <div className="wc-wrap wc-fade">
          <h2 className="wc-h2 wc-disp" style={{ marginTop: 0 }}>{t("knockoutTitle")}</h2>
          {!ko && (
            <div className="wc-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "var(--mut)", lineHeight: 1.6, marginBottom: 14 }}>{t("needComplete")}</div>
              <button className="wc-cta" style={{ marginBottom: 8 }} onClick={simAll}>{t("simAll")}</button>
              {allComplete(gs) && <button className="wc-ghost" onClick={simKO}>{t("reSimKO")}</button>}
            </div>
          )}
          {ko && (
            <>
              <div className="wc-champ">
                <div className="lab">{t("champion")}</div>
                <div className="nm wc-disp">{flag(ko.champion.c)} {ko.champion.n}</div>
              </div>
              <button className="wc-ghost" style={{ marginBottom: 14 }} onClick={simKO}>{t("reSimKO")}</button>
              {ko.rounds.slice().reverse().map((rd) => (
                <div className="wc-card" key={rd.name} style={{ padding: "6px 16px 10px" }}>
                  <div className="wc-fixmd" style={{ marginTop: 8 }}>{t(rd.name)}</div>
                  {rd.matches.map((m, idx) => {
                    const aw = m.winner && m.winner.c === m.a.c, bw = m.winner && m.winner.c === m.b.c;
                    return (
                      <div className="wc-bm" key={idx}>
                        <div className={"t" + (aw ? " win" : "")}><span className="e">{flag(m.a.c)}</span><span className="nm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.a.n}</span></div>
                        <div className="sc">{m.hs}–{m.as}{m.pen ? <span style={{ fontSize: 9 }}> {t("pens")}</span> : ""}</div>
                        <div className={"t" + (bw ? " win" : "")} style={{ justifyContent: "flex-end", textAlign: "end" }}><span className="nm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.b.n}</span><span className="e">{flag(m.b.c)}</span></div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <h2 className="wc-h2 wc-disp">{t("bestThirds")}</h2>
              <div className="wc-card" style={{ padding: "4px 16px" }}>
                {bestThirds(gs).map((x, i) => (
                  <div className="wc-oddrow" key={x.n + x.g} style={i === 0 ? { borderTop: "none" } : { opacity: i < 8 ? 1 : 0.4 }}>
                    <div className="nm"><span style={{ color: i < 8 ? "var(--teal)" : "var(--mut)", width: 18, fontFamily: "Oswald" }}>{i + 1}</span><span style={{ fontSize: 18 }}>{flag(x.c)}</span>{x.n} <span style={{ color: "var(--mut)", fontSize: 11 }}>({x.g})</span></div>
                    <span style={{ fontSize: 11, color: "var(--mut)", fontVariantNumeric: "tabular-nums" }}>{x.Pts} {t("pts")} · {x.GD > 0 ? "+" + x.GD : x.GD}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          <p className="wc-note">{t("top2")}</p>
        </div>
      )}

      {/* ===== STADES ===== */}
      {tab === "stades" && (
        <div className="wc-wrap wc-fade">
          <h2 className="wc-h2 wc-disp" style={{ marginTop: 0 }}>{t("stTitle")}</h2>
          <div className="wc-chips">
            {[["all","all"],["US","🇺🇸"],["MX","🇲🇽"],["CA","🇨🇦"]].map(([k, lbl]) => (
              <button key={k} className={"wc-chip" + (stFilter === k ? " on" : "")} onClick={() => setStFilter(k)}>{k === "all" ? t("all") : lbl + " " + k}</button>
            ))}
          </div>
          <div className="wc-card" style={{ padding: "4px 16px" }}>
            {STADIUMS.filter((s) => stFilter === "all" || s.co === stFilter).map((s, i) => {
              const special = ["open", "final", "semi", "third"].includes(s.role);
              return (
                <div className="wc-st" key={s.s} style={i === 0 ? { borderTop: "none" } : {}}>
                  <span className="e">{flag(s.co)}</span>
                  <div className="info">
                    <div className="nm">{s.s}</div><div className="ci">{s.city}</div>
                    {special && <span className={"wc-tagp tag-" + s.role}>{t("role_" + s.role)}</span>}
                  </div>
                  <div style={{ textAlign: "end" }}>
                    <div className="cap wc-disp">{s.cap.toLocaleString(lang === "ar" ? "ar" : lang === "en" ? "en-US" : "fr-FR")}</div>
                    <div className="cl">{t("places")}{!special ? " · " + t("role_" + s.role) : ""}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="wc-note">{t("stNote")}</p>
        </div>
      )}

      {/* ===== ARBITRES ===== */}
      {tab === "arbitres" && (
        <div className="wc-wrap wc-fade">
          <div className="wc-card">
            <div className="wc-disp" style={{ fontSize: 16, marginBottom: 4 }}>{t("refTitle")}</div>
            <div style={{ fontSize: 12, color: "var(--mut)", lineHeight: 1.6 }}>{t("refBody")}</div>
            <div className="wc-stats" style={{ marginTop: 12 }}>
              {REF_COUNTS.map((r) => <div className="wc-stat" key={r.conf} style={{ gridColumn: "span 2" }}><b className="wc-disp">{r.n}</b><span>{r.conf}</span></div>)}
            </div>
          </div>
          {REFS.map((b) => (
            <div className="wc-card" key={b.conf} style={{ padding: "6px 16px 10px" }}>
              <div className="wc-h2 wc-disp" style={{ margin: "10px 0 2px" }}>{b.conf}</div>
              {b.list.map((r, i) => (
                <div className="wc-st" key={r.n} style={i === 0 ? { borderTop: "none" } : {}}>
                  <span className="e">{flag(r.c)}</span>
                  <div className="info"><div className="nm" style={r.c === "MA" ? { color: "var(--gold)" } : {}}>{r.n}</div>{r.k && <div className="ci">{t(r.k)}</div>}</div>
                </div>
              ))}
            </div>
          ))}
          <div className="wc-card">
            <div className="wc-h2 wc-disp" style={{ margin: "2px 0 8px" }}>{t("tech")}</div>
            <div style={{ fontSize: 12, color: "var(--mut)", lineHeight: 1.7 }}>{t("techTxt")}</div>
          </div>
          <p className="wc-note">{t("refNote")}</p>
        </div>
      )}

      {/* ===== PARIS ===== */}
      {tab === "paris" && (
        <div className="wc-wrap wc-fade">
          <div className="wc-chips">
            {[["vainqueur","mWin"],["simul","mSim"],["groupe","mGroup"]].map(([k, lk]) => (
              <button key={k} className={"wc-chip" + (betMkt === k ? " on" : "")} onClick={() => setBetMkt(k)}>{t(lk)}</button>
            ))}
          </div>

          {betMkt === "vainqueur" && (
            <div className="wc-card" style={{ padding: "6px 16px" }}>
              {outright.slice(0, 16).map((x, i) => (
                <div className="wc-oddrow" key={x.n} style={i === 0 ? { borderTop: "none" } : {}}>
                  <div className="nm"><span style={{ color: "var(--mut)", width: 18, fontFamily: "Oswald" }}>{i + 1}</span><span style={{ fontSize: 19 }}>{flag(x.c)}</span>{x.n}</div>
                  <button className={"wc-ob" + (has("out-" + x.c) ? " on" : "")} onClick={() => toggle({ id: "out-" + x.c, t1: x.n, t2: t("winnerFinal"), odds: x.odds })}>{fx(x.odds)}</button>
                </div>
              ))}
            </div>
          )}

          {betMkt === "simul" && (
            <div className="wc-card">
              <div className="wc-h2 wc-disp" style={{ margin: "2px 0 10px" }}>{t("pickTwo")}</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <select className="wc-sel" value={tA} onChange={(e) => setTA(e.target.value)}>{ALL_TEAMS.map((x) => <option key={x.n} value={x.n}>{x.n}</option>)}</select>
                <select className="wc-sel" value={tB} onChange={(e) => setTB(e.target.value)}>{ALL_TEAMS.map((x) => <option key={x.n} value={x.n}>{x.n}</option>)}</select>
              </div>
              {sim && tA !== tB ? (
                <>
                  <div className="wc-vs" style={{ margin: "6px 0" }}><span className="e">{flag(simA.c)}</span><span className="x wc-disp">VS</span><span className="e">{flag(simB.c)}</span></div>
                  <div className="wc-tri-h"><span>{simA.n}</span><span>{t("d")}</span><span>{simB.n}</span></div>
                  <div className="wc-3">
                    {[{ id: "m1" + simA.c + simB.c, lab: simA.n, p: sim.pA }, { id: "mX" + simA.c + simB.c, lab: t("d"), p: sim.pN }, { id: "m2" + simA.c + simB.c, lab: simB.n, p: sim.pB }].map((o) => {
                      const od = toOdds(o.p);
                      return <button key={o.id} className={"wc-ob" + (has(o.id) ? " on" : "")} onClick={() => toggle({ id: o.id, t1: o.lab, t2: simA.n + " – " + simB.n, odds: od })}>{fx(od)}</button>;
                    })}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--mut)", textAlign: "center", marginTop: 10 }}>{t("probs")} : {Math.round(sim.pA * 100)}% / {Math.round(sim.pN * 100)}% / {Math.round(sim.pB * 100)}%</div>
                </>
              ) : <div style={{ fontSize: 12, color: "var(--mut)", textAlign: "center", padding: 10 }}>{t("pickDiff")}</div>}
            </div>
          )}

          {betMkt === "groupe" && (
            <>
              <div className="wc-chips">{LETTERS.map((g) => <button key={g} className={"wc-chip" + (openG === g ? " on" : "")} onClick={() => setOpenG(g)}>{g}</button>)}</div>
              <div className="wc-card" style={{ padding: "6px 16px" }}>
                {groupWinnerOdds(openG).sort((a, b) => a.odds - b.odds).map((x, i) => (
                  <div className="wc-oddrow" key={x.n} style={i === 0 ? { borderTop: "none" } : {}}>
                    <div className="nm"><span style={{ fontSize: 19 }}>{flag(x.c)}</span>{x.n}</div>
                    <button className={"wc-ob" + (has("gw-" + openG + x.c) ? " on" : "")} onClick={() => toggle({ id: "gw-" + openG + x.c, t1: x.n, t2: t("mGroup") + " " + openG, odds: x.odds })}>{fx(x.odds)}</button>
                  </div>
                ))}
              </div>
            </>
          )}
          <p className="wc-note">{t("betNote")}</p>
        </div>
      )}

      {/* ===== PLUS ===== */}
      {tab === "plus" && (
        <div className="wc-wrap wc-fade">
          <h2 className="wc-h2 wc-disp" style={{ marginTop: 0 }}>{t("plus")}</h2>
          <button className="wc-plusitem" onClick={() => setTab("stades")}><span className="ic">🏟️</span>{t("stadiums")}</button>
          <button className="wc-plusitem" onClick={() => setTab("arbitres")}><span className="ic">🧑‍⚖️</span>{t("refTitle")}</button>
          <button className="wc-plusitem" onClick={share}><span className="ic">↗</span>{t("share")}</button>
          <button className="wc-plusitem" onClick={() => { if (confirm(t("resetSim") + " ?")) reset(); }}><span className="ic">↺</span>{t("resetSim")}</button>
          <div className="wc-card" style={{ marginTop: 6 }}>
            <div className="wc-h2 wc-disp" style={{ margin: "2px 0 6px" }}>{t("about")}</div>
            <div style={{ fontSize: 12.5, color: "var(--mut)", lineHeight: 1.65 }}>{t("aboutTxt")}</div>
          </div>
          <div className="wc-pro">
            <div className="pt">{t("proT")}</div>
            <ul>{t("proF").map((f) => <li key={f}>{f}</li>)}</ul>
          </div>
        </div>
      )}

      {/* BET SLIP */}
      {sels.length > 0 && !slip && (
        <button className="wc-slipbtn" onClick={() => setSlip(true)}><span className="cnt">{sels.length}</span> {t("slip")} · {fx(totalOdds)}</button>
      )}
      {slip && (
        <div className="wc-sheet" onClick={() => setSlip(false)}>
          <div className="wc-sheetinner" dir={dir} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div className="wc-disp" style={{ fontSize: 18 }}>{t("slip")}</div>
              <button className="wc-rm" onClick={() => setSlip(false)} style={{ fontSize: 24 }}>×</button>
            </div>
            {sels.length === 0 && <div style={{ color: "var(--mut)", fontSize: 13, padding: "16px 0" }}>{t("noSel")}</div>}
            {sels.map((s) => (
              <div className="wc-selrow" key={s.id}>
                <div className="l"><div className="t1">{s.t1}</div><div className="t2">{s.t2}</div></div>
                <span className="od">{fx(s.odds)}</span>
                <button className="wc-rm" onClick={() => toggle(s)}>×</button>
              </div>
            ))}
            {sels.length > 0 && (
              <>
                <div className="wc-stake">
                  <input type="number" value={stake} min={0} onChange={(e) => setStake(Math.max(0, Number(e.target.value)))} />
                  <span style={{ color: "var(--mut)", fontWeight: 600 }}>{t("cur")}</span>
                </div>
                <div className="wc-payout">
                  <span style={{ color: "var(--mut)", fontSize: 12 }}>{t("totalOdds")} {fx(totalOdds)} {sels.length > 1 ? t("combo") : ""}</span>
                  <span className="big wc-disp">{payout.toFixed(2)} {t("cur")}</span>
                </div>
                <button className="wc-ghost" style={{ marginTop: 14 }} onClick={() => { setSels([]); setSlip(false); }}>{t("clear")}</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="wc-nav">
        {navItems.map(([k, lk, d]) => {
          const active = tab === k || (k === "plus" && isMore);
          return <button key={k} className={"wc-nb" + (active ? " on" : "")} onClick={() => { setTab(k); setSlip(false); }}><Ico d={d} />{t(lk)}</button>;
        })}
      </nav>
    </div>
  );
}
