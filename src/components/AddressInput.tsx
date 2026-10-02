"use client";

import { useEffect, useState } from "react";

type Suggestion = { placeId: string; text: string };

export default function AddressInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string, verified: boolean) => void;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || value.trim().length < 4) return;
    let cancelled = false;

    const timer = setTimeout(async () => {
      const res = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(value)}`);
      if (res.ok && !cancelled) setSuggestions(await res.json());
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, open]);

  const shown = open && value.trim().length >= 4 ? suggestions : [];

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value, false);
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full rounded-xl border-[var(--app-border)] bg-transparent px-4 py-3 text-sm font-bold outline-none ring-1 focus:ring-[var(--brand)] placeholder:text-[var(--app-muted)]"
        placeholder="Cra 76 #32-18, Bogotá"
      />
      {shown.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl bg-[var(--app-surface)] shadow-xl ring-1 ring-[var(--app-border)]">
          {shown.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                onClick={() => {
                  onChange(s.text, true);
                  setOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm font-bold text-[var(--app-text)] hover:bg-[var(--app-soft)]"
              >
                {s.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}