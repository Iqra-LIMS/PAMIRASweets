"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCart, money } from "./CartProvider";
import DateArt from "./DateArt";
import { ZONES, FREE_OVER, deliveryFee, etaFor } from "../lib/delivery";

const WHATSAPP = "923421513871"; // 0342 1513871 in international format
const empty = { name: "", phone: "", email: "", city: "", cityOther: "", address: "", notes: "", website: "" };

export default function CartDrawer() {
  const { items, setQty, total, card, setCard, open, setOpen, clear } = useCart();
  const [step, setStep] = useState("cart"); // cart | details | done
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(null);
  const path = usePathname();
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const cityStr = f.city === "Other" ? f.cityOther.trim() : f.city;
  const fee = f.city ? deliveryFee(cityStr, total) : null;
  const grand = total + (fee || 0);
  const eta = f.city && (f.city !== "Other" || cityStr) ? etaFor(cityStr) : null;

  const text = (id) => {
    const lines = items.map((x, i) => `${i + 1}. ${x.name} x${x.qty} (${money(x.unit * x.qty)})\n   ${x.detail}`).join("\n");
    return `Hello PAMIRA, ${id ? `my order ${id}` : "I would like to order"}:\n\n${lines}\n\nDelivery: ${fee === null ? "to be confirmed" : fee ? money(fee) : "free"}\n${eta ? `Estimated delivery: ${eta.range}\n` : ""}Total: ${money(grand)} (cash on delivery)\nName: ${f.name}\nPhone: ${f.phone}\nAddress: ${f.address}, ${cityStr}\nGift card message: ${card || "(none)"}`;
  };
  const wa = (id) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text(id))}`;
  const close = () => { setOpen(false); if (step === "done") { setStep("cart"); setDone(null); } };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({}); setFailed(false);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: { ...f, city: cityStr }, card, items: items.map(({ spec, qty }) => ({ spec, qty })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setDone({ id: data.id, eta: data.eta, total: data.total, name: f.name, link: wa(data.id) }); clear(); setCard(""); setStep("done"); }
      else if (res.status === 422 && data.errors) setErrors(data.errors);
      else setFailed(true);
    } catch { setFailed(true); }
    setBusy(false);
  };

  const field = (k, label, props = {}) => (
    <label className={`field ${props.wide ? "wide" : ""}`}>
      {label}
      {props.area ? <textarea rows="2" value={f[k]} onChange={set(k)} {...props.attrs} /> : <input value={f[k]} onChange={set(k)} {...props.attrs} />}
      {errors[k] && <span className="err" role="alert">{errors[k]}</span>}
    </label>
  );

  if (path && path.startsWith("/admin")) return null;
  return (
    <>
      {open && <div className="scrim" onClick={close} />}
      <aside className={`drawer ${open ? "open" : ""}`} aria-hidden={!open} aria-label="Cart">
        <div className="drawer-head">
          <h2>{step === "details" ? "Delivery details" : step === "done" ? "Thank you" : "Your cart"}</h2>
          <button className="x" onClick={close} aria-label="Close cart">×</button>
        </div>

        {step === "done" && done && (
          <div className="drawer-body done">
            <p className="big-id">{done.id}</p>
            <p>Thank you, {done.name}. We have your order of <b>{money(done.total)}</b>, to be paid in cash when it arrives.</p>
            {done.eta && <p>Estimated delivery: <b>{done.eta.range}</b> ({done.eta.days}).</p>}
            <p>We will call or message you to confirm the delivery time. A confirmation email is on its way if you gave a valid address.</p>
            <a className="btn gold" href={done.link} target="_blank" rel="noreferrer">Send these details on WhatsApp too</a>
            <button className="link" onClick={() => { setStep("cart"); setDone(null); setOpen(false); }}>Continue shopping</button>
          </div>
        )}

        {step === "cart" && (
          <>
            <div className="drawer-body">
              {items.length === 0 && <p>Your cart is empty. Add some stuffed dates to begin.</p>}
              {items.map((x) => (
                <div className="line" key={x.key}>
                  <div className="thumb">{x.img ? <img src={x.img} alt="" /> : x.art ? <DateArt {...x.art} size={56} /> : <span>🎁</span>}</div>
                  <div className="info">
                    <strong>{x.name}</strong>
                    <span className="small">{x.detail}</span>
                    <div className="qty">
                      <button onClick={() => setQty(x.key, x.qty - 1)} aria-label="Decrease">−</button>
                      <span>{x.qty}</span>
                      <button onClick={() => setQty(x.key, x.qty + 1)} aria-label="Increase">+</button>
                      <b>{money(x.unit * x.qty)}</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <div className="drawer-foot">
                <label className="freecard">Free gift card, your message
                  <textarea rows="2" maxLength="300" value={card} onChange={(e) => setCard(e.target.value)} placeholder="With love, from..." />
                </label>
                <p className="total"><span>Total</span><b>{money(total)}</b></p>
                <button className="btn gold" onClick={() => setStep("details")}>Checkout</button>
                <button className="link" onClick={clear}>Clear cart</button>
              </div>
            )}
          </>
        )}

        {step === "details" && (
          <form className="drawer-body checkout" onSubmit={submit} noValidate>
            <button type="button" className="link back" onClick={() => setStep("cart")}>← Back to cart</button>
            <div className="fields">
              {field("name", "Full name", { attrs: { autoComplete: "name", required: true } })}
              {field("phone", "Mobile number", { attrs: { autoComplete: "tel", inputMode: "tel", placeholder: "0342 1513871", required: true } })}
              {field("email", "Email", { wide: true, attrs: { type: "email", autoComplete: "email", required: true } })}
              <label className="field">City
                <select value={f.city} onChange={set("city")}>
                  <option value="">Select your city</option>
                  {ZONES.map((z) => <option key={z.city}>{z.city}</option>)}
                  <option>Other</option>
                </select>
                {errors.city && <span className="err" role="alert">{errors.city}</span>}
              </label>
              {f.city === "Other" && field("cityOther", "Your city", { attrs: { placeholder: "City name" } })}
              {field("address", "Full delivery address", { wide: true, area: true, attrs: { autoComplete: "street-address", required: true, placeholder: "House, street, area" } })}
              {field("notes", "Delivery notes (optional)", { wide: true, attrs: { placeholder: "Landmark, preferred time..." } })}
              <input className="hp" tabIndex="-1" autoComplete="off" aria-hidden="true" value={f.website} onChange={set("website")} name="website" />
            </div>
            {errors.items && <p className="err" role="alert">{errors.items}</p>}
            <div className="cod">
              <span className="dot" aria-hidden="true" />
              <div><b>Cash on delivery</b><br /><span className="small">Pay in cash when your order arrives.</span></div>
            </div>
            <div className="sums">
              <p><span>Subtotal</span><span>{money(total)}</span></p>
              <p><span>Delivery{f.city ? ` to ${cityStr || "your city"}` : ""}</span><span>{fee === null ? "Choose a city" : fee === 0 ? "Free" : money(fee)}</span></p>
              <p className="total"><span>Total to pay on delivery</span><b>{money(grand)}</b></p>
              {eta && <p className="eta">Estimated delivery: <b>{eta.range}</b> ({eta.days}), once we confirm your order.</p>}
              {Number.isFinite(FREE_OVER) && <p className="small">Free delivery on orders of {money(FREE_OVER)} or more.</p>}
            </div>
            {failed && (
              <div className="fail" role="alert">
                We could not place the order online. Please send it to us on WhatsApp instead.
                <a className="btn ghost" href={wa()} target="_blank" rel="noreferrer">Send order on WhatsApp</a>
              </div>
            )}
            <button className="btn gold" type="submit" disabled={busy}>{busy ? "Placing order..." : "Place order, pay on delivery"}</button>
          </form>
        )}
      </aside>
    </>
  );
}
