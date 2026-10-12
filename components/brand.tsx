import { House } from "lucide-react";
export function Brand() {
  return (
    <span className="brand-lockup">
      <House
        className="brand-emblem"
        aria-hidden="true"
        size={28}
        strokeWidth={2.5}
      />
      <span className="brand-lettering">casa practica</span>
    </span>
  );
}
