"use client";
import type { eventNames } from "./growth";
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
    }),
    keepalive: true,
  }).catch(() => {});
}
