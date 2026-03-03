"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Bell,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Info,
  Filter,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification as ApiNotification } from "@/types/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  data?: any;
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { canAccessRoute, isSuperAdmin, isAuthChecking } = useAdminAuth();

  // Use unified hook
  const {
    notifications,
    isLoading: isNotificationsLoading,
    error,
    markAllRead: markAllReadAction,
    mutate,
  } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  // loading state
  if ((isNotificationsLoading && !notifications) || isAuthChecking) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center text-red-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
        <p>Failed to load notifications</p>
      </div>
    );
  }

  // Ensure notifications is an array before filtering
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  // Filter notifications based on PERMISSIONS
  const filteredNotifications = safeNotifications.filter((notification) => {
    // 1. Basic filter (all/unread)
    if (filter === "unread" && notification.isRead) return false;

    // 2. Permission-based filter for Sub-Admins
    if (isSuperAdmin) return true;

    const type = notification.type;

    // KYC -> Sellers/KYC permission
    if (type === "NEW_KYC_SUBMISSION")
      return canAccessRoute("/admin/sellers") || canAccessRoute("/admin/kyc");

    // Reports -> Reports permission
    if (type === "NEW_REPORT") return canAccessRoute("/admin/reports");

    // Support -> Support permission
    if (type === "NEW_SUPPORT_TICKET") return canAccessRoute("/admin/support");

    // Orders (if any) -> Transactions
    if (type.includes("ORDER")) return canAccessRoute("/admin/transactions");

    // System announcements -> Everyone sees
    if (type === "SYSTEM_ANNOUNCEMENT") return true;

    // Default to showing if unsure (or hide? Safer to show generic, hide sensitive)
    // Assuming other types are generic
    return true;
  });

  const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllReadAction();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  // const handleNotificationClick = async (notification: Notification) => {
  //     // Mark as read if not already
  //     if (!notification.isRead) {
  //         try {
  //             await fetch(`/api/notifications/${notification.id}`, {
  //                 method: 'PATCH',
  //                 headers: { 'Content-Type': 'application/json' },
  //                 body: JSON.stringify({ isRead: true })
  //             })
  //             mutate() // Refresh list
  //         } catch (e) {
  //             console.error('Failed to mark read', e)
  //         }
  //     }

  //     // Navigate
  //     if (notification.actionUrl) {
  //         router.push(notification.actionUrl)
  //     }
  // }
  const handleNotificationClick = async (notification: ApiNotification) => {
    if (!notification.isRead) {
      try {
        await fetch(`/api/notifications/${notification.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        });
        mutate();
      } catch (e) {
        console.error("Failed to mark read", e);
      }
    }

    const url = notification.actionUrl ?? undefined; // converts null -> undefined
    if (url) router.push(url);
  };

  const getIcon = (type: string) => {
    if (type.includes("KYC"))
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (type.includes("REPORT"))
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (type.includes("TICKET") || type.includes("MESSAGE"))
      return <MessageSquare className="w-5 h-5 text-blue-500" />;
    return <Info className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with marketplace activity
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFilter(filter === "all" ? "unread" : "all")}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
              filter === "unread"
                ? "bg-orange-50 border-orange-200 text-orange-700"
                : "bg-white border-gray-300 text-gray-700"
            }`}
          >
            <Filter className="w-4 h-4" />
            {filter === "all" ? "Show Unread Only" : "Show All"}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4 ${
                !notification.isRead ? "bg-orange-50/50" : ""
              }`}
            >
              <div
                className={`mt-1 p-2 rounded-full ${!notification.isRead ? "bg-white shadow-sm" : "bg-gray-100"}`}
              >
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3
                    className={`text-sm font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}
                  >
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p
                  className={`text-sm mt-1 ${!notification.isRead ? "text-gray-800" : "text-gray-500"}`}
                >
                  {notification.message}
                </p>
              </div>
              {!notification.isRead && (
                <div className="mt-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium">No notifications found</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
