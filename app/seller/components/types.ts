export interface PhotoSlot {
    id: string;
    label: string;
    image: string | null;
    file?: File | null;
    // Optimistic Upload State
    isUploading?: boolean;
    uploadUrl?: string | null;
    uploadError?: string | null;
}

export interface ProductData {
    // Step 1: Photos
    photos: PhotoSlot[];

    // Step 2: About
    name: string;
    title?: string;
    price: string | number;
    comparePrice: string | number;
    description: string;
    category: string;
    categoryId?: string;
    size: string;
    tags: string;
    brand?: string;
    brandId?: string;
    color?: string;
    colorId?: string;
    // Location
    state?: string;
    city?: string;
    cityId?: string;

    // Step 3: Details
    condition: string;
    gender: string;
    fabric: string;
    materialId?: string;
    dress: string;
    dressStyleId?: string;
    hasPendingStyle?: boolean;
    occasion: string;
    occasionId?: string;

    // Step 4: Video
    video: string | null;
    videoFile?: File | null;
    // Optimistic Video State
    videoIsUploading?: boolean;
    videoUploadUrl?: string | null;
    videoUploadError?: string | null;
}

export const initialProductData: ProductData = {
    photos: [
        { id: "1", label: "Add a photo", image: null },
        { id: "2", label: "Cover photo", image: null },
        { id: "3", label: "Front photo", image: null },
        { id: "4", label: "Back photo", image: null },
        { id: "5", label: "Side photo", image: null },
        { id: "6", label: "Label photo", image: null },
        { id: "7", label: "Detail photo", image: null },
        { id: "8", label: "Flaw photo", image: null },
        { id: "9", label: "Extra photo", image: null },
        { id: "10", label: "Extra photo", image: null },
    ],
    name: "",
    price: "",
    comparePrice: "",
    description: "",
    category: "",
    size: "",
    tags: "",
    brand: "",
    color: "",
    state: "",
    city: "",
    condition: "",
    gender: "",
    fabric: "",
    dress: "",
    occasion: "",
    video: null,
};
