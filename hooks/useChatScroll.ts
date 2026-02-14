"use client"

import { useRef, useCallback, useEffect } from 'react'

interface UseChatScrollOptions {
    messages: any[]
    containerRef: React.RefObject<HTMLElement>
}

interface UseChatScrollReturn {
    scrollToBottom: (behavior?: ScrollBehavior) => void
    isAtBottom: () => boolean
    shouldAutoScroll: React.MutableRefObject<boolean>
}

export function useChatScroll({ messages, containerRef }: UseChatScrollOptions): UseChatScrollReturn {
    const shouldAutoScroll = useRef(true)
    const lastMessageCount = useRef(0)

    // Check if user is at bottom of chat
    const isAtBottom = useCallback(() => {
        const container = containerRef.current
        if (!container) return true

        const threshold = 100 // pixels from bottom
        return container.scrollHeight - container.scrollTop - container.clientHeight < threshold
    }, [containerRef])

    // Scroll to bottom
    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        const container = containerRef.current
        if (!container) return

        container.scrollTo({
            top: container.scrollHeight,
            behavior
        })
    }, [containerRef])

    // Auto-scroll when new messages arrive
    useEffect(() => {
        // Only scroll if:
        // 1. New messages added (not just re-render)
        // 2. User was at bottom OR shouldAutoScroll is true
        if (messages.length > lastMessageCount.current) {
            if (shouldAutoScroll.current || isAtBottom()) {
                // Use setTimeout to wait for render
                setTimeout(() => scrollToBottom('smooth'), 50)
            }
        }

        lastMessageCount.current = messages.length
    }, [messages, scrollToBottom, isAtBottom])

    // Track scroll position
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleScroll = () => {
            shouldAutoScroll.current = isAtBottom()
        }

        container.addEventListener('scroll', handleScroll)
        return () => container.removeEventListener('scroll', handleScroll)
    }, [containerRef, isAtBottom])

    return {
        scrollToBottom,
        isAtBottom,
        shouldAutoScroll
    }
}
