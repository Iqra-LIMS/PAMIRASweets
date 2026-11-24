import { KINDS, FILLS, COATS, by } from "../lib/menu";

const PATHS = {
  moon: "M72 10A50 50 0 1 0 72 110A38 38 0 1 1 72 10Z",
  heart: "M60 104C8 68 12 22 42 22C52 22 58 28 60 36C62 28 68 22 78 22C108 22 112 68 60 104Z",
};

export default function DateArt({ shape = "classic", kind = "medjool", fill = "pistachio", coat = "dark", choc = false, size = 120 }) {
  const c = by(COATS, coat);
  const f = by(FILLS, fill);
  const body = c.color || by(KINDS, kind).color;
  const coated = !!c.color;
  const gold = "#C6A15B";
  const filling = (cx, cy, rx, ry, rot = 0) => (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={f.color} stroke="rgba(0,0,0,.18)" strokeWidth="1" />
      {fill === "mixed" && <ellipse cx={cx} cy={cy} rx={rx * 0.45} ry={ry * 0.8} fill="#D9B98A" />}
      <ellipse cx={cx - rx * 0.3} cy={cy - ry * 0.3} rx={rx * 0.3} ry={ry * 0.25} fill="#fff" opacity=".35" />
    </g>
  );
  let shapeEl, fillEl;
  if (shape === "moon") {
    const d = "M70.5 15.1A46 46 0 1 0 98.5 85.3A38 38 0 1 1 70.5 15.1Z";
    const cid = `moon-${coat}-${kind}-${fill}`;
    const drizzle = coat === "white" ? "#8B5A3C" : "#FFF6E6";
    shapeEl = (
      <g transform="rotate(-20 60 60)">
        <defs><clipPath id={cid}><path d={d} /></clipPath></defs>
        <path d={d} fill={body} stroke={body} strokeWidth="6" strokeLinejoin="round" />
        {coated ? (
          <g clipPath={`url(#${cid})`} stroke={drizzle} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity=".9">
            {Array.from({ length: 9 }, (_, k) => <path key={k} d={`M-4 ${k * 15 - 14}Q26 ${k * 15 + 6} 58 ${k * 15 + 44}`} />)}
          </g>
        ) : (
          <g fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1.5" strokeLinecap="round"><path d="M30 30Q24 44 27 58" /><path d="M26 74Q30 84 40 90" /></g>
        )}
        <g clipPath={`url(#${cid})`}><path d="M24 36Q17 56 24 78" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity=".3" /></g>
        {coated && [[22, 46], [31, 68], [41, 26], [38, 94]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.6" fill={gold} />)}
        {filling(33, 34, 5.5, 8, 0)}{filling(27, 57, 5.5, 8, 0)}{filling(35, 80, 5.5, 8, 0)}
      </g>
    );
    fillEl = null;
  }
  else if (shape === "heart") { shapeEl = <path d={PATHS.heart} fill={body} />; fillEl = filling(60, 56, 13, 9, 0); }
  else if (shape === "flower") {
    shapeEl = <g fill={body}>{[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={60 + 28 * Math.cos((a * Math.PI) / 180)} cy={60 + 28 * Math.sin((a * Math.PI) / 180)} r="19" />)}<circle cx="60" cy="60" r="22" /></g>;
    fillEl = filling(60, 60, 13, 13, 0);
  } else {
    shapeEl = <ellipse cx="60" cy="60" rx="26" ry="46" fill={body} transform="rotate(-25 60 60)" />;
    fillEl = filling(60, 56, 8, 17, -25);
  }
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`${shape} ${choc ? "chocolate" : kind + " date"}`} style={{ filter: "drop-shadow(0 6px 8px rgba(86,61,50,.25))" }}>
      {shapeEl}
      {!coated && !choc && shape !== "moon" && <g fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1.5" strokeLinecap="round"><path d="M44 40Q52 50 44 62" /><path d="M72 50Q66 62 74 74" /></g>}
      {coated && shape !== "moon" && <g fill={gold}><circle cx="46" cy="30" r="1.8" /><circle cx="78" cy="40" r="1.6" /><circle cx="70" cy="86" r="1.8" /><circle cx="40" cy="84" r="1.5" /></g>}
      {fillEl}
      {shape !== "moon" && <ellipse cx="42" cy="36" rx="10" ry="4" fill="#fff" opacity={coated ? 0.28 : 0.12} transform="rotate(-30 42 36)" />}
    </svg>
  );
}
