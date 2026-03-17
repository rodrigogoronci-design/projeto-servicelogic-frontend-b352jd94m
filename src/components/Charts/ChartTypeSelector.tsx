import { BarChart, LineChart, PieChart, ScatterChart } from 'lucide-react'
import { cn } from '@/lib/utils'

const chartTypes = [
  { id: 'bar', label: 'Barra', icon: BarChart },
  { id: 'line', label: 'Linha', icon: LineChart },
  { id: 'pie', label: 'Pizza', icon: PieChart },
  { id: 'scatter', label: 'Dispersão', icon: ScatterChart },
]

export function ChartTypeSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {chartTypes.map((type) => {
        const isSelected = value === type.id
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={cn(
              'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 gap-3',
              isSelected
                ? 'border-sl-orange bg-orange-50 text-sl-orange shadow-sm'
                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50',
            )}
          >
            <type.icon className={cn('size-8', isSelected ? 'text-sl-orange' : 'text-slate-400')} />
            <span className="font-medium text-sm">{type.label}</span>
          </button>
        )
      })}
    </div>
  )
}
