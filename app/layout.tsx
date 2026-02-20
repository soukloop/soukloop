import type { Metadata } from "next";
import React from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Providers from "@/components/Providers";
import GoogleOneTap from "@/components/auth/GoogleOneTap";
import { auth } from "@/auth";
import SiteHeader from "@/components/site-header";
import ConditionalHeader from "@/components/layout/ConditionalHeader";
import { SessionInvalidationListener } from "@/components/auth/SessionInvalidationListener";
import { RoleChangeListener } from "@/components/auth/RoleChangeListener";
import { AccountStatusListener } from "@/components/auth/AccountStatusListener";
import AuthParamsListener from "@/components/auth/AuthParamsListener";

export const metadata: Metadata = {
  title: "SoukLoop",
  description: "Created with v0",
  generator: "v0.app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Global Session Check
  const session = await auth();

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <Providers session={session}>
          <SessionInvalidationListener />
          <RoleChangeListener />
          <AccountStatusListener />
          <AuthParamsListener />
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
