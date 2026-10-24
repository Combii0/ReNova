"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { getIdToken, type User } from "@/lib/auth";

export default function RateOrder({
  user,
  orderId,
  given,
  onRated,
}: {
  user: User;
  orderId: string;
  given?: number;
  onRated: (stars: number) => void;
}) {
  const [selected, setSelected] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  if (given) {
    return (
      <p className="text-xs font-black text-amber-700">Tu calificación: ★ {given}</p>
    );
  }

  async function send() {
    if (!selected || sending) return;
    setSending(true);
    setError("");

    const token = await getIdToken(user);
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderId, stars: selected }),
    });
    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar la calificación");
      return;
    }
    onRated(selected);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSelected(n)}
              aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
              className="p-0.5 text-amber-600"
            >
              <Star size={20} fill={n <= selected ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={send}
          disabled={!selected || sending}
          className="rounded-full bg-[var(--app-text)] px-4 py-2 text-xs font-black text-[var(--app-bg)] disabled:opacity-50"
        >
          {sending ? "Enviando..." : "Calificar"}
        </button>
      </div>
      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}