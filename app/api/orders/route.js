import { NextResponse } from "next/server";
import { validateOrder } from "../../../lib/validate";
import { saveOrder } from "../../../lib/orders";
import { notify } from "../../../lib/notify";

const hits = new Map(); // simple per-IP rate limit (resets on restart)

export async function POST(req) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60000);
  if (recent.length >= 5) return NextResponse.json({ error: "Too many orders. Please wait a minute." }, { status: 429 });
  hits.set(ip, [...recent, now]);

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const v = validateOrder(body);
  if (v.honeypot) return NextResponse.json({ ok: true, id: "PAM-0000", total: 0 });
  if (!v.ok) return NextResponse.json({ errors: v.errors }, { status: 422 });
  try {
    const order = await saveOrder(v.data);
    await notify(order).catch((e) => console.error("Email failed:", e.message));
    return NextResponse.json({ ok: true, id: order.id, total: order.total, delivery: order.delivery, eta: order.eta });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not save the order" }, { status: 500 });
  }
}
