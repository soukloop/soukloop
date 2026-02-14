"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { Centrifuge, Subscription, PublicationContext } from "centrifuge";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

type CentrifugeContextType = {
    centrifuge: Centrifuge | null;
    isConnected: boolean;
    subscribe: (channel: string, callback: (ctx: PublicationContext) => void) => () => void;
};

const CentrifugeContext = createContext<CentrifugeContextType>({
    centrifuge: null,
    isConnected: false,
    subscribe: () => () => { },
});

export const useSocket = () => {
    return useContext(CentrifugeContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session } = useSession();
    const [centrifuge, setCentrifuge] = useState<Centrifuge | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Use refs to maintain state without triggering re-renders or dependency loops
    const centrifugeRef = useRef<Centrifuge | null>(null);
    const subscriptions = useRef<Map<string, Subscription>>(new Map());

    useEffect(() => {
        // Prevent double initialization in React Strict Mode
        if (centrifugeRef.current) {
            return;
        }

        const initCentrifuge = () => {
            // Disabled by default to prevent crash on localhost if server is missing
            const shouldConnect = process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true';

            if (!shouldConnect) {
                console.log("WebSocket (Centrifugo) disabled. Set NEXT_PUBLIC_ENABLE_SOCKET=true to enable.");
                return;
            }

            const url = process.env.NEXT_PUBLIC_CENTRIFUGO_URL || "ws://127.0.0.1:8000/connection/websocket";

            try {
                const client = new Centrifuge(url, {
                    debug: process.env.NODE_ENV === 'development', // Enable debug logs in dev
                    // minRetry is not a valid top-level option in v5, it's handled via backoff config if needed, or defaults are fine.
                    timeout: 5000, // Explicit connection timeout
                    getToken: async () => {
                        try {
                            const res = await fetch("/api/centrifugo/token");
                            if (!res.ok) {
                                throw new Error(`Token fetch failed: ${res.status} ${res.statusText}`);
                            }
                            const contentType = res.headers.get("content-type");
                            if (!contentType || !contentType.includes("application/json")) {
                                const text = await res.text();
                                throw new Error(`Expected JSON but received ${contentType}: ${text.slice(0, 100)}...`);
                            }
                            const data = await res.json();
                            return data.token;
                        } catch (err) {
                            console.error("Centrifugo token error:", err);
                            throw err;
                        }
                    },
                });

                client.on("connected", (ctx) => {
                    console.log("Centrifugo connected (client)", ctx);
                    setIsConnected(true);
                });

                client.on("disconnected", (ctx) => {
                    console.log("Centrifugo disconnected", ctx);
                    setIsConnected(false);
                });

                client.on("error", (ctx) => {
                    // Standard connection closed errors (Code 2 = Transport closed) are often transient
                    if (ctx.error?.code === 2) {
                        console.warn("Centrifugo transport closed. Reconnecting...");
                        return;
                    }

                    // Detailed error logging for other errors
                    console.error("Centrifugo error context:", JSON.stringify(ctx, null, 2));

                    if (ctx.type === 'transport') {
                        console.warn("Transport Error: Verify Centrifugo server is running at", url);
                    }
                });

                client.connect();
                centrifugeRef.current = client;
                setCentrifuge(client);

            } catch (error) {
                console.error("Failed to initialize Centrifugo client:", error);
            }
        };

        initCentrifuge();

        return () => {
            // Cleanup on unmount
            const client = centrifugeRef.current;
            if (client) {
                console.log("Disconnecting Centrifugo...");
                client.disconnect();
                centrifugeRef.current = null;
                setCentrifuge(null);
                setIsConnected(false);
            }
        };
    }, []); // Empty dependency array ensures this runs once on mount

    const subscribe = useCallback((channel: string, callback: (ctx: PublicationContext) => void) => {
        if (!centrifugeRef.current) return () => { };

        const client = centrifugeRef.current;
        let sub = subscriptions.current.get(channel);

        if (!sub) {
            sub = client.newSubscription(channel);
            subscriptions.current.set(channel, sub);
            sub.subscribe();
        }

        sub.on("publication", callback);

        return () => {
            sub?.off("publication", callback);
            // Optional: We could unsubscribe if no listeners remain, but keeping it active is often better for UI responsiveness
        };
    }, []); // No dependencies needed as we use ref

    // Handle personal channel for authenticated users
    useEffect(() => {
        if (isConnected && session?.user?.id && centrifuge) {
            const channel = `personal:${session.user.id}`;
            // Use key to track if we already subscribed to this specific personal channel
            const subKey = `personal-sub-${channel}`;

            // Avoid re-subscribing if already handled by the generic mechanism or previous effect run
            // But since subscriptions ref is a map of channel -> Subscription, we can check it.
            let sub = subscriptions.current.get(channel);

            if (!sub) {
                sub = centrifuge.newSubscription(channel);
                subscriptions.current.set(channel, sub);
                sub.subscribe();
            }

            const handler = (ctx: PublicationContext) => {
                console.log("Personal notification received:", ctx.data);

                // Check for suspension event (can be nested in data.data or top level)
                const eventType = ctx.data.data?.type || ctx.data.type;

                if (eventType === 'USER_SUSPENDED' || eventType === 'ACCOUNT_SUSPENDED') {
                    // Check for stale event (sent > 60 seconds ago)
                    // events usually have a timestamp in top level or data.
                    // Notifications from DB usually have 'createdAt'
                    const rawTime = ctx.data.timestamp || ctx.data.data?.timestamp || ctx.data.data?.createdAt || Date.now();
                    const eventTime = new Date(rawTime).getTime();

                    const age = Date.now() - eventTime;
                    const EVENT_MAX_AGE_MS = 60000; // 60 seconds

                    if (age > EVENT_MAX_AGE_MS) {
                        console.warn(`[Socket] Ignoring stale suspension event (Age: ${age}ms)`, ctx.data);
                        return;
                    }

                    console.warn("Received suspension event - logging out user");
                    toast.error("Account Suspended");

                    // Force logout
                    import("next-auth/react").then(({ signOut }) => {
                        signOut({ callbackUrl: "/?error=SuspendedAccount" });
                    });
                    return;
                }

                // Handle regular notifications (nested or flat)
                const title = ctx.data.title || ctx.data.data?.title;
                const message = ctx.data.message || ctx.data.data?.message;
                const type = ctx.data.type || 'info';

                // Determine toast type based on notification type if possible
                let toastType: 'success' | 'info' | 'error' | 'cart' = 'info';
                if (type.includes('SUCCESS') || type.includes('APPROVED')) toastType = 'success';
                if (type.includes('FAILED') || type.includes('REJECTED')) toastType = 'error';
                if (type.includes('ORDER')) toastType = 'cart';

                // Handle Session Refresh (Server-Triggered)
                if (eventType === 'SESSION_REFRESH') {
                    console.log("🔄 active session sync triggered by server");
                    import("next-auth/react").then(({ getSession }) => {
                        // Force a session update value to ensure NextAuth re-fetches from server
                        // passing { trigger: 'server-action' } or similar dummy object forces the jwt callback to run
                        // but specifically, update() with no args re-fetches.
                        // However, we need to call the hook's update. 
                        // Since we are inside a callback ref, we can't easily access the hook's `update` function directly if it wasn't in dependency.
                        // But we can trigger a global window event or use the `getSession` to refresh.
                        // Actually, NextAuth v5 `update` is best. 

                        // We will dispatch a custom event that the SessionProvider or a specific listener can pick up?
                        // OR closer to the source: The `useSession` hook from the component above (`SocketProvider`) has `update`.
                        // Let's use a window reload as a fallback or a custom event if `update` isn't available in scope.
                        // But wait, we used `useSession` at the top level! 

                        // We can't use the `update` from `useSession` easily inside this `useEffect` unless we add it to deps, 
                        // which might cause re-subscriptions. 
                        // Better approach: Dispatch a custom window event "soukloop:session-refresh".
                        window.dispatchEvent(new Event("soukloop:session-refresh"));
                    });

                    // Also verify if we need to show a toast
                    toast.success("Profile Updated");
                    return;
                }

                if (title) {
                    if (toastType === 'error') {
                        toast.error(title);
                    } else if (toastType === 'success') {
                        toast.success(title);
                    } else {
                        toast.info(title);
                    }
                }
            };

            sub.on("publication", handler);

            return () => {
                sub?.off("publication", handler);
            };
        }
    }, [isConnected, session?.user?.id, centrifuge]);

    return (
        <CentrifugeContext.Provider value={{ centrifuge, isConnected, subscribe }}>
            {children}
        </CentrifugeContext.Provider>
    );
};
