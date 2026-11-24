import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { listOrders, setStatus, STATUSES } from "../../lib/orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "PAMIRA orders", robots: "noindex" };

const money = (n) => "Rs. " + n.toLocaleString("en-US");
const TZ = "Asia/Karachi";
const when = (iso) => new Date(iso).toLocaleString("en-GB", { timeZone: TZ, day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
const day = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });

const TABS = [
  { id: "new", label: "New", status: "new" },
  { id: "confirmed", label: "Confirmed", status: "confirmed" },
  { id: "out", label: "Out for delivery", status: "out for delivery" },
  { id: "delivered", label: "Delivered", status: "delivered" },
  { id: "cancelled", label: "Cancelled", status: "cancelled" },
  { id: "all", label: "All" },
];
const slug = (s) => s.replace(/ /g, "-");
const NEXT = {
  new: { to: "confirmed", label: "Confirm order" },
  confirmed: { to: "out for delivery", label: "Send out for delivery" },
  "out for delivery": { to: "delivered", label: "Mark as delivered" },
};
const EMPTY = {
  new: "No new orders right now.", confirmed: "No confirmed orders waiting.", out: "Nothing is out for delivery.",
  delivered: "No delivered orders yet.", cancelled: "No cancelled orders.", all: "No orders yet.",
};

function message(o) {
  const first = o.customer.name.split(" ")[0];
  const m = {
    new: `Hello ${first}, thank you for your PAMIRA order ${o.id}. Please confirm your delivery address and a good time: ${o.customer.address}, ${o.customer.city}.`,
    confirmed: `Hello ${first}, your PAMIRA order ${o.id} is confirmed.${o.eta ? ` Estimated delivery: ${o.eta.range}.` : ""} Please keep ${money(o.total)} ready (cash on delivery).`,
    "out for delivery": `Hello ${first}, your PAMIRA order ${o.id} is out for delivery. Please keep ${money(o.total)} ready.`,
    delivered: `Hello ${first}, thank you for choosing PAMIRA. We hope you enjoy your order ${o.id}!`,
    cancelled: `Hello ${first}, your PAMIRA order ${o.id} has been cancelled. Message us any time if you would like to order again.`,
  };
  return `https://wa.me/92${o.customer.phone.slice(1)}?text=${encodeURIComponent(m[o.status] || m.new)}`;
}

async function move(formData) {
  "use server";
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const tab = String(formData.get("tab") || "new");
  const q = String(formData.get("q") || "");
  await setStatus(id, status);
  revalidatePath("/admin");
  redirect(`/admin?tab=${encodeURIComponent(tab)}${q ? `&q=${encodeURIComponent(q)}` : ""}&msg=${encodeURIComponent(`${id} is now ${status}`)}`);
}

function Move({ o, to, label, cls = "btn", tab, q }) {
  return (
    <form action={move}>
      <input type="hidden" name="id" value={o.id} />
      <input type="hidden" name="status" value={to} />
      <input type="hidden" name="tab" value={tab} />
      <input type="hidden" name="q" value={q} />
      <button className={cls}>{label}</button>
    </form>
  );
}

export default async function Admin({ searchParams }) {
  const q = String(searchParams?.q || "").trim();
  const all = await listOrders();
  const tab = q ? "all" : TABS.some((t) => t.id === searchParams?.tab) ? searchParams.tab : "new";
  const cur = TABS.find((t) => t.id === tab);
  let list = cur.status ? all.filter((o) => o.status === cur.status) : all;
  if (q) {
    const n = q.toLowerCase(), d = n.replace(/\D/g, "");
    list = list.filter((o) => [o.id, o.customer.name, o.customer.email, o.customer.city, o.customer.address].some((x) => String(x).toLowerCase().includes(n)) || (d.length >= 3 && o.customer.phone.includes(d)));
  }
  const count = (s) => all.filter((o) => o.status === s).length;
  const open = all.filter((o) => ["new", "confirmed", "out for delivery"].includes(o.status));
  const today = all.filter((o) => day(o.createdAt) === day(new Date())).length;
  const msg = searchParams?.msg ? String(searchParams.msg) : "";

  return (
    <main className="ad">
      <header className="ad-bar">
        <h1>PAMIRA orders</h1>
        <Link href="/" className="link">View shop</Link>
      </header>

      <section className="ad-stats">
        <div><b>{count("new")}</b><span>New, need action</span></div>
        <div><b>{open.length}</b><span>Open orders</span></div>
        <div><b>{money(open.reduce((s, o) => s + o.total, 0))}</b><span>Cash to collect</span></div>
        <div><b>{today}</b><span>Orders today</span></div>
      </section>

      <form className="ad-search" method="get">
        <input name="q" defaultValue={q} placeholder="Search by name, phone, order number, city..." aria-label="Search orders" />
        <button className="btn">Search</button>
        {q && <Link href="/admin" className="link">Clear</Link>}
      </form>

      <nav className="ad-tabs" aria-label="Order status">
        {TABS.map((t) => (
          <Link key={t.id} href={`/admin?tab=${t.id}`} className={`ad-tab ${tab === t.id ? "on" : ""} ${t.id === "new" && count("new") ? "hot" : ""}`}>
            {t.label} <span>{t.status ? count(t.status) : all.length}</span>
          </Link>
        ))}
      </nav>

      {msg && <p className="ad-msg" role="status">{msg}</p>}
      {q && <p className="small">{list.length} result{list.length === 1 ? "" : "s"} for “{q}”</p>}
      {list.length === 0 && <p className="ad-empty">{q ? "No orders match your search." : EMPTY[tab]}</p>}

      {(tab === "confirmed" || tab === "out") && !q && list.length > 0 && (
        <p className="ad-batch"><Link className="btn" href={`/admin/slips?status=${encodeURIComponent(cur.status)}`} target="_blank">Print all {list.length} slip{list.length === 1 ? "" : "s"}</Link> <span className="small">One page per rider run, oldest orders first.</span></p>
      )}

      {list.map((o) => {
        const next = NEXT[o.status];
        return (
          <article key={o.id} className={`ad-card st-${slug(o.status)}`}>
            <div className="ad-top">
              <h2>{o.id}</h2>
              <span className={`st st-${slug(o.status)}`}>{o.status}</span>
              <time>{when(o.createdAt)}</time>
            </div>
            <div className="ad-grid">
              <div>
                <p className="ad-name">{o.customer.name}</p>
                <p><a href={`tel:${o.customer.phone}`}>{o.customer.phone}</a> · <a href={`mailto:${o.customer.email}`}>{o.customer.email}</a></p>
                <p className="ad-addr">{o.customer.address}, {o.customer.city}</p>
                {o.customer.notes && <p className="ad-note">Note: {o.customer.notes}</p>}
              </div>
              <div>
                <ul className="ad-items">{o.items.map((x, i) => <li key={i}><b>{x.name}</b> × {x.qty}<small>{x.detail}</small></li>)}</ul>
                {o.card && <p className="ad-gift">Gift card: “{o.card}”</p>}
              </div>
              <div className="ad-side">
                <p className="ad-total">{money(o.total)}</p>
                <p className="small">Cash on delivery<br />{money(o.subtotal ?? o.total)} + {money(o.delivery ?? 0)} delivery</p>
                {o.eta && <p className="small">Deliver {o.eta.range}</p>}
              </div>
            </div>
            <div className="ad-actions">
              {next && <Move o={o} to={next.to} label={next.label} tab={tab} q={q} />}
              <a className="btn ghost" href={message(o)} target="_blank" rel="noreferrer">Message on WhatsApp</a>
              <a className="btn ghost" href={`tel:${o.customer.phone}`}>Call</a>
              <Link className="btn ghost" href={`/admin/slips?id=${o.id}`} target="_blank">Print slip</Link>
              {(o.status === "delivered" || o.status === "cancelled") && <Move o={o} to="new" label="Reopen" cls="btn ghost" tab={tab} q={q} />}
              {next && (
                <details className="ad-cancel">
                  <summary>Cancel</summary>
                  <p>Cancel order {o.id}?</p>
                  <Move o={o} to="cancelled" label="Yes, cancel this order" cls="btn danger" tab={tab} q={q} />
                </details>
              )}
            </div>
          </article>
        );
      })}
    </main>
  );
}
