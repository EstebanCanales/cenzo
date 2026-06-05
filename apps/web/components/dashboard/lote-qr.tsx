"use client";

import { Download, ExternalLink, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export function LoteQr({ loteId }: { loteId: number }) {
  const [origin, setOrigin] = useState("");
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => setOrigin(window.location.origin), []);

  const path = `/t/${loteId}`;
  const url = origin ? `${origin}${path}` : path;

  function download() {
    const canvas = wrap.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `censo-lote-${loteId}-qr.png`;
    link.click();
  }

  return (
    <div className="censo-card" style={{ display: "grid", gap: 12, justifyItems: "center" }}>
      <strong style={{ fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
        <QrCode size={16} /> QR del empaque
      </strong>
      <div
        ref={wrap}
        style={{ padding: 12, background: "#fff", borderRadius: 10, border: "1px solid var(--line, #f0f0f0)" }}
      >
        <QRCodeCanvas value={url} size={156} level="M" marginSize={2} />
      </div>
      <span className="censo-mono" style={{ textAlign: "center" }}>{url}</span>
      <div style={{ display: "flex", gap: 8 }}>
        <Button type="button" size="sm" variant="secondary" onClick={download}>
          <Download size={14} /> PNG
        </Button>
        <a className="ui-button ui-button--default ui-button--sm" href={path} target="_blank" rel="noreferrer">
          Ver página <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
