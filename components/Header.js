"use client";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";

export default function Header() {
  const { count, setOpen } = useCart();
  const path = usePathname();
  if (path && path.startsWith("/admin")) return null;
  return (
    <header className="nav">
      <a href="#top" className="brand"><img src="/logo.png" alt="PAMIRA" /></a>
      <nav aria-label="Main">
        <a href="#dates">Stuffed dates</a>
        <a href="#builder">Customise</a>
        <a href="#boxes">Gift boxes</a>
        <a href="#contact">Contact</a>
        <button className="pill" onClick={() => setOpen(true)}>Cart ({count})</button>
      </nav>
    </header>
  );
}
