import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/admin/StatusBadge';
import ProductHeaderActions from './product-header-actions';
import { cn } from '@/lib/utils';
import ProductTabs from './product-tabs';
import { Product, DressStyle } from '@prisma/client';

interface ProductHeaderProps {
    product: Product & { dressStyle: DressStyle | null };
}

export default function ProductHeader({ product }: ProductHeaderProps) {
    return (
        <div className="w-full bg-white border-b">
            <div className="max-w-7xl mx-auto px-6 pt-6">
                {/* Top Row */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/products">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-gray-900 line-clamp-1">{product.name}</h1>
                                {product.hasPendingStyle ? (
                                    <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                        Inactive (Pending Style)
                                    </span>
                                ) : (
                                    <StatusBadge status={product.isActive ? 'Active' : 'Blocked'} type="product" />
                                )}
                                {product.status === 'SOLD' && (
                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800 ring-1 ring-inset ring-blue-600/20">
                                        SOLD
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {product.id}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <ProductHeaderActions product={product} />
                </div>

                {/* Tabs */}
                <ProductTabs productId={product.id} />
            </div>
        </div>
    );
}
