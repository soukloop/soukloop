import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '../lib/api'
import type { Cart, CartItem } from '../types/api'

// Cart service functions
export async function getCart(): Promise<ApiResponse<Cart>> {
  return apiGet<Cart>('/api/cart')
}

export async function addItem(data: { 
  productId: string
  quantity: number 
}): Promise<ApiResponse<CartItem>> {
  return apiPost<CartItem>('/api/cart/items', data)
}

export async function updateItem(itemId: string, quantity: number): Promise<ApiResponse<CartItem>> {
  return apiPatch<CartItem>(`/api/cart/items/${itemId}`, { quantity })
}

export async function removeItem(itemId: string): Promise<ApiResponse<void>> {
  return apiDelete<void>(`/api/cart/items/${itemId}`)
}

// Example usage:
/*
// Get current cart
const { data: cart, error: cartError } = await getCart()

if (cartError) {
  console.error('Failed to fetch cart:', cartError.message)
} else {
  console.log(`Cart has ${cart?.totalItems} items, total: $${cart?.totalPrice}`)
  cart?.items.forEach(item => {
    console.log(`- ${item.product.name} x${item.quantity}: $${item.product.price * item.quantity}`)
  })
}

// Add item to cart
const { data: newItem, error: addError } = await addItem({
  productId: 'prod123',
  quantity: 2
})

if (addError) {
  console.error('Failed to add item to cart:', addError.message)
} else {
  console.log('Added item to cart:', newItem?.product.name)
}

// Update item quantity
const { data: updatedItem, error: updateError } = await updateItem('item456', 3)

if (updateError) {
  console.error('Failed to update item:', updateError.message)
} else {
  console.log('Updated item quantity:', updatedItem?.quantity)
}

// Remove item from cart
const { error: removeError } = await removeItem('item456')

if (removeError) {
  console.error('Failed to remove item:', removeError.message)
} else {
  console.log('Item removed from cart successfully')
}

// Complete cart workflow example
export async function addToCartWorkflow(productId: string, quantity: number = 1) {
  // First, get current cart to check if item already exists
  const { data: cart, error: cartError } = await getCart()
  
  if (cartError) {
    console.error('Failed to get cart:', cartError.message)
    return
  }
  
  // Check if product is already in cart
  const existingItem = cart?.items.find(item => item.productId === productId)
  
  if (existingItem) {
    // Update existing item quantity
    const newQuantity = existingItem.quantity + quantity
    const { error: updateError } = await updateItem(existingItem.id, newQuantity)
    
    if (updateError) {
      console.error('Failed to update item quantity:', updateError.message)
    } else {
      console.log(`Updated quantity to ${newQuantity}`)
    }
  } else {
    // Add new item to cart
    const { error: addError } = await addItem({ productId, quantity })
    
    if (addError) {
      console.error('Failed to add item to cart:', addError.message)
    } else {
      console.log('Added new item to cart')
    }
  }
}
*/
