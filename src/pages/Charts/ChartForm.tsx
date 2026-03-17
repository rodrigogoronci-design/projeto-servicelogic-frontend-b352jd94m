import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { BarChart, LineChart, PieChart, ScatterChart, ArrowLeft, Loader2, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

const chartTypes = [
  { id: 'bar', label: 'Barra', icon: BarChart },
  { id: 'line', label: 'Linha', icon: LineChart },
  { id: 'pie', label: 'Pizza', icon: PieChart },
  { id: 'scatter', label: 'Dispersão', icon: ScatterChart },
]

export default function ChartForm() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!id)
  const [tables, setTables] = useState<string[]>([])
  const [columns, setColumns] = useState<{ name: string; type: string }[]>([])
  const [loadingSchema, setLoadingSchema] = useState(false)

  const [formData, setFormData] = useState({
    nome_grafico: '',
    nome_tabela: '',
    campos_selecionados: [] as string[],
    tipo_grafico: 'bar',
    descricao: '',
  })

  const [userEditedDesc, setUserEditedDesc] = useState(false)

  // Fetch Tables
  useEffect(() => {
    const fetchTables = async () => {
      if (!user) return
      try {
        const { data: res, error } = await supabase.functions.invoke('get-sql-tables', {
          body: { action: 'get_tables', usuario_id: user.id },
        })
        if (error) throw error
        if (res.error) throw new Error(res.error)
        setTables(res.data.map((t: any) => t.table_name))
      } catch (err: any) {
        toast({
          title: 'Erro ao carregar tabelas',
          description: err.message,
          variant: 'destructive',
        })
      }
    }
    fetchTables()
  }, [user])

  // Fetch Columns when table changes
  useEffect(() => {
    const fetchColumns = async () => {
      if (!user || !formData.nome_tabela) {
        setColumns([])
        return
      }
      setLoadingSchema(true)
      try {
        const { data: res, error } = await supabase.functions.invoke('get-sql-tables', {
          body: { action: 'get_columns', table_name: formData.nome_tabela, usuario_id: user.id },
        })
        if (error) throw error
        if (res.error) throw new Error(res.error)
        setColumns(res.data.map((c: any) => ({ name: c.column_name, type: c.data_type })))

        // Remove selected fields that don't exist in new table
        const newColNames = res.data.map((c: any) => c.column_name)
        setFormData((prev) => ({
          ...prev,
          campos_selecionados: prev.campos_selecionados.filter((f) => newColNames.includes(f)),
        }))
      } catch (err: any) {
        toast({
          title: 'Erro ao carregar colunas',
          description: err.message,
          variant: 'destructive',
        })
      } finally {
        setLoadingSchema(false)
      }
    }
    fetchColumns()
  }, [formData.nome_tabela, user])

  // Fetch existing config if editing
  useEffect(() => {
    const fetchConfig = async () => {
      if (!id || !user) return
      try {
        const { data, error } = await supabase
          .from('configuracao_graficos' as any)
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        if (data) {
          setFormData({
            nome_grafico: data.nome_grafico,
            nome_tabela: data.nome_tabela,
            campos_selecionados: data.campos_selecionados || [],
            tipo_grafico: data.tipo_grafico,
            descricao: data.descricao || '',
          })
          if (data.descricao) setUserEditedDesc(true)
        }
      } catch (err: any) {
        toast({ title: 'Erro', description: 'Gráfico não encontrado.', variant: 'destructive' })
        navigate('/app/graficos')
      } finally {
        setInitialLoading(false)
      }
    }
    fetchConfig()
  }, [id, user])

  // Auto-generate description
  const generatedDescription = useMemo(() => {
    const typeLabel =
      chartTypes.find((t) => t.id === formData.tipo_grafico)?.label?.toLowerCase() || 'barra'
    const table = formData.nome_tabela || 'uma tabela'
    const fields =
      formData.campos_selecionados.length > 0
        ? formData.campos_selecionados.join(', ').replace(/, ([^,]*)$/, ' e $1')
        : 'dados gerais'
    return `Gráfico de ${typeLabel} comparando ${fields} da tabela ${table}.`
  }, [formData.tipo_grafico, formData.nome_tabela, formData.campos_selecionados])

  useEffect(() => {
    if (!userEditedDesc && (formData.nome_tabela || formData.campos_selecionados.length > 0)) {
      setFormData((prev) => ({ ...prev, descricao: generatedDescription }))
    }
  }, [generatedDescription, userEditedDesc])

  const toggleField = (fieldName: string) => {
    setFormData((prev) => {
      const isSelected = prev.campos_selecionados.includes(fieldName)
      const newFields = isSelected
        ? prev.campos_selecionados.filter((f) => f !== fieldName)
        : [...prev.campos_selecionados, fieldName]
      return { ...prev, campos_selecionados: newFields }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!formData.nome_grafico || !formData.nome_tabela || !formData.tipo_grafico) {
      return toast({
        title: 'Atenção',
        description: 'Preencha os campos obrigatórios.',
        variant: 'destructive',
      })
    }

    setLoading(true)
    const payload = {
      usuario_id: user.id,
      ...formData,
    }

    try {
      let error
      if (id) {
        const res = await supabase
          .from('configuracao_graficos' as any)
          .update(payload)
          .eq('id', id)
        error = res.error
      } else {
        const res = await supabase.from('configuracao_graficos' as any).insert(payload)
        error = res.error
      }

      if (error) throw error
      toast({ title: 'Sucesso', description: 'Configuração salva com sucesso.' })
      navigate('/app/graficos')
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="size-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in-up pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="text-slate-500 hover:text-slate-900">
          <Link to="/app/graficos">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            {id ? 'Editar Gráfico' : 'Novo Gráfico'}
          </h2>
          <p className="text-slate-500">Configure as opções de visualização para seus dados SQL.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-t-4 border-t-sl-orange shadow-md">
          <CardHeader>
            <CardTitle>Detalhes da Configuração</CardTitle>
            <CardDescription>Defina a origem dos dados e o formato visual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome_grafico">
                  Nome do Gráfico <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nome_grafico"
                  required
                  placeholder="Ex: Faturamento Mensal"
                  value={formData.nome_grafico}
                  onChange={(e) => setFormData({ ...formData, nome_grafico: e.target.value })}
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome_tabela">
                  Tabela Origem <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.nome_tabela}
                  onValueChange={(val) => setFormData({ ...formData, nome_tabela: val })}
                >
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue placeholder="Selecione uma tabela" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                    {tables.length === 0 && (
                      <div className="p-2 text-sm text-slate-500">Buscando tabelas...</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>
                Tipo de Gráfico <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {chartTypes.map((type) => {
                  const isSelected = formData.tipo_grafico === type.id
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, tipo_grafico: type.id })}
                      className={cn(
                        'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 gap-3',
                        isSelected
                          ? 'border-sl-orange bg-orange-50 text-sl-orange shadow-sm'
                          : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50',
                      )}
                    >
                      <type.icon
                        className={cn('size-8', isSelected ? 'text-sl-orange' : 'text-slate-400')}
                      />
                      <span className="font-medium text-sm">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between">
                <Label>Campos para Visualização</Label>
                {loadingSchema && <Loader2 className="size-4 animate-spin text-slate-400" />}
              </div>

              {!formData.nome_tabela ? (
                <p className="text-sm text-slate-500 italic">
                  Selecione uma tabela para carregar os campos.
                </p>
              ) : columns.length === 0 && !loadingSchema ? (
                <p className="text-sm text-slate-500 italic">Nenhum campo encontrado.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[200px] overflow-y-auto p-1">
                  {columns.map((col) => (
                    <div
                      key={col.name}
                      className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm"
                    >
                      <Checkbox
                        id={`col-${col.name}`}
                        checked={formData.campos_selecionados.includes(col.name)}
                        onCheckedChange={() => toggleField(col.name)}
                      />
                      <label
                        htmlFor={`col-${col.name}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate flex-1 cursor-pointer"
                        title={`${col.name} (${col.type})`}
                      >
                        {col.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="descricao">Descrição (Auto-gerada)</Label>
                {userEditedDesc && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-sl-blue"
                    onClick={() => {
                      setUserEditedDesc(false)
                      setFormData((prev) => ({ ...prev, descricao: generatedDescription }))
                    }}
                  >
                    Restaurar Padrão
                  </Button>
                )}
              </div>
              <Textarea
                id="descricao"
                placeholder="Descreva o propósito deste gráfico..."
                value={formData.descricao}
                onChange={(e) => {
                  setFormData({ ...formData, descricao: e.target.value })
                  setUserEditedDesc(true)
                }}
                className="bg-white resize-y"
                rows={3}
              />
            </div>

            <div className="pt-6 border-t flex justify-end gap-3">
              <Button type="button" variant="outline" asChild className="bg-white">
                <Link to="/app/graficos">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-sl-blue hover:bg-sl-blueLight text-white px-8"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : (
                  <Save className="size-4 mr-2" />
                )}
                Salvar Gráfico
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
