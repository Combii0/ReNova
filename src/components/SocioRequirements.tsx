import { Check, Circle } from "lucide-react";

export type Requirements = { age: boolean; phone: boolean; address: boolean };

const items: [keyof Requirements, string][] = [
  ["age", "Fecha de nacimiento (16 años o más)"],
  ["phone", "Celular"],
  ["address", "Dirección"],
];

export default function SocioRequirements({ requirements }: { requirements: Requirements }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map(([key, text]) => (
        <li key={key} className="flex items-center gap-2 text-sm font-bold text-[var(--app-text)]">
          {requirements[key] ? (
            <Check size={18} className="text-[var(--brand)]" />
          ) : (
            <Circle size={18} className="text-[var(--app-muted)]" />
          )}
          {text}
          {!requirements[key] && (
            <span className="text-xs text-[var(--app-muted)]">(falta)</span>
          )}
        </li>
      ))}
    </ul>
  );
}