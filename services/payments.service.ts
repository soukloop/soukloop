import { apiPost, type ApiResponse } from '../lib/api'
import type { Payment } from '../types/api'

// Payment service functions
export async function stripeSession(orderId: string): Promise<ApiResponse<{ sessionId: string; url: string }>> {
  return apiPost<{ sessionId: string; url: string }>('/api/payments/stripe/session', { orderId })
}

export async function paypalCreate(orderId: string): Promise<ApiResponse<{ paypalOrderId: string; approvalUrl: string }>> {
  return apiPost<{ paypalOrderId: string; approvalUrl: string }>('/api/payments/paypal/create', { orderId })
}

export async function paypalCapture(paypalOrderId: string): Promise<ApiResponse<Payment>> {
  return apiPost<Payment>('/api/payments/paypal/capture', { paypalOrderId })
}

export async function cryptoCreate(orderId: string): Promise<ApiResponse<{ 
  address: string
  amount: number
  currency: string
  expiresAt: string
}>> {
  return apiPost<{ 
    address: string
    amount: number
    currency: string
    expiresAt: string
  }>('/api/payments/crypto/create', { orderId })
}

// Example usage:
/*
// Stripe payment flow
const { data: stripeData, error: stripeError } = await stripeSession('order123')

if (stripeError) {
  console.error('Stripe session creation failed:', stripeError.message)
} else {
  console.log('Stripe session created:', stripeData?.sessionId)
  // Redirect user to stripeData.url for payment
  window.location.href = stripeData?.url || ''
}

// PayPal payment flow
const { data: paypalData, error: paypalError } = await paypalCreate('order123')

if (paypalError) {
  console.error('PayPal order creation failed:', paypalError.message)
} else {
  console.log('PayPal order created:', paypalData?.paypalOrderId)
  // Redirect user to paypalData.approvalUrl for approval
  window.location.href = paypalData?.approvalUrl || ''
}

// PayPal capture after user approval
const { data: payment, error: captureError } = await paypalCapture('paypal_order_456')

if (captureError) {
  console.error('PayPal capture failed:', captureError.message)
} else {
  console.log('Payment captured:', payment?.id, 'Status:', payment?.status)
}

// Crypto payment
const { data: cryptoData, error: cryptoError } = await cryptoCreate('order123')

if (cryptoError) {
  console.error('Crypto payment creation failed:', cryptoError.message)
} else {
  console.log('Crypto payment details:', {
    address: cryptoData?.address,
    amount: cryptoData?.amount,
    currency: cryptoData?.currency,
    expiresAt: cryptoData?.expiresAt
  })
}

// Complete payment workflow example
export async function processPaymentWorkflow(orderId: string, paymentMethod: 'stripe' | 'paypal' | 'crypto') {
  try {
    let paymentData: any
    let error: any

    switch (paymentMethod) {
      case 'stripe':
        const stripeResult = await stripeSession(orderId)
        paymentData = stripeResult.data
        error = stripeResult.error
        break

      case 'paypal':
        const paypalResult = await paypalCreate(orderId)
        paymentData = paypalResult.data
        error = paypalResult.error
        break

      case 'crypto':
        const cryptoResult = await cryptoCreate(orderId)
        paymentData = cryptoResult.data
        error = cryptoResult.error
        break

      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`)
    }

    if (error) {
      throw new Error(`Payment initialization failed: ${error.message}`)
    }

    console.log(`${paymentMethod} payment initialized for order ${orderId}`)
    return paymentData
  } catch (err) {
    console.error('Payment workflow failed:', err)
    throw err
  }
}

// PayPal complete flow example
export async function paypalCompleteFlow(orderId: string) {
  try {
    // Step 1: Create PayPal order
    const { data: createData, error: createError } = await paypalCreate(orderId)
    
    if (createError) {
      throw new Error(`PayPal order creation failed: ${createError.message}`)
    }

    console.log('PayPal order created:', createData?.paypalOrderId)
    
    // Step 2: User would be redirected to approvalUrl for approval
    // After approval, they return with the paypalOrderId
    
    // Step 3: Capture the payment (this would typically be called from a webhook or return page)
    const { data: payment, error: captureError } = await paypalCapture(createData?.paypalOrderId || '')
    
    if (captureError) {
      throw new Error(`PayPal capture failed: ${captureError.message}`)
    }

    console.log('Payment completed:', payment?.id, 'Status:', payment?.status)
    return payment
  } catch (err) {
    console.error('PayPal flow failed:', err)
    throw err
  }
}
*/
