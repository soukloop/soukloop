
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const occasions = [
  'Casual', 'Formal', 'Party', 'Wedding', 'Festive', 'Sports', 'Religious'
];

const fabrics = [
  'Cotton', 'Silk', 'Polyester', 'Wool', 'Linen', 'Denim', 'Leather'
];

async function main() {
  console.log('Seeding Occasions...');
  for (const name of occasions) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await prisma.occasion.upsert({
      where: { slug },
      update: { name },
      create: { name, slug }
    });
  }

  console.log('Seeding Fabrics...');
  for (const name of fabrics) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    // Using Material model for Fabrics as per schema
    await prisma.material.upsert({
      where: { slug },
      update: { name },
      create: { name, slug }
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
