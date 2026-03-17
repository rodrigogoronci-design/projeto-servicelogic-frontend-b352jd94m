import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { KeyRound, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export default function Credentials() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  useEffect(() => {
    const fetchCreds = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('credenciais_sistema_legado' as any)
          .select('username, password')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) {
          console.error('Error fetching credentials:', error)
          return
        }

        if (data) {
          setFormData({ username: data.username, password: data.password })
        }
      } catch (err) {
        console.error('Failed to fetch credentials:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCreds()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    try {
      const { data: existing, error: existingError } = await supabase
        .from('credenciais_sistema_legado' as any)
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingError) throw existingError

      let error
      if (existing) {
        const { error: updateError } = await supabase
          .from('credenciais_sistema_legado' as any)
          .update({
            username: formData.username,
            password: formData.password,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('credenciais_sistema_legado' as any)
          .insert({ user_id: user.id, username: formData.username, password: formData.password })
        error = insertError
      }

      if (error) throw error

      toast({
        title: 'Credenciais Atualizadas',
        description: 'As configurações de acesso ao legado foram salvas com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Falha ao atualizar credenciais.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <KeyRound className="size-6 text-sl-orange" /> Configurações de Credenciais
        </h2>
        <p className="text-muted-foreground">
          Gerencie as credenciais utilizadas para acessar o sistema legado.
        </p>
      </div>

      <Card className="border-0 shadow-subtle bg-white">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Credenciais do Sistema Legado</CardTitle>
            <CardDescription>
              Estes dados são utilizados pelas automações para extrair relatórios da base anterior.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="h-24 flex items-center justify-center text-muted-foreground">
                Carregando...
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Usuário Legado</Label>
                  <Input
                    id="username"
                    required
                    placeholder="ex: admin_legado"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="focus-visible:ring-sl-orange"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha Legada</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="focus-visible:ring-sl-orange"
                  />
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="gap-2 bg-gradient-corporate btn-scale text-white border-0 shadow-md"
                  >
                    <Save className="size-4" />
                    {isSubmitting ? 'Salvando...' : 'Salvar Credenciais'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
