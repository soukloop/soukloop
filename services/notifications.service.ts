import { apiGet, apiPatch, type ApiResponse } from '../lib/api'
import type { Notification } from '../types/api'

// Notifications service functions
export async function listNotifications(): Promise<ApiResponse<Notification[]>> {
  return apiGet<Notification[]>('/api/notifications')
}

export async function markAllRead(): Promise<ApiResponse<void>> {
  return apiPatch<void>('/api/notifications', {})
}

// Example usage:
/*
// List all notifications
const { data: notifications, error: listError } = await listNotifications()

if (listError) {
  console.error('Failed to fetch notifications:', listError.message)
} else {
  console.log(`Found ${notifications?.length} notifications`)
  notifications?.forEach(notification => {
    console.log(`- ${notification.title}: ${notification.message}`)
    console.log(`  Type: ${notification.type}`)
    console.log(`  Read: ${notification.isRead ? 'Yes' : 'No'}`)
    console.log(`  Created: ${notification.createdAt}`)
  })
}

// Mark all notifications as read
const { error: markError } = await markAllRead()

if (markError) {
  console.error('Failed to mark notifications as read:', markError.message)
} else {
  console.log('All notifications marked as read')
}

// Notification analytics
export async function getNotificationAnalytics() {
  const { data: notifications, error } = await listNotifications()
  
  if (error) {
    console.error('Failed to fetch notifications for analytics:', error.message)
    return null
  }
  
  if (!notifications) return null
  
  const analytics = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    byType: notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    recent: notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }
  
  console.log('Notification Analytics:', analytics)
  return analytics
}

// Get unread notifications count
export async function getUnreadCount(): Promise<number> {
  const { data: notifications, error } = await listNotifications()
  
  if (error) {
    console.error('Failed to fetch notifications:', error.message)
    return 0
  }
  
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0
  console.log(`Unread notifications: ${unreadCount}`)
  return unreadCount
}

// Get notifications by type
export async function getNotificationsByType(type: Notification['type']) {
  const { data: notifications, error } = await listNotifications()
  
  if (error) {
    console.error('Failed to fetch notifications:', error.message)
    return []
  }
  
  const filtered = notifications?.filter(n => n.type === type) || []
  console.log(`Found ${filtered.length} ${type} notifications`)
  return filtered
}

// Mark specific notification as read
export async function markNotificationRead(notificationId: string) {
  // This would typically be a separate endpoint like PATCH /api/notifications/[id]
  // For now, we'll simulate by marking all as read
  console.log(`Marking notification ${notificationId} as read`)
  
  // In a real implementation:
  // return apiPatch(`/api/notifications/${notificationId}`, { isRead: true })
  
  // For now, just mark all as read
  return markAllRead()
}

// Notification management workflow
export async function manageNotifications() {
  try {
    // Get current notifications
    const { data: notifications, error } = await listNotifications()
    
    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`)
    }
    
    if (!notifications) {
      console.log('No notifications found')
      return
    }
    
    const unreadCount = notifications.filter(n => !n.isRead).length
    
    if (unreadCount === 0) {
      console.log('All notifications are already read')
      return
    }
    
    console.log(`Found ${unreadCount} unread notifications`)
    
    // Show unread notifications
    const unreadNotifications = notifications.filter(n => !n.isRead)
    unreadNotifications.forEach(notification => {
      console.log(`📢 ${notification.title}`)
      console.log(`   ${notification.message}`)
      console.log(`   Type: ${notification.type}`)
      if (notification.actionUrl) {
        console.log(`   Action: ${notification.actionUrl}`)
      }
      console.log('')
    })
    
    // Mark all as read
    const { error: markError } = await markAllRead()
    
    if (markError) {
      throw new Error(`Failed to mark notifications as read: ${markError.message}`)
    }
    
    console.log('✅ All notifications marked as read')
    
  } catch (error) {
    console.error('Notification management failed:', error)
    throw error
  }
}

// Real-time notification polling (for demo purposes)
export async function startNotificationPolling(intervalMs: number = 30000) {
  console.log(`Starting notification polling every ${intervalMs}ms`)
  
  const poll = async () => {
    try {
      const unreadCount = await getUnreadCount()
      
      if (unreadCount > 0) {
        console.log(`🔔 You have ${unreadCount} unread notifications`)
        // In a real app, you might show a toast or update a badge
      }
    } catch (error) {
      console.error('Notification polling error:', error)
    }
  }
  
  // Initial poll
  await poll()
  
  // Set up interval
  const intervalId = setInterval(poll, intervalMs)
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId)
    console.log('Notification polling stopped')
  }
}
*/
