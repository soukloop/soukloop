"use client";
import { Button } from "@/components/ui/button";
import { Star, X, Search, MapPin, Calendar } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { UserAvatar } from "@/components/shared/user-avatar";

interface SellerProfileProps {
  vendor: {
    id: string;
    isActive: boolean;
    businessName?: string | null;
    slug: string;
    logo?: string | null;
    banner?: string | null;
    description?: string | null;
    averageRating: number;
    reviewCount: number;
    createdAt: Date;
    user: {
      name?: string | null;
      image?: string | null;
    };
    _count?: {
      orders: number;
      products: number;
    }
  } | null;
}

export default function SellerProfile({ vendor }: SellerProfileProps) {
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  if (!vendor) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Seller not found</h2>
        <p className="text-gray-500">The requested seller profile could not be loaded.</p>
      </div>
    );
  }

  // Fallbacks
  const displayName = vendor.businessName || vendor.slug || vendor.user.name || "Seller";
  const srcImage = vendor.logo || vendor.user.image;
  const displayBanner = vendor.banner || "/images/cover-image.png"; // You might want a default specific banner
  const description = vendor.description || `Welcome to ${displayName}'s store on SoukLoop!`;

  return (
    <>
      {/* Banner Section - moved here or typically passed to a parent wrapper, 
          but for now let's keep the structure similar to before or integrate it. 
          The previous page had <CoverSection /> separately. 
          We should probably make this component handle the profile info card mainly.
      */}

      <section className="bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {/* Main Layout */}
          <div className="flex flex-col items-start space-y-6 sm:flex-row sm:space-x-6 sm:space-y-0">
            {/* Profile Image */}
            <div className="relative z-10 -mt-16 mb-6 size-32 rounded-full border-4 border-white shadow-lg bg-gray-100">
              <UserAvatar
                src={srcImage}
                name={displayName}
                fallbackType="initials"
                className="size-full"
              />
            </div>

            {/* Profile Info */}
            <div className="mb-6 flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="mb-2 text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      {displayName}
                    </span>
                    {!vendor.isActive && (
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                        Suspended
                      </span>
                    )}
                  </h2>

                  <div className="mb-2 flex flex-col space-y-1 text-sm text-gray-600 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-900">{vendor._count?.products || 0}</span> products
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-900">{vendor._count?.orders || 0}</span> sold
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Joined {format(new Date(vendor.createdAt), "MMMM yyyy")}
                    </div>
                  </div>

                  {/* RATING DISPLAY */}
                  <div className="mb-2 flex space-x-1 sm:justify-start items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${i < Math.round(vendor.averageRating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      ({vendor.reviewCount} reviews)
                    </span>
                    {vendor.averageRating > 0 && (
                      <span className="ml-1 text-xs font-bold text-gray-900">{Number(vendor.averageRating).toFixed(1)}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row gap-3">
                  <Button className="h-10 px-8 rounded-lg bg-[#e0622c] text-white hover:bg-[#d96d34]">
                    Follow
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 px-8 rounded-lg border-[#e0622c] bg-[#FEF3EC] text-[#e0622c] hover:bg-[#FEF3EC]"
                  >
                    Message
                  </Button>
                </div>
              </div>


              {/* Stats / Following */}
              <div className="mb-4 mt-4 flex items-center space-x-6 text-sm text-gray-600">
                <button
                  onClick={() => setShowFollowersModal(true)}
                  className="transition-colors hover:text-[#e0622c]"
                >
                  <strong className="text-gray-900">0</strong> Followers
                </button>
                <button
                  onClick={() => setShowFollowingModal(true)}
                  className="transition-colors hover:text-[#e0622c]"
                >
                  <strong className="text-gray-900">0</strong> Following
                </button>
              </div>

              <div className="mb-4 max-w-2xl">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals - Keeping structure but empty for now as requested */}
      {showFollowersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-[481px] flex-col rounded-2xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Followers</h2>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="flex size-10 items-center justify-center rounded-full bg-black text-white hover:bg-gray-800"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-8 text-center text-gray-500">No followers yet.</div>
          </div>
        </div>
      )}

      {showFollowingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-[481px] flex-col rounded-2xl bg-white p-6">
            <div className="mb-6 flex shrink-0 items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Following</h2>
              <button
                onClick={() => setShowFollowingModal(false)}
                className="flex size-10 items-center justify-center rounded-full bg-black text-white hover:bg-gray-800"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-8 text-center text-gray-500">Not following anyone yet.</div>
          </div>
        </div>
      )}
    </>
  );
}
