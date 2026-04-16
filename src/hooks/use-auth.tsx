import { ReactNode } from 'react'

const MOCK_USER = {
  id: '1',
  email: 'admin@servicelogic.com',
  user_metadata: { name: 'Administrador' },
}

const MOCK_AUTH = {
  user: MOCK_USER,
  session: {},
  signIn: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  loading: false,
}

export const useAuth = () => MOCK_AUTH

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>
}
