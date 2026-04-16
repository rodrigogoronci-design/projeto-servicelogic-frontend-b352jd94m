import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Filter, LayoutDashboard, PieChart } from 'lucide-react'
import { ChartRenderer } from '@/components/Charts/ChartRenderer'
import { DashboardData, ChartFormData, ChartField, mapToOldFormat } from '@/types/chart'
import { getDashboard, getDashboardItems } from '@/services/dashboards'

function DashboardChartCard({
  chart,
  filters,
}: {
  chart: ChartFormData & { id: string }
  filters: Record<string, string>
}) {
  const { user } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const oldFormat = useMemo(() => mapToOldFormat(chart), [chart])

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    supabase.functions
      .invoke('get-chart-preview', {
        body: {
          usuario_id: user?.id,
          nome_tabela: oldFormat.nome_tabela,
          campos_selecionados: oldFormat.campos_selecionados,
          tipo_grafico: oldFormat.tipo_grafico,
          filtros: filters,
        },
      })
      .then(({ data: res, error }) => {
        if (!isMounted) return
        if (!error && res?.success) {
          setData(res.data || [])
        } else {
          setData([])
        }
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [oldFormat, filters, user])

  return (
    <Card
      className="shadow-sm border-t-4"
      style={{ borderTopColor: chart.type === 'pie' ? '#FF8C00' : '#0066CC' }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-800 line-clamp-1">
          {chart.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] pb-6">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-sl-blue" />
          </div>
        ) : data.length > 0 ? (
          <ChartRenderer data={data} config={oldFormat as any} />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-slate-400">
            Nenhum dado encontrado para os filtros atuais.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardViewer() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [charts, setCharts] = useState<(ChartFormData & { id: string })[]>([])
  const [loading, setLoading] = useState(true)

  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [debouncedFilters, setDebouncedFilters] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchDashboardAndCharts = async () => {
      if (!user || !id) return
      try {
        const dashData = await getDashboard(id)
        setDashboard(dashData)

        const itemsData = await getDashboardItems(id)
        const activeCharts = itemsData
          .map((item) => item.expand?.chart_id)
          .filter(Boolean) as (ChartFormData & { id: string })[]

        setCharts(activeCharts)
      } catch (err: any) {
        toast({
          title: 'Erro ao carregar Dashboard',
          description: err.message,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardAndCharts()
  }, [id, user, toast])

  const globalFilters = useMemo(() => {
    if (!dashboard || charts.length === 0) return []
    const filtersMap = new Map<string, ChartField>()
    charts.forEach((c) => {
      ;(c.fields_config || []).forEach((f) => {
        if (f.is_filter && !filtersMap.has(f.original_name)) {
          filtersMap.set(f.original_name, f)
        }
      })
    })
    return Array.from(filtersMap.values())
  }, [dashboard, charts])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filterValues)
    }, 600)
    return () => clearTimeout(handler)
  }, [filterValues])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="size-10 animate-spin text-sl-blue" />
        <p className="text-slate-500 font-medium">Carregando painel...</p>
      </div>
    )
  }

  if (!dashboard) {
    return <div className="text-center py-20 text-slate-500">Dashboard não encontrado.</div>
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-slate-500 hover:text-slate-900 bg-white border shadow-sm"
          >
            <Link to="/app/dashboards">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
              <LayoutDashboard className="size-7 text-sl-blue hidden sm:block" />
              {dashboard.name}
            </h2>
            {dashboard.description && (
              <p className="text-slate-500 mt-1">{dashboard.description}</p>
            )}
          </div>
        </div>
      </div>

      {globalFilters.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold mb-2">
            <Filter className="size-4 text-sl-orange" />
            Filtros Globais
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {globalFilters.map((f) => (
              <div key={f.original_name} className="space-y-1.5">
                <Label className="text-xs text-slate-500 uppercase tracking-wide">
                  {f.display_name || f.original_name}
                </Label>
                <Input
                  placeholder={`Filtrar ${f.display_name || f.original_name}...`}
                  value={filterValues[f.original_name] || ''}
                  onChange={(e) =>
                    setFilterValues((prev) => ({ ...prev, [f.original_name]: e.target.value }))
                  }
                  className="bg-slate-50 focus-visible:ring-sl-blue"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {charts.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-xl border border-dashed border-slate-300">
          <PieChart className="size-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-medium text-slate-700">Dashboard Vazio</h3>
          <p className="text-slate-500 mt-1 mb-4">Edite este dashboard para adicionar gráficos.</p>
          <Button asChild variant="outline">
            <Link to={`/app/dashboards/${dashboard.id}/editar`}>Editar Dashboard</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 mt-6">
          {charts.map((chartConfig) => (
            <DashboardChartCard
              key={chartConfig.id}
              chart={chartConfig}
              filters={debouncedFilters}
            />
          ))}
        </div>
      )}
    </div>
  )
}
