"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";

type AppStartupLoaderProps = {
  children: ReactNode;
  durationMs?: number;
};

export default function AppStartupLoader({
  children,
  durationMs = 3500,
}: AppStartupLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
    }, durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [durationMs]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-white">
        <Image
          src="/loop.png"
          alt="Soukloop loading"
          width={150}
          height={150}
          className="slow-spin"
          priority
        />
      </div>
    );
  }

  return <>{children}</>;
}
