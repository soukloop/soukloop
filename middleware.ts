import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

// Initialize NextAuth with Edge-safe config
const { auth } = NextAuth(authConfig)

type AppRole = "USER" | "SELLER" | "ADMIN" | "SUPER_ADMIN"

const ROLE_LEVEL: Record<AppRole, number> = {
  USER: 1,
  SELLER: 2,
  ADMIN: 5,
  SUPER_ADMIN: 10,
}

function hasRequiredRole(currentRole: string | undefined, minRole: AppRole): boolean {
  if (!currentRole) return false
  const role = currentRole as AppRole
  const currentLevel = ROLE_LEVEL[role]
  const requiredLevel = ROLE_LEVEL[minRole]
  if (currentLevel === undefined || requiredLevel === undefined) return false
  return currentLevel >= requiredLevel
}

// ===== PUBLIC ROUTES =====
const PUBLIC_PAGES = [
  '/',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/about-us',
  '/contact-us',
  '/how-to-use-points',
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
  { prefix: '/admin', minRole: "ADMIN" as const },
  { prefix: '/api/admin', minRole: "ADMIN" as const },
  // Allow all authenticated users (User, Seller, Admin) to access onboarding
  { prefix: '/become-a-seller', minRole: "USER" as const },
  { prefix: '/api/seller/onboarding', minRole: "USER" as const },
  { prefix: '/api/seller/upload', minRole: "USER" as const },
  { prefix: '/seller', minRole: "SELLER" as const },
  { prefix: '/api/vendor', minRole: "SELLER" as const },
  { prefix: '/api/seller', minRole: "SELLER" as const },
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
      const allowed = hasRequiredRole(userRole as string | undefined, route.minRole);

      if (!allowed) {
        return NextResponse.redirect(new URL("/", nextUrl));
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
