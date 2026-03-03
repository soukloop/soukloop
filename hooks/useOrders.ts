import useSWR from 'swr'
import {
  listOrders,
  listVendorOrders,
  checkout,
  refund,
  getOrder,
  getCustomerOrder,
  getDeliveryStatusText,
  getOverallStatus
} from '../services/orders.service'
import type { CustomerOrder, VendorOrder, AddressDto } from '../types/api'
import { useSession } from 'next-auth/react'

// Re-export helper functions for convenience
export { getDeliveryStatusText, getOverallStatus }

// ===== SINGLE ORDER HOOK =====
export function useOrder(orderId?: string) {
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const { data, error, isLoading, mutate } = useSWR(
    isAuthenticated && orderId ? `/api/orders/${orderId}` : null,
    async () => {
      if (!orderId) return null
      const { data, error } = await getOrder(orderId)
      if (error) {
        throw new Error(error.message)
      }
      return data
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate
  }
}

// ===== USER ORDERS HOOK =====
export function useOrders(enabled: boolean = true, mode: 'lite' | 'full' = 'full') {
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const { data, error, isLoading, mutate } = useSWR(
    isAuthenticated && enabled ? `/api/orders?mode=${mode}` : null,
    async () => {
      // Pass the mode to the API call directly
      const res = await fetch(`/api/orders?mode=${mode}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch orders');
      }
      return json.items; // Backend returns { items: [...] }
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate
  }
}

// ===== VENDOR ORDERS HOOK =====
export function useVendorOrders(enabled: boolean = true, mode: 'lite' | 'full' = 'full') {
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const { data, error, isLoading, mutate } = useSWR(
    isAuthenticated && enabled ? `/api/vendor/orders?mode=${mode}` : null,
    async (url: string) => {
      // If url is null (not enabled), SWR won't even call this fetcher
      // It's a double safeguard just in case
      if (!url) return [];

      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch vendor orders');
      }
      return json.items;
    })

  return {
    data,
    error,
    isLoading,
    mutate
  }
}

// ===== CHECKOUT HOOK =====
export function useCheckout() {
  const { mutate: refreshOrders } = useSWR('/api/orders')
  const { mutate: refreshVendorOrders } = useSWR('/api/vendor/orders')
  const { mutate: refreshCart } = useSWR('/api/cart')

  const checkoutAction = async (dto: { shippingAddr: AddressDto }) => {
    const { data, error } = await checkout(dto)
    if (error) {
      throw new Error(error.message)
    }
    // Refresh orders and cart
    await Promise.all([
      refreshOrders(),
      refreshVendorOrders(),
      refreshCart()
    ])
    return data
  }

  return {
    checkout: checkoutAction
  }
}

// ===== REFUND HOOK =====
export function useRefund() {
  const { mutate: refreshOrders } = useSWR('/api/orders')
  const { mutate: refreshVendorOrders } = useSWR('/api/vendor/orders')

  const refundAction = async (orderId: string) => {
    const { data, error } = await refund(orderId)
    if (error) {
      throw new Error(error.message)
    }
    // Refresh orders
    await Promise.all([
      refreshOrders(),
      refreshVendorOrders()
    ])
    return data
  }

  return {
    refund: refundAction
  }
}

// ===== COMBINED ORDERS MANAGEMENT HOOK =====
export function useOrdersManagement() {
  const { data: orders, error: ordersError, isLoading: isLoadingOrders } = useOrders()
  const { data: vendorOrders, error: vendorOrdersError, isLoading: isLoadingVendorOrders } = useVendorOrders()
  const { checkout } = useCheckout()
  const { refund } = useRefund()

  return {
    // User orders
    orders,
    isLoadingOrders,
    isErrorOrders: !!ordersError,
    ordersError,

    // Vendor orders
    vendorOrders,
    isLoadingVendorOrders,
    isErrorVendorOrders: !!vendorOrdersError,
    vendorOrdersError,

    // Actions
    checkout,
    refund
  }
}

// ===== ORDER STATUS HELPERS =====
export function useOrderStatusHelpers() {
  const { data: orders } = useOrders()

  // For CustomerOrders, status is computed from vendorOrders
  const getOrdersByOverallStatus = (status: 'PENDING' | 'PARTIAL' | 'DELIVERED' | 'CANCELED') => {
    if (!Array.isArray(orders)) return []
    return orders.filter(order => getOverallStatus(order) === status)
  }

  const getPendingOrders = () => getOrdersByOverallStatus('PENDING')
  const getPartialOrders = () => getOrdersByOverallStatus('PARTIAL')
  const getDeliveredOrders = () => getOrdersByOverallStatus('DELIVERED')
  const getCanceledOrders = () => getOrdersByOverallStatus('CANCELED')

  const getTotalOrders = () => Array.isArray(orders) ? orders.length : 0
  const getTotalSpent = () => {
    if (!Array.isArray(orders)) return 0
    return orders
      .filter(order => getOverallStatus(order) === 'DELIVERED')
      .reduce((total, order) => total + order.totalAmount, 0)
  }

  const getRecentOrders = (limit: number = 5) => {
    if (!Array.isArray(orders)) return []
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  return {
    getOrdersByOverallStatus,
    getPendingOrders,
    getPartialOrders,
    getDeliveredOrders,
    getCanceledOrders,
    getTotalOrders,
    getTotalSpent,
    getRecentOrders
  }
}

// Example usage:
/*
import { useOrders, useVendorOrders, useCheckout, useRefund, useOrdersManagement } from 'src/hooks/useOrders'

// User orders
function OrdersPage() {
  const { data: orders, isLoading, isError, error } = useOrders()

  if (isLoading) return <div>Loading orders...</div>
  if (isError) return <div>Error: {error?.message}</div>

  return (
    <div>
      <h1>My Orders</h1>
      {orders?.map(order => (
        <div key={order.id} className="order">
          <h3>Order #{order.id}</h3>
          <p>Status: {order.status}</p>
          <p>Total: ${order.totalCents / 100}</p>
          <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          <div>
            {order.items.map(item => (
              <div key={item.id}>
                <span>{item.title} x{item.quantity}</span>
                <span>${item.priceCents / 100}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Vendor orders
function VendorOrdersPage() {
  const { data: vendorOrders, isLoading, isError, error } = useVendorOrders()

  if (isLoading) return <div>Loading vendor orders...</div>
  if (isError) return <div>Error: {error?.message}</div>

  return (
    <div>
      <h1>Vendor Orders</h1>
      {vendorOrders?.map(order => (
        <div key={order.id} className="vendor-order">
          <h3>Order #{order.id}</h3>
          <p>Customer: {order.userId}</p>
          <p>Status: {order.status}</p>
          <p>Total: ${order.totalCents / 100}</p>
        </div>
      ))}
    </div>
  )
}

// Checkout
function CheckoutForm() {
  const { mutate: checkout, isPending, error } = useCheckout()
  const [shippingAddress, setShippingAddress] = useState<AddressDto>({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  })

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    checkout({ shippingAddr: shippingAddress }, {
      onSuccess: (order) => {
        console.log('Order created:', order.id)
        // Redirect to order confirmation page
      }
    })
  }

  return (
    <form onSubmit={handleCheckout}>
      <input
        value={shippingAddress.firstName}
        onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
        placeholder="First Name"
        required
      />
      <input
        value={shippingAddress.lastName}
        onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
        placeholder="Last Name"
        required
      />
      <input
        value={shippingAddress.street}
        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
        placeholder="Street Address"
        required
      />
      <input
        value={shippingAddress.city}
        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
        placeholder="City"
        required
      />
      <input
        value={shippingAddress.state}
        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
        placeholder="State"
        required
      />
      <input
        value={shippingAddress.zipCode}
        onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
        placeholder="ZIP Code"
        required
      />
      <input
        value={shippingAddress.country}
        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
        placeholder="Country"
        required
      />
      
      <button type="submit" disabled={isPending}>
        {isPending ? 'Processing...' : 'Checkout'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  )
}

// Refund
function OrderActions({ orderId }: { orderId: string }) {
  const { mutate: refund, isPending, error } = useRefund()

  const handleRefund = () => {
    refund(orderId, {
      onSuccess: (refundData) => {
        console.log('Refund processed:', refundData.id)
        // Show success message
      }
    })
  }

  return (
    <div>
      <button onClick={handleRefund} disabled={isPending}>
        {isPending ? 'Processing Refund...' : 'Request Refund'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </div>
  )
}

// Combined management
function OrdersManagement() {
  const {
    orders,
    isLoadingOrders,
    vendorOrders,
    isLoadingVendorOrders,
    checkout,
    isCheckingOut,
    refund,
    isRefunding
  } = useOrdersManagement()

  const {
    getPendingOrders,
    getFulfilledOrders,
    getTotalOrders,
    getTotalSpent,
    getRecentOrders
  } = useOrderStatusHelpers()

  return (
    <div>
      <h1>Orders Management</h1>
      <div>
        <h2>Statistics</h2>
        <p>Total Orders: {getTotalOrders()}</p>
        <p>Pending: {getPendingOrders().length}</p>
        <p>Fulfilled: {getFulfilledOrders().length}</p>
        <p>Total Spent: ${getTotalSpent() / 100}</p>
      </div>
      
      <div>
        <h2>Recent Orders</h2>
        {getRecentOrders(3).map(order => (
          <div key={order.id}>
            <span>#{order.id}</span>
            <span>{order.status}</span>
            <span>${order.totalCents / 100}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
*/
