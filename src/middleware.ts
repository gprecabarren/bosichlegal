import { NextRequest, NextResponse } from "next/server";

const canonicalHost = "www.bosichlegal.cl";
const vercelHosts = new Set(["bosichlegal.vercel.app", "bosichlegal-two.vercel.app"]);

function withSecurityHeaders(response: NextResponse, pathname: string) {
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (pathname.startsWith("/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  }
  return response;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];
  const pathname = request.nextUrl.pathname;

  // Keep the Vercel deployment URLs out of search results and on the canonical domain.
  if (host && vercelHosts.has(host)) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.hostname = canonicalHost;
    url.port = "";
    return withSecurityHeaders(NextResponse.redirect(url, 308), pathname);
  }

  return withSecurityHeaders(NextResponse.next(), pathname);
}

export const config = {
  matcher: "/:path*",
};
