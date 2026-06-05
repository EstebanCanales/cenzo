"use client";

import { Zap } from "lucide-react";
import { useTransition } from "react";

import { simulateSensorReading } from "@/lib/censo-actions";

type Props = {
  stationId: string;
  loteId?: number;
};

export function SensorSimulateButton({ stationId, loteId }: Props) {
  const [pending, start] = useTransition();

  return (
    <button
      className="btn-sensor-sim"
      disabled={pending}
      type="button"
      onClick={() =>
        start(async () => {
          await simulateSensorReading(stationId, loteId);
        })
      }
    >
      <Zap size={12} />
      {pending ? "Simulando…" : "Simular lectura"}
    </button>
  );
}
