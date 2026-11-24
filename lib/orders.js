// File-based order storage. Works on a server with a persistent disk (VPS, Railway/Render disk, local).
// On serverless hosts such as Vercel the disk is read-only: replace this file with a database (e.g. Supabase, Neon).
import { promises as fs } from "fs";
import path from "path";

const DIR = process.env.ORDERS_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DIR, "orders.json");
export const STATUSES = ["new", "confirmed", "out for delivery", "delivered", "cancelled"];

async function readAll() {
  try { return JSON.parse(await fs.readFile(FILE, "utf8")); } catch { return []; }
}
async function writeAll(all) {
  await fs.mkdir(DIR, { recursive: true });
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(all, null, 2));
  await fs.rename(tmp, FILE);
}
export async function saveOrder(order) {
  const all = await readAll();
  const rec = { id: "PAM-" + (1001 + all.length), createdAt: new Date().toISOString(), status: "new", ...order };
  all.push(rec);
  await writeAll(all);
  return rec;
}
export async function listOrders() { return (await readAll()).reverse(); }
export async function setStatus(id, status) {
  if (!STATUSES.includes(status)) return;
  const all = await readAll();
  const o = all.find((x) => x.id === id);
  if (o) { o.status = status; await writeAll(all); }
}
