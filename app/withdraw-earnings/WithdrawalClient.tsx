"use client";

import { useState } from "react";
import {
    Building2,
    CheckCircle2,
    Loader2,
    Wallet,
    ArrowUpRight,
    Plus,
    AlertCircle,
    ChevronLeft,
    CreditCard
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    requestWithdrawal,
    saveBankAccount
} from "@/src/features/withdrawals/actions";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import { useSellerAuth } from "@/hooks/useSellerAuth"; // Still used for protection check if needed, or rely on page

interface WithdrawalClientProps {
    initialData: {
        balance: number;
        bankAccounts: any[];
        recentPayouts: any[];
    };
}

export default function WithdrawalClient({ initialData }: WithdrawalClientProps) {
    const router = useRouter();
    const { isSeller, isLoading: isAuthLoading } = useSellerAuth();

    // Local state for UI interactivity only - Data comes from props
    const [withdrawalAmount, setWithdrawalAmount] = useState("");

    // Set default account if available
    const [selectedAccountId, setSelectedAccountId] = useState(() => {
        const defaultAcc = initialData.bankAccounts.find((a: any) => a.isDefault) || initialData.bankAccounts[0];
        return defaultAcc?.id || "";
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // New Account Form State
    const [newAccount, setNewAccount] = useState({
        bankName: "",
        accountHolder: "",
        accountNumber: "",
        routingNumber: "",
        isDefault: true
    });

    const handleAddAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await saveBankAccount(newAccount);
            toast.success("Bank account saved!");
            setShowAddAccount(false);
            setNewAccount({
                bankName: "",
                accountHolder: "",
                accountNumber: "",
                routingNumber: "",
                isDefault: true
            });
            router.refresh(); // Refresh Server Component data
        } catch (error: any) {
            toast.error(error.message || "Failed to save account");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawalAmount);
        if (!selectedAccountId) {
            toast.error("Please select a bank account");
            return;
        }
        if (isNaN(amount) || amount < 50) {
            toast.error("Minimum withdrawal amount is $50.00");
            return;
        }

        setIsSubmitting(true);
        try {
            await requestWithdrawal({
                amount,
                bankAccountId: selectedAccountId
            });
            setShowSuccess(true);
            setWithdrawalAmount("");
            router.refresh(); // Refresh Server Component data
        } catch (error: any) {
            toast.error(error.message || "Failed to submit request");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-white">
                <EcommerceHeader />
                <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#E87A3F]" />
                </div>
                <FooterSection />
            </div>
        );
    }

    // Auth Redirect (Redundant if handled by middleware/page, but safe to keep)
    if (!isSeller) {
        router.push("/seller/onboarding");
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#F9FAFB] sm:mt-[-9rem] mt-[-6.2rem]">
            <EcommerceHeader />

            <main className="flex-1 pb-12">
                <div className="container mx-auto max-w-5xl px-4 pt-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mb-4 -ml-2 text-gray-500 hover:text-[#E87A3F] hover:bg-[#E87A3F]/5 group"
                            onClick={() => router.back()}
                        >
                            <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            Return to Dashboard
                        </Button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Withdraw Earnings</h1>
                                <p className="text-gray-500">Manage your balance and request payouts to your bank account.</p>
                            </div>
                            <div className="hidden sm:block">
                                <Badge variant="outline" className="px-3 py-1 font-medium text-[#E87A3F] border-[#E87A3F]/20 bg-[#E87A3F]/5">
                                    Seller Wallet
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <Alert className="border-green-200 bg-green-50 border-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <AlertTitle className="text-green-800 font-bold text-lg">Request Submitted!</AlertTitle>
                                <AlertDescription className="text-green-700 text-base">
                                    We are looking into it, and will respond to you within **48 hours**.
                                    Your requested amount has been deducted from your wallet balance.
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto ml-2 text-green-800 font-bold underline"
                                        onClick={() => setShowSuccess(false)}
                                    >
                                        Dismiss
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Left Column: Balance & Request Form */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Balance Card */}
                            <Card className="overflow-hidden border-none shadow-premium bg-gradient-to-br from-[#E87A3F] to-[#d96d34] text-white">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-2xl bg-white/10">
                                            <Wallet className="h-6 w-6" />
                                        </div>
                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
                                            Available for Payout
                                        </Badge>
                                    </div>
                                    <h3 className="text-lg font-medium opacity-80 mb-1">Available Balance</h3>
                                    <div className="text-5xl font-bold tracking-tight mb-4">
                                        ${initialData.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className="flex items-center text-sm font-medium text-white/70">
                                        <ArrowUpRight className="h-4 w-4 mr-1" />
                                        Ready to be transferred to your bank
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Withdrawal Request Form */}
                            <Card className="border-none shadow-premium bg-white">
                                <CardHeader>
                                    <CardTitle>Request Payout</CardTitle>
                                    <CardDescription>Enter the amount and choose your bank account.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Withdrawal Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                className={`pl-7 h-12 text-lg font-bold border-2 focus:ring-0 ${Number(withdrawalAmount) > initialData.balance
                                                    ? 'border-red-500 focus:border-red-500'
                                                    : 'focus:border-[#E87A3F]'
                                                    }`}
                                                value={withdrawalAmount}
                                                onChange={(e) => setWithdrawalAmount(e.target.value)}
                                            />
                                        </div>
                                        {Number(withdrawalAmount) > initialData.balance && (
                                            <p className="text-xs font-medium text-red-500">
                                                Amount exceeds your available balance (${initialData.balance.toFixed(2)})
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500">Minimum withdrawal: $50.00</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>Receive to</Label>
                                            <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
                                                <DialogTrigger asChild>
                                                    <Button variant="link" size="sm" className="text-[#E87A3F] p-0 h-auto">
                                                        <Plus className="mr-1 h-3 w-3" />
                                                        Add New Account
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <form onSubmit={handleAddAccount}>
                                                        <DialogHeader>
                                                            <DialogTitle>Add Bank Account</DialogTitle>
                                                            <DialogDescription>
                                                                Enter your bank details. This account will be saved for future payouts.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="bankName">Bank Name</Label>
                                                                <Input
                                                                    id="bankName"
                                                                    required
                                                                    onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="holder">Account Holder Name</Label>
                                                                <Input
                                                                    id="holder"
                                                                    required
                                                                    onChange={(e) => setNewAccount({ ...newAccount, accountHolder: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="account">Account Number</Label>
                                                                <Input
                                                                    id="account"
                                                                    required
                                                                    onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="routing">Routing Number (Optional)</Label>
                                                                <Input
                                                                    id="routing"
                                                                    onChange={(e) => setNewAccount({ ...newAccount, routingNumber: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button type="submit" disabled={isSubmitting} className="w-full bg-[#E87A3F] hover:bg-[#d96d34]">
                                                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                                Save Account
                                                            </Button>
                                                        </DialogFooter>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        <div className="grid gap-3">
                                            {initialData.bankAccounts.length === 0 ? (
                                                <Alert className="bg-gray-50 border-dashed border-gray-300">
                                                    <AlertCircle className="h-4 w-4 text-gray-500" />
                                                    <AlertTitle className="text-gray-600">No bank account linked</AlertTitle>
                                                    <AlertDescription className="text-gray-500">
                                                        Please add a bank account to receive your payouts.
                                                    </AlertDescription>
                                                </Alert>
                                            ) : (
                                                initialData.bankAccounts.map((acc: any) => (
                                                    <div
                                                        key={acc.id}
                                                        onClick={() => setSelectedAccountId(acc.id)}
                                                        className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedAccountId === acc.id
                                                            ? "border-[#E87A3F] bg-[#E87A3F]/5 shadow-sm"
                                                            : "border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200"
                                                            }`}
                                                    >
                                                        <div className={`p-2 rounded-lg mr-4 ${selectedAccountId === acc.id ? "bg-[#E87A3F]/10" : "bg-gray-100"}`}>
                                                            <Building2 className={`h-5 w-5 ${selectedAccountId === acc.id ? "text-[#E87A3F]" : "text-gray-500"}`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-semibold text-gray-900">{acc.bankName}</p>
                                                                {acc.isDefault && (
                                                                    <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-500 font-normal">Default</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-500">Ending in {acc.accountNumber.slice(-4)} • {acc.accountHolder}</p>
                                                        </div>
                                                        {selectedAccountId === acc.id && (
                                                            <CheckCircle2 className="h-5 w-5 text-[#E87A3F] ml-2" />
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full h-12 text-lg font-semibold bg-[#E87A3F] hover:bg-[#d96d34] shadow-lg shadow-[#E87A3F]/20"
                                        onClick={handleWithdraw}
                                        disabled={isSubmitting || !selectedAccountId || !withdrawalAmount}
                                    >
                                        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                        {isSubmitting ? "Processing Request..." : "Withdraw Funds"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Info & Summary */}
                        <div className="space-y-8">
                            {/* Payout Info & Security Note Cards - Same as original */}
                            <Card className="border-none shadow-premium bg-white">
                                <CardHeader>
                                    <CardTitle className="text-lg">Payout Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1 bg-green-50 rounded">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-900">Standard Payout</p>
                                            <p className="text-gray-500 leading-relaxed">Funds typically arrive in your bank account within 1-3 business days.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1 bg-[#E87A3F]/10 rounded">
                                            <AlertCircle className="h-4 w-4 text-[#E87A3F]" />
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-900">Weekly Payouts</p>
                                            <p className="text-gray-500 leading-relaxed">Processed every Monday for requests made before Sunday midnight.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-premium bg-[#111827] text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <CreditCard className="h-5 w-5 text-[#E87A3F]" />
                                        <h3 className="font-semibold">Security Note</h3>
                                    </div>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        We use secure encryption for all financial transactions. Your bank details are used only for processing payouts and are never shared with third parties.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Transaction History Section */}
                    <div className="mt-12 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Payout History</h2>
                            <Button variant="outline" size="sm" className="text-gray-500 border-gray-200">
                                View Full History
                            </Button>
                        </div>

                        <Card className="border-none shadow-premium bg-white overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="w-[200px]">Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Bank Account</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!initialData.recentPayouts || initialData.recentPayouts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-gray-400">
                                                No payout requests found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        initialData.recentPayouts.map((payout: any) => (
                                            <TableRow key={payout.id} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="font-medium">
                                                    {format(new Date(payout.createdAt), "MMM d, yyyy")}
                                                    <p className="text-[10px] text-gray-400 font-normal">ID: {payout.id.slice(-8).toUpperCase()}</p>
                                                </TableCell>
                                                <TableCell className="text-lg font-bold text-gray-900">
                                                    ${Number(payout.amount).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="text-sm text-gray-600">
                                                            {payout.bankAccount?.bankName || "Unknown Bank"} (..{payout.bankAccount?.accountNumber?.slice(-4) || '----'})
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge
                                                        className={`font-medium ${payout.status === "pending"
                                                            ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                                            : payout.status === "completed"
                                                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                                                : "bg-red-100 text-red-700 hover:bg-red-100"
                                                            }`}
                                                    >
                                                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>
            </main>

            <FooterSection />
        </div>
    );
}
