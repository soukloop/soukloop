import { z } from 'zod';

export const AdminSettingsSchema = z.object({
    siteName: z.string().min(1, "Site name is required"),
    siteEmail: z.string().email("Invalid email address"),
    supportEmail: z.string().email("Invalid support email"),
    currency: z.string().min(1, "Currency is required"),
    timezone: z.string().min(1, "Timezone is required"),
    maintenanceMode: z.enum(['true', 'false']),
    allowRegistration: z.enum(['true', 'false']),
    requireEmailVerification: z.enum(['true', 'false']),
});

export type AdminSettingsInput = z.infer<typeof AdminSettingsSchema>;
