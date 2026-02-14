// Example usage of the typed API wrapper
import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '@/lib/api'
import { fetchProducts, fetchUser, createOrder } from './index'

// Example 1: Basic API calls with destructuring
export async function exampleBasicUsage() {
  // Get user data
  const { data: user, error: userError } = await apiGet<User>('/users/me')
  if (userError) {
    console.error('User error:', userError.message)
    return
  }
  console.log('User:', user?.name)

  // Create a new product
  const { data: product, error: productError } = await apiPost<Product>('/products', {
    name: 'New Product',
    price: 29.99
  })
  if (productError) {
    console.error('Product creation failed:', productError.message)
    return
  }
  console.log('Created product:', product?.id)

  // Update product
  const { data: updatedProduct, error: updateError } = await apiPatch<Product>(`/products/${product?.id}`, {
    name: 'Updated Product Name'
  })
  if (updateError) {
    console.error('Update failed:', updateError.message)
  } else {
    console.log('Updated product:', updatedProduct?.name)
  }

  // Delete product
  const { error: deleteError } = await apiDelete(`/products/${product?.id}`)
  if (deleteError) {
    console.error('Delete failed:', deleteError.message)
  } else {
    console.log('Product deleted successfully')
  }
}

// Example 2: Using service modules
export async function exampleServiceModules() {
  // Fetch products with pagination
  const { data: productsData, error: productsError } = await fetchProducts({ 
    page: 1, 
    pageSize: 10,
    q: 'electronics'
  })
  
  if (productsError) {
    console.error('Products error:', productsError.message)
    return
  }
  
  console.log(`Found ${productsData?.total} products`)
  productsData?.items.forEach(product => {
    console.log(`- ${product.name}: $${product.price}`)
  })

  // Fetch user profile
  const { data: user, error: userError } = await fetchUser('user123')
  if (userError) {
    console.error('User error:', userError.message)
    return
  }
  console.log('User profile:', user?.name, user?.email)

  // Create an order
  const { data: order, error: orderError } = await createOrder({
    items: [
      { productId: 'prod1', quantity: 2, price: 19.99 },
      { productId: 'prod2', quantity: 1, price: 29.99 }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA'
    }
  })
  
  if (orderError) {
    console.error('Order creation failed:', orderError.message)
  } else {
    console.log('Order created:', order?.id, 'Total:', order?.total)
  }
}

// Example 3: Error handling patterns
export async function exampleErrorHandling() {
  const { data, error } = await apiGet<User[]>('/users')
  
  if (error) {
    switch (error.code) {
      case 'HTTP_401':
        console.error('Unauthorized - please login')
        // Redirect to login
        break
      case 'HTTP_403':
        console.error('Forbidden - insufficient permissions')
        break
      case 'HTTP_404':
        console.error('Not found - resource does not exist')
        break
      case 'HTTP_500':
        console.error('Server error - please try again later')
        break
      case 'NETWORK_ERROR':
        console.error('Network error - check your connection')
        break
      case 'PARSE_ERROR':
        console.error('Invalid response format from server')
        break
      default:
        console.error('Unknown error:', error.message)
    }
    return
  }
  
  // Success case
  console.log('Users loaded:', data?.length)
}

// Example 4: With query parameters
export async function exampleWithQueryParams() {
  const { data, error } = await apiGet<Product[]>('/products', {
    category: 'electronics',
    minPrice: 10,
    maxPrice: 100,
    inStock: true,
    sortBy: 'price',
    sortOrder: 'asc'
  })
  
  if (error) {
    console.error('Query failed:', error.message)
    return
  }
  
  console.log('Filtered products:', data?.length)
}

// Example 5: Server component usage
export async function ServerComponentExample() {
  const { data: products, error } = await fetchProducts({ page: 1, pageSize: 8 })
  
  if (error) {
    return { error: error.message }
  }
  
  if (!products?.items.length) {
    return { products: [] }
  }
  
  return { products }
}

// Type definitions for examples
interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface Product {
  id: string
  name: string
  price: number
  description?: string
  imageUrl?: string
}

