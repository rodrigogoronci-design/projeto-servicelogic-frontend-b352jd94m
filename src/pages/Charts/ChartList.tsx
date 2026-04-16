import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Plus, Trash2, Edit, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getCharts, deleteChart } from '@/services/charts'
import { ChartFormData } from '@/types/chart'

export default function ChartList() {
  const { toast } = useToast()
  const [charts, setCharts] = useState<(ChartFormData & { id: string; created: string })[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCharts = async () => {
    setLoading(true)
    try {
      const data = await getCharts()
      setCharts(data)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCharts()
  }, [])

  useRealtime('charts', () => {
    fetchCharts()
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este gráfico?')) return
    try {
      await deleteChart(id)
      toast({ title: 'Sucesso', description: 'Gráfico excluído.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <BarChart className="size-8 text-sl-blue" />
            Meus Gráficos
          </h2>
          <p className="text-slate-500 mt-1">Gerencie suas visualizações e métricas.</p>
        </div>
        <Button asChild className="bg-sl-blue hover:bg-sl-blueLight text-white shadow-md">
          <Link to="/graficos/novo">
            <Plus className="size-4 mr-2" />
            Novo Gráfico
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="size-8 animate-spin text-slate-400" />
        </div>
      ) : charts.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">Nenhum gráfico encontrado</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Crie seu primeiro gráfico para visualizar seus dados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charts.map((chart) => (
            <Card
              key={chart.id}
              className="flex flex-col hover:shadow-md transition-shadow border-t-4 border-t-sl-blue"
            >
              <CardHeader className="pb-3">
                <CardTitle
                  className="font-bold text-lg text-slate-800 line-clamp-1"
                  title={chart.name}
                >
                  {chart.name}
                </CardTitle>
                <div className="text-xs text-slate-500 mt-1 font-medium">
                  Tabela: {chart.table_name}
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <p className="text-sm text-slate-600 line-clamp-2">
                  {chart.description || 'Sem descrição informada.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-1">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                    {format(new Date(chart.created), 'dd MMM yyyy', { locale: ptBR })}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex gap-2 border-t border-slate-100 mt-auto pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-sl-blue"
                  asChild
                >
                  <Link to={`/graficos/${chart.id}`}>
                    <Edit className="size-4 mr-2" /> Editar
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto text-slate-500 hover:text-red-600"
                  onClick={() => handleDelete(chart.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
