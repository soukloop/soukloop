"use client";

import { useEffect, useState, type ReactNode } from "react";

type AppStartupLoaderProps = {
  children: ReactNode;
  durationMs?: number;
  gifSrc?: string;
};

export default function AppStartupLoader({
  children,
  durationMs = 3500,
  gifSrc = "/loader.gif",
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
        <img
          src={gifSrc}
          alt="Soukloop loading"
          className="h-auto w-[220px] max-w-[70vw]"
          onError={(event) => {
            event.currentTarget.src = "/loop.png";
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
