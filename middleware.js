import { NextResponse } from "next/server";

export const config = { matcher: ["/admin/:path*"] };

export function middleware(req) {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return new NextResponse("Set ADMIN_PASSWORD in .env.local to enable the admin page.", { status: 503 });
  const [scheme, enc] = (req.headers.get("authorization") || "").split(" ");
  if (scheme === "Basic" && enc) {
    try { const p = atob(enc).split(/:(.*)/s)[1]; if (p === pass) return NextResponse.next(); } catch {}
  }
  return new NextResponse("Authentication required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="PAMIRA admin"' } });
}
