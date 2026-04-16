import { ChartFormData, ChartMapping } from '@/types/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartFieldRow } from './ChartFieldRow'

interface ChartFieldsSetupProps {
  columns: { name: string; type: string }[]
  formData: ChartFormData
  setFormData: (fn: any) => void
}

export function ChartFieldsSetup({ columns, formData, setFormData }: ChartFieldsSetupProps) {
  const handleAddField = (colName: string) => {
    if (colName === 'none') return

    const isNumeric =
      columns.find((c) => c.name === colName)?.type.includes('int') ||
      columns.find((c) => c.name === colName)?.type.includes('decimal') ||
      columns.find((c) => c.name === colName)?.type.includes('float') ||
      columns.find((c) => c.name === colName)?.type.includes('numeric')

    const newMapping: ChartMapping = {
      field: colName,
      label: colName,
      type: isNumeric ? 'metric' : 'dimension',
      axis: isNumeric ? 'vertical' : 'horizontal',
      aggregation: isNumeric ? 'sum' : undefined,
      color: isNumeric ? '#0066CC' : '#FF8C00',
    }

    setFormData((prev: ChartFormData) => ({
      ...prev,
      fields_config: {
        ...prev.fields_config,
        mappings: [...prev.fields_config.mappings, newMapping],
      },
    }))
  }

  const handleUpdateField = (index: number, updated: ChartMapping) => {
    setFormData((prev: ChartFormData) => {
      const newMappings = [...prev.fields_config.mappings]
      newMappings[index] = updated
      return { ...prev, fields_config: { ...prev.fields_config, mappings: newMappings } }
    })
  }

  const handleRemoveField = (index: number) => {
    setFormData((prev: ChartFormData) => {
      const newMappings = [...prev.fields_config.mappings]
      newMappings.splice(index, 1)
      return { ...prev, fields_config: { ...prev.fields_config, mappings: newMappings } }
    })
  }

  const availableCols = columns.filter(
    (c) => !formData.fields_config.mappings.some((f) => f.field === c.name),
  )

  if (!formData.table_name) {
    return (
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center text-slate-500 italic">
        Selecione uma tabela origem para configurar o mapeamento dos campos.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800">Mapeamento de Campos</h3>
          <p className="text-sm text-slate-500">
            Defina quais campos compõem o gráfico e configure suas cores e labels.
          </p>
        </div>
        <Select onValueChange={handleAddField} value="">
          <SelectTrigger className="w-full sm:w-[250px] bg-white border-slate-200 shadow-sm focus:ring-sl-blue">
            <SelectValue placeholder="Adicionar Campo..." />
          </SelectTrigger>
          <SelectContent>
            {availableCols.map((c) => (
              <SelectItem key={c.name} value={c.name}>
                {c.name} <span className="text-slate-400 text-xs ml-1">({c.type})</span>
              </SelectItem>
            ))}
            {availableCols.length === 0 && (
              <SelectItem value="none" disabled>
                Nenhum campo disponível
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {formData.fields_config.mappings.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border-2 border-dashed border-slate-200 text-center text-sm text-slate-400">
            Nenhum campo adicionado. Selecione um campo acima para iniciar a configuração.
          </div>
        ) : (
          formData.fields_config.mappings.map((mapping, idx) => (
            <ChartFieldRow
              key={mapping.field}
              field={mapping}
              onChange={(upd) => handleUpdateField(idx, upd)}
              onRemove={() => handleRemoveField(idx)}
            />
          ))
        )}
      </div>
    </div>
  )
}
