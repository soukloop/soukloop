"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Coins, Trophy, Clock, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRewards } from "@/hooks/useRewards";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function RewardsPointsPage({ initialData }: { initialData?: any }) {
  // ✅ Server-side Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { balance, history, pagination, isLoading } = useRewards(currentPage, itemsPerPage, initialData);

  const currentBalance = balance?.currentBalance || 0;
  const totalEarned = balance?.totalEarned || 0;

  return (
    <main className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 sm:px-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">
            Reward Points
          </h1>
          <p className="text-gray-500 font-medium">
            Earn points with every purchase and unlock exclusive rewards.
          </p>
        </div>

        {/* 1. Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-sm relative overflow-hidden group">
            {/* Decorative background blob */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#E87A3F]">
                  <Coins className="h-6 w-6" />
                </div>
                <Link href="/how-to-use-points">
                  <Button variant="ghost" className="text-sm font-bold text-gray-500 hover:text-[#E87A3F] hover:bg-orange-50 rounded-full px-4">
                    How it works <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Current Balance</p>
                {isLoading ? (
                  <Skeleton className="h-12 w-48 rounded-lg" />
                ) : (
                  <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                    {currentBalance.toLocaleString()}
                  </h2>
                )}
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Link href="/products" className="flex-1">
                  <Button className="w-full bg-[#E87A3F] hover:bg-[#d06228] text-white font-bold h-12 rounded-full shadow-lg shadow-orange-100 transition-all hover:scale-[1.02]">
                    Redeem Now
                  </Button>
                </Link>
                <Link href="/how-to-use-points" className="flex-1">
                  <Button variant="outline" className="w-full font-bold h-12 rounded-full border-gray-200 hover:bg-gray-50 text-gray-700">
                    Earn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Info / Tiers Card */}
          <div className="bg-gray-900 rounded-[24px] p-6 sm:p-8 shadow-md text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gray-800/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-gray-800 flex items-center justify-center text-yellow-400 mb-6">
                  <Trophy className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Value & Perks</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                  Your points translate directly to value. Sellers can unlock premium tools, while buyers get direct discounts on orders.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Customer</p>
                  <p className="font-bold flex items-center gap-2">
                    <span className="text-yellow-400">100 pts</span> = $1.00 USD
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Seller</p>
                  <p className="font-bold flex items-center gap-2">
                    <span className="text-yellow-400">1000 pts</span> = Free Plan
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Activity Table Section */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              Points Activity
            </h2>
            <div className="text-sm font-medium text-gray-500">
              Lifetime Earned: <span className="text-gray-900">{isLoading ? '...' : totalEarned.toLocaleString()}</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Points</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  /* Table Skeleton */
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    </tr>
                  ))
                ) : history.length > 0 ? (
                  history.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {format(new Date(item.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {item.actionType.replace(/_/g, " ").toLowerCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center gap-1.5 font-bold text-sm ${item.points > 0 ? "text-emerald-600" : "text-gray-900"}`}>
                          {item.points > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : null}
                          {item.points > 0 ? `+${item.points}` : item.points}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className={`font-semibold ${item.points > 0
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-[#E87A3F]/10 text-[#E87A3F] hover:bg-[#E87A3F]/20"
                            }`}
                        >
                          {item.points > 0 ? "Earned" : "Redeemed"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
                          <Coins className="h-6 w-6" />
                        </div>
                        <p className="text-gray-900 font-medium">No activity yet</p>
                        <p className="text-gray-500 text-sm">Earn points to see your history here.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
              <p className="text-xs text-gray-500 font-medium">
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="h-8 w-8 p-0 rounded-full border-gray-200"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))}
                  disabled={currentPage === pagination.totalPages || isLoading}
                  className="h-8 w-8 p-0 rounded-full border-gray-200"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
