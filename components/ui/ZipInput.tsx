'use client'

import * as React from "react"
import { Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ZipInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    required?: boolean
    containerClassName?: string
}

const ZipInput = React.forwardRef<HTMLInputElement, ZipInputProps>(
    ({ className, label, required, containerClassName, ...props }, ref) => {
        return (
            <div className={cn("space-y-2", containerClassName)}>
                <div className="flex items-center gap-2">
                    {label && (
                        <Label className="text-sm font-semibold text-gray-700">
                            {label} {required && <span className="text-red-500">*</span>}
                        </Label>
                    )}
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="cursor-help inline-flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                                    <Info className="size-4" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[260px] text-center">
                                <p>ZIP code must be 5 digits (or 9 for ZIP+4).</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Input
                    {...props}
                    ref={ref}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={9}
                    className={cn("h-11 rounded-xl", className)}
                    onKeyDown={(e) => {
                        // Allow: backspace, delete, tab, escape, enter, and .
                        if (
                            [46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
                            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                            (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                            (e.keyCode === 67 && (e.ctrlKey === true || e.metaKey === true)) ||
                            (e.keyCode === 86 && (e.ctrlKey === true || e.metaKey === true)) ||
                            (e.keyCode === 88 && (e.ctrlKey === true || e.metaKey === true)) ||
                            // Allow: home, end, left, right
                            (e.keyCode >= 35 && e.keyCode <= 39)
                        ) {
                            // let it happen, don't do anything
                            return;
                        }
                        // Ensure that it is a number and stop the keypress
                        if (
                            (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
                            (e.keyCode < 96 || e.keyCode > 105)
                        ) {
                            e.preventDefault();
                        }
                    }}
                />
            </div>
        )
    }
)
ZipInput.displayName = "ZipInput"

export { ZipInput }
