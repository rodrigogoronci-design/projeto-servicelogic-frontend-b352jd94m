import { ChartField } from '@/types/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { ColorPicker } from './ColorPicker'

interface ChartFieldRowProps {
  field: ChartField
  onChange: (f: ChartField) => void
  onRemove: () => void
}

export function ChartFieldRow({ field, onChange, onRemove }: ChartFieldRowProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
      <div
        className="w-full md:w-40 truncate font-semibold text-sm text-slate-800"
        title={field.field_name}
      >
        {field.field_name}
      </div>

      <div className="grid grid-cols-2 md:flex items-center gap-2 w-full md:w-auto">
        <Select value={field.type} onValueChange={(val: any) => onChange({ ...field, type: val })}>
          <SelectTrigger className="w-full md:w-[110px] h-8 text-xs bg-slate-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dimension" className="text-xs">
              Dimensão
            </SelectItem>
            <SelectItem value="metric" className="text-xs">
              Métrica
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={field.axis} onValueChange={(val: any) => onChange({ ...field, axis: val })}>
          <SelectTrigger className="w-full md:w-[100px] h-8 text-xs bg-slate-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="horizontal" className="text-xs">
              Eixo X
            </SelectItem>
            <SelectItem value="vertical" className="text-xs">
              Eixo Y
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={field.aggregation || 'sum'}
          onValueChange={(val: any) => onChange({ ...field, aggregation: val })}
          disabled={field.type === 'dimension'}
        >
          <SelectTrigger className="w-full md:w-[100px] h-8 text-xs bg-slate-50">
            <SelectValue placeholder="Agreg." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sum" className="text-xs">
              Soma
            </SelectItem>
            <SelectItem value="avg" className="text-xs">
              Média
            </SelectItem>
            <SelectItem value="count" className="text-xs">
              Contagem
            </SelectItem>
            <SelectItem value="min" className="text-xs">
              Mínimo
            </SelectItem>
            <SelectItem value="max" className="text-xs">
              Máximo
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 w-full md:flex-1 mt-2 md:mt-0">
        <Input
          value={field.display_label}
          onChange={(e) => onChange({ ...field, display_label: e.target.value })}
          placeholder="Rótulo (ex: Valor Total)"
          className="h-8 text-xs flex-1 bg-slate-50"
        />
        <ColorPicker color={field.color} onChange={(c) => onChange({ ...field, color: c })} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          title="Remover campo"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}
