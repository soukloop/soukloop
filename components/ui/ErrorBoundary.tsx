import React, { Component, ErrorInfo, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  className?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <DefaultErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          className={this.props.className}
        />
      )
    }

    return this.props.children
  }
}

// Default error fallback component
interface DefaultErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  className?: string
}

function DefaultErrorFallback({ error, errorInfo, className }: DefaultErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)

  return (
    <div className={cn('min-h-[400px] flex items-center justify-center p-6', className)}>
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>

          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showDetails ? 'Hide' : 'Show'} Error Details
            </button>
          )}
        </div>

        {showDetails && process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Error Details:</h3>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto">
              {error?.toString()}
              {errorInfo?.componentStack}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

// Error message component for displaying errors inline
interface ErrorMessageProps {
  error: Error | string | null
  className?: string
  variant?: 'default' | 'inline' | 'compact'
  onRetry?: () => void
}

export function ErrorMessage({ 
  error, 
  className, 
  variant = 'default',
  onRetry 
}: ErrorMessageProps) {
  if (!error) return null

  const errorMessage = typeof error === 'string' ? error : error.message

  if (variant === 'inline') {
    return (
      <span className={cn('text-sm text-red-600', className)}>
        {errorMessage}
      </span>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2 text-sm text-red-600', className)}>
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>{errorMessage}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('bg-red-50 border border-red-200 rounded-md p-4', className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Error
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{errorMessage}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Network error component
interface NetworkErrorProps {
  onRetry?: () => void
  className?: string
}

export function NetworkError({ onRetry, className }: NetworkErrorProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Connection Error
      </h3>
      <p className="text-gray-600 mb-4">
        Unable to connect to the server. Please check your internet connection.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry Connection
        </button>
      )}
    </div>
  )
}

// Not found error component
interface NotFoundErrorProps {
  title?: string
  message?: string
  className?: string
}

export function NotFoundError({ 
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist.",
  className 
}: NotFoundErrorProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0112 4c-2.34 0-4.29 1.009-5.824 2.709" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-4">
        {message}
      </p>
      <button
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Go Back
      </button>
    </div>
  )
}

// Example usage:
/*
import { 
  ErrorBoundary, 
  ErrorMessage, 
  NetworkError, 
  NotFoundError 
} from '@/components/ui/ErrorBoundary'

// Wrap your app with error boundary
function App() {
  return (
    <ErrorBoundary>
      <YourAppContent />
    </ErrorBoundary>
  )
}

// Custom error boundary with fallback
function CustomErrorBoundary() {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-8 text-center">
          <h2>Oops! Something went wrong</h2>
          <p>We're working on fixing this issue.</p>
        </div>
      }
      onError={(error, errorInfo) => {
        // Log to error reporting service
        console.error('Error caught by boundary:', error, errorInfo)
      }}
    >
      <YourComponent />
    </ErrorBoundary>
  )
}

// Inline error message
function FormWithError() {
  const [error, setError] = useState(null)
  
  return (
    <form>
      <input type="text" />
      <ErrorMessage 
        error={error} 
        variant="inline" 
        onRetry={() => setError(null)}
      />
    </form>
  )
}

// Compact error message
function CompactError() {
  return (
    <ErrorMessage 
      error="Failed to load data" 
      variant="compact" 
      onRetry={() => window.location.reload()}
    />
  )
}

// Network error
function NetworkErrorExample() {
  return (
    <NetworkError 
      onRetry={() => window.location.reload()}
    />
  )
}

// Not found error
function NotFoundExample() {
  return (
    <NotFoundError 
      title="Product Not Found"
      message="The product you're looking for doesn't exist or has been removed."
    />
  )
}
*/

