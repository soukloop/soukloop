
import { logAudit } from '../lib/audit';
import { prisma } from '../lib/prisma';

async function testAudit() {
    console.log('Testing Audit Log...');

    const action = 'TEST_ACTION';
    const entityId = 'test-entity-123';

    try {
        // 1. Log an action
        await logAudit({
            action,
            entity: 'SystemVal',
            entityId,
            details: { test: true },
            ipAddress: '127.0.0.1',
            userAgent: 'TestScript/1.0'
        });

        // 2. Verify it exists in DB
        const log = await prisma.auditLog.findFirst({
            where: {
                action,
                entityId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (log) {
            console.log('✅ Audit log found in DB:', log.id);
            // Cleanup
            await prisma.auditLog.delete({ where: { id: log.id } });
        } else {
            throw new Error('Audit log not found in DB');
        }

    } catch (error) {
        console.error('❌ Audit Test Failed:', error);
        process.exit(1);
    }
}

testAudit();
