import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { LayoutDashboard, Plus, Trash2, Edit, Eye, Loader2, PieChart } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DashboardData } from '@/types/chart'
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

export default function DashboardList() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [dashboards, setDashboards] = useState<
    (DashboardData & { id: string; criado_em: string })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchDashboards = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('dashboards' as any)
      .select('*')
      .eq('usuario_id', user.id)
      .order('criado_em', { ascending: false })

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      setDashboards(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDashboards()
  }, [user])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const { error } = await supabase
        .from('dashboards' as any)
        .delete()
        .eq('id', deleteId)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Dashboard excluído com sucesso.' })
      setDashboards(dashboards.filter((d) => d.id !== deleteId))
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
            <LayoutDashboard className="size-8 text-sl-blue" />
            Meus Dashboards
          </h2>
          <p className="text-slate-500 mt-1">Crie painéis interativos organizando seus gráficos.</p>
        </div>
        <Button asChild className="bg-sl-blue hover:bg-sl-blueLight text-white shadow-md">
          <Link to="/app/dashboards/novo">
            <Plus className="size-4 mr-2" />
            Novo Dashboard
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="size-8 animate-spin text-slate-400" />
        </div>
      ) : dashboards.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="mx-auto size-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <LayoutDashboard className="size-8 text-sl-blue" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Nenhum dashboard encontrado</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Agrupe e organize seus gráficos criando seu primeiro dashboard personalizado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => {
            const chartCount = Array.isArray(dashboard.configuracao_layout)
              ? dashboard.configuracao_layout.length
              : 0

            return (
              <Card
                key={dashboard.id}
                className="flex flex-col hover:shadow-md transition-shadow border-t-4 border-t-sl-blue"
              >
                <CardHeader className="pb-3">
                  <h3
                    className="font-bold text-lg text-slate-800 line-clamp-1"
                    title={dashboard.nome}
                  >
                    {dashboard.nome}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                    <PieChart className="size-3.5" />
                    {chartCount} {chartCount === 1 ? 'Gráfico' : 'Gráficos'} inclusos
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {dashboard.descricao || 'Sem descrição informada.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                      Criado em{' '}
                      {format(new Date(dashboard.criado_em), 'dd MMM yyyy', { locale: ptBR })}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex gap-2 border-t border-slate-100 mt-auto pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white text-sl-blue hover:text-sl-blueLight border-slate-200"
                    asChild
                  >
                    <Link to={`/app/dashboards/${dashboard.id}`}>
                      <Eye className="size-4 mr-2" /> Visualizar
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:text-sl-orange hover:bg-orange-50"
                    asChild
                  >
                    <Link to={`/app/dashboards/${dashboard.id}/editar`}>
                      <Edit className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteId(dashboard.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Dashboard</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este dashboard? Os gráficos originais não serão
              afetados.
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
