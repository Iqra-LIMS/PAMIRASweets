"use client";

export default function PrintButton({ label = "Print" }) {
  return <button className="btn" onClick={() => window.print()}>{label}</button>;
}
