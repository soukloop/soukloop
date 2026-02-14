"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useRouter } from "next/navigation";
import AccessDenied from "@/components/admin/AccessDenied";
import { StatefulButton } from "@/components/ui/StatefulButton";

export default function RewardSettingsPage() {
    const { isAuthChecking, isAuthenticated, hasPermission } = useAdminAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [config, setConfig] = useState({
        BUYER_REWARD_RATE: "1.0",
        SELLER_REWARD_RATE: "1.0",
        POINT_VALUE_USD: "0.01"
    });

    // Permission Guard
    const canView = hasPermission('settings', 'view');
    const canEdit = hasPermission('settings', 'edit');

    useEffect(() => {
        if (!isAuthChecking && !canView) {
            // Optional: Redirect or just show Access Denied
        }
    }, [isAuthChecking, canView]);

    useEffect(() => {
        if (canView) {
            fetch("/api/admin/settings/rewards")
                .then(res => res.json())
                .then(data => {
                    setConfig({
                        BUYER_REWARD_RATE: data.BUYER_REWARD_RATE.toString(),
                        SELLER_REWARD_RATE: data.SELLER_REWARD_RATE.toString(),
                        POINT_VALUE_USD: data.POINT_VALUE_USD.toString()
                    });
                })
                .catch(() => toast.error("Failed to fetch settings"))
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [canView]);

    const handleSave = async () => {
        if (!canEdit) {
            toast.error("Permission denied");
            return;
        }
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/settings/rewards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });

            if (res.ok) {
                toast.success("Settings updated successfully");
            } else {
                toast.error("Failed to update settings");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    if (isAuthChecking || isLoading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!canView) {
        return <AccessDenied message="You do not have permission to configure reward settings." />;
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Reward System Configuration</h1>

            <div className="grid grid-cols-1 gap-6">
                {/* Rates Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>Global Exchange Rates</CardTitle>
                        <CardDescription>Control how points are earned and redeemed acros the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Buyer Earn Rate (Points per $1)</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={config.BUYER_REWARD_RATE}
                                        onChange={e => setConfig({ ...config, BUYER_REWARD_RATE: e.target.value })}
                                    />
                                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">Pts/$</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Default: 1.0 (Spend $100 = Earn 100 Points)</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Seller Earn Rate (Points per $1 Sold)</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={config.SELLER_REWARD_RATE}
                                        onChange={e => setConfig({ ...config, SELLER_REWARD_RATE: e.target.value })}
                                    />
                                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">Pts/$</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Default: 1.0 (Sell $100 = Earn 100 Points)</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Redemption Value ($ per Point)</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        step="0.001"
                                        value={config.POINT_VALUE_USD}
                                        onChange={e => setConfig({ ...config, POINT_VALUE_USD: e.target.value })}
                                    />
                                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">$/Pt</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Default: 0.01 (100 Points = $1.00 off)</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <StatefulButton
                                onClick={handleSave}
                                isLoading={isSaving}
                                disabled={!canEdit}
                                loadingText="Saving..."
                                className="w-32"
                            >
                                <Save className="mr-2 size-4" />
                                Save
                            </StatefulButton>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
