export const KINDS = [
  { id: "aseel", name: "Aseel", price: 110, color: "#7A4A2B" },
  { id: "kalmi", name: "Kalmi", price: 140, color: "#8A4B2A" },
  { id: "mabrool", name: "Mabrool", price: 150, color: "#6A3F28" },
  { id: "medjool", name: "Medjool", price: 220, color: "#5B3524" },
  { id: "ajwa", name: "Ajwa", price: 250, color: "#2E1B14" },
];
export const SHAPES = [
  { id: "classic", name: "Classic", extra: 0 },
  { id: "moon", name: "Moon", extra: 40 },
  { id: "flower", name: "Flower", extra: 40 },
  { id: "heart", name: "Heart", extra: 40 },
];
export const FILLS = [
  { id: "almond", name: "Almond", color: "#D9B98A" },
  { id: "pistachio", name: "Pistachio", color: "#A9C27A" },
  { id: "walnut", name: "Walnut", color: "#C9A27E" },
  { id: "cashew", name: "Cashew", color: "#EAD7B0" },
  { id: "hazelnut", name: "Hazelnut", color: "#B98B5A" },
  { id: "coconut", name: "Coconut", color: "#F3EAD8" },
  { id: "mixed", name: "Mixed dry fruit", color: "#A9C27A" },
];
export const COATS = [
  { id: "none", name: "No chocolate", extra: 0, color: null },
  { id: "milk", name: "Milk chocolate", extra: 35, color: "#8B5A3C" },
  { id: "dark", name: "Dark chocolate", extra: 35, color: "#3B2418" },
  { id: "white", name: "White chocolate", extra: 35, color: "#F3E6CF" },
];
export const by = (list, id) => list.find((x) => x.id === id);
// price of one piece
export const pieceCost = ({ kind, shape, coat, choc }) =>
  (choc ? 90 : by(KINDS, kind).price) + by(SHAPES, shape).extra + by(COATS, coat).extra;
export const describe = ({ kind, shape, fill, coat, choc }) =>
  [choc ? "Filled chocolate" : by(KINDS, kind).name + " date", by(SHAPES, shape).name + " shape", by(FILLS, fill).name + " filling", by(COATS, coat).name].join(", ");

export const HAMPERS = [
  { id: "gesture", name: "The Little Gesture", size: "Box of 12 treats", price: 3500, items: ["6 stuffed dates", "6 stuffed chocolates", "Free gift card"], img: "/images/box-gesture.jpg", pos: "40% 55%", alt: "Blush PAMIRA gift box with a window, holding six stuffed dates and chocolates in heart, moon and flower shapes" },
  { id: "welcome", name: "The Warm Welcome", size: "Signature hamper", price: 7500, items: ["12 stuffed dates", "8 stuffed chocolates", "Ribbon and keepsake box", "Free gift card"], img: "/images/box-warm.jpg", pos: "55% 50%", alt: "Wooden PAMIRA gift box with gold dividers, cream ribbon, stuffed dates and chocolates", featured: true },
  { id: "grand", name: "The Grand Occasion", size: "Celebration hamper", price: 15000, items: ["24 stuffed dates", "16 stuffed chocolates", "Custom monogram", "Free gift card"], img: "/images/box-grand.jpg", pos: "62% 60%", alt: "Mocha PAMIRA gift box with blush ribbon, split between stuffed dates and chocolates" },
];
export const READY = [
  { id: "r1", name: "Almond & Orange Classic", img: "/images/date-classic.jpg", cfg: { shape: "classic", fill: "almond", coat: "dark" } },
  { id: "r2", name: "Pistachio Heart", img: "/images/date-heart.jpg", cfg: { shape: "heart", fill: "pistachio", coat: "dark" } },
  { id: "r3", name: "Coconut Moon", img: "/images/date-moon.jpg", cfg: { shape: "moon", fill: "coconut", coat: "milk" } },
  { id: "r4", name: "Almond Blossom", img: "/images/date-flower.jpg", cfg: { shape: "flower", fill: "almond", coat: "dark" } },
];
export const SHAPE_PHOTOS = {
  classic: { img: "/images/date-classic.jpg", note: "Our classic: dark chocolate, almond, candied orange and pistachio" },
  heart: { img: "/images/date-heart.jpg", note: "Our heart: dark chocolate, white drizzle and pistachio" },
  flower: { img: "/images/date-flower.jpg", note: "Our flower: dark or milk chocolate with almond, coconut and candied orange" },
  moon: { img: "/images/date-moon.jpg", note: "Our moon: milk chocolate with coconut" },
};

// ---- multi-select helpers ----
const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;
export const names = (list, ids) => ids.map((i) => by(list, i).name).join(", ");
// toggle an id in a list; always keep at least one. "none" is exclusive: picking it clears the rest, un-picking it falls back.
export function toggle(list, id, none, fallback) {
  if (none && id === none) return list.includes(none) ? [fallback] : [none];
  if (none && list.includes(none)) return list;
  if (list.includes(id)) return list.length > 1 ? list.filter((x) => x !== id) : list;
  return [...list, id];
}
export const noNone = (coats) => { const f = coats.filter((c) => c !== "none"); return f.length ? f : ["dark"]; };
// average price of one piece across every selected combination
export const avgCost = ({ kinds, shapes, coats, choc }) =>
  avg(kinds.flatMap((k) => shapes.flatMap((s) => coats.map((c) => pieceCost({ kind: k, shape: s, coat: c, choc })))));
export const describeMulti = ({ kinds, shapes, fills, coats, choc }) =>
  [choc ? "Filled chocolates" : names(KINDS, kinds) + " dates", names(SHAPES, shapes) + " shape", names(FILLS, fills) + " filling", names(COATS, coats)].join("; ");
export { avg };
