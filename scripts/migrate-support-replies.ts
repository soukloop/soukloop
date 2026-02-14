import { prisma } from "../lib/prisma";

async function migrateReplies() {
    console.log("Starting migration of support replies...");

    const tickets = await prisma.supportTicket.findMany({
        where: {
            adminReply: {
                not: null
            }
        }
    });

    console.log(`Found ${tickets.length} tickets with replies.`);

    for (const ticket of tickets) {
        if (!ticket.adminReply) continue;

        // Check if message already exists to avoid duplication
        const existingMessage = await prisma.supportMessage.findFirst({
            where: {
                ticketId: ticket.id,
                content: ticket.adminReply,
                type: "admin"
            }
        });

        if (!existingMessage) {
            await prisma.supportMessage.create({
                data: {
                    ticketId: ticket.id,
                    content: ticket.adminReply,
                    type: "admin",
                    // Use ticket's updatedAt as a best guess for the reply time
                    createdAt: ticket.updatedAt
                }
            });
            console.log(`Migrated reply for ticket ${ticket.id}`);
        } else {
            console.log(`Reply for ticket ${ticket.id} already migrated.`);
        }
    }

    console.log("Migration completed.");
}

migrateReplies()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
