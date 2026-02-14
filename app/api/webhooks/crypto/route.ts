import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-wrapper'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-cc-webhook-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Coinbase signature' },
        { status: 400 }
      )
    }

    // TODO: Verify webhook signature with Coinbase Commerce
    // TODO: Parse webhook event
    // TODO: Handle payment events (charge:confirmed, etc.)
    // TODO: Update order status in database

    console.log('Coinbase webhook received:', { body, signature })

    return NextResponse.json({ received: true })

  } catch (error) {
    return handleApiError(error)
  }
}
