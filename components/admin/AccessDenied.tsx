import { ShieldOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AccessDeniedProps {
    message?: string;
    showHomeButton?: boolean;
}

export default function AccessDenied({
    message = "You do not have permission to view this page.",
    showHomeButton = true
}: AccessDeniedProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6">
            <div className="bg-gray-100 p-4 rounded-full mb-6">
                <Lock className="h-12 w-12 text-gray-500" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>

            <p className="text-gray-500 max-w-md mb-8">
                {message}
            </p>

            {showHomeButton && (
                <Link href="/admin">
                    <Button variant="outline">
                        Return to Dashboard
                    </Button>
                </Link>
            )}
        </div>
    );
}
