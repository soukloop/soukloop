"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MessageSquare, ShoppingBag, Store, User, Trash2, Send, Paperclip } from "lucide-react"
import useSWR from "swr"
import { MessageBubble } from "@/components/chat/MessageBubble"
import { ConversationSkeleton } from "@/components/chat/ChatSkeletons"
import { useSocket } from "@/components/providers/socket-provider"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
});

export default function AdminChatPage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isBuyerTyping, setIsBuyerTyping] = useState(false)
    const [isSellerTyping, setIsSellerTyping] = useState(false)
    const { socket, isConnected } = useSocket()
    const previousConversationRef = useRef<string | null>(null)

    const { data: conversation, error, isLoading, mutate } = useSWR(id ? `/api/admin/chats/${id}` : null, fetcher)

    // Socket.io Integration
    useEffect(() => {
        if (!id || !socket || !isConnected) return

        if (previousConversationRef.current && previousConversationRef.current !== id) {
            socket.emit('leave-conversation', previousConversationRef.current)
        }

        socket.emit('join-conversation', id)
        previousConversationRef.current = id

        const handleNewMessage = (newMessage: any) => {
            mutate((prev: any) => {
                if (!prev) return prev
                if (prev.messages && prev.messages.find((m: any) => m.id === newMessage.id)) return prev
                return {
                    ...prev,
                    messages: [...(prev.messages || []), newMessage]
                }
            }, false)
        }

        const handleTyping = ({ userId, isTyping }: { userId: string, isTyping: boolean }) => {
            if (userId === conversation?.buyerId) {
                setIsBuyerTyping(isTyping)
            } else if (userId === conversation?.sellerId) {
                setIsSellerTyping(isTyping)
            }
        }

        socket.on('new-message', handleNewMessage)
        socket.on('user-typing', handleTyping)

        return () => {
            if (socket) {
                socket.emit('leave-conversation', id)
                socket.off('new-message', handleNewMessage)
                socket.off('user-typing', handleTyping)
            }
        }
    }, [id, socket, isConnected, conversation?.buyerId, conversation?.sellerId, mutate])

    // Auto-scroll to bottom
    useEffect(() => {
        if (conversation?.messages) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [conversation?.messages?.length])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) return

        try {
            setIsDeleting(true)
            const res = await fetch(`/api/admin/chats/${id}`, {
                method: 'DELETE'
            })

            if (!res.ok) throw new Error("Failed to delete")

            toast.success("Conversation deleted")
            router.push('/admin/chats')
        } catch (error) {
            toast.error("Failed to delete conversation")
            setIsDeleting(false)
        }
    }

    const getUserImage = (user: any) => {
        return user?.profile?.avatar || user?.image || user?.vendor?.logo
    }

    const navigateToUser = (userId: string) => {
        router.push(`/admin/users/${userId}`)
    }

    if (isLoading) return <AdminChatSkeleton />

    if (error || !conversation) return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-50 text-gray-500">
            <MessageSquare className="mb-4 h-16 w-16 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900">Conversation not found</h2>
            <Button variant="outline" className="mt-6" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
        </div>
    )

    return (
        <div className="flex h-[calc(100vh-120px)] flex-col bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
            {/* Header */}
            <header className="sticky top-0 z-[100] border-b bg-white px-6 py-4 shadow-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                    {/* Left: Back & Product Info */}
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full shrink-0 hover:bg-gray-100">
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Button>

                        {/* Product Info */}
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                                {conversation.product?.images?.[0]?.url ? (
                                    <img src={conversation.product.images[0].url} alt="Product" className="h-full w-full object-cover" />
                                ) : (
                                    <ShoppingBag className="h-5 w-5 m-auto text-gray-400 mt-2.5" />
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h1 className="truncate text-sm font-bold text-gray-900 leading-tight">
                                    {conversation.product?.name || "Unknown Product"}
                                </h1>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="font-medium text-green-600">${conversation.product?.price}</span>
                                    <span className="hidden sm:inline text-gray-300">|</span>
                                    <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 select-all">
                                        ID: {conversation.id}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Participants & Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Buyer Box */}
                        <div
                            onClick={() => navigateToUser(conversation.buyerId)}
                            className="hidden md:flex items-center gap-2 cursor-pointer rounded-lg border border-gray-100 bg-white p-1.5 px-3 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm group"
                        >
                            <div className="text-right hidden lg:block">
                                <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{conversation.buyer?.name}</p>
                                <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wide">Buyer</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 overflow-hidden">
                                {getUserImage(conversation.buyer) ? (
                                    <img src={getUserImage(conversation.buyer)} className="h-full w-full object-cover" alt="Buyer" />
                                ) : (
                                    <User className="h-4 w-4 m-auto text-blue-400 mt-2" />
                                )}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block h-8 w-px bg-gray-200 mx-1"></div>

                        {/* Seller Box */}
                        <div
                            onClick={() => navigateToUser(conversation.sellerId)}
                            className="hidden md:flex items-center gap-2 cursor-pointer rounded-lg border border-gray-100 bg-white p-1.5 px-3 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm group"
                        >
                            <div className="h-8 w-8 rounded-full bg-orange-50 border border-orange-100 overflow-hidden order-last lg:order-first">
                                {getUserImage(conversation.seller) ? (
                                    <img src={getUserImage(conversation.seller)} className="h-full w-full object-cover" alt="Seller" />
                                ) : (
                                    <Store className="h-4 w-4 m-auto text-orange-400 mt-2" />
                                )}
                            </div>
                            <div className="text-left hidden lg:block">
                                <p className="text-xs font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{conversation.seller?.name}</p>
                                <p className="text-[10px] uppercase font-bold text-orange-500 tracking-wide">Seller</p>
                            </div>
                        </div>

                        {/* Mobile User Icons (Simplified) */}
                        <div className="flex md:hidden items-center -space-x-2">
                            <div className="h-8 w-8 rounded-full border-2 border-white bg-blue-100 overflow-hidden z-10" onClick={() => navigateToUser(conversation.buyerId)}>
                                {getUserImage(conversation.buyer) ? (
                                    <img src={getUserImage(conversation.buyer)} className="h-full w-full object-cover" alt="Buyer" />
                                ) : <User className="h-4 w-4 m-auto text-blue-500 mt-1.5" />}
                            </div>
                            <div className="h-8 w-8 rounded-full border-2 border-white bg-orange-100 overflow-hidden z-20" onClick={() => navigateToUser(conversation.sellerId)}>
                                {getUserImage(conversation.seller) ? (
                                    <img src={getUserImage(conversation.seller)} className="h-full w-full object-cover" alt="Seller" />
                                ) : <Store className="h-4 w-4 m-auto text-orange-500 mt-1.5" />}
                            </div>
                        </div>

                        {/* Delete Action */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 text-gray-400 hover:text-white hover:bg-red-500 transition-colors"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto bg-[#F9FAFB] p-4 sm:p-6">
                <div className="mx-auto max-w-3xl space-y-4">
                    {conversation.messages?.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <p>No messages in this conversation yet.</p>
                        </div>
                    ) : (
                        conversation.messages.map((msg: any) => {
                            // NEW LOGIC: Buyer on RIGHT (Orange), Seller on LEFT (Gray)
                            // "isOwn" in MessageBubble usually puts it on the right.
                            // So if msg is from Buyer, we set isOwn=true.
                            const isBuyer = msg.senderId === conversation.buyerId;

                            return (
                                <div key={msg.id} className="relative">
                                    <MessageBubble
                                        message={{
                                            ...msg,
                                            status: 'sent',
                                            isRead: true
                                        }}
                                        isOwn={isBuyer} // Buyer = Right (Orange)
                                    />
                                    {/* Optional: Label to verify who sent it useful for admin debugging */}
                                    <div className={`text-[10px] text-gray-400 px-2 mt-0.5 mb-2 ${isBuyer ? 'text-right' : 'text-left'}`}>
                                        {isBuyer ? 'Buyer' : 'Seller'}
                                    </div>
                                </div>
                            )
                        })
                    )}

                    {/* Typing Indicators */}
                    <div className="flex flex-col gap-2">
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
                    <div ref={messagesEndRef} />
                </div>
            </main >

            {/* Read-Only Input Area (Visual Only) */}
            < footer className="shrink-0 border-t bg-white p-3" >
                <div className="mx-auto max-w-3xl opacity-60 pointer-events-none select-none">
                    <form className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="icon" className="size-9 text-gray-400">
                            <Paperclip className="size-5" />
                        </Button>
                        <Input
                            placeholder="Admin View Only - Cannot send messages"
                            disabled
                            className="flex-1 bg-gray-50"
                        />
                        <Button type="button" disabled className="size-9 bg-gray-200 text-gray-400">
                            <Send className="size-4" />
                        </Button>
                    </form>
                </div>
            </footer >
        </div >
    )
}

function AdminChatSkeleton() {
    return (
        <div className="flex h-screen flex-col bg-gray-50">
            {/* Header Skeleton */}
            <header className="border-b bg-white px-6 py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-10 w-10 rounded bg-gray-200 animate-pulse" />
                        <div className="space-y-1">
                            <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                            <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-10 w-32 rounded bg-gray-200 animate-pulse" />
                        <div className="h-10 w-32 rounded bg-gray-200 animate-pulse" />
                    </div>
                </div>
            </header>

            {/* Chat Skeleton */}
            <main className="flex-1 p-6">
                <div className="mx-auto max-w-3xl">
                    <ConversationSkeleton />
                </div>
            </main>

            {/* Footer Skeleton */}
            <footer className="border-t bg-white p-4">
                <div className="mx-auto max-w-3xl flex gap-2">
                    <div className="h-10 w-10 rounded bg-gray-200 animate-pulse" />
                    <div className="h-10 flex-1 rounded bg-gray-200 animate-pulse" />
                    <div className="h-10 w-10 rounded bg-gray-200 animate-pulse" />
                </div>
            </footer>
        </div>
    )
}
