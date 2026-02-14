"use server";

/**
 * Centrifugo Real-Time Messaging Helper
 * 
 * Used for publishing real-time events to connected clients via Centrifugo.
 * Common use cases:
 * - Role changes: notify user their permissions changed
 * - Session invalidation: force logout on security events
 * - Notifications: push new notifications to user
 */

const CENTRIFUGO_API_URL = process.env.CENTRIFUGO_API_URL || 'http://localhost:8000/api';
const CENTRIFUGO_API_KEY = process.env.CENTRIFUGO_API_KEY;

interface CentrifugoPublishOptions {
    channel: string;
    data: any;
}

interface CentrifugoResponse {
    success: boolean;
    error?: string;
}

/**
 * Publish a message to a Centrifugo channel
 * 
 * @param channel - The channel to publish to (e.g., "user:123:notifications")
 * @param data - The data payload to send (will be JSON stringified)
 * @returns Success status and optional error message
 * 
 * @example
 * ```typescript
 * await centrifugoPublish('user:123:role-changed', {
 *   newRole: 'SELLER',
 *   message: 'You have been promoted!'
 * });
 * ```
 */
export async function centrifugoPublish(
    channel: string,
    data: any
): Promise<CentrifugoResponse> {
    // Check if Centrifugo is configured
    if (!CENTRIFUGO_API_KEY) {
        console.warn('[Centrifugo] API key not configured - skipping publish');
        return { success: false, error: 'Centrifugo not configured' };
    }

    try {
        const response = await fetch(`${CENTRIFUGO_API_URL}/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `apikey ${CENTRIFUGO_API_KEY}`,
            },
            body: JSON.stringify({
                channel,
                data,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        console.log(`[Centrifugo] Published to channel: ${channel}`);
        return { success: true };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Centrifugo] Publish error on channel ${channel}:`, errorMessage);
        return { success: false, error: errorMessage };
    }
}

/**
 * Publish to multiple channels at once
 * More efficient than calling centrifugoPublish multiple times
 * 
 * @param publishes - Array of channel/data pairs to publish
 * @returns Success status and count of successful publishes
 * 
 * @example
 * ```typescript
 * await centrifugoBatchPublish([
 *   { channel: 'user:123:notifications', data: { ... } },
 *   { channel: 'user:456:notifications', data: { ... } }
 * ]);
 * ```
 */
export async function centrifugoBatchPublish(
    publishes: CentrifugoPublishOptions[]
): Promise<{ success: boolean; successCount: number; errors: string[] }> {
    if (!CENTRIFUGO_API_KEY) {
        return {
            success: false,
            successCount: 0,
            errors: ['Centrifugo not configured']
        };
    }

    const errors: string[] = [];
    let successCount = 0;

    // Use Promise.allSettled to try all publishes even if some fail
    const results = await Promise.allSettled(
        publishes.map(({ channel, data }) =>
            centrifugoPublish(channel, data)
        )
    );

    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
            successCount++;
        } else if (result.status === 'fulfilled' && result.value.error) {
            errors.push(`Channel ${publishes[index].channel}: ${result.value.error}`);
        } else if (result.status === 'rejected') {
            errors.push(`Channel ${publishes[index].channel}: ${result.reason}`);
        }
    });

    return {
        success: successCount === publishes.length,
        successCount,
        errors
    };
}

/**
 * Disconnect a user from Centrifugo (force disconnect all their connections)
 * Useful when logging out a user or banning them
 * 
 * @param userId - The user ID to disconnect
 */
export async function centrifugoDisconnectUser(userId: string): Promise<CentrifugoResponse> {
    if (!CENTRIFUGO_API_KEY) {
        return { success: false, error: 'Centrifugo not configured' };
    }

    try {
        const response = await fetch(`${CENTRIFUGO_API_URL}/disconnect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `apikey ${CENTRIFUGO_API_KEY}`,
            },
            body: JSON.stringify({
                user: userId,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        console.log(`[Centrifugo] Disconnected user: ${userId}`);
        return { success: true };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Centrifugo] Disconnect error for user ${userId}:`, errorMessage);
        return { success: false, error: errorMessage };
    }
}
