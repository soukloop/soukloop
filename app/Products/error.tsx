'use client'

import ErrorFallback from "@/components/layout/ErrorFallback"
import { useEffect } from 'react'

export default function ProductsError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Products Page Error:', error)
    }, [error])

    return <ErrorFallback reset={reset} />
}
