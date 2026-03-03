"use client";

import { AlertCircle, Filter, X } from "lucide-react";
import { useState, useMemo, useTransition } from "react";
import ProductCard from "@/components/product-card";
import ProductFilters from "@/app/products/components/product-filters";
import ApplicationStatusBox from "@/components/seller/ApplicationStatusBox";
import { useProducts } from "@/hooks/useProducts";
import { CardSkeleton } from "@/components/ui/skeletons";
import { Pagination } from "@/components/ui/pagination";
import { useCart } from "@/hooks/useCart";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { deleteProductAction, updateProductStatusAction } from "@/src/features/seller/actions";
import { useRouter, useSearchParams } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ProfileProductsProps {
    userId: string;
    isSeller: boolean;
    isOwner: boolean;
    verification: any;
    isApproved: boolean;
    isSubmitted: boolean;
    isRejected: boolean;
    filtersData: {
        categories: any[];
        brands: string[];
        dressStyles: any[];
    };
}

export default function ProfileProducts({
    userId,
    isSeller,
    isOwner,
    verification,
    isApproved,
    isSubmitted,
    isRejected,
    filtersData
}: ProfileProductsProps) {
    const [activeTab, setActiveTab] = useState<"all" | "sold">("all");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [animatingId, setAnimatingId] = useState<string | null>(null);
    const [toastOpen, setToastOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Delete Confirmation State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const router = useRouter();
    const ITEMS_PER_PAGE = 6;

    // Filter States
    const [occasion, setOccasion] = useState("all");
    const [gender, setGender] = useState("all");
    const [condition, setCondition] = useState("all");
    const [size, setSize] = useState("all");
    const [fabric, setFabric] = useState("all");
    const [brandQuery, setBrandQuery] = useState("");
    const [dress, setDress] = useState("all");
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [onSale, setOnSale] = useState(false);
    const [minRating, setMinRating] = useState("all");

    const searchParams = useSearchParams();
    const initialCategory = searchParams?.get("category") || "all";
    const [category, setCategory] = useState(initialCategory);

    // OPTIMIZATION: Server-side pagination (matches products page pattern)
    // Build filter params to send to API
    const productFilters = useMemo(() => ({
        userId,
        limit: ITEMS_PER_PAGE,  // Only fetch 6 items per page
        page: currentPage,      // Current page number
        includePending: true,
        includeInactive: true,
        sold: activeTab === "sold",
        // Send all filters to API for server-side filtering
        category: category !== "all" ? category : undefined,
        occasion: occasion !== "all" ? occasion : undefined,
        gender: gender !== "all" ? gender : undefined,
        condition: condition !== "all" ? condition : undefined,
        size: size !== "all" ? size : undefined,
        fabric: fabric !== "all" ? fabric : undefined,
        brandId: brandQuery || undefined,
        dress: dress !== "all" ? dress : undefined,
        onSale: onSale === true ? true : undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minRating: minRating !== "all" ? minRating : undefined,
    }), [
        userId, currentPage, activeTab, category, occasion, gender, condition,
        size, fabric, brandQuery, dress, onSale, priceRange, minRating
    ]);

    // Fetch from backend with server-side filtering and pagination
    const { data: apiData, isLoading, error, mutate } = useProducts({
        params: productFilters
    });

    // Backend returns paginated results
    const paginatedProducts = apiData?.items || [];
    const totalPages = apiData?.totalPages || 1;

    const { addItem } = useCart();
    const handleAddToCart = async (product: any) => {
        setAnimatingId(product.id);
        setTimeout(async () => {
            await addItem(product.id, 1);
            setAnimatingId(null);
            setToastOpen(true);
            setTimeout(() => setToastOpen(false), 2500);
        }, 1200);
    };

    // Management Handlers
    const handleEdit = (product: any) => {
        router.push(`/seller/post-new-product?edit=${product.id}`);
    };

    const handleDelete = (productId: string) => {
        setProductToDelete(productId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        startTransition(async () => {
            const result = await deleteProductAction(productToDelete);
            if (result.success) {
                toast.success("Product deleted successfully");
                mutate();
            } else {
                toast.error(result.error || "Failed to delete product");
            }
            setIsDeleteDialogOpen(false);
            setProductToDelete(null);
        });
    };

    const handleStatusUpdate = async (productId: string, status: string, label: string) => {
        startTransition(async () => {
            const result = await updateProductStatusAction(productId, status);
            if (result.success) {
                toast.success(`Product ${label}ed`);
                mutate();
            } else {
                toast.error(result.error || `Failed to ${label}`);
            }
        });
    };

    if (!isSeller) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-white">
                <ApplicationStatusBox
                    status={isApproved ? 'approved' : isSubmitted ? 'submitted' : isRejected ? 'rejected' : 'incomplete'}
                    rejectionReason={verification?.rejectionReason}
                    isExistingSeller={false}
                />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-white">
            <div className="flex flex-col gap-12 lg:flex-row">
                {/* Sidebar Filters */}
                <aside className={`
            fixed inset-y-0 left-0 z-50 w-80 transform bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:w-72 lg:transform-none lg:shadow-none lg:p-0
            ${isFilterOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
                    <div className="flex items-center justify-between lg:hidden mb-6">
                        <h2 className="text-xl font-bold">Filters</h2>
                        <button onClick={() => setIsFilterOpen(false)}><X className="size-6" /></button>
                    </div>
                    <ProductFilters
                        occasion={occasion} setOccasion={setOccasion}
                        gender={gender} setGender={setGender}
                        condition={condition} setCondition={setCondition}
                        size={size} setSize={setSize}
                        fabric={fabric} setFabric={setFabric}
                        brandQuery={brandQuery} setBrandQuery={setBrandQuery}
                        dress={dress} setDress={setDress}
                        priceRange={priceRange} setPriceRange={setPriceRange}
                        onSale={onSale} setOnSale={setOnSale}
                        minRating={minRating} setMinRating={setMinRating}
                        categoryFromURL={category}
                        onCategoryChange={(cat) => { setCategory(cat); setCurrentPage(1); }}
                        categories={filtersData.categories}
                        brands={filtersData.brands.map(b => ({ id: b, name: b }))}
                        allDressStyles={filtersData.dressStyles}
                        initialOccasions={[]}
                        initialMaterials={[]}
                    />
                </aside>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="mb-0 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 relative">
                        <div className="flex space-x-10">
                            {["all", "sold"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab as any); setCurrentPage(1); }}
                                    className={`relative pb-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === tab ? "text-[#E87A3F]" : "text-gray-400 hover:text-gray-600"
                                        }`}
                                >
                                    {tab === "all" ? "All Products" : "Sold"}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="tab-underline"
                                            className="absolute bottom-[-1px] left-0 h-0.5 w-full bg-[#E87A3F] z-10"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 lg:hidden mb-4"
                        >
                            <Filter className="size-4 text-[#E87A3F]" />
                            Filters
                        </button>
                    </div>

                    <div className="mt-8">
                        {isLoading ? (
                            <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-3">
                                {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
                            </div>
                        ) : error ? (
                            <div className="flex h-80 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/50 text-red-500">
                                <AlertCircle className="size-10" />
                                <p className="font-medium">Failed to load your products</p>
                            </div>
                        ) : (
                            <>
                                <div className={`grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-3 ${isPending ? "opacity-60" : ""}`}>
                                    {paginatedProducts.length > 0 ? (
                                        paginatedProducts.map((product: any) => (
                                            <ProductCard
                                                key={product.id}
                                                product={{
                                                    id: product.id,
                                                    image: product.image || product.images?.[0]?.url || "/white-quilted-butterfly-bag.png",
                                                    title: product.title || product.name,
                                                    description: product.description || "",
                                                    price: `$${((product.priceCents ?? product.price * 100) / 100).toFixed(2)}`,
                                                    originalPrice: product.originalPrice ? `$${product.originalPrice}` : "",
                                                    daysAgo: "Just now",
                                                    isWishlist: false,
                                                    vendorId: product.vendorId,
                                                    vendorUserId: product.vendor?.userId,
                                                    hasPendingStyle: product.hasPendingStyle,
                                                    status: product.status,
                                                    isActive: product.isActive,
                                                    averageRating: product.averageRating,
                                                    reviewCount: product.reviewCount,
                                                    createdAt: product.createdAt,
                                                    pendingOrderCount: product.pendingOrderCount
                                                }}
                                                animatingId={animatingId}
                                                handleAddToCart={() => handleAddToCart(product)}
                                                toggleWishlist={() => { }}
                                                // Manage Props for Owner
                                                {...(isOwner ? {
                                                    onEdit: () => handleEdit(product),
                                                    onDelete: () => handleDelete(product.id),
                                                    onDeactivate: () => handleStatusUpdate(product.id, "INACTIVE", "deactivate"),
                                                    onMarkSold: () => handleStatusUpdate(product.id, "SOLD", "mark as sold"),
                                                } : {})}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full py-32 text-center">
                                            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-gray-50/50">
                                                <Filter className="size-8 text-gray-300" />
                                            </div>
                                            <p className="text-xl font-bold text-gray-900">No matches found</p>
                                            <p className="text-gray-500">Try adjusting your filters to see more results.</p>
                                        </div>
                                    )}
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-16 flex justify-center">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {toastOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 rounded-full bg-gray-900 px-8 py-4 font-bold text-white shadow-2xl"
                    >
                        ✅ Product added to cart
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                type="danger"
                confirmText="Delete"
                isLoading={isPending}
            />
        </div>
    );
}
