import { Activity, RadioTower, ShieldCheck, TriangleAlert } from "lucide-react";

import { ProductDrawer } from "@/components/dashboard/product-drawer";
import { ProductAssetCard } from "@/components/dashboard/product-asset-card";
import { products } from "@/lib/dashboard";

export function ProductGrid() {
  const verifiedCount = products.filter((product) => product.status === "Verified").length;
  const reviewCount = products.filter((product) => product.status === "Needs review").length;
  const liveSensors = products.filter((product) => product.sensorStatus === "Live").length;

  return (
    <section className="products-section">
      <div className="products-board">
        <div className="products-hero">
          <div>
            <p className="section-kicker">Products</p>
            <h2>Inventario vivo de lotes, sensores y evidencia Stellar.</h2>
            <p>
              Cada card resume origen, riesgo, ultima prueba y cadena de manipulacion sin convertir la pantalla en una
              tabla.
            </p>
          </div>
          <div className="products-hero__stats">
            <span>
              <ShieldCheck size={16} />
              <strong>{verifiedCount}</strong>
              verified
            </span>
            <span>
              <TriangleAlert size={16} />
              <strong>{reviewCount}</strong>
              review
            </span>
            <span>
              <RadioTower size={16} />
              <strong>{liveSensors}</strong>
              live sensors
            </span>
          </div>
          <div className="products-hero__action">
            <Activity size={16} />
            <span>Operational trace board</span>
            <ProductDrawer mode="add" triggerLabel="Agregar producto" />
          </div>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <ProductAssetCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
