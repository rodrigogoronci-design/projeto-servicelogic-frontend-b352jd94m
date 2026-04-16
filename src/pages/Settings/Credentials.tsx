import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { KeyRound, Save, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getCredentials, saveCredentials, testConnection } from '@/services/credentials'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'

function SqlServerCreds() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
  })

  useEffect(() => {
    let mounted = true
    const fetchCreds = async () => {
      try {
        const data = await getCredentials()
        if (mounted && data) {
          setFormData({
            host: data.host || '',
            port: data.port || '',
            database: data.database || '',
            username: data.username || '',
            password: data.password || '',
          })
        }
      } catch (err) {
        console.error('Failed to load credentials:', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    fetchCreds()
    return () => {
      mounted = false
    }
  }, [])

  const handleTest = async () => {
    if (
      !formData.host ||
      !formData.port ||
      !formData.database ||
      !formData.username ||
      !formData.password
    ) {
      return toast({
        title: 'Atenção',
        description: 'Preencha todos os campos para testar.',
        variant: 'destructive',
      })
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      await testConnection(formData)
      setTestResult({ success: true, message: 'Conexão estabelecida com sucesso!' })
      toast({
        title: 'Sucesso!',
        description: 'Conexão com SQL Server estabelecida.',
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      })
    } catch (err: any) {
      const msg = getErrorMessage(err)
      setTestResult({ success: false, message: msg || 'Erro de Conexão' })
      toast({ title: 'Falha na Conexão', description: msg, variant: 'destructive' })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFieldErrors({})
    setTestResult(null)

    try {
      await saveCredentials(formData)
      toast({
        title: 'Credenciais Atualizadas',
        description: 'Acesso ao banco SQL Server salvo com sucesso.',
      })
    } catch (error: any) {
      const errs = extractFieldErrors(error)
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs)
      } else {
        toast({
          title: 'Erro ao salvar',
          description: getErrorMessage(error),
          variant: 'destructive',
        })
      }
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
            {testResult && (
              <Alert
                variant={testResult.success ? 'default' : 'destructive'}
                className={
                  testResult.success ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : ''
                }
              >
                <AlertCircle className={`size-4 ${testResult.success ? 'text-emerald-600' : ''}`} />
                <AlertTitle>{testResult.success ? 'Sucesso' : 'Erro de Conexão'}</AlertTitle>
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">
                  Host (IP/URL) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="host"
                  required
                  placeholder="ex: 192.168.1.100"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  className={fieldErrors.host ? 'border-red-500' : ''}
                />
                {fieldErrors.host && <p className="text-xs text-red-500">{fieldErrors.host}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">
                  Porta <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="port"
                  required
                  placeholder="ex: 1433"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  className={fieldErrors.port ? 'border-red-500' : ''}
                />
                {fieldErrors.port && <p className="text-xs text-red-500">{fieldErrors.port}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="database">
                  Nome do Database <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="database"
                  required
                  placeholder="ex: BD_PRODUCAO"
                  value={formData.database}
                  onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                  className={fieldErrors.database ? 'border-red-500' : ''}
                />
                {fieldErrors.database && (
                  <p className="text-xs text-red-500">{fieldErrors.database}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">
                  Usuário <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  required
                  placeholder="ex: sa"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={fieldErrors.username ? 'border-red-500' : ''}
                />
                {fieldErrors.username && (
                  <p className="text-xs text-red-500">{fieldErrors.username}</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">
                  Senha <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={fieldErrors.password ? 'border-red-500' : ''}
                />
                {fieldErrors.password && (
                  <p className="text-xs text-red-500">{fieldErrors.password}</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                disabled={isTesting || isSubmitting}
                className="gap-2 border-slate-200 hover:bg-slate-50"
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
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
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
