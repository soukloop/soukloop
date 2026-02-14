
import { prisma } from "../lib/prisma"

async function main() {
    const userCount = await prisma.user.count()
    const vendorCount = await prisma.vendor.count()
    const sellers = await prisma.user.findMany({
        where: { role: 'SELLER' },
        select: { email: true, id: true }
    })

    console.log('--- DB REPORT ---')
    console.log(`Total Users: ${userCount}`)
    console.log(`Total Vendors: ${vendorCount}`)
    console.log(`Sellers found: ${sellers.length}`)
    sellers.forEach(s => console.log(` - ${s.email} (${s.id})`))
    console.log('-----------------')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
