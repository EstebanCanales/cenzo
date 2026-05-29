"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock, Cpu, ShieldCheck, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";

type Stage = "queued" | "worker" | "verified" | "released";

type Contract = {
  id: string;
  hash: string;
  crop: string;
  amount: string;
  stage: Stage;
  age: number;
  releasedAt?: string;
};

const CROPS = ["Coffee", "Cacao", "Banano", "Quinoa"];
const AMOUNTS = ["$1,240", "$880", "$3,100", "$560", "$2,040", "$720"];

function randHash() {
  return (
    "G" +
    Math.random().toString(36).slice(2, 8).toUpperCase() +
    "…" +
    Math.random().toString(36).slice(2, 5).toUpperCase()
  );
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

function now() {
  return new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const STAGE_LABELS: Record<Stage, string> = {
  queued: "Queued",
  worker: "Trustless Worker",
  verified: "Stellar Verified",
  released: "Released",
};

const STAGE_COLORS: Record<Stage, { bg: string; border: string; text: string }> = {
  queued: { bg: "rgba(95,129,146,0.07)", border: "rgba(95,129,146,0.18)", text: "#5f8192" },
  worker: { bg: "rgba(201,139,36,0.07)", border: "rgba(201,139,36,0.22)", text: "#c98b24" },
  verified: { bg: "rgba(26,122,74,0.07)", border: "rgba(26,122,74,0.20)", text: "#1a7a4a" },
  released: { bg: "rgba(26,122,74,0.12)", border: "rgba(26,122,74,0.32)", text: "#1a7a4a" },
};

const STAGE_ICONS: Record<Stage, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>> = {
  queued: Clock,
  worker: Cpu,
  verified: ShieldCheck,
  released: CheckCircle2,
};

let _counter = 100;

export function StellarContractFlow() {
  const [pipeline, setPipeline] = useState<Contract[]>(() =>
    Array.from({ length: 4 }, (_, i) => ({
      ...makeContract(String(++_counter)),
      stage: (["queued", "worker", "verified"] as Stage[])[i % 3],
      age: i * 2,
    }))
  );
  const [released, setReleased] = useState<Contract[]>(() =>
    Array.from({ length: 3 }, (_, i) => ({
      ...makeContract(String(++_counter)),
      stage: "released" as Stage,
      age: 0,
      releasedAt: `${12 - i * 3}:0${i}`,
    }))
  );
  const [totalReleased, setTotalReleased] = useState(released.length + 38);
  const [activeWorkers] = useState(3);
  const [selected, setSelected] = useState<Contract | null>(null);
  const releasedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = setInterval(() => {
      setPipeline((prev) => {
        const next = prev.map((c) => ({ ...c, age: c.age + 1 }));
        const advanceIdx = next.findIndex((c) => c.age > 2);
        if (advanceIdx !== -1) {
          const stages: Stage[] = ["queued", "worker", "verified", "released"];
          const cur = stages.indexOf(next[advanceIdx].stage);
          if (cur < 2) {
            next[advanceIdx] = { ...next[advanceIdx], stage: stages[cur + 1], age: 0 };
          } else if (cur === 2) {
            // Move to released list
            const promoted: Contract = {
              ...next[advanceIdx],
              stage: "released",
              age: 0,
              releasedAt: now(),
            };
            setReleased((r) => [promoted, ...r]);
            setTotalReleased((n) => n + 1);
            // Replace with new contract
            next[advanceIdx] = makeContract(String(++_counter));
          }
        }
        return next;
      });
    }, 1600);
    return () => clearInterval(tick);
  }, []);

  // Auto-scroll released list to top on new entry
  useEffect(() => {
    releasedRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [released.length]);

  const pipelineStages: Stage[] = ["queued", "worker", "verified"];

  return (
    <>
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

        {/* Pipeline grid: 3 stages + released log */}
        <div className="stellar-pipeline">
          {pipelineStages.map((stage) => {
            const items = pipeline.filter((c) => c.stage === stage);
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
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        className="stellar-contract-card"
                        style={{ background: col.bg, borderColor: col.border }}
                      >
                        <div className="stellar-contract-card__top">
                          <code className="stellar-contract-card__hash">{c.hash}</code>
                          {stage === "verified" ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
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
              </div>
            );
          })}

          {/* Released — accumulates, clickable */}
          <div className="stellar-stage stellar-stage--released">
            <div className="stellar-stage__label">
              <CheckCircle2 size={11} style={{ color: STAGE_COLORS.released.text }} />
              <span style={{ color: STAGE_COLORS.released.text }}>Released</span>
              <span className="stellar-stage__count stellar-stage__count--green">{released.length}</span>
            </div>
            <div className="stellar-stage__cards stellar-stage__cards--scroll" ref={releasedRef}>
              <AnimatePresence initial={false}>
                {released.map((c) => (
                  <motion.button
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    className="stellar-contract-card stellar-contract-card--released"
                    style={{
                      background: STAGE_COLORS.released.bg,
                      borderColor: STAGE_COLORS.released.border,
                    }}
                    onClick={() => setSelected(c)}
                    type="button"
                  >
                    <div className="stellar-contract-card__top">
                      <code className="stellar-contract-card__hash">{c.hash}</code>
                      <ShieldCheck size={10} style={{ color: "#1a7a4a", flexShrink: 0 }} />
                    </div>
                    <div className="stellar-contract-card__meta">
                      <span>{c.crop}</span>
                      <strong style={{ color: STAGE_COLORS.released.text }}>{c.amount}</strong>
                    </div>
                    {c.releasedAt ? (
                      <div className="stellar-contract-card__time">{c.releasedAt}</div>
                    ) : null}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* QR Modal */}
      <AnimatePresence>
        {selected ? (
          <motion.div
            className="stellar-qr-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="stellar-qr-modal"
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="stellar-qr-modal__close" onClick={() => setSelected(null)} type="button">
                <X size={14} />
              </button>

              <div className="stellar-qr-modal__header">
                <ShieldCheck size={16} style={{ color: "var(--green)" }} />
                <span>Stellar Proof</span>
              </div>

              <div className="stellar-qr-modal__qr">
                <QRCode
                  value={`stellar:contract:${selected.hash}:${selected.crop}:${selected.amount}`}
                  size={180}
                  fgColor="var(--graphite)"
                  bgColor="transparent"
                />
              </div>

              <div className="stellar-qr-modal__info">
                <div className="stellar-qr-modal__row">
                  <span>Hash</span>
                  <code>{selected.hash}</code>
                </div>
                <div className="stellar-qr-modal__row">
                  <span>Cultivo</span>
                  <strong>{selected.crop}</strong>
                </div>
                <div className="stellar-qr-modal__row">
                  <span>Monto</span>
                  <strong style={{ color: "var(--green)" }}>{selected.amount}</strong>
                </div>
                {selected.releasedAt ? (
                  <div className="stellar-qr-modal__row">
                    <span>Released at</span>
                    <code>{selected.releasedAt}</code>
                  </div>
                ) : null}
              </div>

              <p className="stellar-qr-modal__hint">Escanea para verificar en Stellar</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
