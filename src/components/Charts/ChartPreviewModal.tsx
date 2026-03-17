import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, AlertCircle } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

const COLORS = ['#FF8C00', '#0066CC', '#FFB347', '#4D94FF', '#FFE0B2', '#99C2FF']

interface ChartConfig {
  nome_grafico: string
  nome_tabela: string
  campos_selecionados: string[]
  tipo_grafico: string
  descricao?: string
}

interface ChartPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  config: ChartConfig | null
}

export function ChartPreviewModal({ isOpen, onClose, config }: ChartPreviewModalProps) {
  const { user } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPreview = async () => {
      if (!isOpen || !config || !user) return

      setLoading(true)
      setError(null)
      setData([])

      try {
        const { data: res, error: fnError } = await supabase.functions.invoke('get-chart-preview', {
          body: {
            usuario_id: user.id,
            nome_tabela: config.nome_tabela,
            campos_selecionados: config.campos_selecionados,
            tipo_grafico: config.tipo_grafico,
          },
        })

        if (fnError) throw fnError
        if (res.error) throw new Error(res.error)

        setData(res.data || [])
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar prévia do gráfico.')
      } finally {
        setLoading(false)
      }
    }

    fetchPreview()
  }, [isOpen, config, user])

  const renderChart = () => {
    if (!config || data.length === 0) return null

    // Determine numeric keys for charts that need them (Bar/Line)
    const dataKeys = Object.keys(data[0] || {}).filter((key) => key !== 'name')
    const primaryKey = dataKeys[0] || 'value'

    // Build ChartConfig for shadcn ChartContainer
    const chartConfigObj = dataKeys.reduce(
      (acc, key, index) => {
        acc[key] = {
          label: key,
          color: COLORS[index % COLORS.length],
        }
        return acc
      },
      {} as Record<string, any>,
    )

    switch (config.tipo_grafico) {
      case 'bar':
        return (
          <ChartContainer config={chartConfigObj} className="h-[400px] w-full">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748B' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {dataKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ChartContainer>
        )
      case 'line':
        return (
          <ChartContainer config={chartConfigObj} className="h-[400px] w-full">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748B' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {dataKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={`var(--color-${key})`}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )
      case 'pie':
        return (
          <ChartContainer
            config={{ value: { label: primaryKey, color: COLORS[0] } }}
            className="h-[400px] w-full"
          >
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={130}
                dataKey="value"
                nameKey="name"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        )
      case 'scatter':
        return (
          <ChartContainer config={chartConfigObj} className="h-[400px] w-full">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" dataKey="x" name="stature" tick={{ fill: '#64748B' }} />
              <YAxis type="number" dataKey="y" name="weight" tick={{ fill: '#64748B' }} />
              <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
              <Scatter name={config.nome_tabela} data={data} fill={COLORS[0]} />
            </ScatterChart>
          </ChartContainer>
        )
      default:
        return <div className="p-4 text-center text-slate-500">Tipo de gráfico não suportado.</div>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            {config?.nome_grafico || 'Prévia do Gráfico'}
          </DialogTitle>
          {config?.descricao && <DialogDescription>{config.descricao}</DialogDescription>}
        </DialogHeader>

        <div className="mt-4 min-h-[400px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 p-6">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="size-8 animate-spin" />
              <p>Processando dados do SQL Server...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 text-red-500 text-center max-w-md">
              <AlertCircle className="size-8" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="w-full h-full">{renderChart()}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
