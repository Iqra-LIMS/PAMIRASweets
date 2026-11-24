"use client";
import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);
export const money = (n) => "Rs. " + n.toLocaleString("en-US");

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [card, setCard] = useState("");
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("pamira-cart") || "null");
      if (s) { setItems((s.items || []).filter((x) => x.spec)); setCard(s.card || ""); }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem("pamira-cart", JSON.stringify({ items, card })); } catch {}
  }, [items, card, ready]);

  const add = (item) => {
    setItems((p) => {
      const i = p.findIndex((x) => x.key === item.key);
      return i > -1 ? p.map((x, j) => (j === i ? { ...x, qty: x.qty + item.qty } : x)) : [...p, item];
    });
    setOpen(true);
  };
  const setQty = (key, qty) => setItems((p) => (qty < 1 ? p.filter((x) => x.key !== key) : p.map((x) => (x.key === key ? { ...x, qty } : x))));
  const total = items.reduce((s, x) => s + x.unit * x.qty, 0);
  const count = items.reduce((s, x) => s + x.qty, 0);

  return <Ctx.Provider value={{ items, add, setQty, total, count, card, setCard, open, setOpen, clear: () => setItems([]) }}>{children}</Ctx.Provider>;
}
