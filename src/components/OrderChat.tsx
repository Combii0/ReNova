"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useUser, getIdToken } from "@/lib/auth";

type Message = {
  id: string;
  text: string;
  mine: boolean;
  createdAt: string;
};

const POLL_MS = 5000;

export default function OrderChat({
  orderId,
  title,
  onClose,
  onCancel,
}: {
  orderId: string;
  title: string;
  onClose: () => void;
  onCancel: () => Promise<boolean>;
}) {
  const user = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // polling: se limpia al cerrar el chat o al cambiar de pedido
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      try {
        const token = await getIdToken(user);
        const res = await fetch(`/api/orders/${orderId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setError(data.error ?? "No se pudieron cargar los mensajes");
          return;
        }
        setError("");
        setMessages(data);
      } catch {
        if (!cancelled) setError("No se pudieron cargar los mensajes");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const timer = setInterval(load, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [user, orderId]);

  // baja al último mensaje cuando llega uno nuevo
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setError("");
    try {
      const token = await getIdToken(user);
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo enviar el mensaje");

      // si el polling ya trajo este mensaje no se agrega otra vez
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
      setInput("");
    } catch (err: unknown) {
      setError((err as Error).message || "No se pudo enviar el mensaje");
    } finally {
      setSending(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm("¿Cancelar esta solicitud? El producto volverá a estar disponible.")) return;
    const ok = await onCancel();
    if (!ok) setError("No se pudo cancelar la solicitud");
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/35 p-4">
      <div className="flex h-[80vh] max-h-[640px] w-full max-w-md flex-col overflow-hidden rounded-[1.5rem] bg-[var(--app-surface)] shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--app-border)] p-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">Chat</p>
            <h2 className="truncate text-lg font-black text-[var(--app-text)]">{title}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleCancel}
              className="rounded-full bg-red-500/10 px-3 py-2 text-xs font-black text-red-600"
            >
              Cancelar
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-[var(--app-soft)]"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div
          ref={listRef}
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-[var(--app-soft)] p-4"
        >
          {loading && <p className="text-sm font-bold text-[var(--app-muted)]">Cargando...</p>}
          {!loading && messages.length === 0 && (
            <p className="text-sm font-bold text-[var(--app-muted)]">
              Aún no hay mensajes. Escribe el primero.
            </p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm font-bold leading-6 shadow-sm ${
                message.mine
                  ? "ml-auto bg-[var(--brand)] text-white"
                  : "bg-[var(--app-surface)] text-[var(--app-text)]"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
              <p className="mt-1 text-right text-[10px] font-semibold opacity-70">
                {new Date(message.createdAt).toLocaleTimeString("es-CO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>

        {error && <p className="px-4 pt-3 text-sm font-semibold text-red-500">{error}</p>}

        <form
          className="flex gap-2 border-t border-[var(--app-border)] p-3"
          onSubmit={handleSubmit}
        >
          <input
            className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
            placeholder="Escribe un mensaje"
            maxLength={500}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="h-11 rounded-full bg-[var(--brand)] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}