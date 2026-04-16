export interface ChartField {
  original_name: string
  display_name: string
  axis: 'horizontal' | 'vertical'
  type: 'dimension' | 'metric'
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
  color: string
  is_filter: boolean
}

export interface ChartFormData {
  id?: string
  name: string
  table_name: string
  type: string
  description?: string
  fields_config: ChartField[]
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
  return {
    nome_grafico: chart.name || '',
    nome_tabela: chart.table_name || '',
    tipo_grafico: chart.type || 'bar',
    descricao: chart.description || '',
    campos_selecionados: (chart.fields_config || []).map((f) => ({
      field_name: f.original_name,
      display_label: f.display_name,
      axis: f.axis,
      type: f.type,
      aggregation: f.aggregation,
      color: f.color,
      is_filter: f.is_filter,
    })),
  }
}
