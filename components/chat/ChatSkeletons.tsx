"use client"

// Skeleton Shimmers for Chat Interface

// Chat List Skeleton - shows animated placeholders for conversation list
export function ChatListSkeleton() {
    return (
        <div className="animate-pulse space-y-0">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-3 border-b p-3">
                    <div className="size-10 shrink-0 rounded-lg bg-gray-200" />
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-24 rounded bg-gray-200" />
                            <div className="h-3 w-10 rounded bg-gray-100" />
                        </div>
                        <div className="h-3 w-32 rounded bg-gray-100" />
                    </div>
                </div>
            ))}
        </div>
    )
}

// Conversation Skeleton - shows placeholders for message bubbles
export function ConversationSkeleton() {
    return (
        <div className="animate-pulse space-y-4 p-4">
            {/* Incoming messages (left) */}
            <div className="flex gap-2">
                <div className="size-8 shrink-0 rounded-full bg-gray-200" />
                <div className="space-y-1">
                    <div className="h-12 w-48 rounded-2xl rounded-tl-none bg-gray-200" />
                    <div className="h-3 w-12 rounded bg-gray-100" />
                </div>
            </div>

            {/* Outgoing message (right) */}
            <div className="flex justify-end">
                <div className="space-y-1">
                    <div className="h-10 w-36 rounded-2xl rounded-tr-none bg-orange-100" />
                    <div className="ml-auto h-3 w-12 rounded bg-gray-100" />
                </div>
            </div>

            {/* Another incoming */}
            <div className="flex gap-2">
                <div className="size-8 shrink-0 rounded-full bg-gray-200" />
                <div className="space-y-1">
                    <div className="h-20 w-56 rounded-2xl rounded-tl-none bg-gray-200" />
                    <div className="h-3 w-12 rounded bg-gray-100" />
                </div>
            </div>

            {/* Outgoing */}
            <div className="flex justify-end">
                <div className="space-y-1">
                    <div className="h-8 w-24 rounded-2xl rounded-tr-none bg-orange-100" />
                    <div className="ml-auto h-3 w-12 rounded bg-gray-100" />
                </div>
            </div>

            {/* Incoming with image */}
            <div className="flex gap-2">
                <div className="size-8 shrink-0 rounded-full bg-gray-200" />
                <div className="space-y-1">
                    <div className="h-32 w-40 rounded-2xl rounded-tl-none bg-gray-200" />
                    <div className="h-3 w-12 rounded bg-gray-100" />
                </div>
            </div>
        </div>
    )
}

// About Seller/Buyer Skeleton
export function AboutUserSkeleton() {
    return (
        <div className="animate-pulse p-4">
            {/* Avatar */}
            <div className="mb-6 text-center">
                <div className="mx-auto mb-3 size-16 rounded-full bg-gray-200" />
                <div className="mx-auto h-5 w-24 rounded bg-gray-200" />
                <div className="mx-auto mt-1 h-3 w-16 rounded bg-gray-100" />
            </div>

            {/* Info cards */}
            <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <div className="size-4 rounded bg-gray-200" />
                    <div className="flex-1">
                        <div className="h-3 w-16 rounded bg-gray-200 mb-1" />
                        <div className="h-4 w-24 rounded bg-gray-200" />
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <div className="size-4 rounded bg-gray-200" />
                    <div className="flex-1">
                        <div className="h-3 w-16 rounded bg-gray-200 mb-1" />
                        <div className="h-4 w-12 rounded bg-gray-200" />
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <div className="size-4 rounded bg-gray-200" />
                    <div className="flex-1">
                        <div className="h-3 w-16 rounded bg-gray-200 mb-1" />
                        <div className="h-4 w-12 rounded bg-gray-200" />
                    </div>
                </div>
            </div>

            {/* Button skeleton */}
            <div className="mt-4 h-10 w-full rounded-lg bg-gray-200" />
        </div>
    )
}
