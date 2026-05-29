"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ShieldCheck, Cpu, ArrowRight, Zap, CheckCircle2, Clock } from "lucide-react";

type Contract = {
  id: string;
  hash: string;
  crop: string;
  amount: string;
  stage: "queued" | "worker" | "verified" | "released";
  age: number;
};

const CROPS = ["Coffee", "Cacao", "Banano", "Quinoa"];
const AMOUNTS = ["$1,240", "$880", "$3,100", "$560", "$2,040", "$720"];

function randHash() {
  return "G" + Math.random().toString(36).slice(2, 8).toUpperCase() + "…" + Math.random().toString(36).slice(2, 5).toUpperCase();
}

function makeContract(id: string): Contract {
  return {
    id,
    hash: randHash(),
    crop: CROPS[Math.floor(Math.random() * CROPS.length)],
    amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
    stage: "queued",
    age: 0,
  };
}

const STAGE_LABELS = {
  queued: "Queued",
  worker: "Trustless Worker",
  verified: "Stellar Verified",
  released: "Released",
};

const STAGE_COLORS = {
  queued: { bg: "rgba(95,129,146,0.08)", border: "rgba(95,129,146,0.2)", text: "#5f8192" },
  worker: { bg: "rgba(201,139,36,0.08)", border: "rgba(201,139,36,0.25)", text: "#c98b24" },
  verified: { bg: "rgba(26,122,74,0.08)", border: "rgba(26,122,74,0.22)", text: "#1a7a4a" },
  released: { bg: "rgba(26,122,74,0.14)", border: "rgba(26,122,74,0.35)", text: "#1a7a4a" },
};

const STAGE_ICONS = {
  queued: Clock,
  worker: Cpu,
  verified: ShieldCheck,
  released: CheckCircle2,
};

let _counter = 100;

export function StellarContractFlow() {
  const [contracts, setContracts] = useState<Contract[]>(() =>
    Array.from({ length: 5 }, (_, i) => ({
      ...makeContract(String(++_counter)),
      stage: (["queued", "worker", "verified", "released"] as const)[i % 4],
      age: i * 2,
    }))
  );
  const [totalReleased, setTotalReleased] = useState(41);
  const [activeWorkers] = useState(3);

  useEffect(() => {
    const tick = setInterval(() => {
      setContracts((prev) => {
        const next = prev.map((c) => ({ ...c, age: c.age + 1 }));

        // Advance one contract per tick
        const advanceIdx = next.findIndex((c) => c.stage !== "released" && c.age > 2);
        if (advanceIdx !== -1) {
          const stages: Contract["stage"][] = ["queued", "worker", "verified", "released"];
          const cur = stages.indexOf(next[advanceIdx].stage);
          next[advanceIdx] = { ...next[advanceIdx], stage: stages[cur + 1] ?? "released", age: 0 };
          if (next[advanceIdx].stage === "released") {
            setTotalReleased((n) => n + 1);
          }
        }

        // Replace released contracts after a delay
        const replaceIdx = next.findIndex((c) => c.stage === "released" && c.age > 4);
        if (replaceIdx !== -1) {
          next[replaceIdx] = makeContract(String(++_counter));
        }

        return next;
      });
    }, 1400);
    return () => clearInterval(tick);
  }, []);

  const byStage = (s: Contract["stage"]) => contracts.filter((c) => c.stage === s);

  return (
    <section className="lab-chart lab-chart--flex stellar-flow">
      <div className="lab-chart__header">
        <div>
          <p className="lab-kicker">Stellar · Trustless</p>
          <h2>Contract pipeline</h2>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--green)" }}>
          {totalReleased} released
        </span>
      </div>

      {/* Worker nodes */}
      <div className="stellar-workers">
        {Array.from({ length: activeWorkers }).map((_, i) => (
          <motion.div
            key={i}
            className="stellar-worker-node"
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.97, 1, 0.97] }}
            transition={{ duration: 2.4, delay: i * 0.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Cpu size={11} />
            <span>Worker {i + 1}</span>
            <motion.div
              className="stellar-worker-dot"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.2, delay: i * 0.4, repeat: Infinity }}
            />
          </motion.div>
        ))}
        <div className="stellar-worker-node stellar-worker-node--chain">
          <Zap size={11} />
          <span>Stellar</span>
          <div className="stellar-worker-dot stellar-worker-dot--green" />
        </div>
      </div>

      {/* Pipeline stages */}
      <div className="stellar-pipeline">
        {(["queued", "worker", "verified", "released"] as const).map((stage, si) => {
          const items = byStage(stage);
          const col = STAGE_COLORS[stage];
          const Icon = STAGE_ICONS[stage];
          return (
            <div key={stage} className="stellar-stage">
              <div className="stellar-stage__label">
                <Icon size={11} style={{ color: col.text }} />
                <span style={{ color: col.text }}>{STAGE_LABELS[stage]}</span>
                <span className="stellar-stage__count">{items.length}</span>
              </div>
              <div className="stellar-stage__cards">
                <AnimatePresence mode="popLayout">
                  {items.map((c) => (
                    <motion.div
                      key={c.id}
                      layout
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="stellar-contract-card"
                      style={{
                        background: col.bg,
                        borderColor: col.border,
                      }}
                    >
                      <div className="stellar-contract-card__top">
                        <code className="stellar-contract-card__hash">{c.hash}</code>
                        {stage === "verified" || stage === "released" ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="stellar-contract-card__check"
                          >
                            <ShieldCheck size={10} style={{ color: "#1a7a4a" }} />
                          </motion.div>
                        ) : null}
                      </div>
                      <div className="stellar-contract-card__meta">
                        <span>{c.crop}</span>
                        <strong style={{ color: col.text }}>{c.amount}</strong>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {si < 3 && <ArrowRight size={12} className="stellar-stage__arrow" />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
