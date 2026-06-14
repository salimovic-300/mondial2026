/**
 * MONDIAL 2026 PRO — Configuration File
 * =======================================
 * Edit this file to rebrand the app in under 5 minutes.
 * No other files need to be touched.
 */

const CONFIG = {
  // ── App identity ──────────────────────────────────────────────────────────
  appName: "Mondial 2026 Pro",
  appTagline: {
    fr: "La plateforme officieuse du Mondial 2026",
    en: "The Ultimate World Cup 2026 Platform",
    ar: "منصة كأس العالم 2026",
  },

  // ── Branding colors (CSS values) ──────────────────────────────────────────
  colors: {
    // Main gradient (header, nav active, buttons)
    gradientFrom: "#C8102E",   // FIFA red
    gradientTo:   "#006847",   // FIFA green
    // Background
    bgDark:       "#070A1A",
    bgCard:       "#0F1628",
    bgCardBorder: "#1E2A4A",
    // Accent (highlights, Morocco, betting slip)
    accent:       "#FFD700",   // gold
    accentAlt:    "#00D4FF",   // light blue
    // Text
    textPrimary:  "#EEF1FF",
    textMuted:    "#8892B0",
  },

  // ── Featured team (highlighted in gold throughout the app) ───────────────
  featuredTeam: {
    code: "MA",          // ISO 3166-1 alpha-2
    name: { fr: "Maroc", en: "Morocco", ar: "المغرب" },
    group: "C",
  },

  // ── Currency for the betting slip ─────────────────────────────────────────
  currency: {
    symbol: "DH",        // e.g. "DH", "$", "€", "£", "SAR"
    name:   "Dirham",
    defaultStake: 100,
  },

  // ── Default language ──────────────────────────────────────────────────────
  defaultLang: "fr",     // "fr" | "en" | "ar"

  // ── Pro upgrade (monetization) ────────────────────────────────────────────
  pro: {
    enabled: true,
    price:   "4.99",     // display only — connect your payment link
    paymentUrl: "",      // e.g. "https://buy.stripe.com/xxx"
    features: {
      fr: ["Scores en direct", "Alertes push", "Mode hors-ligne", "Ligues privées"],
      en: ["Live scores", "Push alerts", "Offline mode", "Private leagues"],
      ar: ["النتائج المباشرة", "تنبيهات فورية", "وضع عدم الاتصال", "دوريات خاصة"],
    },
  },

  // ── Analytics (optional) ─────────────────────────────────────────────────
  analytics: {
    googleAnalyticsId: "",   // e.g. "G-XXXXXXXXXX"
    // Add other analytics IDs here
  },
};

export default CONFIG;
