import { ChartFormData, ChartFilter } from '@/types/chart'
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
import { Trash2, Plus } from 'lucide-react'

interface Props {
  columns: { name: string; type: string }[]
  formData: ChartFormData
  setFormData: (fn: any) => void
}

const OPERATORS = [
  { value: 'equals', label: 'Igual a' },
  { value: 'contains', label: 'Contém' },
  { value: 'greater_than', label: 'Maior que' },
  { value: 'less_than', label: 'Menor que' },
  { value: 'not_equals', label: 'Diferente de' },
]

export function ChartGlobalFilters({ columns, formData, setFormData }: Props) {
  const filters = formData.fields_config.filters || []

  const addFilter = () => {
    if (columns.length === 0) return
    const newFilter: ChartFilter = {
      field: columns[0].name,
      operator: 'equals',
      value: '',
    }
    setFormData((prev: ChartFormData) => ({
      ...prev,
      fields_config: {
        ...prev.fields_config,
        filters: [...prev.fields_config.filters, newFilter],
      },
    }))
  }

  const updateFilter = (index: number, updated: ChartFilter) => {
    setFormData((prev: ChartFormData) => {
      const newFilters = [...prev.fields_config.filters]
      newFilters[index] = updated
      return {
        ...prev,
        fields_config: { ...prev.fields_config, filters: newFilters },
      }
    })
  }

  const removeFilter = (index: number) => {
    setFormData((prev: ChartFormData) => {
      const newFilters = [...prev.fields_config.filters]
      newFilters.splice(index, 1)
      return {
        ...prev,
        fields_config: { ...prev.fields_config, filters: newFilters },
      }
    })
  }

  if (!formData.table_name) {
    return (
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center text-slate-500 italic">
        Selecione uma tabela origem para configurar filtros globais.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filters.length === 0 ? (
        <div className="p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-center text-sm text-slate-400">
          Nenhum filtro global configurado.
        </div>
      ) : (
        <div className="space-y-3">
          {filters.map((filter, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm"
            >
              <div className="w-full sm:w-1/3">
                <Label className="sr-only">Campo</Label>
                <Select
                  value={filter.field}
                  onValueChange={(v) => updateFilter(idx, { ...filter, field: v })}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-1/4">
                <Label className="sr-only">Operador</Label>
                <Select
                  value={filter.operator}
                  onValueChange={(v) => updateFilter(idx, { ...filter, operator: v })}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Operador" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:flex-1 flex items-center gap-2">
                <Label className="sr-only">Valor</Label>
                <Input
                  value={filter.value}
                  onChange={(e) => updateFilter(idx, { ...filter, value: e.target.value })}
                  placeholder="Valor..."
                  className="h-9 w-full focus-visible:ring-sl-blue"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFilter(idx)}
                  className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addFilter}
        disabled={columns.length === 0}
        className="w-full sm:w-auto mt-2 border-dashed text-slate-600"
      >
        <Plus className="size-4 mr-2" />
        Adicionar Filtro
      </Button>
    </div>
  )
}
