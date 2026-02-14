'use client'

import { useQueryClient } from '@tanstack/react-query'
import { createQueryUtils, createDevUtils } from '@/lib/react-query'

export function useQueryUtils() {
  const queryClient = useQueryClient()
  return createQueryUtils(queryClient)
}

export function useDevUtils() {
  const queryClient = useQueryClient()
  return createDevUtils(queryClient)
}

