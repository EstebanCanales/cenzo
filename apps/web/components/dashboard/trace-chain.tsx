"use client";

import { motion } from "framer-motion";
import { Check, ClipboardCheck, Factory, PackageCheck, Truck, Wheat } from "lucide-react";

import { ProductTraceEvent } from "@/lib/dashboard";

const stageIcons = {
  Agricultor: Wheat,
  Transporte: Truck,
  Recepcion: PackageCheck,
  "Control de calidad": ClipboardCheck,
  Venta: Factory,
} as const;

export function TraceChain({ events, compact = false }: { events: ProductTraceEvent[]; compact?: boolean }) {
  return (
    <div className={compact ? "trace-chain trace-chain--compact" : "trace-chain"}>
      {events.map((event, index) => {
        const Icon = stageIcons[event.stage as keyof typeof stageIcons] ?? Check;
        return (
          <motion.div
            key={event.id}
            animate={{ opacity: 1, y: 0 }}
            className={`trace-chain__node trace-chain__node--${event.status}`}
            initial={{ opacity: 0, y: 8 }}
            transition={{ delay: index * 0.07 }}
          >
            <span className="trace-chain__step">{String(index + 1).padStart(2, "0")}</span>
            <span className="trace-chain__icon">
              <Icon size={16} />
            </span>
            <span className="trace-chain__copy">
              <strong>{event.stage}</strong>
              <small>{event.status === "verified" ? "Verified" : "Pending"}</small>
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

