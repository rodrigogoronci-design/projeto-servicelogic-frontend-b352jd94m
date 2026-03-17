import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sl-bg">
        <div className="size-12 rounded-lg bg-gradient-corporate flex items-center justify-center animate-pulse mb-4">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <p className="text-muted-foreground animate-pulse">Carregando plataforma...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return <>{children}</>
}
