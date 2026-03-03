"use client";
import { Suspense } from "react"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorContent />
        </Suspense>
    )
}

import { useSearchParams } from "next/navigation"

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams?.get("error") ?? null

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Authentication Error</h1>
                <p className="mb-6 text-gray-600">
                    {error || "An unknown error occurred during authentication."}
                </p>
                <div className="space-y-3">
                    <Link
                        href="/"
                        className="block w-full rounded-lg bg-orange-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-orange-600"
                    >
                        Return to Home
                    </Link>
                    <Link
                        href="/?auth=login"
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Try Logging In Again
                    </Link>
                </div>
            </div>
        </div>
    )
}
