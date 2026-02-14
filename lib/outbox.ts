import { prisma } from "@/lib/prisma";

export type OutboxMethod = "publish";

export interface OutboxPayload {
    channel: string;
    data: any;
}

/**
 * Centrifugo Transactional Outbox Service
 * 
 * This service ensures that real-time events are only sent if the database transaction 
 * is successfully committed. Centrifugo v6 will then pick up these events from the 
 * centrifugo_outbox table and push them to the clients.
 */
export const outbox = {
    /**
     * Add a publish event to the outbox.
     * Best used within a prisma.$transaction.
     */
    async publish(channel: string, data: any, tx?: any) {
        const db = tx || prisma;

        return await db.centrifugoOutbox.create({
            data: {
                method: "publish",
                payload: {
                    channel,
                    data,
                },
                partition: 0, // We can use more partitions if load increases
            },
        });
    },

    /**
     * Helper for personal user channels
     */
    async sendToUser(userId: string, data: any, tx?: any) {
        return this.publish(`personal:${userId}`, data, tx);
    },

    /**
     * Helper for public channels
     */
    async broadcast(channel: string, data: any, tx?: any) {
        return this.publish(`public:${channel}`, data, tx);
    }
};
