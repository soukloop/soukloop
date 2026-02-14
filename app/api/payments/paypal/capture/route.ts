import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { paypalOrderId } = body

    if (!paypalOrderId) {
      return NextResponse.json(
        { error: 'PayPal Order ID is required' },
        { status: 400 }
      )
    }

    // TODO: Integrate with PayPal API to capture payment
    // For now, return a placeholder response
    return NextResponse.json({
      id: 'payment_' + Date.now(),
      status: 'succeeded',
      amount: 10000, // $100.00 in cents
      currency: 'usd',
      provider: 'paypal',
      providerId: paypalOrderId
    })

  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
