// app/loading.tsx
"use client";

import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/loop.png"
          alt="Loading"
          width={120}
          height={120}
          className="slow-spin"
          priority
        />
        <p className="text-sm text-gray-500">Loading Soukloop...</p>
      </div>
    </div>
  );
}