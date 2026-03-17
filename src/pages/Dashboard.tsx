import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, FileText, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function Dashboard() {
  const [stats, setStats] = useState({
    reportsCount: 0,
    dataProcessed: 0,
    successRate: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [reportsRes, dataRes, logsRes] = await Promise.all([
          supabase.from('configuracao_relatorios' as any).select('id', { count: 'exact' }),
          supabase.from('dados_importados' as any).select('registros'),
          supabase.from('log_execucoes' as any).select('status'),
        ])

        const totalData =
          dataRes.data?.reduce(
            (acc: number, curr: any) => acc + (Number(curr.registros) || 0),
            0,
          ) || 0

        const logs = logsRes.data || []
        const successCount = logs.filter((l: any) => l.status === 'sucesso').length
        const rate = logs.length > 0 ? ((successCount / logs.length) * 100).toFixed(1) : 100

        setStats({
          reportsCount: reportsRes.count || 0,
          dataProcessed: totalData,
          successRate: Number(rate),
        })
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Visão Geral</h2>
        <p className="text-muted-foreground">
          Acompanhe o status das integrações e relatórios automatizados.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-sl-muted">Total de Relatórios</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="size-4 text-sl-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sl-text">{stats.reportsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Configurações ativas</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-sl-muted">Dados Processados</CardTitle>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Database className="size-4 text-sl-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sl-text">
              {stats.dataProcessed.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              Operando normalmente
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-sl-muted">Taxa de Sucesso</CardTitle>
            <div className="p-2 bg-slate-100 rounded-lg">
              <Activity className="size-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sl-text">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Histórico geral</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
