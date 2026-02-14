'use client'

import ErrorFallback from "@/components/layout/ErrorFallback"
import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Captured Error:', error)
    }, [error])

    return <ErrorFallback reset={reset} />
}
