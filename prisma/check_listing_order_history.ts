import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking listing orders for status history entries...')

  const ordersWithHistory = await prisma.order.findMany({
    where: {},
    include: { history: true },
    take: 10
  })

  const anyWithHistory = ordersWithHistory.some((o) => o.history.length > 0)

  if (!anyWithHistory) {
    console.error('No orders with status history found. Test failed.')
    process.exit(2)
  }

  console.log('Found orders with status history. Test passed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
