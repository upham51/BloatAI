const STORAGE_KEY = "bloat_ai_recovery_mode_until";
const SESSION_KEY = "bloat_ai_boot_timestamps";

const WINDOW_MS = 30_000;
const MAX_BOOTS_IN_WINDOW = 3;
const COOLDOWN_MS = 10 * 60_000;

export function initRecoveryMode(): boolean {
  if (typeof window === "undefined") return false;

  const now = Date.now();

  const prefersReducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  const untilRaw = Number(window.localStorage.getItem(STORAGE_KEY) ?? "0");
  const hasStoredRecovery = Number.isFinite(untilRaw) && untilRaw > now;

  // Crash-loop detection (only tracked once per boot)
  let boots: number[] = [];
  try {
    boots = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) ?? "[]");
    if (!Array.isArray(boots)) boots = [];
  } catch {
    boots = [];
  }

  boots = [...boots, now].filter((t) => now - t < WINDOW_MS);
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(boots));

  const crashLoop = boots.length >= MAX_BOOTS_IN_WINDOW;
  if (crashLoop) {
    window.localStorage.setItem(STORAGE_KEY, String(now + COOLDOWN_MS));
  }

  return prefersReducedMotion || hasStoredRecovery || crashLoop;
}

export function clearRecoveryMode() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}
