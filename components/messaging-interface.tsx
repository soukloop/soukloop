"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Send, Search, ArrowLeft, Package, Flag, Calendar, Tag, ShoppingBag, User as UserIcon, Paperclip, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSocket } from "@/components/providers/socket-provider"
import { toast } from "sonner"
import { useVoiceRecorder, formatDuration } from "@/hooks/useVoiceRecorder"
import { AttachMenu } from "@/components/chat/AttachMenu"
import { VoiceRecorder } from "@/components/chat/VoiceRecorder"
import { MediaPreview, AttachedFile } from "@/components/chat/MediaPreview"
import { MessageBubble } from "@/components/chat/MessageBubble"
import { ChatListSkeleton, ConversationSkeleton, AboutUserSkeleton } from "@/components/chat/ChatSkeletons"
import { PremiumBadge } from "@/components/ui/premium-badge"
import UserReportModal from "@/components/chat/user-report-modal"
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Types
import { ChatConversation, ChatMessage, User, Product as PrismaProduct } from "@prisma/client"

// API returns partial user info
type PublicUser = Pick<User, "id" | "name" | "image" | "createdAt"> & {
    vendor?: { logo: string | null } | null
    profile?: { avatar: string | null } | null
}

// Helper to get the best available user image
const getUserImage = (user: PublicUser) => {
    // Prioritize user profile image as requested
    return user.profile?.avatar || user.vendor?.logo || user.image
}

// Extended types with relations
interface FullMessage extends ChatMessage {
    sender: PublicUser
}

interface FullConversation extends ChatConversation {
    buyer: PublicUser
    seller: PublicUser
    product: PrismaProduct & { images: { url: string }[], slug: string }
    messages: FullMessage[]
    _count?: {
        messages: number
    }
}

interface Attachment {
    type: string;
    url: string;
    name: string;
    size?: number;
    mimeType: string;
    duration?: number;
}





const MAX_FILES = 4

interface MessagingInterfaceProps {
    impersonatedUserId?: string;
    readOnly?: boolean;
    isAdmin?: boolean;
    initialConversations?: FullConversation[];
}

export default function MessagingInterface({
    impersonatedUserId,
    readOnly = false,
    isAdmin = false,
    initialConversations = []
}: MessagingInterfaceProps = {}) {
    const { data: session } = useSession()
    // Use impersonatedUserId if provided, otherwise fallback to session user
    const currentUserId = impersonatedUserId || session?.user?.id

    const searchParams = useSearchParams()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const lastMessageCountRef = useRef<number>(0)
    const shouldScrollRef = useRef<boolean>(true)
    const imageInputRef = useRef<HTMLInputElement>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const queryClient = useQueryClient()
    const [selectedConversation, setSelectedConversation] = useState<FullConversation | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [showMobileChat, setShowMobileChat] = useState(false)
    const [showMobileAbout, setShowMobileAbout] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [sellerInfo, setSellerInfo] = useState<any>(null)
    const [isLoadingSellerInfo, setIsLoadingSellerInfo] = useState(false)
    const [isOtherTyping, setIsOtherTyping] = useState(false)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Attach menu state
    const [showAttachMenu, setShowAttachMenu] = useState(false)
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])

    // Voice recording state
    const [isVoiceMode, setIsVoiceMode] = useState(false)
    const voiceRecorder = useVoiceRecorder()

    // Report modal state
    const [isReportModalOpen, setIsReportModalOpen] = useState(false)

    // Socket.io integration
    const { centrifuge, isConnected, subscribe } = useSocket()
    const previousConversationRef = useRef<string | null>(null)

    const { data: conversationsData, isLoading: isLoadingConversations } = useQuery({
        queryKey: ['chat', 'conversations'],
        queryFn: async () => {
            const res = await fetch("/api/chat/conversations")
            if (!res.ok) throw new Error("Failed to fetch conversations")
            return res.json() as Promise<FullConversation[]>
        },
        enabled: !!currentUserId && initialConversations.length === 0,
        initialData: initialConversations.length > 0 ? initialConversations : undefined,
    })
    const conversations = conversationsData || []

    const {
        data: messagesData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingMessages
    } = useInfiniteQuery({
        queryKey: ['chat', 'messages', selectedConversation?.id],
        queryFn: async ({ pageParam = null }) => {
            const url = new URL(window.location.origin + `/api/chat/conversations/${selectedConversation!.id}/messages`)
            if (pageParam) url.searchParams.set('cursor', pageParam as string)
            const res = await fetch(url.toString())
            if (!res.ok) throw new Error("Failed to fetch messages")
            return res.json() as Promise<{ messages: FullMessage[], nextCursor: string | null }>
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!selectedConversation?.id,
        initialPageParam: null as string | null
    })

    const messages = messagesData?.pages
        ? [...messagesData.pages].reverse().flatMap(page => page.messages)
        : []

    // Infinite scroll observer
    const topObserverRef = useRef<IntersectionObserver | null>(null)
    const loadingTriggerRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoadingMessages || isFetchingNextPage) return
        if (topObserverRef.current) topObserverRef.current.disconnect()
        topObserverRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                const container = messagesContainerRef.current;
                const prevHeight = container ? container.scrollHeight : 0;
                fetchNextPage().then(() => {
                    setTimeout(() => {
                        if (container) container.scrollTop = container.scrollTop + (container.scrollHeight - prevHeight);
                    }, 0);
                });
            }
        })
        if (node) topObserverRef.current.observe(node)
    }, [isLoadingMessages, isFetchingNextPage, hasNextPage, fetchNextPage])

    // Load seller info when conversation changes
    useEffect(() => {
        if (selectedConversation) fetchSellerInfo(selectedConversation)
    }, [selectedConversation])

    // Auto-select conversation from URL
    useEffect(() => {
        const conversationId = searchParams?.get("conversation")
        if (conversationId && conversations.length > 0 && !selectedConversation) {
            const conv = conversations.find(c => c.id === conversationId)
            if (conv) {
                setSelectedConversation(conv)
                setShowMobileChat(true)
                shouldScrollRef.current = true
            }
        }
    }, [searchParams, conversations, selectedConversation])

    // Scroll to bottom ONLY within messages container
    useEffect(() => {
        if (shouldScrollRef.current && messages.length > lastMessageCountRef.current) {
            setTimeout(() => {
                const container = messagesContainerRef.current
                if (container) container.scrollTop = container.scrollHeight
            }, 50)
        }
        lastMessageCountRef.current = messages.length
    }, [messages])

    // Centrifugo: Subscribe to conversation channel
    useEffect(() => {
        if (!selectedConversation || !isConnected) return

        const channel = `conversation:${selectedConversation.id}`

        const unsubscribe = subscribe(channel, (ctx) => {
            const eventPayload = ctx.data as any
            const message = (eventPayload?.type === 'new-message' ? eventPayload.data : eventPayload) as FullMessage
            const isOwnMessage = message.senderId === currentUserId

            // 1. Update active chat if matching
            if (selectedConversation && selectedConversation.id === message.conversationId) {
                shouldScrollRef.current = true
                queryClient.setQueryData(
                    ['chat', 'messages', selectedConversation.id],
                    (oldData: any) => {
                        if (!oldData) return oldData

                        // Check if message already exists (from optimistic update)
                        const exists = oldData.pages.some((page: any) =>
                            page.messages.some((m: any) => m.id === message.id)
                        )
                        if (exists) return oldData

                        const newPages = [...oldData.pages]
                        // Append to the page that has the newest messages, which is page 0.
                        newPages[0] = {
                            ...newPages[0],
                            messages: [...newPages[0].messages, { ...message, status: 'sent', createdAt: new Date(message.createdAt).toISOString() }]
                        }
                        return { ...oldData, pages: newPages }
                    }
                )
            }

            // 2. Update conversation list snippet
            queryClient.setQueryData(
                ['chat', 'conversations'],
                (oldConvs: FullConversation[] | undefined) => {
                    if (!oldConvs) return oldConvs
                    const updated = oldConvs.map(c => {
                        if (c.id === message.conversationId) {
                            const isCurrentlySelected = selectedConversation?.id === message.conversationId;
                            const newUnreadCount = (!isCurrentlySelected && !isOwnMessage)
                                ? (c._count?.messages || 0) + 1
                                : (c._count?.messages || 0);

                            return {
                                ...c,
                                messages: [{ ...message, createdAt: new Date().toISOString() } as unknown as FullMessage],
                                _count: { ...c._count, messages: newUnreadCount }
                            }
                        }
                        return c
                    })
                    return updated.sort((a, b) => {
                        const dateA = new Date(a.messages?.[0]?.createdAt || a.createdAt).getTime()
                        const dateB = new Date(b.messages?.[0]?.createdAt || b.createdAt).getTime()
                        return dateB - dateA
                    })
                }
            )
        })

        return () => {
            unsubscribe()
        }
    }, [selectedConversation, isConnected, subscribe, currentUserId, queryClient])

    // Emit typing status (Placeholder)
    const emitTypingStatus = (isTyping: boolean) => {
        // Feature temporarily disabled until Centrifugo presence/RPC is configured
    }

    const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return;
        setNewMessage(e.target.value)

        emitTypingStatus(true)

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            emitTypingStatus(false)
        }, 3000)
    }
    const fetchSellerInfo = async (conv: FullConversation) => {
        const otherUserId = conv.buyerId === currentUserId ? conv.sellerId : conv.buyerId
        try {
            setIsLoadingSellerInfo(true)
            const res = await fetch(`/api/users/${otherUserId}/profile`)
            if (res.ok) {
                const data = await res.json()
                setSellerInfo(data)
            }
        } catch (error) {
            const otherUser = conv.buyerId === currentUserId ? conv.seller : conv.buyer
            setSellerInfo({
                name: otherUser.name,
                image: getUserImage(otherUser),
                createdAt: otherUser.createdAt || conv.createdAt,
                productsCount: 0,
                activeAdsCount: 0
            })
        } finally {
            setIsLoadingSellerInfo(false)
        }
    }

    // Determine if the other participant is a seller or buyer
    const getOtherParticipantRole = (conv: FullConversation) => {
        // If current user is the buyer, other is seller. Vice versa.
        return conv.buyerId === currentUserId ? "Seller" : "Buyer"
    }

    // Upload file to local storage
    const uploadFile = async (file: File, type: string): Promise<string | null> => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('mediaType', type)

            const res = await fetch('/api/chat/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) throw new Error('Failed to upload file')

            const { fileUrl } = await res.json()
            return fileUrl
        } catch (error) {
            console.error('Upload error:', error)
            return null
        }
    }

    // Send message with optimistic update
    const sendMessage = async (options?: {
        attachments?: Attachment[],
        messageType?: string,
        latitude?: number,
        longitude?: number
    }) => {
        if (readOnly) return;
        const messageText = newMessage.trim()
        if (!messageText && !options?.attachments?.length && options?.messageType !== 'location') return
        if (!selectedConversation || isSending) return

        // Create optimistic message
        const tempId = `temp-${Date.now()}`
        const optimisticMessage: any = { // Using any for optimistic to avoid strict typing issues with Prisma types
            id: tempId,
            message: messageText || null,
            messageType: options?.messageType || (options?.attachments?.length ? options.attachments[0].type : 'text'),
            attachments: options?.attachments,
            latitude: options?.latitude,
            longitude: options?.longitude,
            status: 'sending',
            createdAt: new Date().toISOString(),
            senderId: currentUserId || '',
            chatConversationId: selectedConversation.id,
            sender: {
                id: currentUserId || '',
                name: session?.user?.name || null,
                image: session?.user?.image || null,
                email: session?.user?.email || null,
                emailVerified: null,
                role: 'USER',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                storeName: null,
                bio: null,
                phone: null,
                password: null
            }
        }

        // Add optimistically
        shouldScrollRef.current = true
        queryClient.setQueryData(['chat', 'messages', selectedConversation.id], (oldData: any) => {
            if (!oldData) return oldData
            const newPages = [...oldData.pages]
            newPages[0] = {
                ...newPages[0],
                messages: [...newPages[0].messages, optimisticMessage]
            }
            return { ...oldData, pages: newPages }
        })

        // Optimistic update for sidebar
        queryClient.setQueryData(['chat', 'conversations'], (oldConvs: FullConversation[] | undefined) => {
            if (!oldConvs) return oldConvs
            const updated = oldConvs.map(c => {
                if (c.id === selectedConversation.id) {
                    return {
                        ...c,
                        messages: [optimisticMessage]
                    }
                }
                return c
            })
            return updated.sort((a, b) => {
                const dateA = new Date(a.messages?.[0]?.createdAt || a.createdAt).getTime()
                const dateB = new Date(b.messages?.[0]?.createdAt || b.createdAt).getTime()
                return dateB - dateA
            })
        })
        setNewMessage("")
        setAttachedFiles([])

        // Stop typing indicator on send
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        emitTypingStatus(false)

        try {
            setIsSending(true)
            const res = await fetch(`/api/chat/conversations/${selectedConversation.id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: messageText || null,
                    messageType: options?.messageType || 'text',
                    attachments: options?.attachments,
                    latitude: options?.latitude,
                    longitude: options?.longitude
                })
            })

            if (res.ok) {
                const realMessage = await res.json()
                // Replace optimistic with real, avoiding duplicates if socket arrival was faster
                queryClient.setQueryData(['chat', 'messages', selectedConversation.id], (oldData: any) => {
                    if (!oldData) return oldData
                    const newPages = [...oldData.pages]

                    if (newPages[0].messages.some((m: any) => m.id === realMessage.id)) {
                        newPages[0] = {
                            ...newPages[0],
                            messages: newPages[0].messages.filter((m: any) => m.id !== tempId)
                        }
                    } else {
                        newPages[0] = {
                            ...newPages[0],
                            messages: newPages[0].messages.map((m: any) => m.id === tempId ? { ...realMessage, status: 'sent' } : m)
                        }
                    }
                    return { ...oldData, pages: newPages }
                })

                // Update conversation list snippet
                queryClient.setQueryData(['chat', 'conversations'], (oldConvs: FullConversation[] | undefined) => {
                    if (!oldConvs) return oldConvs
                    const updated = oldConvs.map(c => {
                        if (c.id === selectedConversation.id) {
                            return {
                                ...c,
                                messages: [{ ...realMessage, createdAt: new Date().toISOString() } as unknown as FullMessage]
                            }
                        }
                        return c
                    })
                    return updated.sort((a, b) => {
                        const dateA = new Date(a.messages?.[0]?.createdAt || a.createdAt).getTime()
                        const dateB = new Date(b.messages?.[0]?.createdAt || b.createdAt).getTime()
                        return dateB - dateA
                    })
                })
            } else {
                // Mark as failed
                queryClient.setQueryData(['chat', 'messages', selectedConversation.id], (oldData: any) => {
                    if (!oldData) return oldData
                    const newPages = [...oldData.pages]
                    newPages[0] = {
                        ...newPages[0],
                        messages: newPages[0].messages.map((m: any) => m.id === tempId ? { ...m, status: 'failed' } : m)
                    }
                    return { ...oldData, pages: newPages }
                })
            }
        } catch (error) {
            console.error("Failed to send message:", error)
            queryClient.setQueryData(['chat', 'messages', selectedConversation.id], (oldData: any) => {
                if (!oldData) return oldData
                const newPages = [...oldData.pages]
                newPages[0] = {
                    ...newPages[0],
                    messages: newPages[0].messages.map((m: any) => m.id === tempId ? { ...m, status: 'failed' } : m)
                }
                return { ...oldData, pages: newPages }
            })
        } finally {
            setIsSending(false)
        }
    }

    // Handle sending with attachments
    const handleSendWithAttachments = async () => {
        if (readOnly) return;
        if (attachedFiles.length === 0 && !newMessage.trim()) return

        setIsSending(true)
        const uploadedAttachments: Attachment[] = []

        // Upload all files
        for (const file of attachedFiles) {
            const url = await uploadFile(file.file, file.type)
            if (url) {
                uploadedAttachments.push({
                    type: file.type,
                    url,
                    name: file.file.name,
                    size: file.file.size,
                    mimeType: file.file.type
                })
            }
        }

        await sendMessage({
            attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined
        })
    }

    // Handle voice message send - stops recording and sends immediately
    const handleSendVoice = async () => {
        if (readOnly) return;
        // Capture duration before stopping
        const recordedDuration = voiceRecorder.duration

        // EXIT VOICE MODE IMMEDIATELY so UI feels snappy
        setIsVoiceMode(false)

        // STOP RECORDING AND WAIT FOR BLOB (returns promise now)
        const audioBlob = await voiceRecorder.stopRecording()

        if (!audioBlob || audioBlob.size < 100) {
            console.warn('Voice recording empty or too short', audioBlob?.size)
            voiceRecorder.resetRecording()
            return
        }

        // CREATE OPTIMISTIC MESSAGE IMMEDIATELY
        const tempId = `temp-voice-${Date.now()}`
        const tempUrl = URL.createObjectURL(audioBlob)

        const optimisticMessage: any = {
            id: tempId,
            message: null,
            messageType: 'voice',
            attachments: [{
                type: 'voice',
                url: tempUrl,
                name: 'Voice message',
                mimeType: audioBlob.type || 'audio/webm',
                duration: recordedDuration
            }],
            status: 'sending',
            createdAt: new Date().toISOString(),
            senderId: currentUserId || '',
            chatConversationId: selectedConversation?.id || '',
            sender: {
                id: currentUserId || '',
                name: session?.user?.name || null,
                image: session?.user?.image || null,
                email: session?.user?.email || null,
                emailVerified: null,
                role: 'USER',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                storeName: null,
                bio: null,
                phone: null,
                password: null
            }
        }

        shouldScrollRef.current = true
        queryClient.setQueryData(['chat', 'messages', selectedConversation?.id], (oldData: any) => {
            if (!oldData) return oldData
            const newPages = [...oldData.pages]
            newPages[0] = {
                ...newPages[0],
                messages: [...newPages[0].messages, optimisticMessage]
            }
            return { ...oldData, pages: newPages }
        })

        try {
            setIsSending(true)

            // Upload in background
            const mimeType = audioBlob.type || 'audio/webm'
            const extension = mimeType.includes('mp4') ? 'mp4' : 'webm'

            const url = await uploadFile(
                new File([audioBlob], `voice.${extension}`, { type: mimeType }),
                'voice'
            )

            if (!url) throw new Error('Upload failed')

            // Call API with real URL
            const res = await fetch(`/api/chat/conversations/${selectedConversation?.id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: null,
                    messageType: 'voice',
                    attachments: [{
                        type: 'voice',
                        url,
                        name: 'Voice message',
                        mimeType: 'audio/mpeg', // Server converts to mp3
                        duration: recordedDuration
                    }]
                })
            })

            if (res.ok) {
                const realMessage = await res.json()
                // Replace optimistic with real, avoiding duplicates
                queryClient.setQueryData(['chat', 'messages', selectedConversation?.id], (oldData: any) => {
                    if (!oldData) return oldData
                    const newPages = [...oldData.pages]

                    if (newPages[0].messages.some((m: any) => m.id === realMessage.id)) {
                        newPages[0] = {
                            ...newPages[0],
                            messages: newPages[0].messages.filter((m: any) => m.id !== tempId)
                        }
                    } else {
                        newPages[0] = {
                            ...newPages[0],
                            messages: newPages[0].messages.map((m: any) => m.id === tempId ? { ...realMessage, status: 'sent' } : m)
                        }
                    }
                    return { ...oldData, pages: newPages }
                })
            } else {
                throw new Error('API failed')
            }
        } catch (error) {
            console.error('Voice send error:', error)
            queryClient.setQueryData(['chat', 'messages', selectedConversation?.id], (oldData: any) => {
                if (!oldData) return oldData
                const newPages = [...oldData.pages]
                newPages[0] = {
                    ...newPages[0],
                    messages: newPages[0].messages.map((m: any) => m.id === tempId ? { ...m, status: 'failed' } : m)
                }
                return { ...oldData, pages: newPages }
            })
        } finally {
            voiceRecorder.resetRecording()
            setIsSending(false)
            // Cleanup temp URL after a bit
            setTimeout(() => URL.revokeObjectURL(tempUrl), 10000)
        }
    }

    // Handle location send
    const handleSendLocation = async () => {
        if (readOnly) return;
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser')
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                await sendMessage({
                    messageType: 'location',
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                })
            },
            (error) => {
                console.error('Geolocation error:', error)
                toast.error('Unable to get your location')
            }
        )
    }

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
        if (readOnly) return;
        const files = e.target.files
        if (!files) return

        const remaining = MAX_FILES - attachedFiles.length
        const filesToAdd = Array.from(files).slice(0, remaining)

        const newFiles: AttachedFile[] = filesToAdd.map(file => ({
            id: `${Date.now()}-${Math.random()}`,
            file,
            type,
            preview: type !== 'file' ? URL.createObjectURL(file) : undefined
        }))

        setAttachedFiles(prev => [...prev, ...newFiles])
        e.target.value = ''
    }

    const removeAttachedFile = (id: string) => {
        if (readOnly) return;
        setAttachedFiles(prev => {
            const file = prev.find(f => f.id === id)
            if (file?.preview) URL.revokeObjectURL(file.preview)
            return prev.filter(f => f.id !== id)
        })
    }

    const handleSelectConversation = (conv: FullConversation) => {
        setSelectedConversation(conv)
        setShowMobileChat(true)
        shouldScrollRef.current = true
        fetchSellerInfo(conv)

        if (conv._count?.messages && conv._count.messages > 0) {
            queryClient.setQueryData(
                ['chat', 'conversations'],
                (oldConvs: FullConversation[] | undefined) => {
                    if (!oldConvs) return oldConvs
                    return oldConvs.map(c => {
                        if (c.id === conv.id) {
                            return {
                                ...c,
                                _count: { ...c._count, messages: 0 }
                            }
                        }
                        return c
                    })
                }
            )
        }
    }

    const getOtherParticipant = (conv: FullConversation) => {
        return conv.buyerId === currentUserId ? conv.seller : conv.buyer
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const today = new Date()
        if (date.toDateString() === today.toDateString()) return "Today"
        return date.toLocaleDateString()
    }

    const formatMemberSince = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    }

    const filteredConversations = conversations.filter(conv => {
        if (!conv.product) return false
        const other = getOtherParticipant(conv)
        const searchLower = searchQuery.toLowerCase()
        return (
            other.name?.toLowerCase().includes(searchLower) ||
            conv.product.name.toLowerCase().includes(searchLower)
        )
    })

    // Retry failed message
    const handleRetryMessage = async (messageId: string) => {
        if (readOnly) return;
        const failedMessage = messages.find((m: any) => m.id === messageId)
        if (!failedMessage) return

        // Remove the failed message
        queryClient.setQueryData(['chat', 'messages', selectedConversation?.id], (oldData: any) => {
            if (!oldData) return oldData
            const newPages = [...oldData.pages]
            newPages[0] = {
                ...newPages[0],
                messages: newPages[0].messages.filter((m: any) => m.id !== messageId)
            }
            return { ...oldData, pages: newPages }
        })

        // Resend
        await sendMessage({
            attachments: (failedMessage.attachments as unknown as Attachment[]) || undefined,
            messageType: failedMessage.messageType,
            latitude: failedMessage.latitude ?? undefined,
            longitude: failedMessage.longitude ?? undefined
        })
    }

    if (!session && !currentUserId) {
        return (
            <div className="flex h-[600px] items-center justify-center rounded-lg border bg-gray-50">
                <p className="text-gray-500">Please sign in to view messages</p>
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-180px)] min-h-[600px] overflow-hidden rounded-xl border bg-white shadow-sm" style={{ overflowX: 'hidden' }}>
            {/* Hidden file inputs */}
            <input ref={imageInputRef} type="file" accept="image/jpeg, image/png, image/webp" multiple className="hidden" onChange={(e) => handleFileSelect(e, 'image')} />
            <input ref={videoInputRef} type="file" accept="video/mp4, video/quicktime" multiple className="hidden" onChange={(e) => handleFileSelect(e, 'video')} />
            <input ref={fileInputRef} type="file" accept=".pdf, .doc, .docx, .txt, application/pdf" multiple className="hidden" onChange={(e) => handleFileSelect(e, 'file')} />

            {/* ========== COLUMN 1: Conversations List ========== */}
            <div className={`flex w-full flex-col border-r lg:w-[280px] ${showMobileChat ? "hidden lg:flex" : "flex"}`}>
                <div className="flex h-14 shrink-0 items-center border-b px-4">
                    <h2 className="text-lg font-bold">Messages</h2>
                </div>

                <div className="border-b p-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 pl-9 text-sm"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    {isLoadingConversations ? (
                        <ChatListSkeleton />
                    ) : filteredConversations.length === 0 ? (
                        <div className="flex h-32 items-center justify-center">
                            <p className="text-gray-500">No conversations yet</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const lastMessage = conv.messages[0]
                            const isSelected = selectedConversation?.id === conv.id
                            const productName = conv.product?.name || "Product Unavailable"
                            const productImage = conv.product?.images?.[0]?.url

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`flex cursor-pointer gap-3 border-b p-3 transition-colors hover:bg-gray-50 ${isSelected ? "bg-orange-50 border-l-4 border-l-[#E87A3F]" : ""}`}
                                >
                                    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                        {productImage ? (
                                            <Image src={productImage} alt={productName} fill className="object-cover" />
                                        ) : (
                                            <div className="flex size-full items-center justify-center">
                                                <Package className="size-5 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="truncate font-medium text-sm">{productName}</p>
                                            <span className="shrink-0 text-xs text-gray-400">
                                                {lastMessage ? formatDate(lastMessage.createdAt.toString()) : ""}
                                            </span>
                                        </div>
                                        {lastMessage && (
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="truncate text-xs text-gray-400">
                                                    {lastMessage.message || (
                                                        lastMessage.messageType === 'voice' ? '🎤 Voice message' :
                                                            lastMessage.messageType === 'image' ? '📷 Image' :
                                                                lastMessage.messageType === 'video' ? '🎥 Video' :
                                                                    lastMessage.messageType === 'location' ? '📍 Location' :
                                                                        '📎 Attachment'
                                                    )}
                                                </p>
                                                {!isAdmin && conv._count?.messages ? (
                                                    <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E87A3F] text-[10px] font-bold text-white">
                                                        {conv._count.messages > 99 ? '99+' : conv._count.messages}
                                                    </span>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </ScrollArea>
            </div>

            {/* ========== COLUMN 2: Chat Area ========== */}
            <div className={`flex flex-1 flex-col ${showMobileChat ? "flex" : "hidden lg:flex"}`}>
                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
                            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setShowMobileChat(false)}>
                                <ArrowLeft className="size-5" />
                            </Button>
                            {/* Product Image - Click to open product page */}
                            {selectedConversation.product ? (
                                <Link href={isAdmin ? `/admin/products/${selectedConversation.productId}` : `/product/${selectedConversation.product.slug || selectedConversation.productId}`} className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 cursor-pointer hover:ring-2 hover:ring-[#E87A3F]">
                                    {selectedConversation.product.images?.[0]?.url ? (
                                        <Image src={selectedConversation.product.images[0].url} alt={selectedConversation.product.name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex size-full items-center justify-center">
                                            <Package className="size-5 text-gray-400" />
                                        </div>
                                    )}
                                </Link>
                            ) : (
                                <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                    <div className="flex size-full items-center justify-center">
                                        <Package className="size-5 text-gray-400" />
                                    </div>
                                </div>
                            )}
                            {/* User Info - Click to open About panel (mobile) */}
                            <div
                                className="min-w-0 flex-1 cursor-pointer xl:cursor-default"
                                onClick={() => setShowMobileAbout(true)}
                            >
                                {selectedConversation.product ? (
                                    <Link href={isAdmin ? `/admin/products/${selectedConversation.productId}` : `/product/${selectedConversation.product.slug || selectedConversation.productId}`} className="block">
                                        <p className="truncate font-semibold hover:text-[#E87A3F] transition-colors">{selectedConversation.product.name}</p>
                                    </Link>
                                ) : (
                                    <p className="truncate font-semibold">Product Unavailable</p>
                                )}
                                <p className="truncate text-xs text-gray-500 flex items-center gap-1">
                                    {getOtherParticipant(selectedConversation).name || "User"}
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                        {getOtherParticipantRole(selectedConversation)}
                                    </span>
                                </p>
                            </div>
                            {!isAdmin && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-400 hover:text-red-500"
                                    onClick={() => setIsReportModalOpen(true)}
                                >
                                    <Flag className="size-4" />
                                </Button>
                            )}
                        </div>

                        {/* Messages */}
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 scrollbar-hide">
                            {isLoadingMessages && !messages.length ? (
                                <ConversationSkeleton />
                            ) : (
                                <div className="space-y-3">
                                    {hasNextPage && (
                                        <div ref={loadingTriggerRef} className="h-4 flex items-center justify-center">
                                            {isFetchingNextPage && <div className="size-4 rounded-full border-2 border-[#E87A3F] border-t-transparent animate-spin" />}
                                        </div>
                                    )}
                                    {messages.map((msg: any) => (
                                        <MessageBubble
                                            key={msg.id}
                                            message={{
                                                ...msg,
                                                latitude: msg.latitude ?? undefined,
                                                longitude: msg.longitude ?? undefined,
                                                attachments: msg.attachments as unknown as Attachment[] | undefined,
                                                createdAt: new Date(msg.createdAt).toISOString(),
                                            }}
                                            isOwn={msg.senderId === currentUserId}
                                            onRetry={msg.status === 'failed' ? () => handleRetryMessage(msg.id) : undefined}
                                        />
                                    ))}
                                    {isOtherTyping && (
                                        <div className="flex justify-start mb-4">
                                            <div className="bg-gray-100 rounded-2xl px-4 py-2 flex items-center gap-1">
                                                <div className="size-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="size-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="size-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Media Preview */}
                        {attachedFiles.length > 0 && (
                            <MediaPreview files={attachedFiles} onRemove={removeAttachedFile} maxFiles={MAX_FILES} />
                        )}

                        {/* Input Area */}
                        {!readOnly && (
                            <div className="shrink-0 border-t p-3">
                                {isVoiceMode ? (
                                    <VoiceRecorder
                                        isRecording={voiceRecorder.isRecording}
                                        duration={voiceRecorder.duration}
                                        onCancel={() => { voiceRecorder.cancelRecording(); setIsVoiceMode(false) }}
                                        onSend={handleSendVoice}
                                    />
                                ) : (
                                    <form onSubmit={(e) => { e.preventDefault(); attachedFiles.length > 0 ? handleSendWithAttachments() : sendMessage() }} className="flex items-center gap-2">
                                        {/* Attach Button */}
                                        <div className="relative">
                                            <Button type="button" variant="ghost" size="icon" className="size-9 text-gray-500 hover:text-[#E87A3F]" onClick={() => setShowAttachMenu(!showAttachMenu)}>
                                                <Paperclip className="size-5" />
                                            </Button>
                                            <AttachMenu
                                                isOpen={showAttachMenu}
                                                onClose={() => setShowAttachMenu(false)}
                                                onSelectImages={() => imageInputRef.current?.click()}
                                                onSelectVideos={() => videoInputRef.current?.click()}
                                                onSelectFiles={() => fileInputRef.current?.click()}
                                                onSelectLocation={handleSendLocation}
                                            />
                                        </div>

                                        {/* Text Input */}
                                        <Input
                                            placeholder={attachedFiles.length > 0 ? "Add caption..." : "Type a message..."}
                                            value={newMessage}
                                            onChange={handleNewMessageChange}
                                            disabled={isSending}
                                            className="flex-1"
                                        />

                                        {/* Voice/Send Button */}
                                        {newMessage.trim() || attachedFiles.length > 0 ? (
                                            <Button type="submit" disabled={isSending} className="size-9 bg-[#E87A3F] hover:bg-[#d96d34]">
                                                <Send className="size-4" />
                                            </Button>
                                        ) : (
                                            <Button type="button" variant="ghost" size="icon" className="size-9 text-gray-500 hover:text-[#E87A3F]" onClick={() => { setIsVoiceMode(true); voiceRecorder.startRecording() }}>
                                                <Mic className="size-5" />
                                            </Button>
                                        )}
                                    </form>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <Package className="mx-auto mb-4 size-12 text-gray-300" />
                            <p className="text-gray-500">Select a conversation to start messaging</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ========== COLUMN 3: About Seller/Buyer - Desktop ========== */}
            <div className="hidden w-[260px] shrink-0 flex-col border-l xl:flex">
                {selectedConversation ? (
                    <>
                        <div className="flex h-14 shrink-0 items-center border-b px-4">
                            <h3 className="font-bold">About {getOtherParticipantRole(selectedConversation)}</h3>
                        </div>
                        {isLoadingSellerInfo ? (
                            <AboutUserSkeleton />
                        ) : (
                            <div className="flex-1 p-4">
                                <div className="mb-6 text-center">
                                    <Avatar className="mx-auto mb-3 size-16">
                                        <AvatarImage src={sellerInfo?.image || getUserImage(getOtherParticipant(selectedConversation)) || undefined} />
                                        <AvatarFallback className="bg-[#E87A3F] text-white text-xl">
                                            {getOtherParticipant(selectedConversation).name?.charAt(0) || "S"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h4 className="font-semibold">{getOtherParticipant(selectedConversation).name || "Seller"}</h4>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                        <Calendar className="size-4 text-[#E87A3F]" />
                                        <div>
                                            <p className="text-xs text-gray-500">Member Since</p>
                                            <p className="font-medium text-sm">{sellerInfo?.createdAt ? formatMemberSince(sellerInfo.createdAt.toString()) : formatMemberSince(selectedConversation.createdAt.toString())}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                        <Tag className="size-4 text-[#E87A3F]" />
                                        <div>
                                            <p className="text-xs text-gray-500">Ads Posted</p>
                                            <p className="font-medium text-sm">{sellerInfo?.productsCount || "0"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                        <ShoppingBag className="size-4 text-[#E87A3F]" />
                                        <div>
                                            <p className="text-xs text-gray-500">Active Ads</p>
                                            <p className="font-medium text-sm">{sellerInfo?.activeAdsCount || "0"}</p>
                                        </div>
                                    </div>
                                </div>
                                <Link href={isAdmin ? `/admin/users/${getOtherParticipant(selectedConversation).id}` : `/profile/${getOtherParticipant(selectedConversation).id}`}>
                                    <Button variant="outline" className="mt-4 w-full border-[#E87A3F] text-[#E87A3F] hover:bg-orange-50">
                                        <UserIcon className="mr-2 size-4" />
                                        View Profile
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center p-4">
                        <p className="text-center text-sm text-gray-400">Select a conversation to see details</p>
                    </div>
                )}
            </div>

            {/* ========== MOBILE: About Seller/Buyer Panel ========== */}
            {showMobileAbout && selectedConversation && (
                <div className="fixed inset-0 z-50 bg-white xl:hidden">
                    <div className="flex h-14 items-center gap-3 border-b px-4">
                        <Button variant="ghost" size="icon" onClick={() => setShowMobileAbout(false)}>
                            <ArrowLeft className="size-5" />
                        </Button>
                        <h3 className="font-bold">About {getOtherParticipantRole(selectedConversation)}</h3>
                    </div>
                    {isLoadingSellerInfo ? (
                        <AboutUserSkeleton />
                    ) : (
                        <div className="p-4">
                            <div className="mb-6 text-center">
                                <Avatar className="mx-auto mb-3 size-20">
                                    <AvatarImage src={getOtherParticipant(selectedConversation).image || undefined} />
                                    <AvatarFallback className="bg-[#E87A3F] text-white text-2xl">
                                        {getOtherParticipant(selectedConversation).name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <h4 className="text-lg font-semibold">{getOtherParticipant(selectedConversation).name || "User"}</h4>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">
                                    {getOtherParticipantRole(selectedConversation)}
                                </span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                                    <Calendar className="size-5 text-[#E87A3F]" />
                                    <div>
                                        <p className="text-xs text-gray-500">Member Since</p>
                                        <p className="font-medium">{sellerInfo?.createdAt ? formatMemberSince(sellerInfo.createdAt.toString()) : formatMemberSince(selectedConversation.createdAt.toString())}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                                    <Tag className="size-5 text-[#E87A3F]" />
                                    <div>
                                        <p className="text-xs text-gray-500">Ads Posted</p>
                                        <p className="font-medium">{sellerInfo?.productsCount || "0"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                                    <ShoppingBag className="size-5 text-[#E87A3F]" />
                                    <div>
                                        <p className="text-xs text-gray-500">Active Ads</p>
                                        <p className="font-medium">{sellerInfo?.activeAdsCount || "0"}</p>
                                    </div>
                                </div>
                            </div>
                            <Link href={isAdmin ? `/admin/users/${getOtherParticipant(selectedConversation).id}` : `/profile/${getOtherParticipant(selectedConversation).id}`}>
                                <Button variant="outline" className="mt-6 w-full h-12 border-[#E87A3F] text-[#E87A3F] hover:bg-orange-50 rounded-xl font-semibold">
                                    <UserIcon className="mr-2 size-5" />
                                    View Full Profile
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* User Report Modal */}
            {selectedConversation && (
                <UserReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    reportedUserId={getOtherParticipant(selectedConversation).id}
                    reportedUserName={getOtherParticipant(selectedConversation).name || "User"}
                />
            )}
        </div>
    )
}
