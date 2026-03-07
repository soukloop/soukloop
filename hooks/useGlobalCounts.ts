'use client'

import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useEffect } from 'react'

export interface UserCounts {
    cartCount: number;
    notificationCount: number;
    favoritesCount: number;
    isAuthenticated: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useGlobalCounts() {
    const { status } = useSession()
    const { isAuthenticated: isAdminAuthenticated } = useAdminAuth()

    const isAuthenticated = status === 'authenticated' || isAdminAuthenticated

    const { data, error, mutate, isLoading } = useSWR<UserCounts>(
        isAuthenticated ? '/api/user/counts' : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000, // Sync every 30s max to prevent DB spam
            focusThrottleInterval: 30000,
        }
    )

    // Optional: Setup Centrifugo socket listener here to auto-mutate
    // the counts when a real-time event (new notification/cart update) occurs

    return {
        counts: data || { cartCount: 0, notificationCount: 0, favoritesCount: 0, isAuthenticated: false },
        isLoading,
        isError: !!error,
        mutateCounts: mutate,
    }
}
