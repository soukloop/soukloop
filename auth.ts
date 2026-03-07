import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Adapter } from "next-auth/adapters"
import { prisma } from "@/lib/prisma"
import { LoginSchema } from "@/lib/validations"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { Role } from "@prisma/client"
import { notifyLogin, notifyLogout, notifyWelcome } from "@/lib/notifications/templates/auth-templates"



// Auth updated to resolve production build issues
import { authConfig } from "./auth.config"

export const { auth, handlers, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma) as Adapter,

    // ✅ JWT STRATEGY REQUIRED FOR CREDENTIALS
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    // Pages are inherited from authConfig

    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: false,
        }),

        Apple({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
        }),

        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsedCredentials = LoginSchema.safeParse(credentials);

                if (!parsedCredentials.success) {
                    console.warn('[Auth] Invalid credentials format');
                    return null;
                }

                const { email, password } = parsedCredentials.data;
                const normalizedEmail = email.toLowerCase().trim();

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: normalizedEmail },
                        include: { profile: true }
                    });

                    if (!user) {
                        console.warn('[Auth] User not found:', { email });
                        return null;
                    }

                    // ✅ CHECK EMAIL VERIFICATION
                    if (!user.emailVerified && user.password) {
                        console.warn('[Auth] Email not verified:', { email });
                        throw new Error('Please verify your email before logging in');
                    }

                    if (!user.isActive) {
                        console.warn('[Auth] Account suspended:', { email });
                        throw new Error('Account suspended');
                    }

                    if (!user.password) {
                        console.warn('[Auth] Credentials login attempted for OAuth-only user:', { email });
                        throw new Error('Please use Google or Apple sign-in');
                    }

                    const isPasswordValid = await compare(password, user.password);

                    if (!isPasswordValid) {
                        console.warn('[Auth] Invalid password attempt:', { email });
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: user.role,
                        tokenVersion: user.tokenVersion,
                    };
                } catch (error) {
                    console.error("[Auth] Authorization error:", error);
                    // Rethrow user-friendly errors
                    if (error instanceof Error) {
                        throw error;
                    }
                    return null;
                }
            }
        }),
    ],

    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // 1. Initial Sign In
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.picture = user.image;
                token.tokenVersion = user.tokenVersion ?? 0;
                token.isActive = user.isActive;
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as Role;
                session.user.image = token.picture;
                session.user.tokenVersion = token.tokenVersion as number;
                session.user.isActive = token.isActive as boolean;
            }
            return session;
        },

        async signIn({ user, account, profile }) {
            // Handle OAuth sign-ins (Google, Apple)
            if (account?.provider === 'google' || account?.provider === 'apple') {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email!.toLowerCase().trim() },
                        include: { profile: true }
                    });

                    // 1. Block Suspended Users
                    if (existingUser && !existingUser.isActive) {
                        console.warn('[Auth] OAuth login attempt for suspended account:', { email: user.email });
                        return '/?error=AccountSuspended';
                    }

                    // 2. Check Registration Setting for NEW Users
                    if (!existingUser) {
                        const allowRegistration = await prisma.settings.findUnique({
                            where: { key: 'allowRegistration' }
                        });

                        if (allowRegistration?.value === 'false') {
                            console.warn('[Auth] OAuth signup attempt blocked by setting:', { email: user.email });
                            return '/auth/signin?error=RegistrationClosed';
                        }
                    }
                } catch (error) {
                    console.error("[Auth] OAuth sign-in error:", error);
                    return '/?error=OAuthError';
                }
            }
            return true;
        }
    },

    events: {
        async signIn({ user, account, profile, isNewUser }) {
            console.log('[Auth] User signed in:', { email: user.email, isNewUser });
            if (user.id && !isNewUser) {
                // Trigger async notification (don't await to not block signin)
                notifyLogin(user.id, user.name || undefined).catch(err =>
                    console.error('[Auth] Failed to send login notification:', err)
                );
            }
        },
        async signOut(data) {
            // In NextAuth v5, events receive a single object
            const session = (data as any).session;
            const token = (data as any).token;

            console.log('[Auth] User signed out:', { email: session?.user?.email });
            // Note: token might be needed if session is null
            const userId = session?.user?.id || token?.id;
            if (userId) {
                notifyLogout(userId).catch(err =>
                    console.error('[Auth] Failed to send logout notification:', err)
                );
            }
        },
        async createUser({ user }) {
            console.log('[Auth] New User Created via Adapter:', user.id);

            // 1. Create User Profile
            const nameParts = user.name?.split(" ") || [];
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            await prisma.userProfile.create({
                data: {
                    userId: user.id,
                    firstName,
                    lastName,
                    avatar: user.image
                }
            });

            // 2. Ensure Email Verified for OAuth
            // Note: Adapter usually handles this, but we force it to specific date if missing
            if (!user.emailVerified) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { emailVerified: new Date() }
                });
            }

            // 3. Send Welcome Email
            notifyWelcome(user.id, user.name || undefined).catch(err =>
                console.error('[Auth] Failed to send welcome notification:', err)
            );
        },

        async linkAccount({ user }) {
            // Ensure email is verified when an account is linked
            if (!user.emailVerified) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { emailVerified: new Date() }
                });
            }
        }
    },

    // Use secure secret
    secret: process.env.NEXTAUTH_SECRET,
})
