import { stripeSession, paypalCreate, paypalCapture, cryptoCreate } from '../services/payments.service'

// ===== PAYMENTS HOOK =====
export function usePayments() {
  // Stripe checkout function
  const stripeCheckout = async (orderId: string) => {
    const { data, error } = await stripeSession(orderId)
    if (error) {
      throw new Error(error.message)
    }
    // Redirect to Stripe checkout
    if (data?.url) {
      window.location.href = data.url
    }
    return data
  }

  // PayPal checkout function
  const paypalCheckout = async (orderId: string) => {
    const { data, error } = await paypalCreate(orderId)
    if (error) {
      throw new Error(error.message)
    }
    // Redirect to PayPal approval
    if (data?.approvalUrl) {
      window.location.href = data.approvalUrl
    }
    return data
  }

  // Crypto checkout function
  const cryptoCheckout = async (orderId: string) => {
    const { data, error } = await cryptoCreate(orderId)
    if (error) {
      throw new Error(error.message)
    }
    // Redirect to crypto payment page with the payment details
    if (data?.address) {
      // Create a hosted URL with the crypto payment details
      const hostedUrl = `/cart/crypto-payment?orderId=${orderId}&address=${encodeURIComponent(data.address)}&amount=${data.amount}&currency=${data.currency}&expiresAt=${encodeURIComponent(data.expiresAt)}`
      window.location.href = hostedUrl
    }
    return data
  }

  return {
    // Payment methods
    stripeCheckout,
    paypalCheckout,
    cryptoCheckout
  }
}

// ===== PAYPAL COMPLETE FLOW HOOK =====
export function usePaypalCompleteFlow() {
  const capturePayment = async (paypalOrderId: string) => {
    const { data, error } = await paypalCapture(paypalOrderId)
    if (error) {
      throw new Error(error.message)
    }
    console.log('PayPal payment completed:', data?.id)
    // Redirect to success page or show success message
    window.location.href = '/orders/success'
    return data
  }

  return {
    capturePayment
  }
}

// ===== PAYMENT STATUS HOOK =====
export function usePaymentStatus() {
  const getPaymentStatus = (provider: string, providerRef: string) => {
    // This would typically call an API to check payment status
    // For now, return a mock status
    return {
      status: 'PENDING',
      amount: 0,
      currency: 'USD',
      createdAt: new Date().toISOString()
    }
  }

  const isPaymentComplete = (status: string) => {
    return status === 'SUCCEEDED' || status === 'COMPLETED'
  }

  const isPaymentFailed = (status: string) => {
    return status === 'FAILED' || status === 'CANCELED'
  }

  const isPaymentPending = (status: string) => {
    return status === 'PENDING' || status === 'PROCESSING'
  }

  return {
    getPaymentStatus,
    isPaymentComplete,
    isPaymentFailed,
    isPaymentPending
  }
}

// Example usage:
/*
import { usePayments, usePaypalCompleteFlow, usePaymentStatus } from 'src/hooks/usePayments'

// Payment selection
function PaymentSelection({ orderId }: { orderId: string }) {
  const {
    stripeCheckout,
    paypalCheckout,
    cryptoCheckout,
    isStripeLoading,
    isPaypalLoading,
    isCryptoLoading,
    stripeError,
    paypalError,
    cryptoError
  } = usePayments()

  const handleStripePayment = () => {
    stripeCheckout(orderId)
  }

  const handlePaypalPayment = () => {
    paypalCheckout(orderId)
  }

  const handleCryptoPayment = () => {
    cryptoCheckout(orderId)
  }

  return (
    <div className="payment-methods">
      <h2>Choose Payment Method</h2>
      
      <div className="payment-option">
        <button 
          onClick={handleStripePayment}
          disabled={isStripeLoading}
          className="stripe-button"
        >
          {isStripeLoading ? 'Processing...' : 'Pay with Stripe'}
        </button>
        {stripeError && <div className="error">Stripe Error: {stripeError.message}</div>}
      </div>

      <div className="payment-option">
        <button 
          onClick={handlePaypalPayment}
          disabled={isPaypalLoading}
          className="paypal-button"
        >
          {isPaypalLoading ? 'Processing...' : 'Pay with PayPal'}
        </button>
        {paypalError && <div className="error">PayPal Error: {paypalError.message}</div>}
      </div>

      <div className="payment-option">
        <button 
          onClick={handleCryptoPayment}
          disabled={isCryptoLoading}
          className="crypto-button"
        >
          {isCryptoLoading ? 'Processing...' : 'Pay with Crypto'}
        </button>
        {cryptoError && <div className="error">Crypto Error: {cryptoError.message}</div>}
      </div>
    </div>
  )
}

// PayPal return page
function PaypalReturnPage() {
  const { capturePayment, isCapturing, captureError } = usePaypalCompleteFlow()
  const [paypalOrderId, setPaypalOrderId] = useState('')

  useEffect(() => {
    // Get PayPal order ID from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const orderId = urlParams.get('paypalOrderId')
    if (orderId) {
      setPaypalOrderId(orderId)
      capturePayment(orderId)
    }
  }, [])

  if (isCapturing) {
    return <div>Processing your payment...</div>
  }

  if (captureError) {
    return (
      <div>
        <h2>Payment Failed</h2>
        <p>Error: {captureError.message}</p>
        <button onClick={() => window.location.href = '/checkout'}>
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2>Payment Successful!</h2>
      <p>Your order has been processed.</p>
      <button onClick={() => window.location.href = '/orders'}>
        View Orders
      </button>
    </div>
  )
}

// Payment status checker
function PaymentStatusChecker({ paymentId }: { paymentId: string }) {
  const { getPaymentStatus, isPaymentComplete, isPaymentFailed, isPaymentPending } = usePaymentStatus()
  const [status, setStatus] = useState('PENDING')

  useEffect(() => {
    const checkStatus = async () => {
      const paymentStatus = getPaymentStatus('stripe', paymentId)
      setStatus(paymentStatus.status)
    }
    
    checkStatus()
    const interval = setInterval(checkStatus, 5000) // Check every 5 seconds
    
    return () => clearInterval(interval)
  }, [paymentId])

  if (isPaymentComplete(status)) {
    return <div className="success">Payment completed successfully!</div>
  }

  if (isPaymentFailed(status)) {
    return <div className="error">Payment failed. Please try again.</div>
  }

  if (isPaymentPending(status)) {
    return <div className="pending">Payment is being processed...</div>
  }

  return <div>Unknown payment status</div>
}

// Combined payment management
function PaymentManagement({ orderId }: { orderId: string }) {
  const {
    stripeCheckout,
    paypalCheckout,
    cryptoCheckout,
    isAnyLoading
  } = usePayments()

  const { capturePayment } = usePaypalCompleteFlow()

  return (
    <div>
      <h1>Payment Management</h1>
      
      <div className="payment-buttons">
        <button onClick={() => stripeCheckout(orderId)} disabled={isAnyLoading}>
          Pay with Stripe
        </button>
        <button onClick={() => paypalCheckout(orderId)} disabled={isAnyLoading}>
          Pay with PayPal
        </button>
        <button onClick={() => cryptoCheckout(orderId)} disabled={isAnyLoading}>
          Pay with Crypto
        </button>
      </div>

      {isAnyLoading && <div>Processing payment...</div>}
    </div>
  )
}
*/
