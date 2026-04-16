import { ReactNode } from 'react'

export const useAuth = () => {
  return {
    user: {
      id: '1',
      email: 'admin@servicelogic.com',
      user_metadata: { name: 'Administrador' },
    },
    session: {},
    signIn: async () => ({ error: null }),
    signOut: async () => ({ error: null }),
    loading: false,
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>
}
