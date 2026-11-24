// Single source of truth for prices. The browser uses it to show prices;
// the server uses it again to re-calculate every order, so the browser's numbers are never trusted.
import { KINDS, SHAPES, FILLS, COATS, HAMPERS, READY, by, pieceCost, describe, describeMulti, avgCost, noNone, names } from "./menu";

export const PIECES = [6, 12, 24];
export const BOX_SIZES = [12, 24, 36];
export const BOX_FEE = 600;
const MIX = { dates: "Stuffed dates only", choc: "Chocolates only", mix: "Dates and chocolates" };

const valid = (list, arr) => Array.isArray(arr) && arr.length > 0 && arr.length <= list.length && new Set(arr).size === arr.length && arr.every((x) => list.some((l) => l.id === x));
const coatsValid = (arr) => valid(COATS, arr) && (!arr.includes("none") || arr.length === 1);

// spec describes what was chosen; returns { name, detail, unit } or null when the spec is invalid
export function priceItem(s) {
  if (!s || typeof s !== "object") return null;

  if (s.type === "ready") {
    const r = READY.find((x) => x.id === s.id);
    if (!r || !by(KINDS, s.kind)) return null;
    const cfg = { ...r.cfg, kind: s.kind, choc: false };
    return { name: `${r.name} (box of 6)`, detail: describe(cfg), unit: 6 * pieceCost(cfg) };
  }

  if (s.type === "hamper") {
    const h = HAMPERS.find((x) => x.id === s.id);
    return h ? { name: h.name, detail: h.items.join(", "), unit: h.price } : null;
  }

  if (s.type === "custom") {
    const { kinds, shapes, fills, coats, choc, pieces } = s;
    if (typeof choc !== "boolean" || !valid(KINDS, kinds) || !valid(SHAPES, shapes) || !valid(FILLS, fills) || !coatsValid(coats) || !PIECES.includes(pieces)) return null;
    if (choc && coats.includes("none")) return null;
    const sel = { kinds, shapes, fills, coats, choc };
    const n = Math.min(6, Math.max(choc ? 1 : kinds.length, shapes.length, fills.length, coats.length));
    const multi = n > 1 || (!choc && kinds.length > 1);
    return { name: `Custom ${choc ? "chocolates" : "stuffed dates"} (${pieces} pcs)`, detail: describeMulti(sel) + (multi ? ". Assorted evenly" : ""), unit: Math.round(pieces * avgCost(sel)) };
  }

  if (s.type === "box") {
    const { size, mix, kinds, dShapes, cShapes, coats } = s;
    if (!BOX_SIZES.includes(size) || !MIX[mix] || !valid(KINDS, kinds) || !valid(SHAPES, dShapes) || !valid(SHAPES, cShapes) || !coatsValid(coats)) return null;
    const coatsEff = mix === "dates" ? coats : noNone(coats);
    const dA = avgCost({ kinds, shapes: dShapes, coats: coatsEff, choc: false });
    const cA = avgCost({ kinds: ["x"], shapes: cShapes, coats: noNone(coats), choc: true });
    const per = mix === "dates" ? dA : mix === "choc" ? cA : (dA + cA) / 2;
    const shapeText = [mix !== "choc" && `date shapes: ${names(SHAPES, dShapes)}`, mix !== "dates" && `chocolate shapes: ${names(SHAPES, cShapes)}`].filter(Boolean).join("; ");
    return { name: `Custom box of ${size}`, detail: `${MIX[mix]}${mix !== "choc" ? ", " + names(KINDS, kinds) + " dates" : ""}, ${shapeText}, ${names(COATS, coatsEff)}`, unit: Math.round(size * per) + BOX_FEE };
  }
  return null;
}
