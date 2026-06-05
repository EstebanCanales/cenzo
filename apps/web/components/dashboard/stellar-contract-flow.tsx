"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock, Cpu, Maximize2, ShieldCheck, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { dashboardInsights, dashboardMetrics } from "@/lib/dashboard";

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
  return new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const STAGE_LABELS: Record<Stage, string> = {
  queued: "Queued",
  worker: "Worker",
  verified: "Verified",
  released: "Released",
};

const STAGE_COLORS: Record<Stage, { bg: string; border: string; text: string }> = {
  queued:   { bg: "rgba(95,129,146,0.07)",  border: "rgba(95,129,146,0.18)",  text: "#5f8192" },
  worker:   { bg: "rgba(201,139,36,0.07)",  border: "rgba(201,139,36,0.22)",  text: "#c98b24" },
  verified: { bg: "rgba(26,122,74,0.07)",   border: "rgba(26,122,74,0.20)",   text: "#1a7a4a" },
  released: { bg: "rgba(26,122,74,0.12)",   border: "rgba(26,122,74,0.32)",   text: "#1a7a4a" },
};

const STAGE_ICONS: Record<Stage, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>> = {
  queued:   Clock,
  worker:   Cpu,
  verified: ShieldCheck,
  released: CheckCircle2,
};

let _counter = 100;

const INIT_RELEASED = Array.from({ length: 3 }, (_, i) => ({
  ...makeContract(String(++_counter)),
  stage: "released" as Stage,
  age: 0,
  releasedAt: `${12 - i * 3}:0${i}`,
}));

export function StellarContractFlow() {
  const [pipeline, setPipeline] = useState<Contract[]>(() =>
    Array.from({ length: 4 }, (_, i) => ({
      ...makeContract(String(++_counter)),
      stage: (["queued", "worker", "verified"] as Stage[])[i % 3],
      age: i * 2,
    }))
  );
  const [released, setReleased] = useState<Contract[]>(INIT_RELEASED);
  const [totalReleased, setTotalReleased] = useState(INIT_RELEASED.length + 38);
  const [selected, setSelected] = useState<Contract>(INIT_RELEASED[0]);
  const [qrOpen, setQrOpen] = useState(false);
  const activeWorkers = 3;

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
            const promoted: Contract = {
              ...next[advanceIdx],
              stage: "released",
              age: 0,
              releasedAt: now(),
            };
            setReleased((r) => [promoted, ...r]);
            setTotalReleased((n) => n + 1);
            setSelected(promoted);
            next[advanceIdx] = makeContract(String(++_counter));
          }
        }
        return next;
      });
    }, 1600);
    return () => clearInterval(tick);
  }, []);

  const pipelineStages: Stage[] = ["queued", "worker", "verified"];

  return (
    <section className="lab-chart lab-chart--flex stellar-flow">
      {/* Header */}
      <div className="lab-chart__header">
        <div>
          <p className="lab-kicker">Stellar · Trustless</p>
          <h2>Contract pipeline</h2>
        </div>
        <div className="stellar-workers">
          {Array.from({ length: activeWorkers }).map((_, i) => (
            <motion.div
              key={i}
              className="stellar-worker-node"
              animate={{
                opacity: [0.55, 1, 0.55],
                scale: [0.97, 1, 0.97],
                boxShadow: [
                  "0 0 0px rgba(95,129,146,0)",
                  "0 0 8px rgba(95,129,146,0.16)",
                  "0 0 0px rgba(95,129,146,0)",
                ],
              }}
              transition={{ duration: 2.4, delay: i * 0.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Cpu size={11} />
              <span>W{i + 1}</span>
              <motion.div
                className="stellar-worker-dot"
                animate={{ opacity: [1, 0.15, 1], scale: [1, 0.5, 1] }}
                transition={{ duration: 1.2, delay: i * 0.4, repeat: Infinity }}
              />
            </motion.div>
          ))}
          <motion.div
            className="stellar-worker-node stellar-worker-node--chain"
            animate={{
              boxShadow: [
                "0 0 0px rgba(26,122,74,0)",
                "0 0 12px rgba(26,122,74,0.28)",
                "0 0 0px rgba(26,122,74,0)",
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Zap size={11} />
            <span>Stellar</span>
            <motion.div
              className="stellar-worker-dot stellar-worker-dot--green"
              animate={{ opacity: [1, 0.3, 1], scale: [1, 0.6, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          <span className="stellar-total">
            {totalReleased} released
          </span>
        </div>
      </div>

      {/* Body: 50% transactions | 50% QR + data */}
      <div className="stellar-body">

        {/* LEFT — pipeline (3 stages) + released list */}
        <div className="stellar-left">
          <div className="stellar-pipeline">
            {pipelineStages.map((stage) => {
              const items = pipeline.filter((c) => c.stage === stage);
              const col = STAGE_COLORS[stage];
              const Icon = STAGE_ICONS[stage];
              return (
                <div key={stage} className="stellar-stage">
                  <div className="stellar-stage__label">
                    <Icon size={10} style={{ color: col.text }} />
                    <span style={{ color: col.text }}>{STAGE_LABELS[stage]}</span>
                    <span className="stellar-stage__count">{items.length}</span>
                  </div>
                  <div className="stellar-stage__cards">
                    <AnimatePresence mode="popLayout">
                      {items.map((c) => (
                        <motion.div
                          key={c.id}
                          layout
                          initial={{ opacity: 0, y: -14, scale: 0.88 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 10, scale: 0.88, transition: { duration: 0.2, ease: "easeOut" } }}
                          transition={{ type: "spring", stiffness: 480, damping: 30 }}
                          className="stellar-contract-card"
                          style={{ background: col.bg, borderColor: col.border }}
                        >
                          <div className="stellar-contract-card__top">
                            <code className="stellar-contract-card__hash">{c.hash}</code>
                            {stage === "verified" && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <ShieldCheck size={10} style={{ color: "#1a7a4a" }} />
                              </motion.div>
                            )}
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

            {/* Released column — scroll */}
            <div className="stellar-stage stellar-stage--released">
              <div className="stellar-stage__label">
                <CheckCircle2 size={10} style={{ color: STAGE_COLORS.released.text }} />
                <span style={{ color: STAGE_COLORS.released.text }}>Released</span>
                <span className="stellar-stage__count stellar-stage__count--green">{released.length}</span>
              </div>
              <div className="stellar-stage__cards stellar-stage__cards--scroll">
                <AnimatePresence initial={false}>
                  {released.map((c) => (
                    <motion.button
                      key={c.id}
                      layout
                      initial={{ opacity: 0, y: -16, scale: 0.88 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 520, damping: 26 }}
                      className="stellar-contract-card stellar-contract-card--released"
                      style={{
                        background: STAGE_COLORS.released.bg,
                        borderColor: selected?.id === c.id
                          ? "rgba(26,122,74,0.55)"
                          : STAGE_COLORS.released.border,
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
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — QR + datos del contrato seleccionado */}
        <div className="stellar-right">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              className="stellar-qr-panel"
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              <div className="stellar-qr-panel__badge">
                <ShieldCheck size={12} style={{ color: "var(--green)" }} />
                <span>Stellar proof</span>
              </div>

              <button
                className="stellar-qr-panel__code"
                onClick={() => setQrOpen(true)}
                type="button"
                title="Ver QR completo"
              >
                <QRCode
                  value={`stellar:contract:${selected.hash}:${selected.crop}:${selected.amount}`}
                  size={160}
                  fgColor="#0f2e1a"
                  bgColor="transparent"
                />
                <div className="stellar-qr-panel__zoom">
                  <Maximize2 size={12} />
                </div>
              </button>

              <div className="stellar-qr-panel__rows">
                <div className="stellar-qr-panel__row">
                  <span>Hash</span>
                  <code>{selected.hash}</code>
                </div>
                <div className="stellar-qr-panel__row">
                  <span>Cultivo</span>
                  <strong>{selected.crop}</strong>
                </div>
                <div className="stellar-qr-panel__row">
                  <span>Monto</span>
                  <strong className="stellar-qr-panel__amount">{selected.amount}</strong>
                </div>
                {selected.releasedAt && (
                  <div className="stellar-qr-panel__row">
                    <span>Hora</span>
                    <code>{selected.releasedAt}</code>
                  </div>
                )}
              </div>

              <p className="stellar-qr-panel__hint">Toca el QR para ampliar · Stellar</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* QR fullscreen modal */}
      <AnimatePresence>
        {qrOpen && (
          <motion.div
            className="stellar-qr-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQrOpen(false)}
          >
            <motion.div
              className="stellar-qr-modal"
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="stellar-qr-modal__close" onClick={() => setQrOpen(false)} type="button">
                <X size={14} />
              </button>
              <div className="stellar-qr-modal__header">
                <ShieldCheck size={16} style={{ color: "var(--green)" }} />
                <span>Stellar Proof</span>
              </div>
              <div className="stellar-qr-modal__qr">
                <QRCode
                  value={`stellar:contract:${selected.hash}:${selected.crop}:${selected.amount}:station:${dashboardInsights.sensorSignal.label}:lotes:${dashboardMetrics[0].value}:moves:${dashboardMetrics[1].value}:alerts:${dashboardMetrics[2].value}:contracts:${dashboardMetrics[3].value}:proof:${dashboardInsights.primary.value}`}
                  size={240}
                  fgColor="#0f2e1a"
                  bgColor="transparent"
                />
              </div>
              <div className="stellar-qr-modal__info">
                <div className="stellar-qr-modal__row"><span>Hash</span><code>{selected.hash}</code></div>
                <div className="stellar-qr-modal__row"><span>Cultivo</span><strong>{selected.crop}</strong></div>
                <div className="stellar-qr-modal__row">
                  <span>Monto</span>
                  <strong style={{ color: "var(--green)" }}>{selected.amount}</strong>
                </div>
                {selected.releasedAt && (
                  <div className="stellar-qr-modal__row"><span>Hora</span><code>{selected.releasedAt}</code></div>
                )}
                <div className="stellar-qr-modal__divider" />
                <div className="stellar-qr-modal__section">Sensores · {dashboardInsights.sensorSignal.label}</div>
                <div className="stellar-qr-modal__row">
                  <span>{dashboardMetrics[0].label}</span>
                  <strong>{dashboardMetrics[0].value}</strong>
                </div>
                <div className="stellar-qr-modal__row">
                  <span>{dashboardMetrics[1].label}</span>
                  <strong>{dashboardMetrics[1].value}</strong>
                </div>
                <div className="stellar-qr-modal__row">
                  <span>{dashboardMetrics[2].label}</span>
                  <strong style={{ color: "#c98b24" }}>{dashboardMetrics[2].value}</strong>
                </div>
                <div className="stellar-qr-modal__row">
                  <span>{dashboardMetrics[3].label}</span>
                  <strong>{dashboardMetrics[3].value}</strong>
                </div>
                <div className="stellar-qr-modal__row">
                  <span>Proof rate</span>
                  <strong style={{ color: "var(--green)" }}>{dashboardInsights.primary.value}</strong>
                </div>
              </div>
              <p className="stellar-qr-modal__hint">Escanea para verificar en Stellar</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
