import { useRef } from "react";
import type { PointerEvent } from "react";

export function useTilt<T extends HTMLElement>(max = 12) {
  const ref = useRef<T>(null);

  const onPointerMove = (event: PointerEvent<T>) => {
    if (event.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * max * 1.2).toFixed(2)}deg`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return { ref, onPointerMove, onPointerLeave: reset, onPointerUp: reset, onPointerCancel: reset };
}
