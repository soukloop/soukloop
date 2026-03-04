"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { CopyButton } from "@/components/ui/copy-button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  approvePayout,
  rejectPayout,
} from "@/src/features/admin/transactions/actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ActiveTab = "transactions" | "payouts" | "subscriptions";

interface TransactionsClientProps {
  data: any[];
  stats: any;
  totalCount: number;
  page: number;
  limit: number;
  activeTab: ActiveTab;
}

export default function TransactionsClient({
  data,
  stats,
  totalCount,
  page,
  limit,
  activeTab,
}: TransactionsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [actionLoading, setActionLoading] = useState(false);

  // Approval State
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);

  // Rejection State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === activeTab) return;

    startTransition(() => {
      const current = searchParams?.toString() ?? "";
      const params = new URLSearchParams(current);

      params.set("type", tab);
      params.set("page", "1");
      params.delete("search");

      router.push(`?${params.toString()}`);
    });
  };

  const transactionColumns: Column<any>[] = [
    {
      key: "providerTransactionId",
      header: "Transaction ID",
      render: (t) => (
        <div className="group/tx-id flex items-center gap-1.5">
          <span className="font-medium text-blue-600">
            #{t.providerTransactionId || t.id.slice(0, 8).toUpperCase()}
          </span>
          <CopyButton
            value={t.providerTransactionId || t.id}
            hoverOnly
            className="h-3 w-3 text-gray-400 hover:text-blue-600"
          />
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (t) => (
        <span className="text-gray-900">
          {t.user?.name || t.user?.email || "Unknown"}
        </span>
      ),
    },
    {
      key: "orderNumber",
      header: "Order",
      render: (t) => (
        <span className="text-gray-600">{t.order?.orderNumber || "N/A"}</span>
      ),
    },
    {
      key: "provider",
      header: "Method",
      render: (t) => (
        <span className="text-gray-600 capitalize">
          {t.provider || "Unknown"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (t) => (
        <span className="text-gray-600">
          {new Date(t.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (t) => (
        <span className="font-medium text-gray-900">
          ${parseFloat(String(t.amount)).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (t) => (
        <StatusBadge status={t.status || "unknown"} type="transaction" />
      ),
    },
  ];

  const payoutColumns: Column<any>[] = [
    {
      key: "id",
      header: "Payout ID",
      render: (p) => (
        <div className="group/payout-id flex items-center gap-1.5">
          <span className="font-medium text-blue-600">
            #{p.id.slice(0, 8).toUpperCase()}
          </span>
          <CopyButton
            value={p.id}
            hoverOnly
            className="h-3 w-3 text-gray-400 hover:text-blue-600"
          />
        </div>
      ),
    },
    {
      key: "seller",
      header: "Seller",
      render: (p) => (
        <span className="text-gray-900">
          {p.vendor?.user?.name || p.vendor?.user?.email || "Unknown"}
        </span>
      ),
    },
    {
      key: "method",
      header: "Method",
      render: (p) => (
        <span className="text-gray-600 capitalize">
          {p.method.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (p) => (
        <span className="text-gray-600">
          {new Date(p.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (p) => (
        <span className="font-medium text-gray-900">
          ${parseFloat(String(p.amount)).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <StatusBadge status={p.status} type="transaction" />,
    },
  ];

  const subscriptionColumns: Column<any>[] = [
    {
      key: "stripeInvoiceId",
      header: "Invoice ID",
      render: (s) => (
        <div className="group/sub-id flex items-center gap-1.5">
          <span className="font-medium text-blue-600">
            #{(s.stripeInvoiceId || s.id).slice(0, 12).toUpperCase()}
          </span>
          <CopyButton
            value={s.stripeInvoiceId || s.id}
            hoverOnly
            className="h-3 w-3 text-gray-400 hover:text-blue-600"
          />
        </div>
      ),
    },
    {
      key: "subscriber",
      header: "Subscriber",
      render: (s) => (
        <span className="text-gray-900">
          {s.vendor?.user?.name || s.vendor?.user?.email || "Unknown"}
        </span>
      ),
    },
    {
      key: "subscription",
      header: "Subscription",
      render: (s) => (
        <span className="text-gray-600">
          {s.subscription?.stripeSubscriptionId || "N/A"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (s) => (
        <span className="text-gray-600">
          {new Date(s.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (s) => (
        <span className="font-medium text-gray-900">
          ${parseFloat(String(s.amount)).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <StatusBadge status={s.status || "unknown"} type="transaction" />
      ),
    },
  ];

  const handleApproveClick = (payoutId: string) => {
    setSelectedPayoutId(payoutId);
    setShowApproveModal(true);
  };

  const handleRejectClick = (payoutId: string) => {
    setSelectedPayoutId(payoutId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedPayoutId) return;
    setActionLoading(true);
    try {
      const result = await approvePayout(selectedPayoutId);
      if (result.success) {
        toast.success("Payout approved successfully");
        setShowApproveModal(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to approve payout");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedPayoutId) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setActionLoading(true);
    try {
      const result = await rejectPayout(selectedPayoutId, rejectReason);
      if (result.success) {
        toast.success("Payout rejected successfully");
        setShowRejectModal(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to reject payout");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const getPayoutActions = (payout: any) => {
    if (payout.status !== "pending") return [];
    return [
      {
        label: "Approve Payout",
        onClick: () => handleApproveClick(payout.id),
        className: "text-green-600 hover:bg-green-50",
      },
      {
        label: "Reject Payout",
        onClick: () => handleRejectClick(payout.id),
        className: "text-red-600 hover:bg-red-50",
      },
    ];
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange("transactions")}
            disabled={isPending}
            className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
              activeTab === "transactions"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Customer Transactions
          </button>
          <button
            onClick={() => handleTabChange("payouts")}
            disabled={isPending}
            className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
              activeTab === "payouts"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Seller Payouts
          </button>
          <button
            onClick={() => handleTabChange("subscriptions")}
            disabled={isPending}
            className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
              activeTab === "subscriptions"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Subscriptions
          </button>
        </nav>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {activeTab === "transactions" ? (
          <>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Transactions
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Revenue
              </p>
              <p className="text-2xl font-bold text-green-600">
                $
                {stats.revenue?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                }) || "0.00"}
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Pending
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Failed
              </p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
          </>
        ) : activeTab === "payouts" ? (
          <>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Payouts
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Completed
              </p>
              <p className="text-2xl font-bold text-green-600">
                $
                {stats.completed?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                }) || "0.00"}
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Pending
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Processing
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.processing}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Renewals
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Recurring
              </p>
              <p className="text-2xl font-bold text-green-600">
                $
                {stats.completed?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                }) || "0.00"}
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Failed Renewals
              </p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
          </>
        )}
      </div>

      <DataTable
        data={data}
        columns={
          activeTab === "transactions"
            ? transactionColumns
            : activeTab === "payouts"
              ? payoutColumns
              : subscriptionColumns
        }
        actions={activeTab === "payouts" ? getPayoutActions : undefined}
        pageSize={limit}
        rowCount={totalCount}
        currentPage={page}
        manualPagination={true}
        isLoading={isPending}
        searchable
        searchPlaceholder={
          activeTab === "transactions"
            ? "Search transactions..."
            : activeTab === "payouts"
              ? "Search payouts..."
              : "Search subscriptions..."
        }
        filterOptions={
          activeTab === "transactions"
            ? [
                {
                  key: "status",
                  label: "Status",
                  options: [
                    { label: "Completed", value: "completed" },
                    { label: "Pending", value: "pending" },
                    { label: "Failed", value: "failed" },
                    { label: "Refunded", value: "refunded" },
                  ],
                },
                {
                  key: "method",
                  label: "Payment Method",
                  options: [
                    { label: "Stripe", value: "stripe" },
                    { label: "Wallet", value: "wallet" },
                    { label: "Refund", value: "refund" },
                  ],
                },
              ]
            : activeTab === "payouts"
              ? [
                  {
                    key: "status",
                    label: "Status",
                    options: [
                      { label: "Completed", value: "completed" },
                      { label: "Pending", value: "pending" },
                      { label: "Processing", value: "processing" },
                    ],
                  },
                  {
                    key: "method",
                    label: "Payout Method",
                    options: [
                      { label: "Stripe Connect", value: "stripe_connect" },
                      { label: "Bank Transfer", value: "BANK_TRANSFER" },
                    ],
                  },
                ]
              : [
                  {
                    key: "status",
                    label: "Status",
                    options: [
                      { label: "Paid", value: "succeeded" },
                      { label: "Failed", value: "failed" },
                    ],
                  },
                ]
        }
      />

      <ConfirmDialog
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={confirmApprove}
        title="Approve Payout"
        message="Are you sure you want to approve this payout? The status will be marked as completed."
        confirmText="Approve Payout"
        type="success"
        isLoading={actionLoading}
      />

      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payout</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payout. The amount will
              be refunded to the seller's wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="rejectReason" className="mb-2 block">
              Rejection Reason
            </Label>
            <Input
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Invalid bank details"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={actionLoading}
            >
              {actionLoading ? "Rejecting..." : "Reject Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
