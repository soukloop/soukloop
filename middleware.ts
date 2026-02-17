import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import {
  checkLoginRateLimit,
  checkRegisterRateLimit,
  checkPasswordResetRateLimit,
  checkApiRateLimit
} from "./middleware/rate-limit"
import { NextResponse, NextRequest } from "next/server"
import { Role } from "@prisma/client"
import { hasRole } from "./lib/roles"

// Initialize NextAuth with Edge-safe config
const { auth } = NextAuth(authConfig)

// ===== PUBLIC ROUTES =====
const PUBLIC_PAGES = [
  '/',
  '/',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/about-us',
  '/contactus',
  '/howtousepoints',
  '/pricing', '/privacypolicy',
  '/terms',
  '/terms&conditions',
  '/refundsandreturns',
  '/FAQs',
  '/help',
  '/products',
  '/productdetails',
  '/sellerprofile',
  '/auth/error',
];

const PUBLIC_API_PREFIXES = [
  '/api/auth',
  '/api/products',
  '/api/categories',
  '/api/locations',
  '/api/uploadthing',
  '/api/brands',
  '/api/reviews',
  '/api/analytics',
  '/api/testimonials',
  '/api/centrifugo',
];

// ===== ROLE-BASED ROUTE PROTECTION =====
// Define the MINIMUM role required for each prefix
const PROTECTED_ROUTES = [
  { prefix: '/admin', minRole: Role.SUPPORT },
  { prefix: '/api/admin', minRole: Role.SUPPORT },
  { prefix: '/seller', minRole: Role.SELLER },
  { prefix: '/api/vendor', minRole: Role.SELLER },
  { prefix: '/api/seller', minRole: Role.SELLER },
];

export default auth(async (req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Add current URL to headers for server components
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-url', pathname);

  // DEBUG: Start
  if (pathname.startsWith('/admin')) {
    console.log(`[Middleware] Checking path: ${pathname}`);
    console.log(`[Middleware] isLoggedIn: ${isLoggedIn}`);
    console.log(`[Middleware] User Role: ${userRole}`);
    console.log(`[Middleware] Auth Object present: ${!!req.auth}`);
  }
  // DEBUG: End

  // 1. Skip static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|webp)$/)
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 2. Strict Rate Limiting (Security)
  if (req.method === "POST") {
    // Login Rate Limit
    if (pathname.includes("/api/auth/callback/credentials")) {
      const res = await checkLoginRateLimit(req);
      if (res) return res;
    }
    // Register Rate Limit
    if (pathname.includes("/api/auth/register") || pathname.includes("/register")) { // Cover potential paths
      const res = await checkRegisterRateLimit(req);
      if (res) return res;
    }
    // Password Reset Rate Limit
    if (pathname.includes("/api/auth/forgot-password") || pathname.includes("/api/auth/reset-password")) {
      const res = await checkPasswordResetRateLimit(req);
      if (res) return res;
    }
  }

  // General API Rate Limit (for other API routes)
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    const res = await checkApiRateLimit(req);
    if (res) return res;
  }

  // 3. Public pages and APIs - allow
  const isPublicPage = PUBLIC_PAGES.some(page => pathname === page || pathname.startsWith(page + '/'));
  const isPublicApi = PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix));

  if (isPublicPage || isPublicApi) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 4. Auth routes (signup, forgot-password) - redirect if logged in
  const isAuthRoute = ["/signup", "/forgot-password"].some(route => pathname.startsWith(route));
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 5. Require login for everything else
  if (!isLoggedIn) {
    const loginUrl = new URL("/", nextUrl);
    loginUrl.searchParams.set("auth", "login");
    return NextResponse.redirect(loginUrl);
  }

  // 5.5 FAIL-SAFE: If logged in but Role is missing (Corrupted Session), force logout
  if (isLoggedIn && !userRole) {
    // Determines if we should clear cookie or redirect to error
    console.error("[Middleware] Critical: Valid Auto-Auth but NO ROLE found. Forcing logout.");
    const response = NextResponse.redirect(new URL("/api/auth/signout", nextUrl));
    return response;
  }

  // 6. Role-based access control
  for (const route of PROTECTED_ROUTES) {
    if (pathname.startsWith(route.prefix)) {
      const hasRequiredRole = hasRole(userRole as Role, route.minRole);

      if (!hasRequiredRole) {
        // console.warn(`[Middleware] Unauthorized access attempt to ${pathname} by role ${userRole}`);
        return NextResponse.redirect(new URL("/", nextUrl));
      }
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
