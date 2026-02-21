"use client";

import * as React from 'react';

import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';

export interface ActionItem {
    label: string;
    onClick?: () => void;
    href?: string;
    className?: string;
    className?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
}

interface ActionDropdownProps {
    actions: ActionItem[];
    className?: string;
}

export default function ActionDropdown({ actions, className = '' }: ActionDropdownProps) {
    // Fix hydration mismatch by ensuring we only render on client
    // Radix UI primitives can generate random IDs that differ between server/client
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        // Render a placeholder with same dimensions to avoid layout shift, or just null
        return (
            <Button variant="ghost" size="sm" className={`p-1 ${className} opacity-0 pointer-events-none`}>
                <MoreVertical className="h-4 w-4" />
            </Button>
        );
    }

    if (actions.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`p-1 ${className}`}>
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-48 rounded-lg border border-gray-200 bg-white shadow-lg"
            >
                {actions.map((action, index) => {
                    const content = (
                        <DropdownMenuItem
                            key={index}
                            className={`cursor-pointer px-4 py-2 hover:bg-gray-50 ${action.className || 'text-gray-700'}`}
                            onClick={action.href ? undefined : action.onClick}
                            disabled={action.disabled}
                        >


                            {action.icon && <span className="mr-2 h-4 w-4">{action.icon}</span>}
                            {action.label}
                        </DropdownMenuItem>
                    );

                    if (action.href) {
                        return (
                            <Link key={index} href={action.href} className="w-full">
                                {content}
                            </Link>
                        );
                    }

                    return content;
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
