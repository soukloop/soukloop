'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'
import '@/app/globals.css'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Root Error:', error)
    }, [error])

    return (
        <html lang="en">
            <body className="antialiased min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-6 p-8">
                    <h2 className="text-2xl font-bold text-gray-900">Critical Error</h2>
                    <p className="text-gray-600 max-w-md">
                        The application encountered a fatal error. Please try recovering or refresh the page.
                    </p>
                    <div className="flex justify-center">
                        <Button
                            onClick={() => reset()}
                            className="bg-[#E87A3F] hover:bg-[#d96d34] rounded-full px-8"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Attempt Recovery
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    )
}
