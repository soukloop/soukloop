"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getGroupedDressStyles, type GroupedDressStyles } from "@/actions/product-data";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileNav() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [openCategory, setOpenCategory] = useState<string | null>(null);
    const [dressStyles, setDressStyles] = useState<GroupedDressStyles>({});
    const [isLoadingStyles, setIsLoadingStyles] = useState(true);

    const FALLBACK_CATEGORIES = ['men', 'women', 'kids'];

    const categoryTabs = Object.keys(dressStyles);

    // Fetch dynamic dress styles
    useEffect(() => {
        setIsLoadingStyles(true);
        getGroupedDressStyles()
            .then(setDressStyles)
            .catch((error) => console.error('[MobileNav] Failed to fetch dress styles:', error))
            .finally(() => setIsLoadingStyles(false));
    }, []);

    const toggleCategory = (category: string) => {
        if (openCategory === category) {
            setOpenCategory(null);
        } else {
            setOpenCategory(category);
        }
    };

    const handleCategoryLink = (category: string) => {
        router.push(`/products?category=${category}`);
        setOpenCategory(null);
    };

    const handleStyleClick = (category: string, styleName: string) => {
        router.push(`/products?category=${category}&query=${encodeURIComponent(styleName)}`);
        setOpenCategory(null);
    };

    return (
        <div className="w-full flex flex-col relative">
            {/* Top Navigation Row */}
            <nav className="flex items-center justify-start space-x-3 py-1 px-1 overflow-x-auto no-scrollbar">
                {(isLoadingStyles ? FALLBACK_CATEGORIES : categoryTabs).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`h-8 px-4 flex items-center justify-center font-bold text-[13px] transition-all duration-300 whitespace-nowrap capitalize border border-gray-100 rounded-lg shadow-sm
                            ${openCategory === cat
                                ? "text-[#E87A3F] border-[#E87A3F]/20 bg-[#E87A3F]/5"
                                : "text-gray-700 hover:text-[#E87A3F] bg-white"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </nav>

            {/* Sub-menu Dropdown Overlay */}
            <AnimatePresence>
                {openCategory && (
                    <>
                        {/* Backdrop to close */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpenCategory(null)}
                            className="fixed inset-0 z-[9998] bg-black/20"
                        />

                        {/* Dropdown Content */}
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="absolute top-full left-0 w-full bg-white z-[9999] shadow-2xl border-b border-gray-100 overflow-hidden"
                        >
                            <div className="p-4 flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{openCategory} Selection</span>
                                    <button onClick={() => setOpenCategory(null)} className="p-1 rounded-full hover:bg-gray-100">
                                        <X className="size-4 text-gray-400" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleCategoryLink(openCategory)}
                                    className="flex items-center justify-between w-full p-4 mb-2 bg-[#E87A3F]/5 text-[#E87A3F] rounded-xl font-bold text-sm"
                                >
                                    View All {openCategory}
                                    <ChevronRight className="size-4" />
                                </button>

                                {isLoadingStyles ? (
                                    <div className="space-y-3 p-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-1">
                                        {dressStyles[openCategory as keyof GroupedDressStyles]?.map((style) => (
                                            <button
                                                key={style.slug}
                                                onClick={() => handleStyleClick(openCategory, style.name)}
                                                className="flex items-center justify-between w-full p-4 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                <span className="text-sm font-medium">{style.name}</span>
                                                <ChevronRight className="size-3.5 text-gray-300" />
                                            </button>
                                        ))}
                                        {dressStyles[openCategory as keyof GroupedDressStyles]?.length === 0 && (
                                            <p className="p-4 text-center text-gray-400 text-sm italic">No styles available</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
