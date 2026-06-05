"use client";

import dynamic from "next/dynamic";

const StellarContractFlowInner = dynamic(
  () =>
    import("@/components/dashboard/stellar-contract-flow").then((m) => ({
      default: m.StellarContractFlow,
    })),
  { ssr: false }
);

export function StellarContractFlowClient() {
  return <StellarContractFlowInner />;
}
