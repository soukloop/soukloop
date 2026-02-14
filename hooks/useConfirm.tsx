'use client'

import { useState, useCallback } from 'react'
import ConfirmDialog, { ConfirmDialogType } from '@/components/ui/ConfirmDialog'

interface UseConfirmOptions {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    type?: ConfirmDialogType
}

export function useConfirm() {
    const [isOpen, setIsOpen] = useState(false)
    const [options, setOptions] = useState<UseConfirmOptions>({
        title: '',
        message: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

    const confirm = useCallback((opts: UseConfirmOptions): Promise<boolean> => {
        setOptions(opts)
        setIsOpen(true)

        return new Promise((resolve) => {
            setResolvePromise(() => resolve)
        })
    }, [])

    const handleConfirm = useCallback(async () => {
        setIsLoading(true)
        if (resolvePromise) {
            resolvePromise(true)
        }
        setIsOpen(false)
        setIsLoading(false)
        setResolvePromise(null)
    }, [resolvePromise])

    const handleCancel = useCallback(() => {
        if (resolvePromise) {
            resolvePromise(false)
        }
        setIsOpen(false)
        setResolvePromise(null)
    }, [resolvePromise])

    const ConfirmDialogComponent = useCallback(() => (
        <ConfirmDialog
            isOpen={isOpen}
            onClose={handleCancel}
            onConfirm={handleConfirm}
            title={options.title}
            message={options.message}
            confirmText={options.confirmText}
            cancelText={options.cancelText}
            type={options.type}
            isLoading={isLoading}
        />
    ), [isOpen, handleCancel, handleConfirm, options, isLoading])

    return {
        confirm,
        ConfirmDialog: ConfirmDialogComponent
    }
}
