import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Play, Database, Server, Activity } from 'lucide-react'

export default function DashboardSQL() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const { toast } = useToast()

  const [stats, setStats] = useState({
    totalLogs: 0,
    successLogs: 0,
    errorLogs: 0,
  })

  useEffect(() => {
    if (!user) return

    const fetchStats = async () => {
      try {
        const records = await pb.collection('execution_logs').getFullList({
          filter: `user_id = "${user.id}"`,
          fields: 'status',
        })

        const success = records.filter((r) => r.status?.toLowerCase().includes('sucesso')).length

        setStats({
          totalLogs: records.length,
          successLogs: success,
          errorLogs: records.length - success,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [user])

  const executeQuery = async () => {
    if (!query.trim()) return

    setLoading(true)
    setResults(null)
    try {
      await pb.collection('execution_logs').create({
        user_id: user?.id,
        sql_query: query,
        status: 'Sucesso',
        error_message: '',
      })

      toast({
        title: 'Query executada',
        description: 'A query foi registrada com sucesso.',
      })

      setResults({ success: true, message: 'Query executada e logada com sucesso.' })
      setQuery('')

      setStats((prev) => ({
        ...prev,
        totalLogs: prev.totalLogs + 1,
        successLogs: prev.successLogs + 1,
      }))
    } catch (error) {
      const msg = getErrorMessage(error)
      toast({
        title: 'Erro na execução',
        description: msg,
        variant: 'destructive',
      })
      setResults({ success: false, message: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Dashboard SQL</h2>
        <p className="text-slate-500 mt-1">
          Monitoramento de banco de dados e execução de queries.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Execuções</CardTitle>
            <Activity className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sucesso</CardTitle>
            <Server className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.successLogs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Erros</CardTitle>
            <Database className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errorLogs}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Executar SQL</CardTitle>
          <CardDescription>
            Digite sua query SQL para executar testes no ambiente simulado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SELECT * FROM users LIMIT 10;"
              className="font-mono bg-slate-50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') executeQuery()
              }}
            />
            <Button onClick={executeQuery} disabled={loading || !query.trim()} className="shrink-0">
              <Play className={`mr-2 h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
              Executar
            </Button>
          </div>

          {results && (
            <div
              className={`p-4 rounded-md border ${results.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}
            >
              <p className="font-medium flex items-center gap-2">
                {results.success ? (
                  <>
                    <Activity className="h-4 w-4" /> Sucesso
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" /> Erro
                  </>
                )}
              </p>
              <p className="text-sm mt-1">{results.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
