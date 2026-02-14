import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-50 text-center px-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 mb-6">
                <FileQuestion className="h-10 w-10 text-[#E87A3F]" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-2">Page Not Found</h2>
            <p className="max-w-md text-gray-600 mb-8 text-lg">
                Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
            </p>
            <div className="flex gap-4">
                <Button asChild className="bg-[#E87A3F] hover:bg-[#d96d34] rounded-full px-8">
                    <Link href="/">Return Home</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-8">
                    <Link href="/products">Browse Products</Link>
                </Button>
            </div>
        </div>
    )
}
