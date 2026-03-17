import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Database, Activity, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    reportsCount: 0,
    lastImportDate: null as string | null,
    lastExecutionStatus: null as string | null,
  })
  const [missingCreds, setMissingCreds] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        const { data: creds } = await supabase
          .from('credenciais_servicelogic' as any)
          .select('id')
          .eq('usuario_id', user.id)
          .maybeSingle()

        if (!creds) setMissingCreds(true)

        const [reportsRes, importsRes, logsRes] = await Promise.all([
          supabase
            .from('configuracao_relatorios' as any)
            .select('id', { count: 'exact' })
            .eq('usuario_id', user.id),
          supabase
            .from('dados_importados' as any)
            .select('data_importacao')
            .eq('usuario_id', user.id)
            .order('data_importacao', { ascending: false })
            .limit(1),
          supabase
            .from('log_execucoes' as any)
            .select('status')
            .eq('usuario_id', user.id)
            .order('data_execucao', { ascending: false })
            .limit(1),
        ])

        setStats({
          reportsCount: reportsRes.count || 0,
          lastImportDate: importsRes.data?.[0]?.data_importacao || null,
          lastExecutionStatus: logsRes.data?.[0]?.status || null,
        })
      } catch (error) {
        console.error('Failed to fetch dashboard data', error)
      }
    }

    fetchDashboardData()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Visão Geral</h2>
        <p className="text-slate-500 mt-1">
          Acompanhe o status de saúde e métricas de integração do seu sistema.
        </p>
      </div>

      {missingCreds && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-medium text-amber-800">Credenciais ausentes</h4>
            <p className="text-sm text-amber-700 mt-1">
              Você ainda não configurou as credenciais do sistema legado. Acesse a aba de{' '}
              <a href="/app/credenciais" className="underline font-semibold">
                Configurações
              </a>{' '}
              para garantir o funcionamento das automações.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total de Relatórios
            </CardTitle>
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <FileText className="size-5 text-sl-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats.reportsCount}</div>
            <p className="text-xs text-slate-500 mt-2">Relatórios configurados ativos</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Última Importação</CardTitle>
            <div className="p-2.5 bg-orange-50 rounded-xl">
              <Database className="size-5 text-sl-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-800 truncate">
              {stats.lastImportDate
                ? format(new Date(stats.lastImportDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                : 'Nunca'}
            </div>
            <p className="text-xs text-slate-500 mt-2">Data do último lote processado</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Status da Última Execução
            </CardTitle>
            <div className="p-2.5 bg-slate-100 rounded-xl">
              <Activity className="size-5 text-slate-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-800 capitalize">
              {stats.lastExecutionStatus || 'Nenhuma execução'}
            </div>
            <p className="text-xs mt-2 flex items-center gap-1.5">
              {stats.lastExecutionStatus === 'sucesso' ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <span className="size-2 rounded-full bg-emerald-500" /> Operando normalmente
                </span>
              ) : stats.lastExecutionStatus === 'erro' ? (
                <span className="text-red-600 font-medium flex items-center gap-1">
                  <span className="size-2 rounded-full bg-red-500" /> Falha detectada
                </span>
              ) : (
                <span className="text-slate-500">Aguardando dados</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
