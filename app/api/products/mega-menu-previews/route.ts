import { NextRequest, NextResponse } from 'next/server';
import { getLatestProductsByDressStyle } from '@/actions/product-data';

/**
 * GET /api/products/mega-menu-previews?styleSlug=some-slug
 * Returns the latest 3 active products for a specific dress style.
 * Primarily used by the Mega Menu to enable background caching via React Query.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const styleSlug = searchParams.get('styleSlug');

        if (!styleSlug) {
            return NextResponse.json(
                { error: 'styleSlug is required' },
                { status: 400 }
            );
        }

        const products = await getLatestProductsByDressStyle(styleSlug);

        return NextResponse.json(products);

    } catch (error) {
        console.error('MegaMenuPreviews GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
