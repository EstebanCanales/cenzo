"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "@/lib/dashboard";

type ProductDrawerProps = {
  mode: "add" | "edit";
  product?: ProductCard;
  triggerLabel: string;
};

export function ProductDrawer({ mode, product, triggerLabel }: ProductDrawerProps) {
  const [open, setOpen] = useState(false);

  const title = mode === "add" ? "Agregar producto" : `Editar ${product?.name ?? "producto"}`;
  const description =
    mode === "add"
      ? "Prepara la ficha base del producto para empezar su trazabilidad."
      : "Actualiza la informacion visible del producto sin salir del dashboard.";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={mode === "add" ? "default" : "outline"}>{triggerLabel}</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <form className="product-form">
          <div className="product-form__field">
            <Label htmlFor={`${mode}-name`}>Nombre</Label>
            <Input defaultValue={product?.name} id={`${mode}-name`} placeholder="Cafe Tarrazu Lote 18" />
          </div>
          <div className="product-form__field">
            <Label htmlFor={`${mode}-category`}>Tipo o categoria</Label>
            <Input defaultValue={product?.category} id={`${mode}-category`} placeholder="Cafe regenerativo" />
          </div>
          <div className="product-form__field">
            <Label htmlFor={`${mode}-origin`}>Origen</Label>
            <Input defaultValue={product?.origin} id={`${mode}-origin`} placeholder="Tarrazu, Costa Rica" />
          </div>
          <div className="product-form__field">
            <Label htmlFor={`${mode}-status`}>Estado</Label>
            <Input defaultValue={product?.status} id={`${mode}-status`} placeholder="Verified" />
          </div>
          <div className="product-form__field">
            <Label htmlFor={`${mode}-image`}>Imagen local</Label>
            <Input defaultValue={product?.assetSrc} id={`${mode}-image`} placeholder="/agro-assets/coffee-lot.png" />
          </div>

          <div className="product-form__actions">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar mock</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
