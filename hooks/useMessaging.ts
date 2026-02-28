import useSWR from 'swr'
import {
  listChatConversations,
  listChatMessages,
  sendChatMessage,
  createOrGetChatConversation,
  startChatFromProduct,
  getOtherUser,
  type ChatConversation,
  type ChatMessage,
  type ChatUser
} from '../services/messaging.service'
import { useState } from 'react'

import { useSession } from 'next-auth/react'

// ============================================
// Re-export types for convenience
// ============================================
export type { ChatConversation, ChatMessage, ChatUser }

// ============================================
// CONVERSATIONS HOOK
// ============================================
export function useConversations() {
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const { data, error, isLoading, mutate } = useSWR(
    isAuthenticated ? '/api/chat/conversations' : null,
    async () => {
      const { data, error } = await listChatConversations()
      if (error) {
        throw new Error(error.message)
      }
      return data
    },
    {
      revalidateOnFocus: true
    }
  )

  return {
    conversations: data || [],
    error,
    isLoading,
    mutate
  }
}

// ============================================
// MESSAGES HOOK
// ============================================
export function useMessages(conversationId: string | null) {
  const { data: messages, error, isLoading, mutate } = useSWR(
    conversationId ? `/api/chat/conversations/${conversationId}/messages` : null,
    async () => {
      if (!conversationId) return []
      const { data, error } = await listChatMessages(conversationId)
      if (error) {
        throw new Error(error.message)
      }
      return data || []
    },
    {
      revalidateOnFocus: true
    }
  )

  // Send message function with optimistic update
  const sendMessageAction = async (
    messageText: string,
    imageUrl?: string,
    optimisticSender?: ChatUser
  ) => {
    if (!conversationId) throw new Error('No conversation selected')

    // Optimistic message
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: optimisticSender?.id || 'temp-user',
      message: messageText,
      imageUrl: imageUrl || null,
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: optimisticSender || { id: 'temp-user', name: 'You', image: null }
    }

    // Optimistic update
    await mutate(
      async (currentMessages: ChatMessage[] | undefined) => {
        const { data, error } = await sendChatMessage(conversationId, {
          message: messageText,
          imageUrl
        })
        if (error) {
          throw new Error(error.message)
        }
        // Return updated messages list
        return [...(currentMessages || []), data!]
      },
      {
        optimisticData: [...(messages || []), optimisticMessage],
        rollbackOnError: true,
        populateCache: true,
        revalidate: true
      }
    )
  }

  return {
    messages: messages || [],
    isLoading,
    isError: !!error,
    error,
    sendMessage: sendMessageAction,
    refreshMessages: mutate
  }
}

// ============================================
// START CHAT HOOK (For product pages)
// ============================================
export function useStartChat() {
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startChat = async (
    sellerId: string,
    productId: string,
    initialMessage?: string
  ): Promise<ChatConversation | null> => {
    setIsStarting(true)
    setError(null)

    try {
      const result = await startChatFromProduct(sellerId, productId, initialMessage)

      if (result.error) {
        setError(result.error)
        return null
      }

      return result.conversation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start chat')
      return null
    } finally {
      setIsStarting(false)
    }
  }

  const createConversation = async (
    sellerId: string,
    productId: string
  ): Promise<ChatConversation | null> => {
    setIsStarting(true)
    setError(null)

    try {
      const { data, error: apiError } = await createOrGetChatConversation(sellerId, { productId })

      if (apiError) {
        setError(apiError.message)
        return null
      }


      return data || null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation')
      return null
    } finally {
      setIsStarting(false)
    }
  }

  return {
    startChat,
    createConversation,
    isStarting,
    error
  }
}

// ============================================
// MESSAGING MANAGEMENT HOOK (Combined helpers)
// ============================================
export function useMessaging() {
  const { conversations, error: conversationsError, isLoading: isLoadingConversations, mutate } = useConversations()

  // Get conversation by ID
  const getConversation = (conversationId: string) => {
    return conversations?.find(conv => conv.id === conversationId)
  }

  // Get recently active conversations
  const getRecentConversations = (limit: number = 10) => {
    if (!conversations) return []
    return conversations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  // Get total unread count (from last messages)
  const getTotalUnreadCount = () => {
    // This would require tracking unread state per conversation
    // For now, return 0 - can be enhanced later
    return 0
  }

  return {
    conversations: conversations || [],
    isLoadingConversations,
    isErrorConversations: !!conversationsError,
    conversationsError,
    refreshConversations: mutate,
    getConversation,
    getRecentConversations,
    getTotalUnreadCount,
    // Helper to get other user
    getOtherUser
  }
}

// ============================================
// LEGACY EXPORTS (Backward compatibility)
// ============================================
export { useConversations as useChatConversations }
export { useMessages as useChatMessages }
