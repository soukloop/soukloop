import { prisma } from "@/lib/prisma";

export const generateVerificationToken = async (email: string) => {
    // Generate a random 6-digit code
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 1 hour from now
    const expires = new Date(new Date().getTime() + 3600 * 1000);

    // Check if a token already exists for this email
    const existingToken = await prisma.verificationToken.findFirst({
        where: { identifier: email },
    });

    if (existingToken) {
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: existingToken.identifier,
                    token: existingToken.token,
                },
            },
        });
    }

    // Create the new token
    const verificationToken = await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires,
        },
    });

    return verificationToken;
};
