"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/app/context/CartContext";
import { NotificationListener } from "./NotificationListener";
import { ThemeProvider } from "@/components/theme-provider";
import { SWRProvider } from "@/lib/swr";
import { SocketProvider } from "@/components/providers/socket-provider";
import { Toaster } from "@/components/ui/sonner";
import { Session } from "next-auth";
import AuthParamsListener from "@/components/auth/AuthParamsListener";
import SessionSyncListener from "@/components/auth/SessionSyncListener";
import React, { Suspense } from "react";

// React Query
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/query-client'

// Simple Error Boundary for non-critical listeners
class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Listener Error caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export default function Providers({
  children,
  session
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  // Re-build trigger check: 2026-02-09
  return (
    <SessionProvider
      session={session}
      refetchInterval={0}  // Disable auto-refetch to prevent errors for guests
      refetchOnWindowFocus={false}  // Disable refetch to prevent DB spam
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SWRProvider>
            <SocketProvider>
              <CartProvider>
                <ErrorBoundary fallback={null}>
                  <Suspense fallback={null}>
                    <NotificationListener />
                    <AuthParamsListener />
                    <SessionSyncListener />
                  </Suspense>
                </ErrorBoundary>
                <Toaster />
                {children}
              </CartProvider>
            </SocketProvider>
          </SWRProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      </QueryClientProvider>
    </SessionProvider>
  );
}
