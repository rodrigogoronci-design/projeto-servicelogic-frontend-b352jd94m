import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function DashboardViewer() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<any>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!id || !user) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const record = await pb.collection('dashboards').getOne(id)
        setDashboard(record)
      } catch (error: any) {
        if (error.status !== 404) {
          setErrorMsg(getErrorMessage(error))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [id, user])

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-5 w-[350px]" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>

        <Skeleton className="h-[400px] w-full rounded-xl mt-6" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">
          {dashboard?.name || dashboard?.title || 'Visualizador de Dashboard'}
        </h2>
        <p className="text-slate-500 mt-1">
          {dashboard?.description || 'Visualização dos dados e métricas do painel selecionado.'}
        </p>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertTitle>Erro ao carregar</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <Card className="border-slate-200 shadow-sm border-t-4 border-t-sl-blue">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-lg">Painel Principal</CardTitle>
          <CardDescription>Visualização em tempo real</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 bg-slate-50/50">
            {dashboard
              ? 'Nenhum widget configurado para este dashboard no momento.'
              : 'Dashboard não encontrado ou sem permissão de acesso.'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
