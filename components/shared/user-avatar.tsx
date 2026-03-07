import React, { CSSProperties } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

export type FallbackType = "initials" | "icon" | "image"

interface UserAvatarProps {
    src?: string | null
    name?: string | null
    fallbackType?: FallbackType
    className?: string
    iconClassName?: string
    style?: CSSProperties
}

export function getInitials(name?: string | null): string {
    if (!name || name.trim() === "") return ""

    const tokens = name.trim().split(/\s+/)
    if (tokens.length === 1) {
        return tokens[0].substring(0, 2).toUpperCase()
    }

    return (tokens[0][0] + tokens[tokens.length - 1][0]).toUpperCase()
}

/**
 * A unified Avatar component to handle all profile image rendering.
 * It provides standard fallbacks depending on the context.
 */
export function UserAvatar({
    src,
    name,
    fallbackType = "initials",
    className,
    iconClassName,
    style
}: UserAvatarProps) {

    // Decide what fallback to show
    let fallbackContent = null

    if (fallbackType === "initials" && name) {
        fallbackContent = <span className="font-semibold">{getInitials(name)}</span>
    } else if (fallbackType === "image") {
        // Standard user-avatar.png fallback
        fallbackContent = (
            <img
                src="/icons/user-avatar.png"
                alt="User Default Avatar"
                className="h-full w-full object-cover opacity-50"
            />
        )
    } else {
        // Default to Icon
        fallbackContent = <User className={cn("size-1/2 text-gray-400", iconClassName)} />
    }

    // Pre-calculate gradient based on name/id if we want consistent colored fallbacks?
    // We can just use the standard shadcn muted background, but maybe add text styling
    // if it's initials.
    const isInitials = fallbackType === "initials" && !!name;

    return (
        <Avatar className={cn(isLoadingClass(src), className)} style={style}>
            {src && <AvatarImage src={src} alt={name || "User"} className="object-cover" />}
            <AvatarFallback
                className={cn(
                    "bg-gray-100 flex items-center justify-center text-gray-600",
                    isInitials ? "bg-orange-100 text-[#E87A3F]" : ""
                )}
            >
                {fallbackContent}
            </AvatarFallback>
        </Avatar>
    )
}

function isLoadingClass(src?: string | null) {
    // If we wanted to add an animation class while waiting, we could, but Radix handles 
    // showing the fallback immediately until the image loads.
    return ""
}
