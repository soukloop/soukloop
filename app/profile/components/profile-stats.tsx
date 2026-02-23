"use client";

import { Star, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface ProfileStatsProps {
    stats: {
        followers: number;
        following: number;
        reviews: number;
    };
    userId: string;
}

export default function ProfileStats({ stats, userId }: ProfileStatsProps) {
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [followers, setFollowers] = useState<any[]>([]);
    const [following, setFollowing] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleFetchFollowers = async () => {
        setShowFollowersModal(true);
        setIsLoading(true);
        try {
            const res = await fetch(`/api/users/${userId}/follows`);
            if (res.ok) {
                const data = await res.json();
                setFollowers(data.followers || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFetchFollowing = async () => {
        setShowFollowingModal(true);
        setIsLoading(true);
        try {
            const res = await fetch(`/api/users/${userId}/follows`);
            if (res.ok) {
                const data = await res.json();
                setFollowing(data.following || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Ratings */}
                <div className="flex items-center">
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="size-4 fill-orange-400 text-orange-400" />
                        ))}
                    </div>
                    <span className="ml-2 text-sm font-bold text-gray-900">{stats.reviews} Reviews</span>
                </div>

                {/* Social Counts */}
                <div className="flex items-center space-x-6 text-sm">
                    <button onClick={handleFetchFollowers} className="transition-colors hover:text-[#e87a3f]">
                        <strong className="text-gray-900">{stats.followers}</strong> <span className="text-gray-600">Followers</span>
                    </button>
                    <button onClick={handleFetchFollowing} className="transition-colors hover:text-[#e87a3f]">
                        <strong className="text-gray-900">{stats.following}</strong> <span className="text-gray-600">Following</span>
                    </button>
                </div>
            </div>

            {/* Follow Modals */}
            {mounted && (showFollowersModal || showFollowingModal) && createPortal(
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 p-4">
                    <div
                        className="absolute inset-0"
                        onClick={() => { setShowFollowersModal(false); setShowFollowingModal(false); }}
                    />
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {showFollowersModal ? "Followers" : "Following"}
                            </h2>
                            <button
                                onClick={() => { setShowFollowersModal(false); setShowFollowingModal(false); }}
                                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="size-6" />
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {isLoading ? (
                                <div className="py-20 text-center text-gray-500">Loading...</div>
                            ) : (showFollowersModal ? followers : following).length > 0 ? (
                                (showFollowersModal ? followers : following).map((f: any) => (
                                    <div className="flex items-center gap-4 p-2 rounded-xl transition-colors hover:bg-orange-50/50">
                                        <div className="relative size-12 rounded-full border border-gray-100 overflow-hidden shrink-0">
                                            <Image
                                                src={f.image || "/icons/user-avatar.png"}
                                                alt={f.name || "User"}
                                                fill
                                                sizes="48px"
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{f.name || "User"}</p>
                                            <p className="text-xs text-gray-500 truncate">{f.email}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-gray-400 font-medium">
                                    {showFollowersModal ? "No followers yet" : "Not following anyone yet"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
