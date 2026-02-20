
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'mailer@soukloop.com' },
        select: { email: true, role: true }
    });
    console.log('User found:', user);
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
