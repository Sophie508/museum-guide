export type AdminEvent = {
  id: string;
  timestamp: number;
  type: string;
  sessionId?: string;
  route?: string;
  user?: {
    nickname?: string;
    age?: string;
    gender?: string;
    identity?: string;
  };
  data?: Record<string, any>;
};

// In-memory event store. In production, replace with a database.
const events: AdminEvent[] = [];

export function addEvent(event: Omit<AdminEvent, "id" | "timestamp">): AdminEvent {
  const full: AdminEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    timestamp: Date.now(),
    ...event,
  };
  events.push(full);
  if (events.length > 5000) {
    events.splice(0, events.length - 5000);
  }
  return full;
}

export function getEvents(): AdminEvent[] {
  return [...events].sort((a, b) => a.timestamp - b.timestamp);
}

export function clearEvents() {
  events.length = 0;
}


