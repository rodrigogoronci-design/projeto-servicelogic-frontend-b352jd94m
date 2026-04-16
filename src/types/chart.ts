export interface ChartMapping {
  field: string
  label: string
  color: string
  axis: 'horizontal' | 'vertical'
  type: 'dimension' | 'metric'
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
}

export interface ChartFilter {
  field: string
  operator: string
  value: string | number
}

export interface ChartFieldsConfig {
  mappings: ChartMapping[]
  filters: ChartFilter[]
}

export interface ChartFormData {
  id?: string
  name: string
  table_name: string
  type: string
  description?: string
  fields_config: ChartFieldsConfig
}

export interface DashboardData {
  id?: string
  name: string
  description: string
}

export interface DashboardItemData {
  id?: string
  dashboard_id?: string
  chart_id: string
  sort_order: number
  expand?: {
    chart_id: ChartFormData & { id: string }
  }
}

// Old formats for compatibility with external components
export interface OldChartField {
  field_name: string
  axis: 'horizontal' | 'vertical'
  type: 'dimension' | 'metric'
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
  display_label: string
  color: string
  is_filter?: boolean
}

export interface OldChartFormData {
  nome_grafico: string
  nome_tabela: string
  tipo_grafico: string
  descricao: string
  campos_selecionados: OldChartField[]
}

export function mapToOldFormat(chart: ChartFormData): OldChartFormData {
  const config = chart.fields_config || { mappings: [], filters: [] }
  const mappings = Array.isArray(config) ? config : config.mappings || []

  return {
    nome_grafico: chart.name || '',
    nome_tabela: chart.table_name || '',
    tipo_grafico: chart.type || 'bar',
    descricao: chart.description || '',
    campos_selecionados: mappings.map((m: any) => ({
      field_name: m.field || m.original_name,
      display_label: m.label || m.display_name,
      axis: m.axis || 'horizontal',
      type: m.type || 'dimension',
      aggregation: m.aggregation,
      color: m.color || '#000000',
      is_filter: false,
    })),
  }
}
