import { ExternalLink, MoreVertical, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/dashboard";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
  return (
    <div className="space-y-8 py-6">
      <div className="flex items-center justify-between px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#071311]">Products</h1>
          <p className="mt-1 text-sm text-[#63716f]">
            Manage your agricultural inventory and Stellar verification status.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-[#117343] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0">
          <Plus size={18} />
          New Product
        </button>
      </div>

      <div className="px-6">
        <div className="overflow-hidden rounded-[32px] border border-[#182524]/10 bg-white shadow-xl shadow-[#182524]/5">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#182524]/5 bg-[#f5f8f1]/50 text-[11px] font-extrabold uppercase tracking-wider text-[#63716f]">
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Origin</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182524]/5">
              {products.map((product) => (
                <tr key={product.id} className="group transition-colors hover:bg-[#fdfefc]">
                  <td className="px-6 py-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-[#182524]/10">
                      <Image
                        alt={product.name}
                        fill
                        className="object-cover"
                        src={product.assetSrc}
                        sizes="48px"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#071311]">{product.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#63716f]">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#63716f]">
                    {product.origin}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={product.riskLevel === 'high' ? 'gold' : 'green'}>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#182524]/10 bg-[#f5f8f1] font-extrabold text-[#117343]">
                      {product.traceabilityScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/dashboard/products/${product.id}`}
                        className="p-2 text-[#63716f] transition-colors hover:text-[#117343]"
                      >
                        <ExternalLink size={18} />
                      </Link>
                      <button className="p-2 text-[#63716f] transition-colors hover:text-[#071311]">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
