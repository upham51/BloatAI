import { useEffect, useState } from "react";
import { MeshGradientBackground } from "@/components/ui/mesh-gradient-background";

type Props = {
  variant?: "warm" | "cool" | "balanced";
  /** Delay in ms before rendering the animated background (prevents cold-start jank). */
  delayMs?: number;
};

export function DeferredMeshGradientBackground({
  variant = "balanced",
  delayMs = 500,
}: Props) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const enable = () => {
      if (!cancelled) setEnabled(true);
    };

    // Prefer idle time; fall back to a short timeout.
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    const cic = (window as any).cancelIdleCallback as
      | ((id: number) => void)
      | undefined;

    if (ric) {
      const id = ric(enable, { timeout: delayMs });
      return () => {
        cancelled = true;
        cic?.(id);
      };
    }

    const t = window.setTimeout(enable, delayMs);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [delayMs]);

  if (!enabled) return null;
  return <MeshGradientBackground variant={variant} />;
}
