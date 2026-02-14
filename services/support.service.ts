import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '../lib/api'

// ===== SUPPORT TICKET TYPES =====
export interface SupportTicket {
  id: string
  userId: string
  user: {
    id: string
    name: string | null
    email: string
  }
  subject: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: 'TECHNICAL' | 'BILLING' | 'GENERAL' | 'FEATURE_REQUEST' | 'BUG_REPORT'
  assignedTo?: string
  assignedUser?: {
    id: string
    name: string
    email: string
  }
  orderId?: string
  createdAt: string
  updatedAt: string
  messages: SupportMessage[]
}

export interface SupportMessage {
  id: string
  ticketId: string
  userId: string
  user: {
    id: string
    name: string | null
    email: string
  }
  content: string
  isFromAdmin: boolean
  createdAt: string
}

export interface SupportTicketsResponse {
  tickets: SupportTicket[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: {
    totalTickets: number
    openTickets: number
    inProgressTickets: number
    resolvedTickets: number
    closedTickets: number
  }
}

export interface CreateTicketDto {
  subject: string
  description: string
  category: SupportTicket['category']
  priority: SupportTicket['priority']
  orderId?: string
}

export interface UpdateTicketDto {
  status?: SupportTicket['status']
  priority?: SupportTicket['priority']
  assignedTo?: string
}

export interface CreateMessageDto {
  content: string
}

// ===== SUPPORT TICKET FUNCTIONS =====
export async function listSupportTickets(params?: {
  page?: number
  limit?: number
  status?: string
  priority?: string
  category?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}): Promise<ApiResponse<SupportTicketsResponse>> {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.set('page', params.page.toString())
  if (params?.limit) queryParams.set('limit', params.limit.toString())
  if (params?.status) queryParams.set('status', params.status)
  if (params?.priority) queryParams.set('priority', params.priority)
  if (params?.category) queryParams.set('category', params.category)
  if (params?.search) queryParams.set('search', params.search)
  if (params?.sortBy) queryParams.set('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.set('sortOrder', params.sortOrder)

  const url = `/api/support/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  return apiGet<SupportTicketsResponse>(url)
}

export async function getSupportTicket(ticketId: string): Promise<ApiResponse<SupportTicket>> {
  return apiGet<SupportTicket>(`/api/support/tickets/${ticketId}`)
}

export async function createSupportTicket(dto: CreateTicketDto): Promise<ApiResponse<SupportTicket>> {
  return apiPost<SupportTicket>('/api/support/tickets', dto)
}

export async function updateSupportTicket(
  ticketId: string, 
  dto: UpdateTicketDto
): Promise<ApiResponse<SupportTicket>> {
  return apiPatch<SupportTicket>(`/api/support/tickets/${ticketId}`, dto)
}

export async function deleteSupportTicket(ticketId: string): Promise<ApiResponse<{ success: boolean }>> {
  return apiDelete(`/api/support/tickets/${ticketId}`)
}

export async function assignTicket(
  ticketId: string, 
  assignedTo: string
): Promise<ApiResponse<SupportTicket>> {
  return apiPatch<SupportTicket>(`/api/support/tickets/${ticketId}/assign`, { assignedTo })
}

export async function resolveTicket(
  ticketId: string
): Promise<ApiResponse<SupportTicket>> {
  return apiPatch<SupportTicket>(`/api/support/tickets/${ticketId}`, { status: 'RESOLVED' })
}

export async function closeTicket(
  ticketId: string
): Promise<ApiResponse<SupportTicket>> {
  return apiPatch<SupportTicket>(`/api/support/tickets/${ticketId}`, { status: 'CLOSED' })
}

// ===== SUPPORT MESSAGE FUNCTIONS =====
export async function addTicketMessage(
  ticketId: string, 
  dto: CreateMessageDto
): Promise<ApiResponse<SupportMessage>> {
  return apiPost<SupportMessage>(`/api/support/tickets/${ticketId}/messages`, dto)
}

export async function getTicketMessages(ticketId: string): Promise<ApiResponse<SupportMessage[]>> {
  return apiGet<SupportMessage[]>(`/api/support/tickets/${ticketId}/messages`)
}

// ===== HELP ARTICLES =====
export interface HelpArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    email: string
  }
}

export interface HelpArticlesResponse {
  articles: HelpArticle[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export async function listHelpArticles(params?: {
  page?: number
  limit?: number
  category?: string
  search?: string
}): Promise<ApiResponse<HelpArticlesResponse>> {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.set('page', params.page.toString())
  if (params?.limit) queryParams.set('limit', params.limit.toString())
  if (params?.category) queryParams.set('category', params.category)
  if (params?.search) queryParams.set('search', params.search)

  const url = `/api/support/help${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  return apiGet<HelpArticlesResponse>(url)
}

export async function getHelpArticle(articleId: string): Promise<ApiResponse<HelpArticle>> {
  return apiGet<HelpArticle>(`/api/support/help/${articleId}`)
}
