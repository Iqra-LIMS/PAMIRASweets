import Link from "next/link";
import { listOrders } from "../../../lib/orders";
import PrintButton from "../../../components/PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Delivery slips", robots: "noindex" };

const money = (n) => "Rs. " + n.toLocaleString("en-US");
const when = (iso) => new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Karachi", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
const phone = (p) => p.replace(/^(\d{4})(\d+)$/, "$1 $2");

export default async function Slips({ searchParams }) {
  const all = await listOrders(); // newest first
  const id = searchParams?.id ? String(searchParams.id) : "";
  const status = searchParams?.status ? String(searchParams.status) : "";
  const list = id ? all.filter((o) => o.id === id) : status ? all.filter((o) => o.status === status).reverse() : []; // batches print oldest first

  return (
    <main className="slips">
      <div className="slips-bar no-print">
        <Link href="/admin" className="link">← Back to orders</Link>
        <span>{list.length} slip{list.length === 1 ? "" : "s"}</span>
        {list.length > 0 && <PrintButton label="Print slips" />}
      </div>
      {list.length === 0 && <p className="ad-empty">No orders found to print.</p>}

      {list.map((o) => (
        <section className="slip" key={o.id}>
          <div className="slip-head">
            <img src="/logo.png" alt="PAMIRA" />
            <div className="meta"><b>Delivery slip {o.id}</b><span>Ordered {when(o.createdAt)}</span></div>
            <div className="slip-cod">COLLECT CASH<b>{money(o.total)}</b></div>
          </div>

          <div className="slip-to">
            <h3>Deliver to</h3>
            <p className="big">{o.customer.name}</p>
            <p className="big">{phone(o.customer.phone)}</p>
            <p className="addr">{o.customer.address}</p>
            <p className="addr"><b>{o.customer.city}</b></p>
            {o.customer.notes && <p className="addr"><b>Note:</b> {o.customer.notes}</p>}
          </div>

          <div>
            <h3>Order</h3>
            <ul className="slip-items">
              {o.items.map((x, i) => <li key={i}><b>{x.qty} × {x.name}</b><small>{x.detail}</small></li>)}
            </ul>
            <p className="slip-sum">Items {money(o.subtotal ?? o.total)} + delivery {money(o.delivery ?? 0)} = <b>{money(o.total)}</b></p>
          </div>

          <div className="slip-gift">
            <h3>Gift card message</h3>
            <p>{o.card ? `“${o.card}”` : "No message. Include a blank card."}</p>
          </div>

          <div className="slip-foot">
            <span>Deliver {o.eta ? o.eta.range : "as agreed"}</span>
            <span>Cash received ☐</span>
            <span>Signature: ____________________</span>
          </div>
        </section>
      ))}
    </main>
  );
}
