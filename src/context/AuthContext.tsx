import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react'

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
  isLoaded: boolean
  login: (_role: Role) => void
  logout: () => Promise<void>
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

const ROLE_TITLES: Record<Role, string> = {
  analyst: 'Senior Analyst',
  lead: 'Compliance Lead',
  admin: 'System Administrator',
}

const AuthContext = createContext<AuthContextValue | null>(null)

function isRole(value: unknown): value is Role {
  return value === ROLES.ANALYST || value === ROLES.LEAD || value === ROLES.ADMIN
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'TA'
}

function normalizeOrgRole(orgRole: string | null | undefined): Role | null {
  if (!orgRole) return null

  const normalized = orgRole.toLowerCase()
  if (normalized === 'org:admin' || normalized.endsWith(':admin') || normalized === 'admin') return ROLES.ADMIN
  if (normalized === 'org:lead' || normalized.endsWith(':lead') || normalized === 'lead') return ROLES.LEAD
  if (normalized === 'org:analyst' || normalized.endsWith(':analyst') || normalized === 'analyst') return ROLES.ANALYST
  if (normalized === 'org:member' || normalized.endsWith(':member') || normalized === 'member') return ROLES.ANALYST

  return null
}

function resolveRole(params: {
  orgRole: string | null | undefined
  email: string | null | undefined
  publicMetadataRole: unknown
  unsafeMetadataRole: unknown
}): Role {
  const { orgRole, email, publicMetadataRole, unsafeMetadataRole } = params

  const normalizedOrgRole = normalizeOrgRole(orgRole)
  if (normalizedOrgRole) return normalizedOrgRole

  if (isRole(publicMetadataRole)) return publicMetadataRole
  if (isRole(unsafeMetadataRole)) return unsafeMetadataRole

  if (email) {
    const matched = Object.values(MOCK_USERS).find((user) => user.email.toLowerCase() === email.toLowerCase())
    if (matched) return matched.role
  }

  return ROLES.ANALYST
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { signOut, isLoaded: clerkAuthLoaded, orgRole } = useClerkAuth()
  const { user, isLoaded: clerkUserLoaded } = useUser()

  const currentUser = useMemo<User | null>(() => {
    if (!user) return null

    const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? ''
    const username = user.username ?? ''
    const role = resolveRole({
      orgRole,
      email,
      publicMetadataRole: user.publicMetadata?.role,
      unsafeMetadataRole: user.unsafeMetadata?.role,
    })
    const matched = email
      ? Object.values(MOCK_USERS).find((mockUser) => mockUser.email.toLowerCase() === email.toLowerCase())
      : undefined

    if (matched) {
      return {
        ...matched,
        id: user.id,
        email,
        role,
      }
    }

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || username || email || 'TraceAgent User'

    return {
      id: user.id,
      name: fullName,
      initials: getInitials(fullName),
      email,
      role,
      title: ROLE_TITLES[role],
      avatar: getInitials(fullName),
    }
  }, [orgRole, user])

  const isLoaded = clerkAuthLoaded && clerkUserLoaded

  const login = () => {
    // Clerk owns sign-in now; keep the method for compatibility with existing consumers.
  }

  const logout = async () => {
    await signOut({ redirectUrl: '/login' })
  }

  const hasRole = (role: Role) => currentUser?.role === role

  const isAtLeast = (role: Role) => {
    const hierarchy: Role[] = [ROLES.ANALYST, ROLES.LEAD, ROLES.ADMIN]
    const currentIndex = hierarchy.indexOf(currentUser?.role ?? ROLES.ANALYST)
    const requiredIndex = hierarchy.indexOf(role)
    return currentIndex >= requiredIndex
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoaded,
        login,
        logout,
        hasRole,
        isAtLeast,
        isAnalyst: currentUser?.role === ROLES.ANALYST,
        isLead: currentUser?.role === ROLES.LEAD,
        isAdmin: currentUser?.role === ROLES.ADMIN,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
