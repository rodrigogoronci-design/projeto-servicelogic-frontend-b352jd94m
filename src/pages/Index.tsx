import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, AlertCircle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'

export default function Index() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('admin@servicelogic.com')
  const [password, setPassword] = useState('admin123')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { signIn, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/app')
    }
  }, [user, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    const { error } = await signIn(email, password)

    if (error) {
      setErrorMsg('Credenciais inválidas. Tente novamente.')
      setIsLoading(false)
    } else {
      navigate('/app')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FF8C00] to-[#003399] p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://img.usecurling.com/p/800/800?q=abstract&color=white')] opacity-5 mix-blend-overlay pointer-events-none bg-cover" />

      <div className="w-full max-w-md z-10 animate-fade-in-up">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-sl-orange to-sl-blue" />
          <CardHeader className="space-y-1 pb-6 pt-8">
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="size-16 rounded-2xl bg-gradient-to-tr from-sl-orange to-sl-blue flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-3xl">S</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">
                Servicelogic
              </h1>
              <CardDescription className="text-center text-base">
                Plataforma Centralizada de Gestão
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                  <AlertCircle className="size-4 shrink-0" />
                  {errorMsg}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Mail className="size-5" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@servicelogic.com"
                    required
                    className="pl-10 h-12 bg-slate-50 focus-visible:ring-sl-orange border-slate-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <a
                    href="#"
                    className="text-xs font-medium text-sl-blue hover:text-sl-orange transition-colors"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Lock className="size-5" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    className="pl-10 pr-10 h-12 bg-slate-50 focus-visible:ring-sl-orange border-slate-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-sl-orange to-sl-blue hover:opacity-90 btn-scale border-0 shadow-lg mt-6 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Autenticando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <footer className="absolute bottom-6 flex flex-col items-center text-sm text-white/80 animate-fade-in gap-2">
        <ShieldCheck className="size-5 opacity-60" />
        <p>&copy; {new Date().getFullYear()} Servicelogic. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
