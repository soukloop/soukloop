import useSWRInfinite from 'swr/infinite'
import { markAllRead } from '../services/notifications.service'
import type { Notification } from '../types/api'
import { useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useSocket } from '@/components/providers/socket-provider'

interface NotificationsResponse {
  items: Notification[];
  nextCursor: string | null;
}

// ===== NOTIFICATIONS HOOK =====
export function useNotifications() {
  const { status } = useSession()
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth()

  // We are authenticated if EITHER user OR admin is logged in
  const isAuthenticated = status === 'authenticated' || isAdminAuthenticated

  // 1. Define SWR Infinite Key
  const getKey = (pageIndex: number, previousPageData: NotificationsResponse | null) => {
    if (!isAuthenticated) return null;
    if (previousPageData && !previousPageData.nextCursor) return null; // Reached the end

    // First page
    if (pageIndex === 0) return `/api/notifications?limit=20`;

    // Subsequent pages
    return `/api/notifications?limit=20&cursor=${previousPageData.nextCursor}`;
  };

  // 2. Fetcher
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to fetch notifications');
    }
    return res.json();
  };

  const { data, error, size, setSize, mutate, isLoading } = useSWRInfinite<NotificationsResponse>(
    getKey,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      refreshInterval: 0, // Disable polling to rely on sockets + manual refresh
    }
  );

  // 3. Derived State
  const notifications = useMemo(() => {
    return data ? data.flatMap(page => page.items) : [];
  }, [data]);

  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.items.length === 0;
  const isReachingEnd = isEmpty || (data && !data[data.length - 1]?.nextCursor);

  // Mark all as read function
  const markAllReadAction = async () => {
    // Optimistic Update: Mark all locally as read
    const newData = data?.map(page => ({
      ...page,
      items: page.items.map(n => ({ ...n, isRead: true }))
    }));
    await mutate(newData, false);

    const { error: apiError } = await markAllRead();
    if (apiError) {
      // Revert if error (simply revalidate)
      mutate();
      throw new Error(apiError.message);
    }
    // Revalidate ensuring consistency
    await mutate();
  }

  // Real-time updates via Centrifugo
  const { subscribe, isConnected } = useSocket()
  useEffect(() => {
    if (isAuthenticated && isConnected) {
      const unsubscribe = subscribe('notifications', (ctx: any) => {
        console.log('Real-time notification update:', ctx.data);
        const newNotification = ctx.data;

        // Custom Mutation: Prepend to the first page
        mutate((currentData) => {
          if (!currentData) return undefined;
          const newPages = [...currentData];
          if (newPages.length > 0) {
            newPages[0] = {
              ...newPages[0],
              items: [newNotification, ...newPages[0].items]
            };
          }
          return newPages;
        }, false); // false = don't revalidate immediately
      })
      return unsubscribe
    }
  }, [isAuthenticated, isConnected, subscribe, mutate])

  // Get unread count
  const unreadCount = notifications.filter(n => !n.isRead).length || 0

  // Get notifications by type
  const getNotificationsByType = (type: Notification['type']) => {
    return notifications.filter(n => n.type === type) || []
  }

  // Get recent notifications
  const getRecentNotifications = (limit: number = 5) => {
    if (notifications.length === 0) return []
    return [...notifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.isRead) || []
  }

  return {
    notifications,
    isLoading: isLoading && !data, // Initial loading
    isLoadingMore,
    isReachingEnd,
    isEmpty,
    loadMore: () => setSize(size + 1),
    isError: !!error,
    error,
    markAllRead: markAllReadAction,
    unreadCount,
    mutate,
    // Helpers
    getNotificationsByType,
    getRecentNotifications,
    getUnreadNotifications
  }
}


// ===== NOTIFICATION FILTERS HOOK =====
export function useNotificationFilters() {
  const { notifications, getNotificationsByType } = useNotifications()

  const orderNotifications = getNotificationsByType('ORDER_UPDATE')
  const messageNotifications = getNotificationsByType('MESSAGE')
  const followNotifications = getNotificationsByType('FOLLOW')
  const systemNotifications = getNotificationsByType('SYSTEM')

  const getNotificationsByDateRange = (startDate: Date, endDate: Date) => {
    return notifications.filter(n => {
      const notificationDate = new Date(n.createdAt)
      return notificationDate >= startDate && notificationDate <= endDate
    })
  }

  const getTodayNotifications = () => {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))
    return getNotificationsByDateRange(startOfDay, endOfDay)
  }

  const getThisWeekNotifications = () => {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    return getNotificationsByDateRange(startOfWeek, endOfWeek)
  }

  return {
    orderNotifications,
    messageNotifications,
    followNotifications,
    systemNotifications,
    getNotificationsByDateRange,
    getTodayNotifications,
    getThisWeekNotifications
  }
}

// ===== NOTIFICATION BADGE HOOK =====
export function useNotificationBadge() {
  const { unreadCount, notifications } = useNotifications()

  const hasUnread = unreadCount > 0
  const badgeText = unreadCount > 99 ? '99+' : unreadCount.toString()

  const getBadgeColor = () => {
    if (unreadCount === 0) return 'gray'
    if (unreadCount < 5) return 'green'
    if (unreadCount < 10) return 'yellow'
    return 'red'
  }

  return {
    hasUnread,
    badgeText,
    badgeColor: getBadgeColor(),
    unreadCount
  }
}
