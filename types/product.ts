export type MegaMenuProduct = {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    image: string;
    isFeatured?: boolean;
    vendorUserId?: string;
};

export type DressStyle = {
    id: string;
    name: string;
    slug: string;
};

export type GroupedDressStyles = {
    women: DressStyle[];
    men: DressStyle[];
    kids: DressStyle[];
};
