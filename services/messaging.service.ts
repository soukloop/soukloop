import { apiGet, apiPost, apiPatch, type ApiResponse } from '../lib/api'

// ============================================
// Types for ChatConversation (Product-centric)
// ============================================

export interface ChatUser {
  id: string
  name: string | null
  image: string | null
}

export interface ProductImage {
  id: string
  url: string
  alt: string | null
}

export interface ChatProduct {
  id: string
  name: string
  price: number
  images?: ProductImage[]
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  message: string | null
  imageUrl: string | null
  isRead: boolean
  createdAt: string
  sender: ChatUser
}

export interface ChatConversation {
  id: string
  buyerId: string
  sellerId: string
  productId: string
  createdAt: string
  buyer: ChatUser
  seller: ChatUser
  product: ChatProduct
  messages?: ChatMessage[] // Last message for preview
}

// ============================================
// Chat Service Functions
// ============================================

/**
 * List all chat conversations for the current user
 * Returns conversations where user is either buyer or seller
 */
export async function listChatConversations(): Promise<ApiResponse<ChatConversation[]>> {
  return apiGet<ChatConversation[]>('/api/chat/conversations')
}

/**
 * Create or get existing conversation for a specific product
 * If conversation already exists (same buyer, seller, product), returns existing one
 */
export async function createOrGetChatConversation(
  sellerId: string,
  productId: string
): Promise<ApiResponse<ChatConversation>> {
  return apiPost<ChatConversation>('/api/chat/conversations', {
    sellerId,
    productId
  })
}

/**
 * Get messages for a specific conversation
 */
export async function listChatMessages(conversationId: string): Promise<ApiResponse<ChatMessage[]>> {
  return apiGet<ChatMessage[]>(`/api/chat/conversations/${conversationId}/messages`)
}

/**
 * Send a message in a conversation
 */
export async function sendChatMessage(
  conversationId: string,
  data: { message?: string; imageUrl?: string }
): Promise<ApiResponse<ChatMessage>> {
  return apiPost<ChatMessage>(`/api/chat/conversations/${conversationId}/messages`, data)
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(messageId: string): Promise<ApiResponse<ChatMessage>> {
  return apiPatch<ChatMessage>(`/api/chat/messages/${messageId}`, { isRead: true })
}

// ============================================
// Helper Functions
// ============================================

/**
 * Start a chat from a product page
 * Creates/gets conversation and optionally sends first message
 */
export async function startChatFromProduct(
  sellerId: string,
  productId: string,
  initialMessage?: string
): Promise<{ conversation: ChatConversation | null; message: ChatMessage | null; error: string | null }> {
  try {
    // Step 1: Create or get existing conversation
    const { data: conversation, error: convError } = await createOrGetChatConversation(sellerId, productId)

    if (convError || !conversation) {
      return { conversation: null, message: null, error: convError?.message || 'Failed to create conversation' }
    }

    // Step 2: Send initial message if provided
    if (initialMessage) {
      const { data: message, error: msgError } = await sendChatMessage(conversation.id, {
        message: initialMessage
      })

      if (msgError) {
        // Conversation created but message failed - still return conversation
        console.error('Failed to send initial message:', msgError)
        return { conversation, message: null, error: null }
      }

      return { conversation, message, error: null }
    }

    return { conversation, message: null, error: null }
  } catch (error) {
    console.error('startChatFromProduct error:', error)
    return { conversation: null, message: null, error: 'An unexpected error occurred' }
  }
}

/**
 * Get the "other" user in a conversation (the one you're chatting with)
 */
export function getOtherUser(conversation: ChatConversation, currentUserId: string): ChatUser {
  return conversation.buyerId === currentUserId ? conversation.seller : conversation.buyer
}

/**
 * Get unread message count for a conversation
 */
export function getUnreadCount(messages: ChatMessage[], currentUserId: string): number {
  return messages.filter(msg => !msg.isRead && msg.senderId !== currentUserId).length
}

/**
 * Get the last message from a conversation
 */
export function getLastMessage(conversation: ChatConversation): ChatMessage | null {
  return conversation.messages?.[0] || null
}

// ============================================
// Legacy exports for backward compatibility
// ============================================

export const listConversations = listChatConversations
export const listMessages = listChatMessages
export const sendMessage = (data: { conversationId: string; body: string; mediaUrl?: string }) => {
  return sendChatMessage(data.conversationId, { message: data.body, imageUrl: data.mediaUrl })
}
