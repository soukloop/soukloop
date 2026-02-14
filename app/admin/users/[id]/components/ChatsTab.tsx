"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Package, User, Calendar, MessageSquare, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "@/components/chat/MessageBubble"
import { ChatListSkeleton, ConversationSkeleton } from "@/components/chat/ChatSkeletons"
import { useSocket } from "@/components/providers/socket-provider"
import { useRef } from "react"

interface UserParticipant {
    id: string
    name: string | null
    image: string | null
    vendor?: { logo: string | null } | null
    profile?: { avatar: string | null } | null
}

interface ChatMessage {
    id: string
    conversationId: string
    senderId: string
    message: string | null
    messageType: string
    createdAt: string
    read: boolean
}

interface Conversation {
    id: string
    buyerId: string
    sellerId: string
    productId: string
    createdAt: string
    buyer: UserParticipant
    seller: UserParticipant
    product: {
        id: string
        name: string
        price: number
        images: { url: string }[]
    }
    messages: ChatMessage[]
}

interface ChatsTabProps {
    userId: string
}

export default function ChatsTab({ userId }: ChatsTabProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const { socket, isConnected } = useSocket()
    const [isBuyerTyping, setIsBuyerTyping] = useState(false)
    const [isSellerTyping, setIsSellerTyping] = useState(false)
    const previousConversationRef = useRef<string | null>(null)
    const selectedConvRef = useRef<any>(null)

    useEffect(() => {
        if (userId) fetchConversations()
    }, [userId])

    useEffect(() => { selectedConvRef.current = selectedConv }, [selectedConv])

    // Socket.io integration
    useEffect(() => {
        if (!socket || !isConnected) return

        const handleNewMessage = (newMessage: any) => {
            // 1. Update active chat if matching
            if (selectedConv?.id === newMessage.conversationId) {
                setMessages(prev => {
                    if (prev.find(m => m.id === newMessage.id)) return prev
                    return [...prev, newMessage]
                })
            }

            // 2. Update conversation list order/snippet for ALL messages
            setConversations(prev => {
                const updated = prev.map(c => {
                    if (c.id === newMessage.conversationId) {
                        return {
                            ...c,
                            messages: [{ ...newMessage, createdAt: new Date().toISOString() }]
                        }
                    }
                    return c
                })

                return updated.sort((a, b) => {
                    if (a.id === newMessage.conversationId) return -1
                    if (b.id === newMessage.conversationId) return 1
                    return new Date(b.messages[0]?.createdAt || b.createdAt).getTime() - new Date(a.messages[0]?.createdAt || a.createdAt).getTime()
                })
            })
        }

        const handleTyping = ({ userId, isTyping }: { userId: string, isTyping: boolean }) => {
            if (userId === selectedConv?.buyerId) {
                setIsBuyerTyping(isTyping)
            } else if (userId === selectedConv?.sellerId) {
                setIsSellerTyping(isTyping)
            }
        }

        socket.on('new-message', handleNewMessage)
        socket.on('user-typing', handleTyping)

        return () => {
            socket.off('new-message', handleNewMessage)
            socket.off('user-typing', handleTyping)
        }
    }, [socket, isConnected, selectedConv?.id, selectedConv?.buyerId, selectedConv?.sellerId])

    // Join/Leave Rooms when selecting chat
    useEffect(() => {
        if (!selectedConv || !socket || !isConnected) return

        if (previousConversationRef.current && previousConversationRef.current !== selectedConv.id) {
            socket.emit('leave-conversation', previousConversationRef.current)
        }

        socket.emit('join-conversation', selectedConv.id)
        previousConversationRef.current = selectedConv.id

        // Reset typing indicators when switching chats
        setIsBuyerTyping(false)
        setIsSellerTyping(false)

        fetchMessages(selectedConv.id)

        return () => {
            if (selectedConv && socket) {
                socket.emit('leave-conversation', selectedConv.id)
            }
        }
    }, [selectedConv?.id, socket, isConnected])

    const fetchConversations = async () => {
        setIsLoading(true)
        try {
            // New Admin Endpoint
            const res = await fetch(`/api/admin/users/${userId}/conversations`)
            if (res.ok) {
                const data = await res.json()
                setConversations(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchMessages = async (convId: string, silent = false) => {
        if (!silent) setIsLoadingMessages(true)
        try {
            const res = await fetch(`/api/chat/conversations/${convId}/messages`)
            if (res.ok) {
                const data = await res.json()
                setMessages(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            if (!silent) setIsLoadingMessages(false)
        }
    }

    const filteredConversations = conversations.filter(c => {
        if (!c.product) return false
        return (
            c.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.buyer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.seller.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })

    const getOtherParticipant = (conv: Conversation): UserParticipant => {
        // Safe check for missing participants (deleted users)
        if (!conv.buyer || !conv.seller) return { id: '', name: 'Unknown', image: null };
        return conv.buyerId === userId ? conv.seller : conv.buyer
    }

    const getRole = (conv: Conversation) => {
        return conv.buyerId === userId ? "Seller" : "Buyer"
    }

    const getUserImage = (user: UserParticipant) => {
        return user?.profile?.avatar || user?.image || user?.vendor?.logo
    }

    return (
        <div className="flex h-[600px] overflow-hidden rounded-xl border bg-white shadow-sm">
            {/* Sidebar */}
            <div className="flex w-[300px] flex-col border-r">
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    {isLoading ? <ChatListSkeleton /> : (
                        <div className="divide-y">
                            {filteredConversations.map(conv => {
                                const other = getOtherParticipant(conv)
                                return (
                                    <div
                                        key={conv.id}
                                        onClick={() => setSelectedConv(conv)}
                                        className={`p-3 hover:bg-gray-50 cursor-pointer flex gap-3 ${selectedConv?.id === conv.id ? "bg-orange-50" : ""}`}
                                    >
                                        <div className="size-12 rounded-lg bg-gray-100 relative overflow-hidden shrink-0">
                                            {conv.product.images[0] ? (
                                                <Image src={conv.product.images[0].url} fill className="object-cover" alt="" />
                                            ) : <Package className="m-auto text-gray-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{conv.product.name}</p>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                {other.name || 'User'} ({getRole(conv)})
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50/50">
                {selectedConv ? (
                    <>
                        {/* Header */}
                        <div className="h-16 border-b bg-white px-6 flex items-center justify-between shadow-sm">
                            {/* Product Info (Left) */}
                            <div className="flex items-center gap-3">
                                <Link href={`/product/${selectedConv.productId}`} target="_blank" className="relative size-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border hover:opacity-80 transition-opacity">
                                    {selectedConv.product.images?.[0]?.url ? (
                                        <Image src={selectedConv.product.images[0].url} fill className="object-cover" alt={selectedConv.product.name} />
                                    ) : <Package className="m-auto text-gray-400 p-2" />}
                                </Link>
                                <div>
                                    <Link href={`/product/${selectedConv.productId}`} target="_blank" className="font-semibold text-gray-900 leading-none hover:text-orange-600 transition-colors block">
                                        {selectedConv.product.name}
                                    </Link>
                                    <p className="text-sm font-medium text-orange-600 mt-1">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedConv.product.price)}
                                    </p>
                                </div>
                            </div>

                            {/* User Info (Right) */}
                            <Link href={`/admin/users/${getOtherParticipant(selectedConv).id}`} className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group">
                                <div className="text-right">
                                    <p className="font-medium text-gray-900 leading-none group-hover:text-orange-600 transition-colors">
                                        {getOtherParticipant(selectedConv).name || 'Unknown User'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {getRole(selectedConv)}
                                    </p>
                                </div>
                                <div className="size-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                                    {getUserImage(getOtherParticipant(selectedConv)) ? (
                                        <img src={getUserImage(getOtherParticipant(selectedConv))} className="size-full object-cover" alt="" />
                                    ) : <User className="size-5 text-gray-400" />}
                                </div>
                            </Link>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                            {isLoadingMessages ? <ConversationSkeleton /> : (
                                messages.map(msg => (
                                    <MessageBubble
                                        key={msg.id}
                                        message={msg}
                                        isOwn={msg.senderId === userId}
                                    />
                                ))
                            )}

                            {/* Typing Indicators */}
                            {isBuyerTyping && (
                                <div className="flex justify-end pr-2">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-gray-400 mb-1">Buyer is typing...</span>
                                        <div className="bg-orange-100 rounded-2xl px-3 py-1.5 flex items-center gap-1">
                                            <div className="size-1 bg-[#E87A3F] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="size-1 bg-[#E87A3F] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="size-1 bg-[#E87A3F] rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {isSellerTyping && (
                                <div className="flex justify-start pl-2">
                                    <div className="flex flex-col items-start">
                                        <span className="text-[10px] text-gray-400 mb-1">Seller is typing...</span>
                                        <div className="bg-gray-200 rounded-2xl px-3 py-1.5 flex items-center gap-1">
                                            <div className="size-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="size-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="size-1 bg-gray-500 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
                        <MessageSquare className="size-12 mb-3 opacity-20" />
                        <p>Select a conversation to view history</p>
                    </div>
                )}
            </div>
        </div>
    )
}
