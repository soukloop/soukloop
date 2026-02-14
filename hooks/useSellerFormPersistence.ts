'use client';

import { useEffect, useState, useRef } from 'react';
import { saveFormData, getFormData, clearFormData } from '@/lib/indexed-db';
import { useDebounce } from 'use-debounce';

const STORAGE_KEY_PREFIX = 'seller-onboarding-form';

export interface SellerFormData {
    profileData: {
        firstName: string;
        lastName: string;
        phone: string;
    };
    identityData: {
        taxIdType: string;
        taxId: string;
        govIdType: string;
        govIdNumber: string;
    };
    addressData: {
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    uploadedFiles: {
        govIdFront?: string;
        govIdBack?: string;
        selfie?: string;
        addressProof?: string;
    };
}

interface PersistedData {
    data: SellerFormData;
    step: string;
    timestamp: number;
}

export function useSellerFormPersistence(
    userId: string | undefined,
    currentData: SellerFormData,
    currentStep: string,
    onLoad: (data: SellerFormData, step: string) => void
) {
    const [isLoaded, setIsLoaded] = useState(false);

    // Debounce the save operation to avoid excessive writes
    const [debouncedData] = useDebounce(currentData, 1000);
    const [debouncedStep] = useDebounce(currentStep, 500);

    // Construct storage key with user ID
    const storageKey = userId ? `${STORAGE_KEY_PREFIX}_${userId}` : '';

    // Load data on mount
    useEffect(() => {
        const load = async () => {
            try {
                if (!storageKey) {
                    setIsLoaded(true);
                    return;
                }

                const stored = await getFormData(storageKey) as PersistedData | null;

                if (stored && stored.data) {
                    // Check if data is not too old (24 hours)
                    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                    if (Date.now() - stored.timestamp < maxAge) {
                        console.log('[SellerFormPersistence] Restoring form state from IndexedDB');
                        onLoad(stored.data, stored.step || 'identity');
                    } else {
                        console.log('[SellerFormPersistence] Stored data expired, clearing...');
                        await clearFormData(storageKey);
                    }
                }
            } catch (error) {
                console.error('[SellerFormPersistence] Failed to load:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey]); // Run when storageKey changes (user ID available)

    // Save data on change
    useEffect(() => {
        if (!isLoaded) return; // Don't save before initial load
        if (!storageKey) return;

        const persistedData: PersistedData = {
            data: debouncedData,
            step: debouncedStep,
            timestamp: Date.now()
        };

        saveFormData(storageKey, persistedData);
        console.log('[SellerFormPersistence] Auto-saved form state');

    }, [debouncedData, debouncedStep, isLoaded, storageKey]);

    const clearPersistence = async () => {
        if (storageKey) {
            await clearFormData(storageKey);
            console.log('[SellerFormPersistence] Cleared persisted data');
        }
    };

    return { isLoaded, clearPersistence };
}
