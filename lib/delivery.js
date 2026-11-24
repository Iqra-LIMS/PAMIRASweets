// Delivery fees by city (placeholders: set your real fees here).
export const ZONES = [
  { city: "Rawalpindi", fee: 200, days: [1, 2] },
  { city: "Islamabad", fee: 200, days: [1, 2] },
  { city: "Lahore", fee: 350, days: [5, 6] },
  { city: "Karachi", fee: 450, days: [5, 6] },
  { city: "Peshawar", fee: 350, days: [5, 6] },
  { city: "Faisalabad", fee: 350, days: [5, 6] },
  { city: "Multan", fee: 400, days: [5, 6] },
];
export const OTHER_DAYS = [5, 6]; // delivery time for any other city
export const OTHER_FEE = 500; // any city not listed above
export const FREE_OVER = 10000; // free delivery at or above this subtotal. Set to Infinity to turn off.

export const cityFee = (city) => {
  const z = ZONES.find((x) => x.city.toLowerCase() === String(city || "").trim().toLowerCase());
  return z ? z.fee : OTHER_FEE;
};
export const deliveryFee = (city, subtotal) => (subtotal >= FREE_OVER ? 0 : cityFee(city));

// Estimated delivery window, counted in calendar days from today (Pakistan time).
const fmt = (d) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Karachi" });
export const daysFor = (city) => {
  const z = ZONES.find((x) => x.city.toLowerCase() === String(city || "").trim().toLowerCase());
  return z ? z.days : OTHER_DAYS;
};
export const etaFor = (city, from = new Date()) => {
  const [a, b] = daysFor(city);
  const at = (n) => new Date(from.getTime() + n * 86400000);
  return { days: `${a} to ${b} days`, range: `${fmt(at(a))} to ${fmt(at(b))}` };
};
