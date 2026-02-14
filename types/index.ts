
import { Product, ProductImage, Vendor, Review, DressStyle, User, UserProfile } from '@prisma/client';

export interface VendorWithRelations extends Vendor {
    user?: User & {
        profile?: UserProfile | null;
    };
}

export interface ProductWithRelations extends Product {
    images: ProductImage[];
    vendor?: VendorWithRelations;
    reviews?: Review[];
    dressStyle?: DressStyle | null;
    _count?: {
        reviews: number;
    };
}
