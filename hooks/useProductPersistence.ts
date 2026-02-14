
import { useEffect, useState, useRef } from 'react';
import { saveFormData, getFormData, clearFormData } from '@/lib/indexed-db';
import { ProductData } from '@/app/seller/components/types';
import { useDebounce } from 'use-debounce';

const STORAGE_KEY = 'new-product-form';

export function useProductPersistence(
    storageKey: string,
    currentData: ProductData,
    currentStep: number,
    onLoad: (data: ProductData, step: number) => void
) {
    const [isLoaded, setIsLoaded] = useState(false);

    // Debounce the save operation to avoid excessive writes
    const [debouncedData] = useDebounce(currentData, 1000);
    const [debouncedStep] = useDebounce(currentStep, 1000);

    const createdUrls = useRef<string[]>([]);

    // Cleanup URLs on unmount
    useEffect(() => {
        return () => {
            createdUrls.current.forEach(url => URL.revokeObjectURL(url));
            createdUrls.current = [];
        };
    }, []);

    // Load data on mount
    useEffect(() => {
        const load = async () => {
            try {
                if (!storageKey) return; // Don't load if no key
                const stored = await getFormData(storageKey);
                if (stored) {
                    const { data, step } = stored;

                    // Re-create Blob URLs for images if they are Files
                    // Note: IndexedDB stores Files/Blobs directly, but we need URLs for <Image />
                    // The persisted data needs to be hydrated.

                    const hydratedPhotos = data.photos.map((p: any) => {
                        if (p.file instanceof File || p.file instanceof Blob) {
                            const url = URL.createObjectURL(p.file);
                            createdUrls.current.push(url);
                            return {
                                ...p,
                                image: url, // Regenerate preview URL
                            };
                        }
                        return p;
                    });

                    // Handle video file if exists
                    let videoUrl = data.video;
                    if (data.videoFile instanceof File || data.videoFile instanceof Blob) {
                        videoUrl = URL.createObjectURL(data.videoFile);
                        createdUrls.current.push(videoUrl);
                    }

                    const hydratedData = {
                        ...data,
                        photos: hydratedPhotos,
                        video: videoUrl
                    };

                    onLoad(hydratedData, step || 1);
                }
            } catch (error) {
                console.error('Failed to load persistence:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        load();
    }, []); // Run only once

    // Save data on change
    useEffect(() => {
        if (!isLoaded) return; // Don't save before initial load

        // We don't want to save generated blob URLs as strings, 
        // but we DO want to save the Files. 
        // The structure is already correct: { photos: [{ file: File, ... }] }
        // IndexedDB handles structured cloning of File objects.

        if (!storageKey) return;

        saveFormData(storageKey, {
            data: debouncedData,
            step: debouncedStep
        });

    }, [debouncedData, debouncedStep, isLoaded, storageKey]);

    const clearPersistence = () => {
        if (storageKey) clearFormData(storageKey);
    };

    return { isLoaded, clearPersistence };
}
