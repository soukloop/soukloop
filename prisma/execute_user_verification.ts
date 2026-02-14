import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting User Verification SQL execution...')

    const user = await prisma.user.findFirst()

    if (!user) {
        console.error('Need at least 1 user.')
        return
    }

    console.log(`User found: ${user.id}`)

    // Create UserVerification
    // Ensure no existing verification for this user to avoid unique constraint error
    const existing = await prisma.userVerification.findUnique({
        where: { userId: user.id }
    })

    if (existing) {
        console.log('Deleting existing verification...')
        await prisma.userVerification.delete({
            where: { userId: user.id }
        })
    }

    const verification = await prisma.userVerification.create({
        data: {
            userId: user.id,
            cnic: '12345-6789012-3',
            documentUrl: 'https://example.com/doc.pdf',
            status: 'pending'
        }
    })

    console.log(`Verification Record Created: ${verification.id}`)

    // Verify
    const fetchedVerification = await prisma.userVerification.findUnique({
        where: { id: verification.id },
        include: {
            user: { select: { email: true } }
        }
    })

    if (fetchedVerification && fetchedVerification.userId === user.id) {
        console.log('Verification Successful:', JSON.stringify(fetchedVerification, null, 2))
    } else {
        console.error('Verification Failed.')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
