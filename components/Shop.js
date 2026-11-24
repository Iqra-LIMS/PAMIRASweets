"use client";
import { useState } from "react";
import DateArt from "./DateArt";
import Picker, { MultiPicker } from "./Picker";
import { useCart, money } from "./CartProvider";
import { KINDS, SHAPES, FILLS, COATS, HAMPERS, READY, SHAPE_PHOTOS, by, pieceCost, describe, describeMulti, avgCost, toggle, noNone, names } from "../lib/menu";
import { priceItem } from "../lib/pricing";

const SIZES = [6, 12, 24];

function Ready({ r }) {
  const { add } = useCart();
  const [kind, setKind] = useState("medjool");
  const cfg = { ...r.cfg, kind, choc: false };
  const spec = { type: "ready", id: r.id, kind };
  const p = priceItem(spec);
  return (
    <article className="card">
      <div className={`art ${r.img ? "photo" : ""}`}>{r.img ? <img src={r.img} alt={`${r.name}, ${describe(cfg)}`} loading="lazy" /> : <DateArt {...cfg} size={150} />}</div>
      <h3>{r.name}</h3>
      <p className="small">{describe(cfg)}</p>
      <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Date kind">
        {KINDS.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
      </select>
      <p className="price">{money(p.unit)} <span>box of 6</span></p>
      <button className="btn" onClick={() => add({ key: `${r.id}-${kind}`, spec, ...p, qty: 1, art: cfg, img: r.img })}>Add to cart</button>
    </article>
  );
}

export function ReadyDates() {
  return <div className="grid4">{READY.map((r) => <Ready key={r.id} r={r} />)}</div>;
}

export function Builder() {
  const { add } = useCart();
  const [choc, setChoc] = useState(false);
  const [shapes, setShapes] = useState(["heart"]);
  const [kinds, setKinds] = useState(["medjool"]);
  const [fills, setFills] = useState(["pistachio"]);
  const [coats, setCoats] = useState(["dark"]);
  const [pieces, setPieces] = useState(12);
  const noChoc = !choc && coats.includes("none");
  const sel = { kinds, shapes, fills, coats, choc };
  const spec = { type: "custom", ...sel, pieces };
  const p = priceItem(spec);
  const unit = p.unit;
  const n = Math.min(6, Math.max(choc ? 1 : kinds.length, shapes.length, fills.length, coats.length));
  const arts = Array.from({ length: n }, (_, i) => ({ shape: shapes[i % shapes.length], kind: kinds[i % kinds.length], fill: fills[i % fills.length], coat: coats[i % coats.length], choc }));
  const multi = n > 1 || (!choc && kinds.length > 1);
  const photos = choc ? [] : shapes.filter((x) => SHAPE_PHOTOS[x]);
  return (
    <div className="builder">
      <div className="preview">
        <div className="stage">{arts.map((a, i) => <DateArt key={i} {...a} size={n === 1 ? 220 : n <= 3 ? 110 : 86} />)}</div>
        <p className="small">{describeMulti(sel)}</p>
        <p className="price big">{money(unit)} <span>{pieces} pieces{multi ? ", assorted evenly" : ""}</span></p>
        {photos.length > 0 && (
          <div className="shots">
            {photos.map((x) => <figure className="shot" key={x}><img src={SHAPE_PHOTOS[x].img} alt={SHAPE_PHOTOS[x].note} loading="lazy" /><figcaption>{SHAPE_PHOTOS[x].note}</figcaption></figure>)}
            <p className="small">Photos show our signature pieces. The drawing above shows your own choices.</p>
          </div>
        )}
        <button className="btn" onClick={() => add({ key: `c-${JSON.stringify(spec)}`, spec, ...p, qty: 1, art: arts[0] })}>Add to cart</button>
      </div>
      <div className="controls">
        <Picker label="Make it" options={[{ id: "date", name: "Stuffed date" }, { id: "choc", name: "Chocolate only" }]} value={choc ? "choc" : "date"} onChange={(v) => { setChoc(v === "choc"); if (v === "choc") setCoats(noNone); }} />
        <MultiPicker label="Shape" options={SHAPES} values={shapes} onToggle={(id) => setShapes((p) => toggle(p, id))} />
        {!choc && <MultiPicker label="Date kind" options={KINDS} values={kinds} onToggle={(id) => setKinds((p) => toggle(p, id))} />}
        <MultiPicker label="Dry fruit filling" options={FILLS} values={fills} onToggle={(id) => setFills((p) => toggle(p, id))} />
        <MultiPicker label="Chocolate coating" options={choc ? COATS.slice(1) : COATS} values={coats} onToggle={(id) => setCoats((p) => toggle(p, id, "none", "dark"))} isDisabled={(id) => noChoc && id !== "none"} />
        {noChoc && <p className="small">Chocolate options are switched off while "No chocolate" is selected. Tap it again to choose a chocolate.</p>}
        <Picker label="Pieces" options={SIZES.map((x) => ({ id: x, name: `${x} pieces` }))} value={pieces} onChange={setPieces} />
      </div>
    </div>
  );
}

export function Boxes() {
  const { add } = useCart();
  const [size, setSize] = useState(12);
  const [mix, setMix] = useState("mix");
  const [kinds, setKinds] = useState(["medjool"]);
  const [coats, setCoats] = useState(["milk"]);
  const [dShapes, setDShapes] = useState(["classic"]);
  const [cShapes, setCShapes] = useState(["heart"]);
  const coatsEff = mix === "dates" ? coats : noNone(coats);
  const noChoc = mix === "dates" && coats.includes("none");
  const cc = noNone(coats);
  const dn = Math.min(3, Math.max(kinds.length, dShapes.length, coatsEff.length));
  const cn = Math.min(3, Math.max(cShapes.length, cc.length));
  const dateArts = Array.from({ length: dn }, (_, i) => ({ shape: dShapes[i % dShapes.length], kind: kinds[i % kinds.length], fill: "pistachio", coat: coatsEff[i % coatsEff.length], choc: false }));
  const chocArts = Array.from({ length: cn }, (_, i) => ({ shape: cShapes[i % cShapes.length], kind: "medjool", fill: "almond", coat: cc[i % cc.length], choc: true }));
  const spec = { type: "box", size, mix, kinds, dShapes, cShapes, coats };
  const p = priceItem(spec);
  const unit = p.unit;
  const label = { dates: "Stuffed dates only", choc: "Chocolates only", mix: "Dates and chocolates" }[mix];
  return (
    <>
      <div className="tiers">
        {HAMPERS.map((h) => (
          <article key={h.id} className={`tier ${h.featured ? "featured" : ""}`}>
            {h.featured && <span className="badge">Most gifted</span>}
            <img className="tier-img" src={h.img} alt={h.alt} style={{ objectPosition: h.pos }} loading="lazy" />
            <h3>{h.name}</h3>
            <p className="size">{h.size}</p>
            <p className="tier-price">{money(h.price)}</p>
            <ul>{h.items.map((i) => <li key={i}>{i}</li>)}</ul>
            <button className={h.featured ? "btn gold" : "btn ghost"} onClick={() => { const spec = { type: "hamper", id: h.id }; add({ key: h.id, spec, ...priceItem(spec), qty: 1 }); }}>Add to cart</button>
          </article>
        ))}
      </div>
      <div className="builder boxbuilder">
        <div className="preview">
          <h3>Build your own box</h3>
          <div className="mini big">
            {mix !== "choc" && dateArts.map((a, i) => <DateArt key={"d" + i} {...a} size={70} />)}
            {mix !== "dates" && chocArts.map((a, i) => <DateArt key={"c" + i} {...a} size={70} />)}
          </div>
          <p className="small">{size} pieces, {label}, ribbon and free gift card</p>
          <p className="price big">{money(unit)} <span>includes box</span></p>
          <button className="btn" onClick={() => add({ key: `box-${JSON.stringify(spec)}`, spec, ...p, qty: 1 })}>Add box to cart</button>
        </div>
        <div className="controls">
          <Picker label="Box size" options={[12, 24, 36].map((n) => ({ id: n, name: `${n} pieces` }))} value={size} onChange={setSize} />
          <Picker label="Inside" options={[{ id: "dates", name: "Dates only" }, { id: "choc", name: "Chocolates only" }, { id: "mix", name: "Dates and chocolates" }]} value={mix} onChange={(v) => { setMix(v); if (v !== "dates") setCoats(noNone); }} />
          {mix !== "choc" && <MultiPicker label="Date shapes" options={SHAPES} values={dShapes} onToggle={(id) => setDShapes((p) => toggle(p, id))} />}
          {mix !== "choc" && <MultiPicker label="Date kind" options={KINDS} values={kinds} onToggle={(id) => setKinds((p) => toggle(p, id))} />}
          {mix !== "dates" && <MultiPicker label="Chocolate shapes" options={SHAPES} values={cShapes} onToggle={(id) => setCShapes((p) => toggle(p, id))} />}
          <MultiPicker label="Chocolate coating" options={mix === "dates" ? COATS : COATS.slice(1)} values={coatsEff} onToggle={(id) => setCoats((p) => toggle(p, id, "none", "dark"))} isDisabled={(id) => noChoc && id !== "none"} />
        </div>
      </div>
    </>
  );
}
