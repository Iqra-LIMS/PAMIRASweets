# PAMIRA website (Next.js 14, App Router)

    npm install
    cp .env.example .env.local     # then edit it
    npm run dev                    # http://localhost:3000
    npm run build && npm start     # production

## Orders (backend)
- Checkout form (name, mobile, email, city, address) posts to `app/api/orders/route.js`, which validates and saves the order. Payment is cash on delivery.
- Orders are stored in `data/orders.json` (`lib/orders.js`). This needs a host with a persistent disk (a VPS, Railway or Render with a disk). On Vercel and similar serverless hosts, replace `lib/orders.js` with a database such as Supabase or Neon; nothing else needs to change.
- View and update orders at `/admin` (username: anything, password: `ADMIN_PASSWORD` in `.env.local`). Without a password set, `/admin` stays locked.
- Optional emails (to you and the customer): fill in the SMTP lines in `.env.local`. For Gmail use an App Password.
- Prices are calculated on the server (`lib/pricing.js`). The browser only sends what was chosen, never a price, so totals cannot be tampered with.
- Delivery fees by city, the "other city" fee and the free-delivery limit: `lib/delivery.js`.

## Content
- Prices, date kinds, shapes, fillings, coatings, hampers: `lib/menu.js` (box fee and box sizes: `lib/pricing.js`)
- WhatsApp number: `WHATSAPP` in `components/CartDrawer.js`
- Photos: `public/images`

## Hosting on Render (recommended for this version)
1. Put the project on GitHub, then in Render create a **Web Service** from the repo. Build command: `npm install && npm run build`. Start command: `npm start`. Use a paid instance (Starter), because free instances cannot keep files.
2. Add a **Disk** (1 GB is plenty) mounted at `/data`.
3. Add environment variables: `ORDERS_DIR=/data/orders`, `ADMIN_PASSWORD=...` and, for order emails, the `SMTP_*` and `OWNER_EMAIL` lines from `.env.example`.
4. Connect your domain in the service settings. Download `orders.json` from the disk now and then as a backup (the order emails are a second copy).

Delivery times (1 to 2 days for Rawalpindi and Islamabad, 5 to 6 days elsewhere) are set in `lib/delivery.js`.
"# PAMIRASweets" 
