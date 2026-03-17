import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Index() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      navigate('/app')
    }, 800)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sl-bg p-4 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sl-orange/10 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sl-blue/10 blur-3xl" />

      <div
        className="w-full max-w-md z-10 animate-fade-in-up opacity-0"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="size-16 rounded-2xl bg-gradient-corporate flex items-center justify-center shadow-elevation">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-sl-text">Servicelogic</h1>
          <p className="text-sl-muted">Plataforma de Gestão e Automação</p>
        </div>

        <Card className="shadow-elevation border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">Acesso ao Sistema</CardTitle>
            <CardDescription className="text-center">
              Insira suas credenciais para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-sl-muted">
                    <Mail className="size-5" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@servicelogic.com"
                    required
                    className="pl-10 h-12 focus-visible:ring-sl-orange"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <a href="#" className="text-sm font-medium text-sl-blue hover:underline">
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-sl-muted">
                    <Lock className="size-5" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    className="pl-10 pr-10 h-12 focus-visible:ring-sl-orange"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-sl-muted hover:text-sl-text"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-corporate btn-scale border-0 shadow-md mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Autenticando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <footer className="absolute bottom-6 text-sm text-sl-muted">
        &copy; {new Date().getFullYear()} Servicelogic. Todos os direitos reservados.
      </footer>
    </div>
  )
}
