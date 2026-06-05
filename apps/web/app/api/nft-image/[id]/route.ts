import { NextResponse } from "next/server";

import { getLote, getNftScore } from "@/lib/censo-api";

const TIER_COLORS: Record<string, { bg: string; accent: string; badge: string; text: string }> = {
  Diamante: { bg: "#0f172a", accent: "#38bdf8", badge: "#0ea5e9", text: "#e0f2fe" },
  Oro:      { bg: "#1c1408", accent: "#fbbf24", badge: "#d97706", text: "#fef3c7" },
  Plata:    { bg: "#111827", accent: "#94a3b8", badge: "#64748b", text: "#e2e8f0" },
  None:     { bg: "#0f1a12", accent: "#4ade80", badge: "#16a34a", text: "#dcfce7" },
};

const GRADE_COLOR: Record<string, string> = {
  A: "#4ade80",
  B: "#60a5fa",
  C: "#fbbf24",
  D: "#fb923c",
  F: "#f87171",
};

function bar(x: number, y: number, w: number, score: number, max: number, color: string): string {
  const fill = Math.round((score / max) * w);
  return `
    <rect x="${x}" y="${y}" width="${w}" height="6" rx="3" fill="#1e293b"/>
    <rect x="${x}" y="${y}" width="${fill}" height="6" rx="3" fill="${color}"/>
  `;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [lote, nftScore] = await Promise.all([
    getLote(id).catch(() => null),
    getNftScore(id).catch(() => null),
  ]);

  const producer = lote?.producer ?? `Lote #${id}`;
  const tier = lote?.tier ?? "None";
  const c = TIER_COLORS[tier] ?? TIER_COLORS.None;

  const grade = nftScore?.score.grade ?? "—";
  const total = nftScore?.score.total ?? 0;
  const gradeColor = GRADE_COLOR[grade] ?? "#94a3b8";

  const bd = nftScore?.score.breakdown;
  const traz  = bd?.trazabilidad  ?? { score: 0, max: 40 };
  const integ = bd?.integridad    ?? { score: 0, max: 25 };
  const sens  = bd?.sensores      ?? { score: 0, max: 20 };
  const cert  = bd?.certificacion ?? { score: 0, max: 15 };

  // truncate long names
  const name = producer.length > 28 ? producer.slice(0, 25) + "…" : producer;

  const W = 600;
  const H = 340;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.bg}"/>
      <stop offset="100%" stop-color="#0d1117"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c.accent}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${c.accent}" stop-opacity="0"/>
    </linearGradient>
    <filter id="blur">
      <feGaussianBlur stdDeviation="40"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Glow blob -->
  <ellipse cx="80" cy="80" rx="120" ry="80" fill="${c.accent}" opacity="0.07" filter="url(#blur)"/>

  <!-- Top border accent -->
  <rect width="${W}" height="3" fill="${c.accent}" opacity="0.8"/>

  <!-- Left accent bar -->
  <rect x="0" y="3" width="3" height="${H - 3}" fill="${c.accent}" opacity="0.3"/>

  <!-- CENSO wordmark -->
  <text x="32" y="44" font-family="ui-monospace,monospace" font-size="11" font-weight="700"
        fill="${c.accent}" letter-spacing="4" opacity="0.9">CENSO</text>
  <text x="104" y="44" font-family="ui-monospace,monospace" font-size="11"
        fill="${c.accent}" opacity="0.3">NFT CERTIFICATE</text>

  <!-- Tier badge -->
  <rect x="470" y="24" width="${tier.length * 9 + 24}" height="22" rx="11" fill="${c.badge}" opacity="0.25"/>
  <text x="482" y="39" font-family="ui-sans-serif,sans-serif" font-size="11" font-weight="700"
        fill="${c.accent}" letter-spacing="1">${tier.toUpperCase()}</text>

  <!-- Divider -->
  <line x1="32" y1="56" x2="${W - 32}" y2="56" stroke="${c.accent}" stroke-width="0.5" opacity="0.2"/>

  <!-- Producer name -->
  <text x="32" y="96" font-family="ui-sans-serif,sans-serif" font-size="26" font-weight="700"
        fill="${c.text}">${name}</text>

  <!-- Lote ID -->
  <text x="32" y="118" font-family="ui-monospace,monospace" font-size="12"
        fill="${c.accent}" opacity="0.5">Lote #${id} · Trazabilidad Soroban</text>

  <!-- Grade circle -->
  <circle cx="510" cy="110" r="52" fill="none" stroke="${gradeColor}" stroke-width="3" opacity="0.2"/>
  <circle cx="510" cy="110" r="52" fill="none" stroke="${gradeColor}" stroke-width="3"
          stroke-dasharray="${Math.round(total / 100 * 327)} 327" stroke-linecap="round"
          transform="rotate(-90 510 110)"/>
  <text x="510" y="104" font-family="ui-sans-serif,sans-serif" font-size="36" font-weight="900"
        fill="${gradeColor}" text-anchor="middle" dominant-baseline="middle">${grade}</text>
  <text x="510" y="130" font-family="ui-monospace,monospace" font-size="12" font-weight="600"
        fill="${gradeColor}" text-anchor="middle" opacity="0.8">${total}/100</text>

  <!-- Breakdown section -->
  <text x="32" y="160" font-family="ui-sans-serif,sans-serif" font-size="10" font-weight="700"
        fill="${c.text}" letter-spacing="2" opacity="0.5">DESGLOSE</text>

  <!-- Trazabilidad -->
  <text x="32" y="186" font-family="ui-sans-serif,sans-serif" font-size="12" fill="${c.text}" opacity="0.75">Trazabilidad</text>
  <text x="420" y="186" font-family="ui-monospace,monospace" font-size="12" fill="${gradeColor}" text-anchor="end">${traz.score}/${traz.max}</text>
  ${bar(32, 192, 390, traz.score, traz.max, c.accent)}

  <!-- Integridad -->
  <text x="32" y="218" font-family="ui-sans-serif,sans-serif" font-size="12" fill="${c.text}" opacity="0.75">Integridad on-chain</text>
  <text x="420" y="218" font-family="ui-monospace,monospace" font-size="12" fill="${gradeColor}" text-anchor="end">${integ.score}/${integ.max}</text>
  ${bar(32, 224, 390, integ.score, integ.max, c.accent)}

  <!-- Sensores -->
  <text x="32" y="250" font-family="ui-sans-serif,sans-serif" font-size="12" fill="${c.text}" opacity="0.75">Sensores IoT</text>
  <text x="420" y="250" font-family="ui-monospace,monospace" font-size="12" fill="${gradeColor}" text-anchor="end">${sens.score}/${sens.max}</text>
  ${bar(32, 256, 390, sens.score, sens.max, c.accent)}

  <!-- Certificación -->
  <text x="32" y="282" font-family="ui-sans-serif,sans-serif" font-size="12" fill="${c.text}" opacity="0.75">Certificación</text>
  <text x="420" y="282" font-family="ui-monospace,monospace" font-size="12" fill="${gradeColor}" text-anchor="end">${cert.score}/${cert.max}</text>
  ${bar(32, 288, 390, cert.score, cert.max, c.accent)}

  <!-- Bottom divider -->
  <line x1="32" y1="308" x2="${W - 32}" y2="308" stroke="${c.accent}" stroke-width="0.5" opacity="0.15"/>

  <!-- Footer -->
  <text x="32" y="326" font-family="ui-monospace,monospace" font-size="10"
        fill="${c.accent}" opacity="0.35">Stellar Testnet · Soroban Smart Contract · censo.app/t/${id}</text>
  <text x="${W - 32}" y="326" font-family="ui-monospace,monospace" font-size="10"
        fill="${c.accent}" opacity="0.35" text-anchor="end">2026</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
