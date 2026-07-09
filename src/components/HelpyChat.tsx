"use client";

import { FormEvent, useState } from "react";
import { Bot, PackagePlus, Send, Sparkles } from "lucide-react";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const prompts = [
  "Quiero comprar comida para una reunion",
  "Necesito vender un producto usado",
  "Busco la opcion mas barata y rapida",
  "Recomiendame productos saludables",
];

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Puedo ayudarte a elegir productos por presupuesto, tiempo de entrega, calidad o necesidad. Tambien puedo guiarte para vender algo en ReNova.",
  },
];

export default function HelpyChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [previousInteractionId, setPreviousInteractionId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(rawMessage: string) {
    const message = rawMessage.trim();

    if (!message || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: message,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/helpy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          previousInteractionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo contactar a Helpy.");
      }

      if (data.id) {
        setPreviousInteractionId(data.id);
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: data.text,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "No se pudo contactar a Helpy.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)]">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-white">
            <Bot size={24} />
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[var(--brand)]">
              Helpy
            </p>
            <h1 className="text-3xl font-black text-[var(--app-text)]">
              Asistente IA
            </h1>
          </div>
        </div>

        <div className="mt-6 flex min-h-[420px] flex-col gap-3 rounded-3xl bg-[var(--app-soft)] p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[86%] rounded-3xl p-4 text-sm font-bold leading-6 shadow-sm ${
                message.role === "user"
                  ? "ml-auto bg-[var(--brand)] text-white"
                  : "bg-[var(--app-surface)] text-[var(--app-text)]"
              }`}
            >
              {message.text}
            </div>
          ))}

          {isLoading ? (
            <div className="max-w-[220px] rounded-3xl bg-[var(--app-surface)] p-4 text-sm font-black text-[var(--app-muted)] shadow-sm">
              Helpy esta pensando...
            </div>
          ) : null}
        </div>

        <form
          className="mt-4 flex gap-3 rounded-full bg-[var(--app-soft)] p-2"
          onSubmit={handleSubmit}
        >
          <input
            className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
            placeholder="Escribe lo que necesitas"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isLoading}
          />
          <button
            className="flex h-11 items-center gap-2 rounded-full bg-[var(--brand)] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isLoading || !input.trim()}
          >
            <Send size={17} />
            Enviar
          </button>
        </form>
      </div>

      <aside className="space-y-4">
        <div className="rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)]">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-[var(--brand)]" />
            <h2 className="text-lg font-black text-[var(--app-text)]">
              Compras
            </h2>
          </div>
          <div className="mt-4 space-y-2">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                className="w-full rounded-2xl bg-[var(--app-soft)] px-4 py-3 text-left text-sm font-black text-[var(--app-text)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
                onClick={() => void sendMessage(prompt)}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-[var(--app-surface)] p-5 shadow-sm ring-1 ring-[var(--app-border)]">
          <div className="flex items-center gap-3">
            <PackagePlus size={20} className="text-[var(--brand)]" />
            <h2 className="text-lg font-black text-[var(--app-text)]">
              Ventas
            </h2>
          </div>
          <button
            className="mt-4 h-12 w-full rounded-full bg-[var(--app-text)] text-sm font-black text-[var(--app-bg)]"
            type="button"
            onClick={() =>
              void sendMessage(
                "Quiero vender un producto en ReNova. Guiame paso a paso.",
              )
            }
          >
            Subir producto
          </button>
        </div>
      </aside>
    </section>
  );
}

