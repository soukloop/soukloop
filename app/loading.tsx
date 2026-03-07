// app/loading.tsx
"use client";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/loader.gif"
          alt="Loading"
          className="h-auto w-[120px]"
          onError={(event) => {
            event.currentTarget.src = "/loop.png";
            event.currentTarget.className = "h-auto w-[120px]";
          }}
        />
        <p className="text-sm text-gray-500">Loading Soukloop...</p>
      </div>
    </div>
  );
}
