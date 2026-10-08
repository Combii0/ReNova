"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Product } from "@/types/products";
import { useCart } from "@/lib/useCart";

type Detail = {
  specifications?: string;
  sellerName?: string | null;
  createdAt?: string;
};

const formatPrice = (price: string) =>
  "$" + Number(price.replace(/\D/g, "")).toLocaleString("es-CO");

export default function ProductDetailModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    fetch(`/api/products/${product.id}`)
      .then((res) => (res.ok ? res.json() : {}))
      .then(setDetail)
      .catch(() => setDetail({}));
  }, [product.id]);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/35 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.5rem] bg-[var(--app-surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${product.tone}`}
        >
          {product.image?.startsWith("http") ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-7xl" aria-hidden>
              {product.image}
            </span>
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-950 shadow-sm"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-black text-[var(--brand)]">
              {product.tag}
            </span>
            <h2 className="mt-3 text-2xl font-black text-[var(--app-text)]">
              {product.name}
            </h2>
            <p className="mt-1 text-lg font-black text-[var(--app-text)]">
              {product.donation ? "Donación" : formatPrice(product.price)}
            </p>
            {product.expirationDate && (
              <p className="mt-1 text-xs font-semibold text-[var(--app-muted)]">
                Vence: {product.expirationDate.split("-").reverse().join("/")}
              </p>
            )}
          </div>

          {detail === null ? (
            <p className="text-sm font-bold text-[var(--app-muted)]">
              Cargando detalles...
            </p>
          ) : (
            <>
              <div className="rounded-2xl bg-[var(--app-soft)] p-4 text-sm font-bold text-[var(--app-text)]">
                <p>Publicado por: {detail.sellerName ?? product.store ?? "Vendedor"}</p>
                {product.store && <p className="mt-1">Tienda: {product.store}</p>}
                {detail.createdAt && (
                  <p className="mt-1">
                    Fecha: {new Date(detail.createdAt).toLocaleDateString("es-CO")}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
                  Descripción
                </p>
                <p className="mt-1 text-sm font-bold leading-6 text-[var(--app-muted)]">
                  {detail.specifications || "El vendedor no agregó descripción."}
                </p>
              </div>
            </>
          )}

          <button
            onClick={() => product.id && addToCart(product.id)}
            disabled={!product.id || isInCart(product.id)}
            className="h-11 w-full rounded-full bg-[var(--app-text)] text-sm font-black text-[var(--app-bg)] disabled:opacity-50"
          >
            {product.id && isInCart(product.id) ? "En el carrito" : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}