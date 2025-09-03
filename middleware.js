// middleware.js at project root
import { NextResponse } from "next/server";

export function middleware(request) {
  const basicAuth = request.headers.get("authorization");
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASS;

  if (basicAuth) {
    const [user, pass] = Buffer.from(
      basicAuth.split(" ")[1],
      "base64"
    )
      .toString()
      .split(":");
    if (user === expectedUser && pass === expectedPass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": "Basic realm=\"Secure Area\"" },
  });
}

export const config = {
  matcher: ["/admin/:path*"], // apply only to /admin
};
