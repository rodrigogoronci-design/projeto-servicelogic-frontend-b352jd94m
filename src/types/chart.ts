export interface ChartField {
  field_name: string
  axis: 'horizontal' | 'vertical'
  type: 'dimension' | 'metric'
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
  display_label: string
  color: string
  is_filter?: boolean
}

export interface ChartFormData {
  nome_grafico: string
  nome_tabela: string
  tipo_grafico: string
  descricao: string
  campos_selecionados: ChartField[]
}

export interface DashboardData {
  id?: string
  nome: string
  descricao: string
  configuracao_layout: string[]
}
