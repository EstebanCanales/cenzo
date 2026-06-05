import { Award, CheckCircle2, Cpu, ExternalLink, Leaf, ShieldCheck } from "lucide-react";
import Image from "next/image";

import type { NftScoreData } from "@/lib/censo-api";

const GRADE_STYLES: Record<string, { ring: string; text: string; bg: string; label: string }> = {
  A: { ring: "ring-[var(--green)]",   text: "text-[var(--green)]",   bg: "bg-[var(--green-soft)]",   label: "Excelente" },
  B: { ring: "ring-blue-400",         text: "text-blue-600",         bg: "bg-blue-50",               label: "Bueno" },
  C: { ring: "ring-amber-400",        text: "text-amber-600",        bg: "bg-amber-50",              label: "Aceptable" },
  D: { ring: "ring-orange-400",       text: "text-orange-600",       bg: "bg-orange-50",             label: "En desarrollo" },
  F: { ring: "ring-red-300",          text: "text-red-500",          bg: "bg-red-50",                label: "No verificable" },
};

const COMPONENT_ICONS = {
  trazabilidad:  Leaf,
  integridad:    ShieldCheck,
  sensores:      Cpu,
  certificacion: Award,
};

const COMPONENT_LABELS = {
  trazabilidad:  "Trazabilidad",
  integridad:    "Integridad on-chain",
  sensores:      "Sensores IoT",
  certificacion: "Certificación",
};

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-[var(--line)]">
      <div
        className="h-1.5 rounded-full bg-[var(--green)] transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

type Props = { data: NftScoreData; loteId: number };

export function NftScoreCard({ data, loteId }: Props) {
  const { score } = data;
  const g = GRADE_STYLES[score.grade] ?? GRADE_STYLES.F;
  const imgSrc = `/api/nft-image/${loteId}`;

  return (
    <div className="censo-card flex flex-col gap-4">
      {/* NFT Image */}
      <div className="relative w-full overflow-hidden rounded-lg border border-[var(--line)]">
        <Image
          src={imgSrc}
          alt={`NFT certificado lote ${loteId}`}
          width={600}
          height={340}
          className="w-full h-auto"
          unoptimized
        />
        <a
          href={imgSrc}
          target="_blank"
          rel="noreferrer"
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-black/50 text-white text-[10px] hover:bg-black/70 transition-colors"
        >
          <ExternalLink size={10} /> Ver SVG
        </a>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-0.5">
            NFT · Estado del producto
          </p>
          <p className="text-xs text-[var(--muted)] m-0">{data.producer}</p>
        </div>
        {/* Score ring */}
        <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full ring-2 ${g.ring} ${g.bg} shrink-0`}>
          <span className={`text-2xl font-black leading-none ${g.text}`}>{score.grade}</span>
          <span className={`text-[9px] font-bold ${g.text}`}>{score.total}/100</span>
        </div>
      </div>

      {/* Grade label */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${g.bg}`}>
        <CheckCircle2 size={13} className={g.text} />
        <span className={`text-xs font-semibold ${g.text}`}>{score.grade_label}</span>
        <span className="ml-auto text-[11px] text-[var(--muted)]">{score.summary}</span>
      </div>

      {/* Breakdown */}
      <div className="flex flex-col gap-3">
        {(Object.keys(COMPONENT_LABELS) as (keyof typeof COMPONENT_LABELS)[]).map((key) => {
          const comp = score.breakdown[key];
          const Icon = COMPONENT_ICONS[key];
          const pct = Math.round((comp.score / comp.max) * 100);
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text)]">
                  <Icon size={12} className="text-[var(--muted)] shrink-0" />
                  <span>{COMPONENT_LABELS[key]}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[var(--text-strong)]">
                    {comp.score}<span className="font-normal text-[var(--muted)]">/{comp.max}</span>
                  </span>
                  <span className="text-[10px] text-[var(--muted)] hidden sm:block">{pct}%</span>
                </div>
              </div>
              <ProgressBar value={comp.score} max={comp.max} />
              <p className="text-[11px] text-[var(--muted)] leading-snug m-0">{comp.label} — {comp.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Traits NFT */}
      <div className="border-t border-[var(--line)] pt-3">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2">
          Atributos del NFT
        </p>
        <div className="flex flex-wrap gap-1.5">
          {score.traits.map((t) => (
            <span
              key={t.trait_type}
              className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--text)]"
            >
              <span className="text-[var(--muted)]">{t.trait_type}:</span> {t.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
