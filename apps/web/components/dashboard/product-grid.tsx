import { Activity, Edit3, ExternalLink, RadioTower, ShieldCheck, TriangleAlert } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { ProductDrawer } from "@/components/dashboard/product-drawer";
import { products } from "@/lib/dashboard";
import { Badge } from "@/components/ui/badge";

const riskBadge = {
  low: "green",
  medium: "slate",
  high: "gold",
} as const;

export function ProductGrid() {
  const verifiedCount = products.filter((product) => product.status === "Verified").length;
  const reviewCount = products.filter((product) => product.status === "Needs review").length;
  const liveSensors = products.filter((product) => product.sensorStatus === "Live").length;

  return (
    <section className="products-section">
      <div className="products-board">
        <div className="products-hero">
          <div className="products-hero__copy">
            <p className="section-kicker">Operational inventory</p>
            <h2>Lotes y evidencia Stellar</h2>
            <p>
              Gestiona unidades de trazabilidad, verifica integridad de datos on-chain y monitorea sensores en tiempo real.
            </p>
          </div>
          <div className="products-hero__stats">
            <span>
              <ShieldCheck size={18} />
              <strong>{verifiedCount}</strong>
              Verified
            </span>
            <span>
              <TriangleAlert size={18} />
              <strong>{reviewCount}</strong>
              Review
            </span>
            <span>
              <RadioTower size={18} />
              <strong>{liveSensors}</strong>
              Live
            </span>
          </div>
          <div className="products-hero__action">
            <span>
              <Activity size={16} />
              Inventory scannability active
            </span>
            <ProductDrawer mode="add" triggerLabel="Agregar producto" />
          </div>
        </div>

        <div className="product-list">
          <header className="product-list-header">
            <div>Asset</div>
            <div>Name & Category</div>
            <div>Status</div>
            <div>Origin</div>
            <div>Verified</div>
            <div>Score</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </header>

          {products.map((product) => {
            const needsReview = product.riskLevel === "high" || product.status === "Needs review";
            
            return (
              <article key={product.id} className="product-list-item">
                <div className="product-list-item__thumb">
                  <Image
                    alt={product.name}
                    fill
                    src={product.assetSrc}
                    sizes="48px"
                  />
                </div>
                
                <div className="product-list-item__info">
                  <h3>{product.name}</h3>
                  <p>{product.category}</p>
                </div>

                <div>
                  <Badge variant={riskBadge[product.riskLevel]}>
                    {needsReview ? <TriangleAlert size={12} /> : <ShieldCheck size={12} />}
                    {product.status}
                  </Badge>
                </div>

                <div className="product-list-item__meta">
                  <span>{product.origin}</span>
                  <small>Source</small>
                </div>

                <div className="product-list-item__meta">
                  <span>{product.lastVerifiedAt}</span>
                  <small>Audit date</small>
                </div>

                <div>
                  <span className="product-list-item__score">{product.traceabilityScore}</span>
                </div>

                <div className="product-list-item__actions">
                  <ProductDrawer mode="edit" product={product} triggerLabel="Edit" />
                  <Link className="icon-link" href={`/dashboard/products/${product.id}`}>
                    <ExternalLink size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
