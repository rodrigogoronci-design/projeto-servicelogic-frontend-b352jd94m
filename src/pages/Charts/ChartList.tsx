import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  Plus,
  Trash2,
  Edit,
  Eye,
  Database,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChartPreviewModal } from '@/components/Charts/ChartPreviewModal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const ChartIcon = ({ type, className }: { type: string; className?: string }) => {
  switch (type) {
    case 'bar':
      return <BarChart className={className} />
    case 'line':
      return <LineChart className={className} />
    case 'pie':
      return <PieChart className={className} />
    case 'scatter':
      return <ScatterChart className={className} />
    default:
      return <BarChart className={className} />
  }
}

const chartTypeLabels: Record<string, string> = {
  bar: 'Gráfico de Barras',
  line: 'Gráfico de Linha',
  pie: 'Gráfico de Pizza',
  scatter: 'Gráfico de Dispersão',
}

export default function ChartList() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [charts, setCharts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [previewConfig, setPreviewConfig] = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchCharts = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('configuracao_graficos' as any)
      .select('*')
      .eq('usuario_id', user.id)
      .order('criado_em', { ascending: false })

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      setCharts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCharts()
  }, [user])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const { error } = await supabase
        .from('configuracao_graficos' as any)
        .delete()
        .eq('id', deleteId)

      if (error) throw error
      toast({ title: 'Sucesso', description: 'Gráfico excluído com sucesso.' })
      setCharts(charts.filter((c) => c.id !== deleteId))
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <PieChart className="size-8 text-sl-orange" />
            Meus Gráficos
          </h2>
          <p className="text-slate-500 mt-1">
            Gerencie suas visualizações de dados personalizadas.
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-sl-orange to-sl-blue text-white shadow-md">
          <Link to="/app/graficos/novo">
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
          <div className="mx-auto size-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <BarChart className="size-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Nenhum gráfico encontrado</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Você ainda não criou nenhuma visualização personalizada. Clique no botão acima para
            começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charts.map((chart) => (
            <Card
              key={chart.id}
              className="flex flex-col hover:shadow-md transition-shadow border-t-4"
              style={{ borderTopColor: chart.tipo_grafico === 'pie' ? '#FF8C00' : '#0066CC' }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className="font-bold text-lg text-slate-800 line-clamp-1"
                      title={chart.nome_grafico}
                    >
                      {chart.nome_grafico}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 font-medium">
                      <Database className="size-3.5" />
                      {chart.nome_tabela}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <ChartIcon type={chart.tipo_grafico} className="size-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <p className="text-sm text-slate-600 line-clamp-2">
                  {chart.descricao || 'Sem descrição informada.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-1">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {chartTypeLabels[chart.tipo_grafico] || chart.tipo_grafico}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                    {format(new Date(chart.criado_em), 'dd MMM yyyy', { locale: ptBR })}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex gap-2 border-t border-slate-100 mt-auto pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-white text-slate-700 hover:text-sl-blue border-slate-200"
                  onClick={() => setPreviewConfig(chart)}
                >
                  <Eye className="size-4 mr-2" /> Prévia
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:text-sl-orange hover:bg-orange-50"
                  asChild
                >
                  <Link to={`/app/graficos/${chart.id}`}>
                    <Edit className="size-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteId(chart.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ChartPreviewModal
        isOpen={!!previewConfig}
        onClose={() => setPreviewConfig(null)}
        config={previewConfig}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Gráfico</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta configuração de gráfico? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
