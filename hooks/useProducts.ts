import useSWR from 'swr'
import { list, getById, createProduct, updateProduct, deactivateProduct } from '../services/products.service'
import type { Product, CreateProductDto, UpdateProductDto, ProductFilters, SearchParams } from '../types/api'

// ===== PRODUCTS LIST HOOK =====
interface UseProductsParams {
  params?: SearchParams
}

export function useProducts({ params }: UseProductsParams = {}) {
  // Helper to clean params
  const cleanParams = (p?: SearchParams) => {
    if (!p) return {}
    const cleaned: Record<string, string> = {}
    Object.entries(p).forEach(([key, value]) => {
      // Skip undefined, null, empty strings, or 'all'
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        // Special handling for arrays or numbers if needed, but for now everything is stringifiable
        cleaned[key] = String(value)
      }
    })
    return cleaned
  }

  const queryParams = cleanParams(params)
  const queryString = new URLSearchParams(queryParams).toString()

  // Dynamic cache key based on params to ensure SWR refetches when params change
  const cacheKey = queryString
    ? `/api/products?${queryString}`
    : '/api/products'

  const { data, error, isLoading, mutate } = useSWR(cacheKey, async () => {
    const { data, error } = await list(params)
    if (error) {
      throw new Error(error.message)
    }
    return data
  })

  return {
    data,
    error,
    isLoading,
    mutate
  }
}

// ===== SINGLE PRODUCT HOOK =====
export function useProduct(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/products/${id}` : null,
    async () => {
      const { data, error } = await getById(id)
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

// ===== CREATE PRODUCT HOOK =====
export function useCreateProduct() {
  const { mutate: refreshProducts } = useSWR('/api/products')

  const createProductAction = async (dto: CreateProductDto) => {
    const { data, error } = await createProduct(dto)
    if (error) {
      throw new Error(error.message)
    }
    // Refresh products list
    await refreshProducts()
    return data
  }

  return {
    createProduct: createProductAction
  }
}

// ===== UPDATE PRODUCT HOOK =====
export function useUpdateProduct() {
  const { mutate: refreshProducts } = useSWR('/api/products')

  const updateProductAction = async ({ id, dto }: { id: string; dto: UpdateProductDto }) => {
    const { data, error } = await updateProduct(id, dto)
    if (error) {
      throw new Error(error.message)
    }
    // Refresh products list
    await refreshProducts()
    return data
  }

  return {
    updateProduct: updateProductAction
  }
}

// ===== DEACTIVATE PRODUCT HOOK =====
export function useDeactivateProduct() {
  const { mutate: refreshProducts } = useSWR('/api/products')

  const deactivateProductAction = async (id: string) => {
    const { error } = await deactivateProduct(id)
    if (error) {
      throw new Error(error.message)
    }
    // Refresh products list
    await refreshProducts()
  }

  return {
    deactivateProduct: deactivateProductAction
  }
}

// ===== COMBINED PRODUCTS HOOK =====
export function useProductsManagement() {
  const { data: products, error: productsError, isLoading: isLoadingProducts } = useProducts()
  const { createProduct } = useCreateProduct()
  const { updateProduct } = useUpdateProduct()
  const { deactivateProduct } = useDeactivateProduct()

  return {
    // Products list
    products,
    isLoadingProducts,
    isErrorProducts: !!productsError,
    productsError,

    // Actions
    createProduct,
    updateProduct,
    deactivateProduct
  }
}
