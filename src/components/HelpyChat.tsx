"use client";

import{FormEvent, useEffect, useState} from "react";
import{Send} from "lucide-react";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "¡Hola! Soy Helpy, tu asistente de ReNova.",
  },
];

export default function HelpyChat() {
  const[messages, setMessages] = useState<Message[]>(initialMessages);
  const[input, setInput] = useState("");
  const[previousInteractionId, setPreviousInteractionId] = useState<
    string | null
  >(null);
  const[isLoading, setIsLoading] = useState(false);

  useEffect(()=>{
    const saved = localStorage.getItem('renova-helpy-messages');
    if(saved){
      setMessages(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('renova-helpy-messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem('renova-helpy-interaction-id');
    if (saved) {
      setPreviousInteractionId(saved);
    }
  }, []);
  useEffect(() => {
    if (previousInteractionId) {
      localStorage.setItem('renova-helpy-interaction-id', previousInteractionId);
    }
  }, [previousInteractionId])


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
    setInput('');
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
    <section className='flex h-full w-full flex-col bg-[var(--app-surface)]'>
      <div className='flex h-full min-h-0 flex-col'>
        <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-[var(--app-soft)] p-4'>
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
              ...
            </div>
          ) : null}
        </div>

        <form
          className='flex gap-4 border-t border-[var(--app-border)] bg-[var(--app-surface)] p-4'
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
    </section>
  );
}

