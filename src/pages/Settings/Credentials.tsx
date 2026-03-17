import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { KeyRound, Save, Link as LinkIcon, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

function SqlServerCreds() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    server_ip: '',
    database_name: '',
    username: '',
    password_encrypted: '',
    table_name: 'DWBI_PBIv2_Conhecimento',
  })

  useEffect(() => {
    const fetchCreds = async () => {
      if (!user) return
      try {
        const { data } = await supabase
          .from('credenciais_sql_server' as any)
          .select('*')
          .eq('usuario_id', user.id)
          .maybeSingle()

        if (data) {
          setFormData({
            server_ip: data.server_ip,
            database_name: data.database_name,
            username: data.username,
            password_encrypted: data.password_encrypted,
            table_name: data.table_name,
          })
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchCreds()
  }, [user])

  const handleTest = async () => {
    if (
      !formData.server_ip ||
      !formData.database_name ||
      !formData.username ||
      !formData.password_encrypted
    ) {
      return toast({
        title: 'Atenção',
        description: 'Preencha todos os campos para testar.',
        variant: 'destructive',
      })
    }
    setIsTesting(true)
    try {
      const { data, error } = await supabase.functions.invoke('test-sql-connection', {
        body: { ...formData, usuario_id: user?.id },
      })
      if (error || data?.error) throw new Error(error?.message || data?.error)
      toast({
        title: 'Sucesso!',
        description: 'Conexão com SQL Server estabelecida.',
        className: 'bg-emerald-50 border-emerald-200',
      })
    } catch (err: any) {
      toast({ title: 'Falha na Conexão', description: err.message, variant: 'destructive' })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    try {
      const { data: existing } = await supabase
        .from('credenciais_sql_server' as any)
        .select('id')
        .eq('usuario_id', user.id)
        .maybeSingle()

      const payload = {
        usuario_id: user.id,
        ...formData,
        updated_at: new Date().toISOString(),
      }

      let error
      if (existing) {
        const res = await supabase
          .from('credenciais_sql_server' as any)
          .update(payload)
          .eq('id', existing.id)
        error = res.error
      } else {
        const res = await supabase.from('credenciais_sql_server' as any).insert(payload)
        error = res.error
      }

      if (error) throw error
      toast({
        title: 'Credenciais Atualizadas',
        description: 'Acesso ao banco SQL Server salvo com sucesso.',
      })
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardHeader>
        <CardTitle>Conexão SQL Server</CardTitle>
        <CardDescription>
          Parâmetros para acesso direto ao banco de dados e atualização do Dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground">
            <Loader2 className="animate-spin size-5" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="server_ip">
                  IP do Servidor <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="server_ip"
                  required
                  placeholder="ex: 192.168.1.100"
                  value={formData.server_ip}
                  onChange={(e) => setFormData({ ...formData, server_ip: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="database_name">
                  Nome do Database <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="database_name"
                  required
                  placeholder="ex: BD_PRODUCAO"
                  value={formData.database_name}
                  onChange={(e) => setFormData({ ...formData, database_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sql_username">
                  Usuário (SQL Login) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sql_username"
                  required
                  placeholder="ex: sa"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sql_password">
                  Senha <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sql_password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password_encrypted}
                  onChange={(e) => setFormData({ ...formData, password_encrypted: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="table_name">
                Nome da Tabela de Fatos <span className="text-red-500">*</span>
              </Label>
              <Input
                id="table_name"
                required
                value={formData.table_name}
                onChange={(e) => setFormData({ ...formData, table_name: e.target.value })}
              />
            </div>
            <div className="pt-4 border-t flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                disabled={isTesting || isSubmitting}
                className="gap-2 border-sl-blue text-sl-blue hover:bg-blue-50"
              >
                {isTesting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LinkIcon className="size-4" />
                )}
                Testar Conexão
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isTesting}
                className="gap-2 bg-sl-orange hover:bg-sl-orangeLight text-white shadow-md"
              >
                <Save className="size-4" />
                {isSubmitting ? 'Salvando...' : 'Salvar Credenciais'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </form>
  )
}

export default function Credentials() {
  return (
    <div className="space-y-6 max-w-3xl animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-slate-800">
          <KeyRound className="size-7 text-sl-orange" /> Gestão de Credenciais
        </h2>
        <p className="text-slate-500 mt-1">
          Configure os acessos necessários para o funcionamento da integração SQL Server.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white border-t-4 border-t-sl-blue mt-4">
        <SqlServerCreds />
      </Card>
    </div>
  )
}
