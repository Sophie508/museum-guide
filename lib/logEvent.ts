import { getOrCreateSessionId } from "@/lib/session";

type LogEventOptions = {
  user?: {
    nickname?: string;
    age?: string;
    gender?: string;
    identity?: string;
  };
  data?: Record<string, any>;
};

export async function logEvent(type: string, options: LogEventOptions = {}) {
  try {
    const sessionId = getOrCreateSessionId();
    const route = typeof window !== "undefined" ? window.location.pathname : "server";
    const body = {
      type,
      sessionId,
      route,
      ...(options.user ? { user: options.user } : {}),
      ...(options.data ? { data: options.data } : {}),
    };
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    // non-blocking
    console.warn("logEvent failed", e);
  }
}


