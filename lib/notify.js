// Optional email notifications. Active only when SMTP_HOST is set (see .env.example).
const money = (n) => "Rs. " + n.toLocaleString("en-US");

export function orderText(o) {
  const c = o.customer;
  const lines = o.items.map((x, i) => `${i + 1}. ${x.name} x${x.qty} - ${money(x.unit * x.qty)}\n   ${x.detail}`).join("\n");
  return `Order ${o.id}\n\nCustomer: ${c.name}\nPhone: ${c.phone}\nEmail: ${c.email}\nAddress: ${c.address}, ${c.city}\n${c.notes ? "Notes: " + c.notes + "\n" : ""}\n${lines}\n\nSubtotal: ${money(o.subtotal)}\nDelivery: ${o.delivery ? money(o.delivery) : "free"}\nTotal to collect: ${money(o.total)}\n${o.eta ? `Estimated delivery: ${o.eta.range} (${o.eta.days})\n` : ""}Payment: Cash on delivery\nGift card message: ${o.card || "(none)"}`;
}

export async function notify(o) {
  if (!process.env.SMTP_HOST) return;
  const nodemailer = (await import("nodemailer")).default;
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === "465",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  await Promise.all([
    t.sendMail({ from, to: process.env.OWNER_EMAIL || "pamira@gmail.com", replyTo: o.customer.email, subject: `New order ${o.id} (${money(o.total)}, cash on delivery)`, text: orderText(o) }),
    t.sendMail({ from, to: o.customer.email, subject: `PAMIRA: we received your order ${o.id}`, text: `Hello ${o.customer.name},\n\nThank you for choosing PAMIRA. We will call or message you on ${o.customer.phone} to confirm your order and delivery time.\n\n${orderText(o)}\n\nA little luxury in every gift.\nPAMIRA` }),
  ]);
}
