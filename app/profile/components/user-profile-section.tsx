"use client";

import ProfileHeader from "./profile-header";
import ProfileStats from "./profile-stats";
import ProfileProducts from "./profile-products";
import { useSellerAuth } from "@/hooks/useSellerAuth";

interface UserProfileSectionProps {
  initialData: any;
}

export default function UserProfileSection({ initialData }: UserProfileSectionProps) {
  const { user, profile, vendor, stats, isOwner, isFollowing, verification, filters } = initialData;
  const { isSeller } = useSellerAuth();

  // Computed properties for verification
  const isApproved = verification?.status === 'approved';
  const isSubmitted = verification?.status === 'submitted';
  const isRejected = verification?.status === 'rejected';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Header (Banner, Avatar, Name, Bio, Follow Button) */}
      <ProfileHeader
        user={{
          ...user,
          role: user.role // Explicitly passing role
        }}
        profile={profile}
        vendor={vendor}
        isOwner={isOwner}
        isFollowing={isFollowing}
      />

      {/* 2. Stats (Followers, Following, Reviews) */}
      <ProfileStats
        stats={stats}
        userId={user.id}
      />

      {/* 3. Social Content (Products for sellers, Status for buyers) */}
      <div className="flex-1 mt-8 pb-20">
        <ProfileProducts
          userId={user.id}
          isSeller={!!vendor || isSeller}
          isOwner={isOwner} // Passing isOwner to ProfileProducts
          verification={verification}
          isApproved={isApproved}
          isSubmitted={isSubmitted}
          isRejected={isRejected}
          filtersData={filters} // Passing dynamic filters data
          occasions={filters.occasions || []}
          materials={filters.materials || []}
        />
      </div>
    </div>
  );
}
