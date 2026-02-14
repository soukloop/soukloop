import type { Metadata } from "next";
import React from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Providers from "@/components/Providers"; // ✅ NextAuth Session Provider wrapper & Global Contexts
import GoogleOneTap from "@/components/auth/GoogleOneTap"; // ✅ Google One Tap Sign-In
import { auth } from "@/auth"; // ✅ Import auth for server-side session hydration
import SiteHeader from "@/components/site-header";

import ConditionalHeader from "@/components/layout/ConditionalHeader";
import { SessionInvalidationListener } from "@/components/auth/SessionInvalidationListener";
import { RoleChangeListener } from "@/components/auth/RoleChangeListener";
import { AccountStatusListener } from "@/components/auth/AccountStatusListener";

export const metadata: Metadata = {
  title: "SoukLoop",
  description: "Created with v0",
  generator: "v0.app",
};

import { validateRequest } from "@/lib/security";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Global Security Check (Suspension/Revocation)
  await validateRequest();

  const session = await auth();



  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <Providers session={session}>
          <SessionInvalidationListener />
          <RoleChangeListener />
          <AccountStatusListener />
          <GoogleOneTap clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""} />
          <ConditionalHeader>
            <SiteHeader />
          </ConditionalHeader>
          {children}
        </Providers>

      </body>
    </html>
  );
}


