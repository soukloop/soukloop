"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UseAsyncActionOptions {
    onSuccess?: () => void;
    onError?: (error: any) => void;
}

export function useAsyncAction() {
    const [isLoading, setIsLoading] = useState(false);

    const execute = useCallback(async <T>(
        actionFn: () => Promise<T>,
        options: {
            successMessage?: string;
            errorMessage?: string;
            onSuccess?: (data: T) => void;
            onError?: (error: any) => void;
        } = {}
    ) => {
        setIsLoading(true);
        try {
            const result = await actionFn();

            if (options.successMessage) {
                toast.success(options.successMessage);
            }

            if (options.onSuccess) {
                options.onSuccess(result);
            }

            return result;
        } catch (error: any) {
            console.error("Action failed:", error);
            const message = options.errorMessage || error.message || "An unexpected error occurred";
            toast.error(message);

            if (options.onError) {
                options.onError(error);
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        execute,
        isLoading
    };
}

