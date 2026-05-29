import { LabShell } from "@/components/dashboard/lab-shell";
import { ProductGrid } from "@/components/dashboard/product-grid";

export default function ProductsPage() {
  return (
    <LabShell
      description="Productos visibles como unidades vivas de trazabilidad, listos para editar y auditar."
      eyebrow="Products"
      heading="Product evidence grid"
      variant="products"
    >
      <ProductGrid />
    </LabShell>
  );
}
