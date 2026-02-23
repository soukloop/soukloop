import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
  variant?: 'default' | 'primary' | 'secondary' | 'muted'
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

const variantClasses = {
  default: 'text-gray-600',
  primary: 'text-blue-600',
  secondary: 'text-gray-500',
  muted: 'text-gray-400'
}

export function LoadingSpinner({
  size = 'md',
  className,
  text,
  variant = 'default'
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-2">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-gray-300 border-t-transparent',
            sizeClasses[size],
            variantClasses[variant]
          )}
          style={{
            borderTopColor: 'transparent'
          }}
        />
        {text && (
          <p className={cn('text-sm', variantClasses[variant])}>
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

// Full page loading spinner
export function FullPageSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
      <LoadingSpinner size="xl" text={text} />
    </div>
  )
}

// Inline loading spinner
export function InlineSpinner({ size = 'sm', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <LoadingSpinner
      size={size}
      className={cn('inline-flex', className)}
    />
  )
}

// Button loading spinner
export function ButtonSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <LoadingSpinner
      size={size}
      className="mr-2"
      variant="muted"
    />
  )
}

// Card loading skeleton
export function LoadingSkeleton({
  className,
  lines = 3
}: {
  className?: string
  lines?: number
}) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 bg-gray-200 rounded',
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
      </div>
    </div>
  )
}

// Table loading skeleton
export function TableSkeleton({
  rows = 5,
  columns = 4
}: {
  rows?: number
  columns?: number
}) {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={cn(
                  'h-4 bg-gray-200 rounded',
                  colIndex === 0 ? 'w-1/4' : 'w-1/6'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Card loading skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    </div>
  )
}

// List loading skeleton
export function ListSkeleton({
  items = 5,
  className
}: {
  items?: number
  className?: string
}) {
  return (
    <div className={cn('animate-pulse space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Example usage:
/*
import { 
  LoadingSpinner, 
  FullPageSpinner, 
  InlineSpinner, 
  ButtonSpinner,
  LoadingSkeleton,
  TableSkeleton,
  CardSkeleton,
  ListSkeleton
} from '@/components/ui/LoadingSpinner'

// Basic loading spinner
function LoadingExample() {
  return (
    <div>
      <LoadingSpinner size="lg" text="Loading products..." />
    </div>
  )
}

// Full page loading
function FullPageExample() {
  return <FullPageSpinner text="Initializing application..." />
}

// Inline loading
function InlineExample() {
  return (
    <span>
      Processing <InlineSpinner size="sm" />
    </span>
  )
}

// Button loading
function ButtonExample() {
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <button 
      onClick={() => setIsLoading(true)}
      disabled={isLoading}
      className="flex items-center"
    >
      {isLoading && <ButtonSpinner />}
      {isLoading ? 'Saving...' : 'Save'}
    </button>
  )
}

// Skeleton loading
function SkeletonExample() {
  return (
    <div>
      <LoadingSkeleton lines={4} className="mb-4" />
      <TableSkeleton rows={3} columns={4} />
    </div>
  )
}

// Card skeleton
function CardExample() {
  return <CardSkeleton className="w-full max-w-md" />
}

// List skeleton
function ListExample() {
  return <ListSkeleton items={6} className="divide-y" />
}
*/

