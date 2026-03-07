import type { Metadata } from "next";
import React from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
import Providers from "@/components/Providers";
import GoogleOneTap from "@/components/auth/GoogleOneTap";
import { auth } from "@/auth";
import SiteHeader from "@/components/site-header";
import ConditionalHeader from "@/components/layout/ConditionalHeader";
// import AppStartupLoader from "@/components/layout/AppStartupLoader";
import { SessionInvalidationListener } from "@/components/auth/SessionInvalidationListener";
import { RoleChangeListener } from "@/components/auth/RoleChangeListener";
import { AccountStatusListener } from "@/components/auth/AccountStatusListener";
import AuthParamsListener from "@/components/auth/AuthParamsListener";

export const metadata: Metadata = {
  title: "SoukLoop",
  description: "Created with v0",
  generator: "v0.app",
  icons: {
    icon: "/images/favicon-soukloop.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Global Session Check
  const session = await auth();

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <Providers session={session}>
          <SessionInvalidationListener />
          <RoleChangeListener />
          <AccountStatusListener />
          <AuthParamsListener />
          <GoogleOneTap clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""} />
          {/* <AppStartupLoader durationMs={3500}> */}
            <ConditionalHeader>
              <SiteHeader />
            </ConditionalHeader>
            {children}
          {/* </AppStartupLoader> */}
        </Providers>
      </body>
    </html>
  );
}
