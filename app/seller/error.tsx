'use client'

import ErrorFallback from "@/components/layout/ErrorFallback"
import { useEffect } from 'react'

export default function SellerError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Seller Dashboard Error:', error)
    }, [error])

    // Seller sections usually share layout patterns.
    return <ErrorFallback reset={reset} message="Seller Dashboard Error" />
}
