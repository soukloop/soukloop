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
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/about-us',
  '/contact-us',
  '/how-to-use-points',
  '/pricing',
  '/privacy-policy',
  '/terms-and-conditions',
  '/refunds-and-returns',
  '/faqs',
  '/help',
  '/products',
  '/product',
  '/seller-profile',
  '/track-orders',
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
  { prefix: '/admin', minRole: Role.ADMIN },
  { prefix: '/api/admin', minRole: Role.ADMIN },
  // Allow all authenticated users (User, Seller, Admin) to access onboarding
  { prefix: '/become-a-seller', minRole: Role.USER },
  { prefix: '/api/seller/onboarding', minRole: Role.USER },
  { prefix: '/api/seller/upload', minRole: Role.USER },
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

  // 2. Public Pages & APIs - Always Allow (Safe Gatekeeping)
  const isPublicPage = PUBLIC_PAGES.some(page => pathname === page || pathname.startsWith(page + '/'));
  const isPublicApi = PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix));

  if (isPublicPage || isPublicApi) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 3. Auth Routes (signup, login) - Redirect if logged in
  const isAuthRoute = ["/signup", "/forgot-password"].some(route => pathname.startsWith(route));
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 4. Protected Routes - Require Login
  if (!isLoggedIn) {
    const loginUrl = new URL("/", nextUrl);
    loginUrl.searchParams.set("auth", "login");
    return NextResponse.redirect(loginUrl);
  }

  // 5. Role-Based Access Control
  // Use the FIRST matching prefix (most specific wins since they're listed specific-to-broad)
  for (const route of PROTECTED_ROUTES) {
    if (pathname.startsWith(route.prefix)) {
      const hasRequiredRole = hasRole(userRole as Role, route.minRole);

      if (!hasRequiredRole) {
        return NextResponse.redirect(new URL("/", nextUrl));
      }

      // Check tier for seller routes
      if (pathname.startsWith('/seller')) {
        const planTier = req.auth?.user?.planTier;
        if (planTier === 'BASIC') {
          return NextResponse.redirect(new URL("/pricing", nextUrl));
        }
      }
      break;
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
