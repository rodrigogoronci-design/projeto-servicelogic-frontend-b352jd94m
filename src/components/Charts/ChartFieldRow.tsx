import { ChartMapping } from '@/types/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'
import { ColorPicker } from './ColorPicker'

interface ChartFieldRowProps {
  field: ChartMapping
  onChange: (f: ChartMapping) => void
  onRemove: () => void
}

export function ChartFieldRow({ field, onChange, onRemove }: ChartFieldRowProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm transition-all hover:shadow-md w-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Campo Original:
          </span>
          <span className="font-mono text-sm text-slate-700 bg-slate-100 px-2 py-1 rounded">
            {field.field}
          </span>
        </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2 lg:col-span-2">
          <Label className="text-xs text-slate-500">Label de Exibição (Display Name)</Label>
          <Input
            value={field.label}
            onChange={(e) => onChange({ ...field, label: e.target.value })}
            placeholder="Nome amigável"
            className="h-9 focus-visible:ring-sl-blue"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Tipo do Dado</Label>
          <Select
            value={field.type}
            onValueChange={(val: any) => onChange({ ...field, type: val })}
          >
            <SelectTrigger className="h-9 focus:ring-sl-blue">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dimension">Dimensão</SelectItem>
              <SelectItem value="metric">Métrica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Eixo e Agregação</Label>
          <div className="flex gap-2">
            <Select
              value={field.axis}
              onValueChange={(val: any) => onChange({ ...field, axis: val })}
            >
              <SelectTrigger className="h-9 w-full focus:ring-sl-blue">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Eixo X</SelectItem>
                <SelectItem value="vertical">Eixo Y</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={field.aggregation || 'sum'}
              onValueChange={(val: any) => onChange({ ...field, aggregation: val })}
              disabled={field.type === 'dimension'}
            >
              <SelectTrigger className="h-9 w-full focus:ring-sl-blue">
                <SelectValue placeholder="Agreg." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sum">Soma</SelectItem>
                <SelectItem value="avg">Média</SelectItem>
                <SelectItem value="count">Contag.</SelectItem>
                <SelectItem value="min">Mínimo</SelectItem>
                <SelectItem value="max">Máximo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 flex flex-col justify-end">
          <div className="flex items-center gap-3 h-9">
            <ColorPicker color={field.color} onChange={(c) => onChange({ ...field, color: c })} />
          </div>
        </div>
      </div>
    </div>
  )
}
