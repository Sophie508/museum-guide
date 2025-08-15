// Lightweight session id stored in localStorage on the client and appended by callers
export const SESSION_STORAGE_KEY = "wzmuseum_session_id";

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}


