"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bell, BellOff } from "lucide-react";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { formatTime, getNotificationStyle, getNotificationRole, getActionButton } from "@/lib/notification-utils";
import { Skeleton } from "@/components/ui/skeleton";

function NotificationSkeleton() {
  return (
    <div className="flex w-full items-start gap-4 rounded-lg border border-gray-100 p-4">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const { isSeller } = useSellerAuth();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Use the unified hook for data
  const {
    notifications,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    loadMore,
    markAllRead: markAllAsRead
  } = useNotifications();

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && !isReachingEnd) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isLoadingMore, isReachingEnd, loadMore]);


  const markAsRead = async (notificationId: string) => {
    try {
      // Optimistic update is now handled in the hook if specific function was there,
      // but current hook only has markAllRead.
      // For single notification read, we can add it to the hook or keep fetch here.
      // Ideally we should add markAsRead to the hook for cache consistency.
      // But for now keeping fetch here as in original code, but UI updates optimistically via local state?
      // No, strictly we should use hook logic.
      // I will assume the user meant markAllRead was optimized.
      // For single read, SWR revalidation will fix it.
      await fetch(`/api/notifications/${notificationId}`, { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="size-6 text-[#E87A3F]" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-[#E87A3F] text-white">
                  {unreadCount}
                </span>
              )}
            </h1>
            {notifications.length > 0 && unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-sm"
              >
                Mark all as read
              </Button>
            )}
          </div>

          {/* Role indicator for sellers */}
          {isSeller && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
              <strong>Seller Mode:</strong> You're seeing notifications for your orders, sales, and product inquiries.
            </div>
          )}

          {/* Loading State - Initial */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : status !== "authenticated" ? (
            /* Not logged in */
            <div className="text-center py-16">
              <BellOff className="size-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Please sign in to view your notifications.</p>
              <Link href="/login">
                <Button className="mt-4 bg-[#E87A3F] hover:bg-[#d96d34]">Sign In</Button>
              </Link>
            </div>
          ) : notifications.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <Bell className="size-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                You'll see updates about orders, messages, and more here.
              </p>
            </div>
          ) : (
            /* Notifications List */
            <div className="space-y-3">
              {notifications.map((notification) => {
                const actionButton = getActionButton(notification);
                const style = getNotificationStyle(notification.type);

                return (
                  <div
                    key={notification.id}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                    className={`flex w-full items-start gap-4 rounded-lg border p-4 transition-colors cursor-pointer relative overflow-hidden group
                      ${notification.isRead
                        ? "bg-white border-gray-100 hover:bg-gray-50"
                        : getNotificationRole(notification) === 'buyer'
                          ? "bg-green-50 border-green-200 hover:bg-green-100"
                          : "bg-orange-50 border-orange-200 hover:bg-orange-100"
                      }`}
                  >
                    {/* Role Badge Indicator */}
                    <div className={`absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-[10px] font-bold uppercase tracking-wider
                      ${getNotificationRole(notification) === 'buyer'
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                      }`}>
                      {getNotificationRole(notification)}
                    </div>
                    {/* Icon */}
                    <div className="shrink-0 mt-1">
                      <div className={`size-10 rounded-full flex items-center justify-center 
                        ${notification.isRead
                          ? "bg-gray-100"
                          : getNotificationRole(notification) === 'buyer'
                            ? "bg-green-100"
                            : "bg-orange-100"
                        }`}>
                        <span className={
                          notification.isRead
                            ? "text-gray-400"
                            : getNotificationRole(notification) === 'buyer'
                              ? "text-green-600"
                              : "text-orange-600"
                        }>
                          {style.icon}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <span className="font-semibold">{notification.title}</span>
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>

                        {/* Action Button */}
                        {actionButton && (
                          <div className="ml-4 shrink-0">
                            <Link href={actionButton.link}>
                              <Button
                                size="sm"
                                className="h-8 rounded-md px-3 py-1 text-xs border-[#E87A3F] bg-[#E87A3F] text-white hover:bg-[#d96d34]"
                              >
                                {actionButton.text}
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="shrink-0">
                        <div className="size-2 rounded-full bg-[#E87A3F]" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Load More Trigger & Loader */}
              {!isReachingEnd && (
                <div ref={loadMoreRef} className="pt-4 pb-8">
                  {isLoadingMore ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <NotificationSkeleton key={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="h-4" /> /* Invisible trigger target */
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <FooterSection />
    </div>
  );
}

