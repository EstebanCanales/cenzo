import { notFound } from "next/navigation";
import Image from "next/image";

import { IncidentStageChart } from "@/components/dashboard/incident-stage-chart";
import { LabShell } from "@/components/dashboard/lab-shell";
import { ProductDrawer } from "@/components/dashboard/product-drawer";
import { ProductTimeline } from "@/components/dashboard/product-timeline";
import { QualityDistribution } from "@/components/dashboard/quality-distribution";
import { TraceChain } from "@/components/dashboard/trace-chain";
import { Badge } from "@/components/ui/badge";
import { getProductById } from "@/lib/dashboard";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <LabShell
      actions={<ProductDrawer mode="edit" product={product} triggerLabel="Editar producto" />}
      description="Cada etapa queda narrada, verificada y lista para futuras conexiones al backend Rust."
      eyebrow="Product detail"
      heading={product.name}
    >
      <div className="product-detail-grid">
        <section className="product-detail-summary">
          <div className="product-detail-summary__media">
            <Image alt={`${product.name} traceable lot`} fill src={product.assetSrc} sizes="(max-width: 900px) 100vw, 44vw" />
            <Badge variant={product.stellarStatus === "Verified" ? "green" : "gold"}>{product.stellarStatus}</Badge>
          </div>
          <div className="product-detail-summary__content">
            <div>
              <p className="lab-kicker">Evidence asset</p>
              <h2>{product.summary}</h2>
              <p>{product.verificationNote}</p>
            </div>
            <div className="product-detail-summary__facts">
              <div>
                <span>Origen</span>
                <strong>{product.origin}</strong>
              </div>
              <div>
                <span>Categoria</span>
                <strong>{product.category}</strong>
              </div>
              <div>
                <span>Traceability score</span>
                <strong>{product.traceabilityScore}</strong>
              </div>
            </div>
            <TraceChain events={product.events} />
          </div>
        </section>

        <ProductTimeline events={product.events} />
      </div>

      <div className="charts-pair">
        <QualityDistribution />
        <IncidentStageChart />
      </div>
    </LabShell>
  );
}
