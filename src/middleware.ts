import { NextRequest, NextResponse } from "next/server";

const canonicalHost = "bosichlegal.cl";
const vercelHost = "bosichlegal.vercel.app";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];

  if (host === vercelHost) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.hostname = canonicalHost;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
