import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Only guard the admin area
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const auth = req.headers.get("authorization");
  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      try {
        // atob is available in the Edge runtime
        const [user, pass] = atob(encoded).split(":");

        const expectedUser = process.env.BASIC_USER || "Dylan";
        const expectedPass = process.env.BASIC_PASS || "orange";

        if (user === expectedUser && pass === expectedPass) {
          return NextResponse.next();
        }
      } catch (e) {
        // fallthrough to challenge
      }
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area", charset="UTF-8"',
    },
  });
}

export const config = {
  // Include both /admin and all nested paths
  matcher: ["/admin", "/admin/:path*"],
};
