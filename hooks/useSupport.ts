import useSWR from 'swr'
import { 
  listSupportTickets, 
  getSupportTicket, 
  createSupportTicket, 
  updateSupportTicket,
  deleteSupportTicket,
  assignTicket,
  resolveTicket,
  closeTicket,
  addTicketMessage,
  getTicketMessages,
  listHelpArticles,
  getHelpArticle
} from '../services/support.service'
import type { 
  SupportTicket, 
  SupportTicketsResponse, 
  CreateTicketDto, 
  UpdateTicketDto, 
  CreateMessageDto,
  HelpArticle,
  HelpArticlesResponse
} from '../services/support.service'

// ===== SUPPORT TICKETS HOOK =====
interface UseSupportTicketsParams {
  page?: number
  limit?: number
  status?: string
  priority?: string
  category?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function useSupportTickets(params: UseSupportTicketsParams = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/support/tickets', params],
    async () => {
      const { data, error } = await listSupportTickets(params)
      if (error) {
        throw new Error(error.message)
      }
      return data
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate
  }
}

// ===== SINGLE SUPPORT TICKET HOOK =====
export function useSupportTicket(ticketId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    ticketId ? `/api/support/tickets/${ticketId}` : null,
    async () => {
      const { data, error } = await getSupportTicket(ticketId)
      if (error) {
        throw new Error(error.message)
      }
      return data
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate
  }
}

// ===== CREATE SUPPORT TICKET HOOK =====
export function useCreateSupportTicket() {
  const { mutate: refreshTickets } = useSWR('/api/support/tickets')

  const createTicketAction = async (dto: CreateTicketDto) => {
    const { data, error } = await createSupportTicket(dto)
    if (error) {
      throw new Error(error.message)
    }
    // Refresh tickets list
    await refreshTickets()
    return data
  }

  return {
    createTicket: createTicketAction
  }
}

// ===== UPDATE SUPPORT TICKET HOOK =====
export function useUpdateSupportTicket() {
  const { mutate: refreshTickets } = useSWR('/api/support/tickets')

  const updateTicketAction = async (ticketId: string, dto: UpdateTicketDto) => {
    const { data, error } = await updateSupportTicket(ticketId, dto)
    if (error) {
      throw new Error(error.message)
    }
    // Refresh tickets list
    await refreshTickets()
    return data
  }

  return {
    updateTicket: updateTicketAction
  }
}

// ===== DELETE SUPPORT TICKET HOOK =====
export function useDeleteSupportTicket() {
  const { mutate: refreshTickets } = useSWR('/api/support/tickets')

  const deleteTicketAction = async (ticketId: string) => {
    const { error } = await deleteSupportTicket(ticketId)
    if (error) {
      throw new Error(error.message)
    }
    // Refresh tickets list
    await refreshTickets()
  }

  return {
    deleteTicket: deleteTicketAction
  }
}

// ===== ASSIGN TICKET HOOK =====
export function useAssignTicket() {
  const { mutate: refreshTickets } = useSWR('/api/support/tickets')

  const assignTicketAction = async (ticketId: string, assignedTo: string) => {
    const { data, error } = await assignTicket(ticketId, assignedTo)
    if (error) {
      throw new Error(error.message)
    }
    // Refresh tickets list
    await refreshTickets()
    return data
  }

  return {
    assignTicket: assignTicketAction
  }
}

// ===== RESOLVE TICKET HOOK =====
export function useResolveTicket() {
  const { mutate: refreshTickets } = useSWR('/api/support/tickets')

  const resolveTicketAction = async (ticketId: string) => {
    const { data, error } = await resolveTicket(ticketId)
    if (error) {
      throw new Error(error.message)
    }
    // Refresh tickets list
    await refreshTickets()
    return data
  }

  return {
    resolveTicket: resolveTicketAction
  }
}

// ===== CLOSE TICKET HOOK =====
export function useCloseTicket() {
  const { mutate: refreshTickets } = useSWR('/api/support/tickets')

  const closeTicketAction = async (ticketId: string) => {
    const { data, error } = await closeTicket(ticketId)
    if (error) {
      throw new Error(error.message)
    }
    // Refresh tickets list
    await refreshTickets()
    return data
  }

  return {
    closeTicket: closeTicketAction
  }
}

// ===== ADD TICKET MESSAGE HOOK =====
export function useAddTicketMessage() {
  const addMessageAction = async (ticketId: string, dto: CreateMessageDto) => {
    const { data, error } = await addTicketMessage(ticketId, dto)
    if (error) {
      throw new Error(error.message)
    }
    return data
  }

  return {
    addMessage: addMessageAction
  }
}

// ===== TICKET MESSAGES HOOK =====
export function useTicketMessages(ticketId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    ticketId ? `/api/support/tickets/${ticketId}/messages` : null,
    async () => {
      const { data, error } = await getTicketMessages(ticketId)
      if (error) {
        throw new Error(error.message)
      }
      return data
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate
  }
}

// ===== HELP ARTICLES HOOK =====
interface UseHelpArticlesParams {
  page?: number
  limit?: number
  category?: string
  search?: string
}

export function useHelpArticles(params: UseHelpArticlesParams = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/support/help', params],
    async () => {
      const { data, error } = await listHelpArticles(params)
      if (error) {
        throw new Error(error.message)
      }
      return data
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate
  }
}

// ===== SINGLE HELP ARTICLE HOOK =====
export function useHelpArticle(articleId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    articleId ? `/api/support/help/${articleId}` : null,
    async () => {
      const { data, error } = await getHelpArticle(articleId)
      if (error) {
        throw new Error(error.message)
      }
      return data
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate
  }
}

// ===== SUPPORT ANALYTICS HOOK =====
export function useSupportAnalytics() {
  const { data: ticketsResponse } = useSupportTickets()

  const getTicketsByStatus = (status: SupportTicket['status']) => {
    if (!ticketsResponse?.tickets) return []
    return ticketsResponse.tickets.filter(ticket => ticket.status === status)
  }

  const getOpenTickets = () => getTicketsByStatus('OPEN')
  const getInProgressTickets = () => getTicketsByStatus('IN_PROGRESS')
  const getResolvedTickets = () => getTicketsByStatus('RESOLVED')
  const getClosedTickets = () => getTicketsByStatus('CLOSED')

  const getTicketsByPriority = (priority: SupportTicket['priority']) => {
    if (!ticketsResponse?.tickets) return []
    return ticketsResponse.tickets.filter(ticket => ticket.priority === priority)
  }

  const getHighPriorityTickets = () => getTicketsByPriority('HIGH')
  const getUrgentTickets = () => getTicketsByPriority('URGENT')

  const getRecentTickets = (limit: number = 5) => {
    if (!ticketsResponse?.tickets) return []
    return ticketsResponse.tickets
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  const getUnassignedTickets = () => {
    if (!ticketsResponse?.tickets) return []
    return ticketsResponse.tickets.filter(ticket => !ticket.assignedTo)
  }

  return {
    getTicketsByStatus,
    getOpenTickets,
    getInProgressTickets,
    getResolvedTickets,
    getClosedTickets,
    getTicketsByPriority,
    getHighPriorityTickets,
    getUrgentTickets,
    getRecentTickets,
    getUnassignedTickets,
    stats: ticketsResponse?.stats
  }
}

// ===== COMBINED SUPPORT MANAGEMENT HOOK =====
export function useSupportManagement() {
  const { data: tickets, error: ticketsError, isLoading: isLoadingTickets } = useSupportTickets()
  const { createTicket } = useCreateSupportTicket()
  const { updateTicket } = useUpdateSupportTicket()
  const { deleteTicket } = useDeleteSupportTicket()
  const { assignTicket } = useAssignTicket()
  const { resolveTicket } = useResolveTicket()
  const { closeTicket } = useCloseTicket()
  const { addMessage } = useAddTicketMessage()

  return {
    // Tickets data
    tickets,
    isLoadingTickets,
    isErrorTickets: !!ticketsError,
    ticketsError,

    // Actions
    createTicket,
    updateTicket,
    deleteTicket,
    assignTicket,
    resolveTicket,
    closeTicket,
    addMessage
  }
}
