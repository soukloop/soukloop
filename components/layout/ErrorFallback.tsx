'use client'

import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'
import FooterSection from '@/components/footer-section'

export default function ErrorFallback({
    reset,
    message = "Something went wrong",
    showFooter = true
}: {
    reset: () => void
    message?: string
    showFooter?: boolean
}) {
    return (
        <div className="flex flex-col w-full">
            <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
                <div className="text-center space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 leading-none tracking-tight">
                        {message}
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-[400px]">
                        We encountered an error while loading this page. Please try again.
                    </p>
                    <div className="flex justify-center pt-4">
                        <Button
                            onClick={() => reset()}
                            className="bg-[#E87A3F] hover:bg-[#d96d34] rounded-full px-8"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
            {showFooter && <FooterSection />}
        </div>
    )
}
