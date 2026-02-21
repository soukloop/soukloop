import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '../lib/api'
import type { Product, ProductImage, CreateProductDto, ProductsListResponse, SearchParams } from '../types/api'

// Products service functions
export async function list(params?: SearchParams): Promise<ApiResponse<ProductsListResponse>> {
  // @ts-ignore
  return apiGet<ProductsListResponse>('/api/products', params)
}

export async function getById(id: string): Promise<ApiResponse<Product>> {
  return apiGet<Product>(`/api/products/${id}`)
}

export async function createProduct(data: CreateProductDto): Promise<ApiResponse<Product>> {
  return apiPost<Product>('/api/products', data)
}

export async function updateProduct(id: string, data: Partial<CreateProductDto>): Promise<ApiResponse<Product>> {
  return apiPatch<Product>(`/api/products/${id}`, data)
}

export async function deactivateProduct(id: string): Promise<ApiResponse<void>> {
  return apiDelete<void>(`/api/products/${id}`)
}

// Example usage:
/*
// List products with search and pagination
const { data: products, error: listError } = await list({
  q: 'electronics',
  page: 1,
  limit: 20
})

if (listError) {
  console.error('Failed to fetch products:', listError.message)
} else {
  console.log(`Found ${products?.total} products`)
  products?.items.forEach(product => {
    console.log(`- ${product.name}: $${product.price}`)
  })
}

// Get single product
const { data: product, error: getError } = await getById('prod123')

if (getError) {
  console.error('Failed to fetch product:', getError.message)
} else {
  console.log('Product:', product?.name, product?.description)
}

// Create new product
const { data: newProduct, error: createError } = await createProduct({
  name: 'New Product',
  description: 'A great new product',
  price: 29.99,
  category: 'electronics',
  brand: 'TechCorp',
  sku: 'TECH-001',
  stock: 100,
  images: [
    {
      url: 'https://example.com/image1.jpg',
      alt: 'Product main image',
      isPrimary: true,
      order: 1
    }
  ],
  tags: ['new', 'featured']
})

if (createError) {
  console.error('Failed to create product:', createError.message)
} else {
  console.log('Created product:', newProduct?.id)
}

// Update product
const { data: updatedProduct, error: updateError } = await updateProduct('prod123', {
  price: 24.99,
  stock: 150
})

if (updateError) {
  console.error('Failed to update product:', updateError.message)
} else {
  console.log('Updated product:', updatedProduct?.name)
}

// Deactivate product
const { error: deleteError } = await deactivateProduct('prod123')

if (deleteError) {
  console.error('Failed to deactivate product:', deleteError.message)
} else {
  console.log('Product deactivated successfully')
}
*/
