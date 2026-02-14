import { prisma } from './lib/prisma'
import { compare } from 'bcryptjs'

async function checkUser() {
    const email = 'buyer@example.com'
    const password = 'buyer123'

    console.log(`Checking user: ${email}`)

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            console.log('User not found in database.')
            return
        }

        console.log('User found:', user.id, user.email, user.role)
        console.log('Stored hash:', user.password)

        if (!user.password) {
            console.log('User has no password set.')
            return
        }

        const isValid = await compare(password, user.password)
        console.log(`Password '${password}' is valid: ${isValid}`)

    } catch (error) {
        console.error('Error checking user:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkUser()
