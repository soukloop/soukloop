import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOrderStatusColor(status: string) {
  const upperStatus = (status || '').toUpperCase();

  if (upperStatus.includes("SHIPPED")) return "bg-blue-500";
  if (upperStatus.includes("DELIVERED")) return "bg-green-600";

  switch (upperStatus) {
    case "PENDING":
      return "bg-amber-500";
    case "PAID":
      return "bg-emerald-500";
    case "PROCESSING":
    case "PROCESSED":
      return "bg-[#E87A3F]"; // Unified Orange for Processing states
    case "APPROVED":
      return "bg-green-600";
    case "PARTIAL":
      return "bg-sky-500";
    case "CANCELED":
    case "CANCELLED":
    case "REJECTED":
      return "bg-red-500";
    case "REFUNDED":
      return "bg-slate-500";
    default:
      return "bg-gray-400";
  }
}
