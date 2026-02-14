import { prisma } from "../lib/prisma";

async function main() {
    const latestProduct = await prisma.product.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { name: true, price: true, createdAt: true }
    });

    console.log("Latest Product:", latestProduct);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
