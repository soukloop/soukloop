'use client'

import ErrorFallback from "@/components/layout/ErrorFallback"
import { useEffect } from 'react'

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Admin Panel Error:', error)
    }, [error])

    // Admin panel has its own sidebar/header layout provided by AdminLayoutClient.
    // We don't want the main site footer here, so showFooter={false}.
    return <ErrorFallback reset={reset} message="Admin Panel Error" showFooter={false} />
}
