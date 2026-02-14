import { Suspense } from 'react';
import AttributesLayout from '@/components/admin/attributes/AttributesLayout';
import CategoriesTable from '@/components/admin/attributes/CategoriesTable';
import DressStylesTable from '@/components/admin/attributes/DressStylesTable';
import BrandsTable from '@/components/admin/attributes/BrandsTable';
import ColorsTable from '@/components/admin/attributes/ColorsTable';
import MaterialsTable from '@/components/admin/attributes/MaterialsTable';
import OccasionsTable from '@/components/admin/attributes/OccasionsTable';
import TableSkeleton from '@/components/admin/TableSkeleton';

import {
    getPaginatedBrands,
    getPaginatedColors,
    getPaginatedDressStyles,
    getPaginatedMaterials,
    getPaginatedOccasions,
    getPaginatedCategories
} from '@/lib/admin/attributes-service';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function CategoriesPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const tab = (typeof searchParams.tab === 'string' ? searchParams.tab : 'categories');
    const page = Number(searchParams.page) || 1;
    const search = typeof searchParams.search === 'string' ? searchParams.search : '';
    const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;

    let content;
    const pageSize = 10;

    switch (tab) {
        case 'brands': {
            const data = await getPaginatedBrands({ page, pageSize, search, status });
            content = <BrandsTable {...data} page={page} />;
            break;
        }
        case 'colors': {
            const data = await getPaginatedColors({ page, pageSize, search, status });
            content = <ColorsTable {...data} page={page} />;
            break;
        }
        case 'dress-styles': {
            const categoryId = typeof searchParams.categoryId === 'string' ? searchParams.categoryId : undefined;
            const [data, categoriesList] = await Promise.all([
                getPaginatedDressStyles({ page, pageSize, search, status, categoryId }),
                prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
            ]);
            content = <DressStylesTable {...data} page={page} categoriesList={categoriesList} />;
            break;
        }
        case 'fabrics': {
            const data = await getPaginatedMaterials({ page, pageSize, search, status });
            content = <MaterialsTable {...data} page={page} pageSize={pageSize} />;
            break;
        }
        case 'occasions': {
            const data = await getPaginatedOccasions({ page, pageSize, search, status });
            content = <OccasionsTable {...data} page={page} pageSize={pageSize} />;
            break;
        }
        case 'categories':
        default: {
            const data = await getPaginatedCategories({ page, pageSize, search, status });
            content = <CategoriesTable {...data} page={page} />;
            break;
        }
    }

    return (
        <AttributesLayout>
            <Suspense fallback={<TableSkeleton rowCount={10} columnCount={4} />}>
                {content}
            </Suspense>
        </AttributesLayout>
    );
}
