import useSWR from 'swr'
import { signIn, signOut, useSession } from 'next-auth/react'
import type { User, LoginDto, CreateUserDto, Role } from '../types/api'
import { registerUserAction } from '@/features/auth/actions'

interface AuthState {
  user: User | null
  isLoading: boolean
  isError: boolean
  error: Error | null
}

interface AuthActions {
  login: (data: LoginDto) => Promise<void>
  register: (data: CreateUserDto) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

export function useAuth(): AuthState & AuthActions {
  // Use NextAuth session with defensive check for provider context
  let sessionResult;
  try {
    sessionResult = useSession();
  } catch (e) {
    console.error("[useAuth] Failed to access session context. Ensure component is wrapped in SessionProvider.", e);
    sessionResult = { data: null, status: "unauthenticated" as const, update: async () => null };
  }

  const { data: session, status, update } = sessionResult;

  // Login function using NextAuth signIn
  const loginUser = async (data: LoginDto) => {
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false
    })

    if (result?.error) {
      throw new Error(result.error)
    }

    if (!result?.ok) {
      throw new Error('Login failed')
    }
  }

  // Register function - uses Server Action
  const registerUser = async (data: CreateUserDto) => {
    const result = await registerUserAction({
      email: data.email,
      username: data.username,
      password: data.password
    });

    if (!result.success) {
      // Map server errors to a single string or throw the first error
      const errorMessage = result.errors
        ? typeof result.errors === 'string'
          ? result.errors
          : Object.values(result.errors).flat()[0]
        : result.message || 'Registration failed';
      throw new Error(errorMessage);
    }

    // After successful registration, automatically sign in
    await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false
    })
  }

  // Logout function using NextAuth signOut
  const logoutUser = async () => {
    await signOut({ redirect: false })
  }

  // Refresh session function
  const refreshSession = async () => {
    await update()
  }

  // Convert NextAuth session to our User type
  const user: User | null = (session?.user && (session.user as any).model !== 'AdminUser') ? {
    id: session.user.id,
    email: session.user.email,
    username: session.user.name || '',
    name: session.user.name,
    image: session.user.image,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    roles: [session.user.role as Role],
    role: session.user.role as Role
  } : null;

  return {
    // State
    user,
    isLoading: status === 'loading',
    isError: status === 'unauthenticated',
    error: null,

    // Actions
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    refreshSession
  }
}

// Example usage:
/*
import { useAuth } from 'src/hooks/useAuth'

function LoginForm() {
  const { user, isLoading, isError, error, login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData)
      // User will be automatically updated in the hook
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error: {error?.message}</div>

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  )
}

function UserProfile() {
  const { user, logout } = useAuth()

  if (!user) return <div>Please log in</div>

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}
*/
