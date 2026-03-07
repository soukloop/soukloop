import React from "react";

interface SellerWithdrawalModalProps {
    setShowPaymentOptionModal: (show: boolean) => void;
    setWithdrawalModal: (step: string) => void;
}

export function SellerWithdrawalModal({
    setShowPaymentOptionModal,
    setWithdrawalModal,
}: SellerWithdrawalModalProps) {
    return (
        <div className="flex-1" style={{ backgroundColor: "#f9f9f9" }}>
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
            <div className="p-8">
                <h1 className="mb-8 text-3xl font-extrabold text-gray-900">
                    Withdraw Earnings
                </h1>

                <div className="mb-8">
                    <h2 className="mb-2 text-lg font-medium text-gray-900">
                        Current Balance
                    </h2>
                    <div className="text-4xl font-bold text-gray-900">$1,234.56</div>
                </div>

                <div
                    className="mb-8 rounded-lg py-6 pr-6"
                    style={{ backgroundColor: "#f9f9f9" }}
                >
                    <h2 className="mb-4 text-lg font-medium text-gray-900">
                        Withdrawal Amount
                    </h2>
                    <input
                        type="text"
                        placeholder="$0.00"
                        className="rounded-lg border border-gray-300 bg-white px-4 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        style={{ width: "448px", height: "56px" }}
                    />
                </div>

                <div className="mb-8">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">
                        Linked Payment Method
                    </h2>
                    <div className="mb-4 flex items-center gap-4">
                        <img src="/images/bank-icon.png" alt="Bank" className="size-8" />
                        <div>
                            <div className="font-medium text-gray-900">
                                Account ending in 1234
                            </div>
                            <div className="text-sm text-gray-600">Bank of America</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-600 hover:text-gray-800">
                            Add Payment Method
                        </button>
                        <button
                            onClick={() => setShowPaymentOptionModal(true)}
                            className="rounded-full bg-orange-500 px-6 py-2 text-white hover:bg-orange-600"
                        >
                            Edit
                        </button>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">
                        Transaction Summary
                    </h2>
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <div className="grid grid-cols-3 gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="font-medium text-gray-900">Date</div>
                            <div className="font-medium text-gray-900">Amount</div>
                            <div className="font-medium text-gray-900">Status</div>
                        </div>
                        <div className="divide-y divide-gray-200">
                            <div className="grid grid-cols-3 gap-4 px-6 py-4">
                                <div className="text-gray-600">07/20/2025</div>
                                <div className="text-gray-900">$500.00</div>
                                <div>
                                    <span
                                        className="flex items-center justify-center text-sm font-medium text-white"
                                        style={{
                                            width: "191px",
                                            height: "27px",
                                            backgroundColor: "#00b69b",
                                            borderRadius: "13.5px",
                                        }}
                                    >
                                        Completed
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 px-6 py-4">
                                <div className="text-gray-600">06/15/2025</div>
                                <div className="text-gray-900">$300.00</div>
                                <div>
                                    <span
                                        className="flex items-center justify-center text-sm font-medium text-white"
                                        style={{
                                            width: "191px",
                                            height: "27px",
                                            backgroundColor: "#00b69b",
                                            borderRadius: "13.5px",
                                        }}
                                    >
                                        Completed
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 px-6 py-4">
                                <div className="text-gray-600">05/10/2025</div>
                                <div className="text-gray-900">$200.00</div>
                                <div>
                                    <span
                                        className="flex items-center justify-center text-sm font-medium text-white"
                                        style={{
                                            width: "191px",
                                            height: "27px",
                                            backgroundColor: "#00b69b",
                                            borderRadius: "13.5px",
                                        }}
                                    >
                                        Completed
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8 text-sm text-black">
                    Withdrawals typically process within 1-3 business days. There is a
                    minimum withdrawal amount of $10.00.
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={() => setWithdrawalModal("confirm")}
                        className="flex items-center justify-center bg-orange-500 font-medium text-white hover:bg-orange-600"
                        style={{ width: "144px", height: "56px", borderRadius: "20px" }}
                    >
                        Withdraw
                    </button>
                </div>
            </div>
        </div>
    );
}
