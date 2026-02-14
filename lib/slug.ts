
import slugify from 'slugify';
import { prisma } from '@/lib/prisma'; // Ensure this path is correct

/**
 * Generates a unique slug for a given model.
 * 
 * @param {string} name - The name to base the slug on.
 * @param {any} modelDelegate - The Prisma model delegate to check against (e.g., prisma.product).
 * @param {string} field - The field name to check for uniqueness (default: 'slug').
 * @returns {Promise<string>} - A unique slug.
 */
export async function generateUniqueSlug(
    name: string,
    modelDelegate: any,
    field: string = 'slug'
): Promise<string> {
    let slug = slugify(name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });

    // Check if the initial slug exists
    let exists = await modelDelegate.findFirst({
        where: { [field]: slug },
    });

    if (!exists) {
        return slug;
    }

    // If it exists, append a counter until it's unique
    let counter = 1;
    let newSlug = `${slug}-${counter}`;

    while (await modelDelegate.findFirst({ where: { [field]: newSlug } })) {
        counter++;
        newSlug = `${slug}-${counter}`;
    }

    return newSlug;
}
