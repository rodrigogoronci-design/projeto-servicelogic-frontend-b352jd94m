import { useMemo } from 'react'
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
import { ChartFormData, ChartField } from '@/types/chart'

const DEFAULT_COLORS = ['#FF8C00', '#0066CC', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B']

interface ChartRendererProps {
  data: any[]
  config: Partial<ChartFormData>
}

export function ChartRenderer({ data, config }: ChartRendererProps) {
  const campos = useMemo(() => {
    return (config?.campos_selecionados || []).map((c: any, i) => {
      if (typeof c === 'string') {
        return {
          field_name: c,
          axis: 'vertical',
          type: 'metric',
          display_label: c,
          color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
        } as ChartField
      }
      return c as ChartField
    })
  }, [config?.campos_selecionados])

  if (!config || data.length === 0) return null

  const type = config.tipo_grafico || 'bar'

  const dimensions = campos.filter((c) => c.type === 'dimension')
  const metrics = campos.filter((c) => c.type === 'metric')

  const dimKey = dimensions[0]?.display_label || dimensions[0]?.field_name || 'name'

  const chartConfigObj = metrics.reduce(
    (acc, m) => {
      const key = m.display_label || m.field_name
      acc[key] = { label: key, color: m.color || '#0066CC' }
      return acc
    },
    {} as Record<string, any>,
  )

  // Fallback config if no metrics mapped but data exists
  if (metrics.length === 0 && campos.length === 0) {
    const fallbackKeys = Object.keys(data[0] || {}).filter((k) => k !== 'name' && k !== dimKey)
    fallbackKeys.forEach((k, i) => {
      chartConfigObj[k] = { label: k, color: DEFAULT_COLORS[i % DEFAULT_COLORS.length] }
      metrics.push({
        field_name: k,
        display_label: k,
        type: 'metric',
        color: chartConfigObj[k].color,
        axis: 'vertical',
      })
    })
  }
  if (metrics.length === 0) {
    chartConfigObj['valor'] = { label: 'Valor', color: '#FF8C00' }
  }

  const renderContent = () => {
    switch (type) {
      case 'bar': {
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey={dimKey} tickLine={false} axisLine={false} tick={{ fill: '#64748B' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B' }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {metrics.map((m) => {
              const k = m.display_label || m.field_name
              return <Bar key={k} dataKey={k} fill={`var(--color-${k})`} radius={[4, 4, 0, 0]} />
            })}
            {metrics.length === 0 && (
              <Bar dataKey="valor" fill="var(--color-valor)" radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        )
      }
      case 'line': {
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey={dimKey} tickLine={false} axisLine={false} tick={{ fill: '#64748B' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B' }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {metrics.map((m) => {
              const k = m.display_label || m.field_name
              return (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={`var(--color-${k})`}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )
            })}
            {metrics.length === 0 && (
              <Line dataKey="valor" stroke="var(--color-valor)" strokeWidth={3} />
            )}
          </LineChart>
        )
      }
      case 'pie': {
        const pieMetric = metrics[0]?.display_label || metrics[0]?.field_name || 'valor'
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={130}
              dataKey={pieMetric}
              nameKey={dimKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        )
      }
      case 'scatter': {
        const xKey = dimensions[0]?.display_label || dimensions[0]?.field_name || 'x'
        const yKey = metrics[0]?.display_label || metrics[0]?.field_name || 'y'
        return (
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis type="number" dataKey={xKey} name={xKey} tick={{ fill: '#64748B' }} />
            <YAxis type="number" dataKey={yKey} name={yKey} tick={{ fill: '#64748B' }} />
            <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
            <Scatter name={config.nome_tabela} data={data} fill={metrics[0]?.color || '#FF8C00'} />
          </ScatterChart>
        )
      }
      default: {
        return <div className="text-slate-500">Tipo de gráfico não suportado.</div>
      }
    }
  }

  return (
    <ChartContainer config={chartConfigObj} className="h-full w-full">
      {renderContent()}
    </ChartContainer>
  )
}
