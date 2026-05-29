import Image from "next/image";
import { Edit3, ExternalLink, RadioTower, ShieldCheck, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { ProductDrawer } from "@/components/dashboard/product-drawer";
import { TraceChain } from "@/components/dashboard/trace-chain";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const riskBadge = {
  low: "green",
  medium: "slate",
  high: "gold",
} as const;

export function ProductAssetCard({ product }: { product: ProductCard }) {
  const needsReview = product.riskLevel === "high" || product.status === "Needs review";

  return (
    <article className={cn("product-asset-card", `product-asset-card--risk-${product.riskLevel}`)}>
      <div className="product-asset-card__media">
        <Image
          alt={`${product.name} agricultural lot`}
          fill
          src={product.assetSrc}
          sizes="(max-width: 900px) 100vw, 48vw"
        />
        <div className="product-asset-card__media-overlay">
          <Badge variant={riskBadge[product.riskLevel]}>
            {needsReview ? <TriangleAlert size={14} /> : <ShieldCheck size={14} />}
            {product.status}
          </Badge>
          <span>
            <RadioTower size={14} />
            {product.sensorStatus}
          </span>
        </div>
      </div>
      <div className="product-asset-card__body">
        <div className="product-asset-card__heading">
          <div>
            <p>{product.category}</p>
            <h3>{product.name}</h3>
          </div>
          <strong>{product.traceabilityScore}</strong>
        </div>
        <p className="product-asset-card__summary">{product.summary}</p>
        <div className="product-asset-card__proof">
          <span>Stellar proof</span>
          <strong>{product.stellarStatus}</strong>
          <small>{product.verificationNote}</small>
        </div>
        <TraceChain compact events={product.events} />
        <div className="product-asset-card__meta">
          <div>
            <span>Origin</span>
            <strong>{product.origin}</strong>
          </div>
          <div>
            <span>Last verified</span>
            <strong>{product.lastVerifiedAt}</strong>
          </div>
          <div>
            <span>Contracts</span>
            <strong>{product.metrics.contracts}</strong>
          </div>
        </div>
        <div className="product-asset-card__actions">
          <ProductDrawer mode="edit" product={product} triggerLabel="Edit" />
          <Link className="icon-link" href={`/dashboard/products/${product.id}`}>
            <ExternalLink size={16} />
            Detail
          </Link>
          <span className="product-asset-card__editable">
            <Edit3 size={14} />
            Editable asset
          </span>
        </div>
      </div>
    </article>
  );
}
