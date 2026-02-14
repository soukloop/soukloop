'use client'

import * as React from 'react'
import { ThemeProvider as MainThemeProvider } from '@/components/theme-provider'
import type { ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <MainThemeProvider {...props}>
      {children}
    </MainThemeProvider>
  )
}
