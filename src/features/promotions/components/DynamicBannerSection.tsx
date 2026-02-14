"use client";

import Image from "next/image";
import Link from "next/link";
import { Banner } from "@prisma/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface DynamicBannerSectionProps {
    banners: Banner[];
}

export default function DynamicBannerSection({ banners }: DynamicBannerSectionProps) {
    if (!banners || banners.length === 0) return null;

    // For now, we show the latest active banner as a featured section
    const featuredBanner = banners[0];

    return (
        <div className="bg-white py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 shadow-2xl"
                >
                    {/* Decorative gradients */}
                    <div className="absolute top-0 right-0 -m-20 h-96 w-96 rounded-full bg-orange-500/20 blur-[100px]" />
                    <div className="absolute bottom-0 left-0 -m-20 h-80 w-80 rounded-full bg-rose-500/10 blur-[80px]" />

                    <div className="relative flex flex-col lg:flex-row items-center">
                        {/* Text Content */}
                        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-20 space-y-8">
                            <div className="space-y-4">
                                <motion.span
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-[0.2em]"
                                >
                                    Featured Promotion
                                </motion.span>
                                <motion.h2
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight"
                                >
                                    {featuredBanner.title}
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-lg text-gray-400 max-w-lg leading-relaxed"
                                >
                                    {featuredBanner.description}
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Link href={featuredBanner.link || "/products"}>
                                    <Button
                                        className="h-14 rounded-full px-10 bg-white text-gray-900 hover:bg-orange-50 transition-all font-bold group shadow-xl shadow-white/5"
                                    >
                                        Shop the Offer
                                        <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>

                        {/* Banner Image */}
                        <div className="w-full lg:w-1/2 h-[400px] lg:h-[600px] relative">
                            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-transparent via-transparent to-gray-900 z-10" />
                            <Image
                                src={featuredBanner.imageUrl}
                                alt={featuredBanner.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
