import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const productId = 'cmkf6jhhm002vva3ow9p17uf5';
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            images: true
        }
    });

    console.log(JSON.stringify(product, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
