"use client";

import dynamic from "next/dynamic";

import type { LoteSummary } from "@/lib/censo-api";

const StellarContractFlowInner = dynamic(
  () =>
    import("@/components/dashboard/stellar-contract-flow").then((m) => ({
      default: m.StellarContractFlow,
    })),
  { ssr: false }
);

export function StellarContractFlowClient({ lotes = [] }: { lotes?: LoteSummary[] }) {
  return <StellarContractFlowInner lotes={lotes} />;
}
