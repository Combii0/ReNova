"use client";

import { X } from "lucide-react";
import { useFirestoreProducts } from "@/lib/useFirestoreProducts";
import { useCart } from "@/lib/useCart";

export default function CartPage() {
  const { products, loading } = useFirestoreProducts();
  const { ids, removeFromCart } = useCart();

  const orderItems = products.filter((p) => p.id && ids.includes(p.id));
  const subtotal = orderItems.reduce(
    (sum, p) => sum + Number(p.price.replace(/\D/g, "")),
    0,
  );
  const shipping = 4900;
  const formatPrice = (n: number) => "$" + n.toLocaleString("es-CO");

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4">
        <p className="text-sm font-bold text-[var(--app-muted)]">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-6 sm:px-6">
      <div className="rounded-[1.5rem] bg-[var(--app-surface)] p-4 shadow-sm ring-1 ring-[var(--app-border)] sm:p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-black text-[var(--app-text)]">Mi pedido</h1>
          <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-black text-[var(--brand)]">
            {orderItems.length} items
          </span>
        </div>

        {orderItems.length === 0 && (
          <p className="mt-5 text-sm font-bold text-[var(--app-muted)]">
            Tu carrito está vacío. Agrega productos desde el market.
          </p>
        )}

        <div className="mt-5 space-y-4">
          {orderItems.map((product) => (
            <div key={product.id} className="flex items-center gap-3">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${product.tone} text-2xl`}
              >
                {product.image?.startsWith("http") ? (
                  <img src={product.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  product.image
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-[var(--app-text)]">{product.name}</p>
                <p className="text-xs font-semibold text-[var(--app-muted)]">{product.price}</p>
              </div>
              <span className="text-sm font-black text-[var(--app-muted)]">x1</span>
              <button
                onClick={() => removeFromCart(product.id!)}
                className="rounded-full p-1 text-[var(--app-muted)] hover:bg-[var(--app-soft)]"
                aria-label={`Quitar ${product.name} del carrito`}
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t border-[var(--app-border)] pt-5 text-sm font-bold">
          <div className="flex justify-between text-[var(--app-muted)]">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[var(--app-muted)]">
            <span>Envio</span>
            <span>{formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between text-lg font-black text-[var(--app-text)]">
            <span>Total</span>
            <span>{formatPrice(subtotal + shipping)}</span>
          </div>
        </div>

        <button className="mt-6 h-12 w-full rounded-full bg-[var(--app-text)] text-sm font-black text-[var(--app-bg)] shadow-sm transition hover:opacity-90">
          Continuar compra
        </button>
      </div>
    </main>
  );
}