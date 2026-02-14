"use client";

import { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RateLimitErrorProps {
    retryAfter?: number;
    message?: string;
    type?: 'login' | 'register' | 'password-reset' | 'api';
}

/**
 * Display rate limit error with countdown timer
 * Shows user when they can retry the action
 */
export function RateLimitError({ retryAfter = 60, message, type = 'api' }: RateLimitErrorProps) {
    const [secondsLeft, setSecondsLeft] = useState(retryAfter);

    useEffect(() => {
        if (secondsLeft <= 0) return;

        const timer = setInterval(() => {
            setSecondsLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsLeft]);

    const getDefaultMessage = () => {
        switch (type) {
            case 'login':
                return 'Too many login attempts. Please wait before trying again.';
            case 'register':
                return 'Too many registration attempts. Please wait before creating another account.';
            case 'password-reset':
                return 'Too many password reset requests. Please check your email or wait before trying again.';
            default:
                return 'Too many requests. Please slow down and try again in a moment.';
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    };

    return (
        <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Rate Limit Exceeded</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
                <p>{message || getDefaultMessage()}</p>
                {secondsLeft > 0 && (
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-3 w-3" />
                        <span>Retry in {formatTime(secondsLeft)}</span>
                    </div>
                )}
                {secondsLeft === 0 && (
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        You can try again now
                    </p>
                )}
            </AlertDescription>
        </Alert>
    );
}

/**
 * Inline rate limit message for forms
 */
export function RateLimitMessage({ retryAfter = 60 }: { retryAfter?: number }) {
    const [secondsLeft, setSecondsLeft] = useState(retryAfter);

    useEffect(() => {
        if (secondsLeft <= 0) return;

        const timer = setInterval(() => {
            setSecondsLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsLeft]);

    if (secondsLeft === 0) return null;

    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;

    return (
        <div className="flex items-center gap-2 text-sm text-destructive">
            <Clock className="h-3 w-3" />
            <span>
                Please wait {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`} before trying again
            </span>
        </div>
    );
}
