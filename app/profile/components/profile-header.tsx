"use client";

import { Camera, Edit, Loader2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toggleFollowAction, updateProfileBannerAction } from "@/src/features/user/actions";
import { toast } from "sonner";

interface ProfileHeaderProps {
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
        createdAt: Date | string;
    };
    profile: any;
    vendor: any;
    isOwner: boolean;
    isFollowing: boolean;
}

export default function ProfileHeader({ user, profile, vendor, isOwner, isFollowing: initialIsFollowing }: ProfileHeaderProps) {
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isFollowPending, startFollowTransition] = useTransition();

    const userImage = profile?.avatar || user?.image || "/icons/user-avatar.png";
    const userName = user?.name || "User";
    const bannerImage = profile?.bannerImage || "/hero-banner.png";

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploadingBanner(true);
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");
            const { url } = await uploadRes.json();

            const result = await updateProfileBannerAction(url);
            if (result.success) {
                toast.success("Banner updated!");
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update banner");
        } finally {
            setIsUploadingBanner(false);
        }
    };

    const handleToggleFollow = () => {
        startFollowTransition(async () => {
            // Optimistic update
            setIsFollowing(!isFollowing);

            const result = await toggleFollowAction(user.id);
            if (!result.success) {
                // Revert on failure
                setIsFollowing(isFollowing);
                toast.error(result.error || "Failed to update follow status");
            }
        });
    };

    return (
        <div className="w-full">
            {/* Banner */}
            <div className="relative h-[160px] sm:h-[240px] md:h-[300px] w-full bg-gray-100 group">
                <img src={bannerImage} alt="Banner" className="size-full object-cover object-center" />

                {isOwner && (
                    <>
                        <input
                            type="file"
                            ref={bannerInputRef}
                            onChange={handleBannerUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={() => bannerInputRef.current?.click()}
                            disabled={isUploadingBanner}
                            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl"
                        >
                            {isUploadingBanner ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                            {isUploadingBanner ? "Uploading..." : "Edit Banner"}
                        </button>
                    </>
                )}
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-12 mb-6 size-24 overflow-hidden rounded-full border-4 border-white shadow-lg sm:-mt-16 sm:size-32">
                    <img src={userImage} alt={userName} className="size-full object-cover object-center" />
                </div>

                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{userName}</h1>
                        {profile?.bio && <p className="mt-1 text-gray-600">{profile.bio}</p>}
                        <p className="mt-1 text-sm text-gray-500">Member since {new Date(user.createdAt).getFullYear()}</p>
                    </div>

                    <div className="flex gap-3">
                        {isOwner ? (
                            <Link href="/edit-profile">
                                <Button variant="outline" className="h-10 rounded-full border-[#E87A3F] text-[#E87A3F] hover:bg-orange-50">
                                    <Edit className="size-4 mr-2" />
                                    Edit Profile
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                onClick={handleToggleFollow}
                                disabled={isFollowPending}
                                className={`h-10 rounded-full px-8 font-bold transition-all ${isFollowing
                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    : "bg-[#E87A3F] text-white hover:bg-[#d96d34]"
                                    }`}
                            >
                                {isFollowPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                                {isFollowing ? "Following" : "Follow"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
