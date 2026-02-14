import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const count = await prisma.product.count({
    where: {
      NOT: {
        dress: null
      }
    }
  })
  const sample = await prisma.product.findFirst({
    where: { NOT: { dress: null } },
    select: { name: true, dress: true, gender: true, fabric: true, occasion: true }
  })
  return NextResponse.json({ count, sample })
}
