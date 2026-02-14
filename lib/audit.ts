
import { prisma } from './prisma';

interface AuditLogOptions {
    userId?: string;
    action: string;
    entity: string;
    entityId: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
}

export async function logAudit(options: AuditLogOptions) {
    try {
        await prisma.auditLog.create({
            data: {
                userId: options.userId,
                action: options.action,
                entity: options.entity,
                entityId: options.entityId,
                details: options.details ?? {},
                ipAddress: options.ipAddress,
                userAgent: options.userAgent
            }
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // We generally don't want audit logging failure to crash the main request,
        // but for critical systems we might want to throw.
        // For now, silent fail with log is safer for availability.
    }
}
