import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addressUpdateSchema = z.object({
  // NOTE: Option A => NO `type` field (your Prisma model uses booleans)
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  company: z.string().optional(),
  address1: z.string().min(1).optional(),
  address2: z.string().optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  phone: z.string().optional(),

  isDefault: z.boolean().optional(),
  isSellerAddress: z.boolean().optional(),
  isShipping: z.boolean().optional(),
  isBilling: z.boolean().optional(),
});

// Helper: only include keys that Prisma Address model actually has.
// If your Address model does NOT include firstName/lastName/company/phone,
// remove them from schema + this function.
function buildUpdateData(input: z.infer<typeof addressUpdateSchema>) {
  const data: Record<string, any> = {};

  if (typeof input.firstName !== "undefined") data.firstName = input.firstName;
  if (typeof input.lastName !== "undefined") data.lastName = input.lastName;
  if (typeof input.company !== "undefined") data.company = input.company;
  if (typeof input.address1 !== "undefined") data.address1 = input.address1;
  if (typeof input.address2 !== "undefined") data.address2 = input.address2;
  if (typeof input.city !== "undefined") data.city = input.city;
  if (typeof input.state !== "undefined") data.state = input.state;
  if (typeof input.postalCode !== "undefined") data.postalCode = input.postalCode;
  if (typeof input.country !== "undefined") data.country = input.country;
  if (typeof input.phone !== "undefined") data.phone = input.phone;

  if (typeof input.isDefault !== "undefined") data.isDefault = input.isDefault;
  if (typeof input.isSellerAddress !== "undefined") data.isSellerAddress = input.isSellerAddress;
  if (typeof input.isShipping !== "undefined") data.isShipping = input.isShipping;
  if (typeof input.isBilling !== "undefined") data.isBilling = input.isBilling;

  return data;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;

  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const address = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error("Address GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;

  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = addressUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const input = validationResult.data;

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const updateData = buildUpdateData(input);

    // If setting as default, unset other defaults for the same category/categories.
    // Categories are defined by booleans: isBilling / isShipping / isSellerAddress
    if (input.isDefault === true) {
      const isBilling = input.isBilling ?? existingAddress.isBilling;
      const isShipping = input.isShipping ?? existingAddress.isShipping;
      const isSellerAddress = input.isSellerAddress ?? existingAddress.isSellerAddress;

      // Build OR conditions for categories that apply
      const orConditions: any[] = [];
      if (isBilling) orConditions.push({ isBilling: true });
      if (isShipping) orConditions.push({ isShipping: true });
      if (isSellerAddress) orConditions.push({ isSellerAddress: true });

      // If none matched (edge case), fallback: unset all other defaults for the user
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          id: { not: params.id },
          ...(orConditions.length ? { OR: orConditions } : {}),
        },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: params.id },
      data: updateData,
    });

    // Notify user about address update (best-effort)
    try {
      const { notifyProfileUpdated } = await import(
        "@/lib/notifications/templates/account-templates"
      );
      const userName = session.user.name || "User";
      notifyProfileUpdated(session.user.id, userName, "Address").catch((err: any) =>
        console.error("Failed to send address update notification:", err)
      );
    } catch (err) {
      console.error("Notification import failed:", err);
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error("Address PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;

  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if address exists and belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Address DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// import { NextRequest, NextResponse } from 'next/server'
// import { auth } from "@/auth"
// import { prisma } from '@/lib/prisma'
// import { z } from 'zod'

// const addressUpdateSchema = z.object({
//     type: z.enum(['billing', 'shipping']).optional(),
//     firstName: z.string().min(1).optional(),
//     lastName: z.string().min(1).optional(),
//     company: z.string().optional(),
//     address1: z.string().min(1).optional(),
//     address2: z.string().optional(),
//     city: z.string().min(1).optional(),
//     state: z.string().min(1).optional(),
//     postalCode: z.string().min(1).optional(),
//     country: z.string().min(1).optional(),
//     phone: z.string().optional(),
//     isDefault: z.boolean().optional(),
//     isSellerAddress: z.boolean().optional(),
//     isShipping: z.boolean().optional(),
//     isBilling: z.boolean().optional()
// })

// export async function GET(
//     request: NextRequest,
//     props: { params: Promise<{ id: string }> }
// ) {
//     const params = await props.params;
//     try {
//         const session = await auth()

//         if (!session?.user) {
//             return NextResponse.json(
//                 { error: 'Unauthorized' },
//                 { status: 401 }
//             )
//         }

//         const address = await prisma.address.findFirst({
//             where: {
//                 id: params.id,
//                 userId: session.user.id
//             }
//         })

//         if (!address) {
//             return NextResponse.json(
//                 { error: 'Address not found' },
//                 { status: 404 }
//             )
//         }

//         return NextResponse.json(address)

//     } catch (error) {
//         console.error('Address GET error:', error)
//         return NextResponse.json(
//             { error: 'Internal server error' },
//             { status: 500 }
//         )
//     }
// }

// export async function PUT(
//     request: NextRequest,
//     props: { params: Promise<{ id: string }> }
// ) {
//     const params = await props.params;
//     try {
//         const session = await auth()

//         if (!session?.user) {
//             return NextResponse.json(
//                 { error: 'Unauthorized' },
//                 { status: 401 }
//             )
//         }

//         const body = await request.json()
//         const validationResult = addressUpdateSchema.safeParse(body)

//         if (!validationResult.success) {
//             return NextResponse.json(
//                 { error: 'Invalid input', details: validationResult.error.flatten() },
//                 { status: 400 }
//             )
//         }

//         const data = validationResult.data

//         // Check if address exists and belongs to user
//         const existingAddress = await prisma.address.findFirst({
//             where: {
//                 id: params.id,
//                 userId: session.user.id
//             }
//         })

//         if (!existingAddress) {
//             return NextResponse.json(
//                 { error: 'Address not found' },
//                 { status: 404 }
//             )
//         }

//         // If setting as default, unset other defaults of the same type
//         if (data.isDefault) {
//             await prisma.address.updateMany({
//                 where: {
//                     userId: session.user.id,
//                     type: data.type || existingAddress.type,
//                     id: { not: params.id }
//                 },
//                 data: {
//                     isDefault: false
//                 }
//             })
//         }

//         const address = await prisma.address.update({
//             where: { id: params.id },
//             data
//         })

//         // Notify user about address update
//         const { notifyProfileUpdated } = await import('@/lib/notifications/templates/account-templates');
//         const userName = session.user.name || 'User';

//         notifyProfileUpdated(session.user.id, userName, 'Address').catch(err =>
//             console.error('Failed to send address update notification:', err)
//         );

//         return NextResponse.json(address)

//     } catch (error) {
//         console.error('Address PUT error:', error)
//         return NextResponse.json(
//             { error: 'Internal server error' },
//             { status: 500 }
//         )
//     }
// }

// export async function DELETE(
//     request: NextRequest,
//     props: { params: Promise<{ id: string }> }
// ) {
//     const params = await props.params;
//     try {
//         const session = await auth()

//         if (!session?.user) {
//             return NextResponse.json(
//                 { error: 'Unauthorized' },
//                 { status: 401 }
//             )
//         }

//         // Check if address exists and belongs to user
//         const address = await prisma.address.findFirst({
//             where: {
//                 id: params.id,
//                 userId: session.user.id
//             }
//         })

//         if (!address) {
//             return NextResponse.json(
//                 { error: 'Address not found' },
//                 { status: 404 }
//             )
//         }

//         await prisma.address.delete({
//             where: { id: params.id }
//         })

//         return NextResponse.json({ message: 'Address deleted successfully' })

//     } catch (error) {
//         console.error('Address DELETE error:', error)
//         return NextResponse.json(
//             { error: 'Internal server error' },
//             { status: 500 }
//         )
//     }
// }
