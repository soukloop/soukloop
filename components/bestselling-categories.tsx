"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface BestsellingStyle {
    id: string;
    name: string;
    slug: string;
    totalSold: number;
    image: string;
}

export default function BestsellingCategories({ initialStyles = [] }: { initialStyles?: BestsellingStyle[] }) {
    const [styles, setStyles] = useState<BestsellingStyle[]>(initialStyles);
    const [isLoading, setIsLoading] = useState(initialStyles.length === 0);

    useEffect(() => {
        if (initialStyles.length > 0) return;

        async function fetchStyles() {
            try {
                const res = await fetch("/api/analytics/bestselling-styles");
                if (res.ok) {
                    const data = await res.json();
                    setStyles(data);
                }
            } catch (error) {
                console.error("Failed to fetch bestselling styles", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStyles();
    }, [initialStyles.length]);

    if (isLoading) {
        return (
            <section className="bg-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 flex flex-col items-center text-center">
                        <div className="h-10 w-64 bg-gray-200 animate-pulse rounded-lg mb-4" />
                        <div className="h-4 w-96 bg-gray-200 animate-pulse rounded-lg" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] sm:aspect-square bg-gray-200 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (styles.length === 0) {
        return null; // Don't show if no data
    }

    return (
        <section className="bg-white py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10 flex flex-col items-center text-center">
                    <h2 className="text-3xl font-extrabold text-[#e0622c] sm:text-4xl lg:text-5xl">
                        Bestselling <span className="font-light italic text-gray-900">Styles</span>
                    </h2>
                    <p className="mt-4 max-w-2xl text-gray-500">
                        Explore the most popular fashion trends loved by our community.
                    </p>
                </div>

                {/* 3x2 Grid with Rank and Name - Visual match to Shop By Price (Rectangular, 3 cols) */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                    {styles.map((style, idx) => (
                        <Link
                            key={style.id}
                            href={`/products?dressStyleId=${style.id}`}
                            className="group relative overflow-hidden rounded-2xl bg-gray-100 h-[180px] sm:h-[220px]"
                        >
                            <Image
                                src={style.image || "/placeholder.svg"}
                                alt={style.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                            {/* Rank Number (Top Left) */}
                            <div className="absolute top-3 left-3 z-10">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 border border-white/30 text-xs font-bold text-white shadow-sm">
                                    {idx + 1}
                                </span>
                            </div>

                            {/* Dress Style Name (Bottom Left) */}
                            <div className="absolute bottom-3 left-3 z-10 max-w-[90%]">
                                <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                                    {style.name}
                                </h3>
                                <div className="mt-1 h-0.5 w-0 bg-[#E87A3F] transition-all duration-300 group-hover:w-1/3" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
