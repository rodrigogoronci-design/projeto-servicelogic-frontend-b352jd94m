import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { ChartFormData } from '@/types/chart'
import { ChartRenderer } from './ChartRenderer'
import { Loader2, AlertCircle, PieChart } from 'lucide-react'

interface ChartLivePreviewProps {
  formData: ChartFormData
}

export function ChartLivePreview({ formData }: ChartLivePreviewProps) {
  const { user } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!formData.nome_tabela || formData.campos_selecionados.length === 0) {
      setData([])
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: res, error: fnError } = await supabase.functions.invoke('get-chart-preview', {
          body: {
            usuario_id: user?.id,
            nome_tabela: formData.nome_tabela,
            campos_selecionados: formData.campos_selecionados,
            tipo_grafico: formData.tipo_grafico,
          },
        })
        if (fnError) throw fnError
        if (res.error) throw new Error(res.error)
        setData(res.data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }, 800) // 800ms debounce

    return () => clearTimeout(delayDebounceFn)
  }, [formData, user])

  if (!formData.nome_tabela || formData.campos_selecionados.length === 0) {
    return (
      <div className="h-[400px] w-full border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center p-4 text-slate-400">
        <PieChart className="size-12 mb-3 opacity-20" />
        <p>Selecione uma tabela e configure os campos para ver a prévia em tempo real.</p>
      </div>
    )
  }

  return (
    <div className="h-[400px] w-full border rounded-xl bg-white shadow-sm flex items-center justify-center p-6 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl transition-all">
          <Loader2 className="size-8 animate-spin text-sl-blue mb-2" />
          <span className="text-sm font-medium text-slate-500">Atualizando prévia...</span>
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center gap-2 text-red-500 text-center max-w-md">
          <AlertCircle className="size-8" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {!error && data.length > 0 && <ChartRenderer data={data} config={formData} />}
      {!error && data.length === 0 && !loading && (
        <div className="text-slate-400">Sem dados para exibição com a configuração atual.</div>
      )}
    </div>
  )
}
