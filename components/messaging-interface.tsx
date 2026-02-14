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
    product: PrismaProduct & { images: { url: string }[] }
    messages: FullMessage[]
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
    initialConversations?: FullConversation[];
}

export default function MessagingInterface({
    impersonatedUserId,
    readOnly = false,
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

    const [conversations, setConversations] = useState<FullConversation[]>(initialConversations)
    const [selectedConversation, setSelectedConversation] = useState<FullConversation | null>(null)
    const [messages, setMessages] = useState<FullMessage[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [showMobileChat, setShowMobileChat] = useState(false)
    const [showMobileAbout, setShowMobileAbout] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [sellerInfo, setSellerInfo] = useState<any>(null)
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)
    const [isLoadingSellerInfo, setIsLoadingSellerInfo] = useState(false)
    const [isOtherTyping, setIsOtherTyping] = useState(false)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Attach menu state
    const [showAttachMenu, setShowAttachMenu] = useState(false)
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])

    // Voice recording state
    const [isVoiceMode, setIsVoiceMode] = useState(false)
    const voiceRecorder = useVoiceRecorder()

    // Socket.io integration
    const { centrifuge, isConnected, subscribe } = useSocket()
    const previousConversationRef = useRef<string | null>(null)

    // Load conversations (only if not provided initially)
    useEffect(() => {
        if (currentUserId && initialConversations.length === 0) {
            fetchConversations()
        }
    }, [currentUserId, initialConversations])

    // Auto-select conversation from URL
    useEffect(() => {
        const conversationId = searchParams?.get("conversation")
        if (conversationId && conversations.length > 0) {
            const conv = conversations.find(c => c.id === conversationId)
            if (conv) {
                setSelectedConversation(conv)
                setShowMobileChat(true)
                shouldScrollRef.current = true
                fetchMessages(conv.id)
                fetchSellerInfo(conv)
            }
        }
    }, [searchParams, conversations])

    // Scroll to bottom ONLY within messages container
    useEffect(() => {
        if (shouldScrollRef.current && messages.length > lastMessageCountRef.current) {
            setTimeout(() => {
                const container = messagesContainerRef.current
                if (container) {
                    container.scrollTop = container.scrollHeight
                }
            }, 50)
        }
        lastMessageCountRef.current = messages.length
    }, [messages])



    // Centrifugo: Subscribe to conversation channel
    useEffect(() => {
        if (!selectedConversation || !isConnected) return

        const channel = `conversation:${selectedConversation.id}`

        const unsubscribe = subscribe(channel, (ctx) => {
            const message = ctx.data as FullMessage
            const isOwnMessage = message.senderId === currentUserId

            // 1. Update active chat if matching
            if (selectedConversation && selectedConversation.id === message.conversationId) {
                shouldScrollRef.current = true
                setMessages(prev => {
                    if (prev.find(m => m.id === message.id)) return prev
                    return [...prev, message]
                })
            }

            // 2. Update conversation list snippet (Run for ALL messages)
            setConversations(prev => {
                const updated = prev.map(c => {
                    if (c.id === message.conversationId) {
                        return {
                            ...c,
                            messages: [{ ...message, createdAt: new Date() } as unknown as FullMessage]
                        }
                    }
                    return c
                })

                // Move updated conversation to top
                return updated.sort((a, b) => {
                    if (a.id === message.conversationId) return -1
                    if (b.id === message.conversationId) return 1
                    return new Date(b.messages[0]?.createdAt || b.createdAt).getTime() - new Date(a.messages[0]?.createdAt || a.createdAt).getTime()
                })
            })
        })

        return () => {
            unsubscribe()
        }
    }, [selectedConversation, isConnected, subscribe, currentUserId])

    // Typing indicator - Centrifugo doesn't have built-in ephemeral messages in the same way as easy socket.io
    // For now, we'll disable typing indicators or implement via separate channel publication later if needed.
    // To keep it simple and fix errors, we remove the broken socket code.

    // Emit typing status (Placeholder)
    const emitTypingStatus = (isTyping: boolean) => {
        // Feature temporarily disabled until Centrifugo presence/RPC is configured
    }

    const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return;
        setNewMessage(e.target.value)

        // Emit typing status with debounce
        emitTypingStatus(true)

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            emitTypingStatus(false)
        }, 3000)
    }

    const fetchConversations = async () => {
        try {
            setIsLoading(true)
            const res = await fetch("/api/chat/conversations")
            if (res.ok) {
                const data = await res.json()
                setConversations(data)
            }
        } catch (error) {
            console.error("Failed to fetch conversations:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchMessages = async (conversationId: string) => {
        try {
            setIsLoadingMessages(true)
            const res = await fetch(`/api/chat/conversations/${conversationId}/messages`)
            if (res.ok) {
                const data = await res.json()

                setMessages(prev => {
                    // Keep messages that are NOT in the polled data AND are currently 'sending'
                    // This ensures optimistic messages stay until replaced/confirmed
                    const localSending = prev.filter(m => m.status === 'sending')

                    // Avoid duplicates if the data already contains the message
                    const filteredLocal = localSending.filter(lm => !data.some((dm: any) => dm.id === lm.id))

                    // Sort by date to keep order
                    return [...data, ...filteredLocal].sort((a, b) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    )
                })
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error)
        } finally {
            setIsLoadingMessages(false)
        }
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
        setMessages(prev => [...prev, optimisticMessage])

        // Optimistic update for sidebar
        setConversations(prev => {
            return prev.map(c => {
                if (c.id === selectedConversation.id) {
                    return {
                        ...c,
                        messages: [optimisticMessage]
                    }
                }
                return c
            }).sort((a, b) => {
                if (a.id === selectedConversation.id) return -1
                if (b.id === selectedConversation.id) return 1
                return new Date(b.messages[0]?.createdAt || b.createdAt).getTime() - new Date(a.messages[0]?.createdAt || a.createdAt).getTime()
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
                setMessages(prev => {
                    // Check if the real message was already added by the socket listener
                    if (prev.some(m => m.id === realMessage.id)) {
                        // If so, just remove the temporary one
                        return prev.filter(m => m.id !== tempId)
                    }
                    // Otherwise, upgrade the temporary one to real
                    return prev.map(m => m.id === tempId ? { ...realMessage, status: 'sent' } : m)
                })

                // Update conversation list snippet
                setConversations(prev => {
                    return prev.map(c => {
                        if (c.id === selectedConversation.id) {
                            return {
                                ...c,
                                messages: [{ ...realMessage, createdAt: new Date().toISOString() }] // Update snippet
                            }
                        }
                        return c
                    }).sort((a, b) => {
                        // Move updated conversation to top
                        if (a.id === selectedConversation.id) return -1
                        if (b.id === selectedConversation.id) return 1
                        return new Date(b.messages[0]?.createdAt || b.createdAt).getTime() - new Date(a.messages[0]?.createdAt || a.createdAt).getTime()
                    })
                })
            } else {
                // Mark as failed
                setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m))
            }
        } catch (error) {
            console.error("Failed to send message:", error)
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m))
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
        setMessages(prev => [...prev, optimisticMessage])

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
                setMessages(prev => {
                    if (prev.some(m => m.id === realMessage.id)) {
                        return prev.filter(m => m.id !== tempId)
                    }
                    return prev.map(m => m.id === tempId ? { ...realMessage, status: 'sent' } : m)
                })
            } else {
                throw new Error('API failed')
            }
        } catch (error) {
            console.error('Voice send error:', error)
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m))
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
            alert('Geolocation is not supported by your browser')
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
                alert('Unable to get your location')
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
        fetchMessages(conv.id)
        fetchSellerInfo(conv)
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
        const failedMessage = messages.find(m => m.id === messageId)
        if (!failedMessage) return

        // Remove the failed message
        setMessages(prev => prev.filter(m => m.id !== messageId))

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
            <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileSelect(e, 'image')} />
            <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden" onChange={(e) => handleFileSelect(e, 'video')} />
            <input ref={fileInputRef} type="file" accept="*/*" multiple className="hidden" onChange={(e) => handleFileSelect(e, 'file')} />

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
                    {isLoading ? (
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
                                            <p className="truncate text-xs text-gray-400 mt-1">{lastMessage.message}</p>
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
                                <Link href={`/product/${selectedConversation.productId}`} className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 cursor-pointer hover:ring-2 hover:ring-[#E87A3F]">
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
                                    <Link href={`/product/${selectedConversation.productId}`} className="block">
                                        <p className="truncate font-semibold hover:text-[#E87A3F] transition-colors">{selectedConversation.product.name}</p>
                                    </Link>
                                ) : (
                                    <p className="truncate font-semibold">Product Unavailable</p>
                                )}
                                <p className="truncate text-xs text-gray-500">
                                    {getOtherParticipant(selectedConversation).name || "User"}
                                    <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                        {getOtherParticipantRole(selectedConversation)}
                                    </span>
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                                <Flag className="size-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 scrollbar-hide">
                            {isLoadingMessages ? (
                                <ConversationSkeleton />
                            ) : (
                                <div className="space-y-3">
                                    {messages.map((msg) => (
                                        <MessageBubble
                                            key={msg.id}
                                            message={{
                                                ...msg,
                                                latitude: msg.latitude ?? undefined,
                                                longitude: msg.longitude ?? undefined,
                                                attachments: msg.attachments as unknown as Attachment[] | undefined,
                                                createdAt: new Date(msg.createdAt).toISOString(),
                                            }}
                                            isOwn={msg.senderId === session?.user?.id}
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
                                <Link href={`/profile/${getOtherParticipant(selectedConversation).id}`}>
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
                            <Link href={`/profile/${getOtherParticipant(selectedConversation).id}`}>
                                <Button variant="outline" className="mt-6 w-full h-12 border-[#E87A3F] text-[#E87A3F] hover:bg-orange-50 rounded-xl font-semibold">
                                    <UserIcon className="mr-2 size-5" />
                                    View Full Profile
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
