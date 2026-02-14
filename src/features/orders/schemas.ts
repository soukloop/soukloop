import { z } from "zod";

export const OrderQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    status: z.string().optional(),
    sort: z.string().optional().default("createdAt_desc"),
});

export type OrderQuery = z.infer<typeof OrderQuerySchema>;

export const UpdateStatusSchema = z.object({
    id: z.string(),
    status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "PAID", "CANCELED", "REFUNDED"]),
    trackingNumber: z.string().optional(),
    carrier: z.string().optional(),
});

export type UpdateStatus = z.infer<typeof UpdateStatusSchema>;
