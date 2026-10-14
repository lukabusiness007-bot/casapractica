"use client";
import type { eventNames } from "./growth";
import {
  attributionSchema,
  classifyAttribution,
  type Attribution,
} from "./attribution";
let initialAttribution: Attribution | undefined;
export function rememberLanding() {
  initialAttribution ??= classifyAttribution(
    window.location.href,
    document.referrer,
  );
}
export function clearAttribution() {
  initialAttribution = undefined;
  try {
    sessionStorage.removeItem("casa-attribution");
  } catch {}
}
export function analyticsSession() {
  try {
    if (localStorage.getItem("casa-analytics") !== "yes") return undefined;
    let id = sessionStorage.getItem("casa-session");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("casa-session", id);
    }
    return id;
  } catch {
    return undefined;
  }
}
export function analyticsAttribution() {
  try {
    if (localStorage.getItem("casa-analytics") !== "yes") return undefined;
    const stored = sessionStorage.getItem("casa-attribution");
    if (stored) {
      try {
        const parsed = attributionSchema.safeParse(JSON.parse(stored));
        if (parsed.success) return parsed.data;
      } catch {}
    }
    rememberLanding();
    sessionStorage.setItem(
      "casa-attribution",
      JSON.stringify(initialAttribution),
    );
    return initialAttribution;
  } catch {
    return undefined;
  }
}
export function track(
  event_name: (typeof eventNames)[number],
  context: string,
) {
  const session_id = analyticsSession();
  if (!session_id) return;
  void fetch("/api/dogadjaji", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_id: crypto.randomUUID(),
      session_id,
      event_name,
      context,
      attribution: analyticsAttribution(),
    }),
    keepalive: true,
  }).catch(() => {});
}
