import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { ChartFormData, ChartField } from '@/types/chart'

export function useChartForm(id?: string) {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!id)
  const [tables, setTables] = useState<string[]>([])
  const [columns, setColumns] = useState<{ name: string; type: string }[]>([])
  const [loadingSchema, setLoadingSchema] = useState(false)
  const [userEditedDesc, setUserEditedDesc] = useState(false)

  const [formData, setFormData] = useState<ChartFormData>({
    nome_grafico: '',
    nome_tabela: '',
    campos_selecionados: [],
    tipo_grafico: 'bar',
    descricao: '',
  })

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
  }, [user, toast])

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

        const fetchedCols = res.data.map((c: any) => ({ name: c.column_name, type: c.data_type }))
        setColumns(fetchedCols)

        const newColNames = fetchedCols.map((c: any) => c.name)
        setFormData((prev) => ({
          ...prev,
          campos_selecionados: prev.campos_selecionados.filter((f) =>
            newColNames.includes(f.field_name),
          ),
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
  }, [formData.nome_tabela, user, toast])

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
          const loadedCampos = data.campos_selecionados || []
          const normalizedCampos = loadedCampos.map((c: any, i: number) => {
            if (typeof c === 'string') {
              return {
                field_name: c,
                axis: i === 0 ? 'horizontal' : 'vertical',
                type: i === 0 ? 'dimension' : 'metric',
                aggregation: i === 0 ? undefined : 'sum',
                display_label: c,
                color: i === 0 ? '#0066CC' : '#FF8C00',
              }
            }
            return c
          })

          setFormData({
            nome_grafico: data.nome_grafico,
            nome_tabela: data.nome_tabela,
            campos_selecionados: normalizedCampos,
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
  }, [id, user, navigate, toast])

  const generatedDescription = useMemo(() => {
    const typeLabel = formData.tipo_grafico || 'barra'
    const table = formData.nome_tabela || 'uma tabela'
    const fields =
      formData.campos_selecionados.length > 0
        ? formData.campos_selecionados
            .map((f) => f.display_label)
            .join(', ')
            .replace(/, ([^,]*)$/, ' e $1')
        : 'dados gerais'
    return `Gráfico de ${typeLabel} comparando ${fields} da tabela ${table}.`
  }, [formData.tipo_grafico, formData.nome_tabela, formData.campos_selecionados])

  useEffect(() => {
    if (!userEditedDesc && (formData.nome_tabela || formData.campos_selecionados.length > 0)) {
      setFormData((prev) => ({ ...prev, descricao: generatedDescription }))
    }
  }, [
    generatedDescription,
    userEditedDesc,
    formData.nome_tabela,
    formData.campos_selecionados.length,
  ])

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
    const payload = { usuario_id: user.id, ...formData }

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

  return {
    formData,
    setFormData,
    tables,
    columns,
    loading,
    initialLoading,
    loadingSchema,
    userEditedDesc,
    setUserEditedDesc,
    generatedDescription,
    handleSubmit,
  }
}
