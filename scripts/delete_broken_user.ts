
import { prisma } from '../lib/prisma';

async function deleteUser() {
    const email = 'munibrehman326@gmail.com';
    console.log(`PREPARING TO DELETE USER: ${email}`);
    console.log('---------------------------------------------------');

    try {
        // 1. Double check the user exists and print their ID to be sure
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true }
        });

        if (!user) {
            console.log('❌ User NOT FOUND. Nothing to delete.');
            return;
        }

        console.log(`✅ FOUND USER: ${user.name} (${user.email})`);
        console.log(`   ID: ${user.id}`);

        // 2. Perform the deletion
        console.log('   Deleting...');

        // We use delete (not deleteMany) to ensure we target the unique field
        const deletedUser = await prisma.user.delete({
            where: { email: email }
        });

        console.log('---------------------------------------------------');
        console.log(`✅ SUCCESSFULLY DELETED user with email: ${deletedUser.email}`);
        console.log(`   Deleted User ID: ${deletedUser.id}`);
        console.log('   (Cascading deletes handled by Prisma/Database schema)');

    } catch (error) {
        console.error('❌ ERROR performing deletion:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteUser();
