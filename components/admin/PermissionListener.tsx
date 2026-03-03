"use client";

import { useEffect } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";

export default function PermissionListener() {
    const { centrifuge: socket } = useSocket();
    const { checkSession, adminUser } = useAdminAuth();

    useEffect(() => {
        if (!socket || !adminUser) return;

        // Listen for specific user events
        // Note: The socket must have joined the user room 'user:{id}'
        // usually this happens in a top-level effect when auth is confirmed.
        // We will assume the socket provider or layout handles joining the room.
        // If not, we might need to emit a 'join-user-room' event here.

        (socket as any)?.emit("join-user-room", adminUser.id);

        const onPermissionUpdate = async (data: any) => {
            console.log("Permission update received:", data);
            toast.info(data.message || "Your permissions have changed.");

            // Force re-fetch of admin session/permissions
            await checkSession();
        };

        (socket as any)?.on("permission-update", onPermissionUpdate);

        return () => {
            (socket as any)?.off("permission-update", onPermissionUpdate);
        };
    }, [socket, adminUser, checkSession]);

    return null;
}
