import type { NextAuthConfig } from "next-auth"

// Define sensitive routes
const PROTECTED_ROUTES = [
    '/admin',
    '/api/admin',
    '/seller',
    '/api/vendor',
    '/api/seller'
];

export const authConfig = {
    pages: {
        signIn: '/?auth=login',
        error: '/auth/error',
    },
    // Explicitly set secret for Edge compatibility
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnProtectedRoute = PROTECTED_ROUTES.some(route => nextUrl.pathname.startsWith(route));

            if (isOnProtectedRoute) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            } else if (isLoggedIn) {
                // Redirect logged-in users away from auth pages
                const isAuthRoute = ["/signup", "/forgot-password"].some(route => nextUrl.pathname.startsWith(route));
                if (isAuthRoute) {
                    return Response.redirect(new URL("/", nextUrl));
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                // User object is only available on first sign-in
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as any;
            }
            return session;
        }
    },
    providers: [], // Providers configured in auth.ts
} satisfies NextAuthConfig
