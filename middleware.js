import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Role-based directory protections
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/select", req.url))
    }
    if (path.startsWith("/business") && token?.role !== "BUSINESS") {
      return NextResponse.redirect(new URL("/auth/select", req.url))
    }
    if (path.startsWith("/user") && token?.role !== "INVESTOR") {
      return NextResponse.redirect(new URL("/auth/select", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/business/:path*",
    "/user/:path*",
  ],
}
