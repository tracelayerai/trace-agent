import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type Role = 'analyst' | 'lead' | 'admin'

export interface User {
  id: string
  name: string
  initials: string
  email: string
  role: Role
  title: string
  avatar: string
}

export interface AuthContextValue {
  currentUser: User | null
  login: (role: Role) => void
  logout: () => void
  hasRole: (role: Role) => boolean
  isAtLeast: (role: Role) => boolean
  isAnalyst: boolean
  isLead: boolean
  isAdmin: boolean
}

export const ROLES = {
  ANALYST: 'analyst',
  LEAD: 'lead',
  ADMIN: 'admin',
} as const

export const MOCK_USERS: Record<Role, User> = {
  analyst: {
    id: 'user-001',
    name: 'Lily Bennett',
    initials: 'LB',
    email: 'lily@traceagent.com',
    role: ROLES.ANALYST,
    title: 'Senior Analyst',
    avatar: 'LB',
  },
  lead: {
    id: 'user-002',
    name: 'Rachel Scott',
    initials: 'RS',
    email: 'rachel@traceagent.com',
    role: ROLES.LEAD,
    title: 'Compliance Lead',
    avatar: 'RS',
  },
  admin: {
    id: 'user-003',
    name: 'Daniel Cooper',
    initials: 'DC',
    email: 'daniel@traceagent.com',
    role: ROLES.ADMIN,
    title: 'System Administrator',
    avatar: 'DC',
  },
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('trace_user_role') as Role | null
    return saved ? (MOCK_USERS[saved] ?? null) : null
  })

  const login = (role: Role) => {
    localStorage.setItem('trace_user_role', role)
    setCurrentUser(MOCK_USERS[role])
  }

  const logout = () => {
    localStorage.removeItem('trace_user_role')
    setCurrentUser(null)
  }

  const hasRole = (role: Role) => currentUser?.role === role

  const isAtLeast = (role: Role) => {
    const hierarchy: Role[] = [ROLES.ANALYST, ROLES.LEAD, ROLES.ADMIN]
    const currentIndex = hierarchy.indexOf(currentUser?.role ?? ROLES.ANALYST)
    const requiredIndex = hierarchy.indexOf(role)
    return currentIndex >= requiredIndex
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      hasRole,
      isAtLeast,
      isAnalyst: currentUser?.role === ROLES.ANALYST,
      isLead: currentUser?.role === ROLES.LEAD,
      isAdmin: currentUser?.role === ROLES.ADMIN,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
