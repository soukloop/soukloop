import React from "react";
import { Search } from "lucide-react";

interface SellerCouponManagerProps {
    setShowCreateCouponModal: (show: boolean) => void;
}

export function SellerCouponManager({
    setShowCreateCouponModal,
}: SellerCouponManagerProps) {
    return (
        <main
            className="flex-1 p-8"
            style={{ backgroundColor: "#f9f9f9", height: "calc(1343px - 73px)" }}
        >
            <header className="flex items-center justify-between border-b bg-white px-8 py-4">
                <h1 className="text-xl font-semibold text-gray-900">Seller Dashboard</h1>
                <div className="flex items-center gap-4">
                    <img
                        src="/images/notification-bell.png"
                        alt="Notifications"
                        className="size-5"
                    />
                    <img
                        src="/images/profile-avatar-header.png"
                        alt="Profile"
                        className="size-8 rounded-full"
                    />
                </div>
            </header>
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Discount Coupons & Offers
                </h1>
                <button
                    type="button"
                    onClick={() => setShowCreateCouponModal(true)}
                    className="flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-2 font-medium text-white transition-colors hover:bg-orange-600"
                >
                    Create New Coupon
                </button>
            </div>

            <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Overview</h2>
                <div className="grid grid-cols-3 gap-6">
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <h3 className="mb-2 text-sm font-medium text-gray-600">
                            Active Offers
                        </h3>
                        <p className="text-3xl font-bold text-gray-900">12</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <h3 className="mb-2 text-sm font-medium text-gray-600">
                            Upcoming Offers
                        </h3>
                        <p className="text-3xl font-bold text-gray-900">3</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <h3 className="mb-2 text-sm font-medium text-gray-600">
                            Expired Offers
                        </h3>
                        <p className="text-3xl font-bold text-gray-900">25</p>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Coupons</h2>

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search coupons by name"
                            className="w-full max-w-4xl rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Coupon Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Discount Type & Value
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Validity Dates
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Usage Count
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            <tr>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                    Summer Sale
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    Percentage off - 20%
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    Jul 1 - Jul 31, 2025
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className="inline-flex items-center justify-center text-xs font-medium text-white px-3 py-1 bg-teal-500 rounded-full"
                                    >
                                        Active
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    150
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div
                                        className="flex items-center justify-center gap-[30px] rounded-lg bg-gray-50 px-4 py-2"
                                    >
                                        <button className="hover:opacity-70">
                                            <img
                                                src="/images/edit-coupon-icon.png"
                                                alt="Edit"
                                                className="size-4"
                                            />
                                        </button>
                                        <button className="hover:opacity-70">
                                            <img
                                                src="/images/delete-coupon-icon.png"
                                                alt="Delete"
                                                className="size-4"
                                            />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
