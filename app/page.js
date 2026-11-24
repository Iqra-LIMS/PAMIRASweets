import { ReadyDates, Builder, Boxes } from "../components/Shop";

export default function Home() {
  return (
    <>
      <main id="top">
        <section className="hero">
          <div className="hero-text">
            <p className="kicker">Stuffed dates, made to be given</p>
            <h1>A little luxury in every gift.</h1>
            <p className="lede">Choose your dates, your shape, your filling and your chocolate. We make it by hand and send it with a free gift card.</p>
            <div className="actions">
              <a href="#builder" className="btn">Design your dates</a>
              <a href="#dates" className="btn ghost">See ready-made dates</a>
            </div>
          </div>
          <div className="collage">
            <img className="ph ph-main" src="/images/hero-main.jpg" alt="Mocha PAMIRA gift box with blush ribbon, split between stuffed dates and chocolates" />
            <img className="ph ph-a" src="/images/hero-a.jpg" alt="Wooden PAMIRA gift box of stuffed dates and chocolates with a cream ribbon" />
            <img className="ph ph-b" src="/images/hero-b.jpg" alt="Blush PAMIRA gift box holding six moon, flower and heart chocolates" />
          </div>
        </section>

        <section className="perks">
          <span>Aseel, Kalmi, Mabrool, Medjool, Ajwa</span>
          <span>Milk, dark or white chocolate</span>
          <span>Moon, flower and heart shapes</span>
          <span>Free gift card with every order</span>
        </section>

        <section id="dates" className="section">
          <div className="section-head"><h2>Ready-made stuffed dates</h2><p>Our favourite combinations in a box of 6. Pick the date kind you like and add it to your cart.</p></div>
          <ReadyDates />
        </section>

        <section id="builder" className="section soft">
          <div className="section-head"><h2>Customise your dates or chocolates</h2><p>Pick a shape, a dry fruit filling and a coating, and watch the piece change. Prices update as you go.</p></div>
          <Builder />
        </section>

        <section id="boxes" className="section hampers">
          <div className="section-head center"><h2>Gift boxes</h2><p>Choose one of our curated hampers, or build your own box of dates, chocolates or both. A handwritten card is always free.</p></div>
          <Boxes />
        </section>
      </main>
      <footer className="footer" id="contact">
        <div><span className="logo">PAMIRA</span><p>A Little Luxury in Every Gift.</p></div>
        <div className="contact"><a href="mailto:pamira@gmail.com">pamira@gmail.com</a><a href="https://wa.me/923421513871">WhatsApp: 0342 1513871</a></div>
        <p className="copy">© 2026 PAMIRA. Made with care in Pakistan.</p>
      </footer>
    </>
  );
}
