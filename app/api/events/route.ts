import { NextResponse } from "next/server";
import { addEvent, getEvents, clearEvents } from "@/lib/eventStore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const saved = addEvent(json);
    return NextResponse.json(saved);
  } catch (e) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function GET() {
  const events = getEvents();
  return NextResponse.json({ events });
}

export async function DELETE() {
  clearEvents();
  return NextResponse.json({ ok: true });
}


