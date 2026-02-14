import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "System Settings - Admin",
    description: "Manage system-wide settings and configurations.",
};

export default async function SystemSettingsPage() {
    // Fetch settings from DB (Server-Side)
    const settings = await prisma.settings.findMany();

    // Convert to key-value object
    const initialData = settings.reduce((acc: Record<string, string>, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your store's general configuration and feature toggles.
                </p>
            </div>

            <SettingsForm initialData={initialData} />
        </div>
    );
}
