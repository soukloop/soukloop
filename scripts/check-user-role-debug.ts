
import { prisma } from '../lib/prisma';

async function main() {
    const userId = 'cmkwmekc80000vanc42r2mxaa';
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, model: true } // Assuming 'model' field exists on User if referenced in middleware? 
        // Wait, middleware checks `(user as any).model`. Does User model actually have a 'model' field?
        // If not, where does it come from? 
        // auth.config.ts says: `(session.user as any).model = token.model as string;`
        // and `token.model = (user as any).model;`
        // This implies the `user` object returned from the adapter has a `model` property.
        // If using Prisma Adapter, it comes from the User model in schema.prisma.
    });

    console.log('User:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
