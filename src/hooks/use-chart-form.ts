import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { ChartFormData, ChartField } from '@/types/chart'
import { getChart, createChart, updateChart } from '@/services/charts'

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
    name: '',
    table_name: '',
    fields_config: [],
    type: 'bar',
    description: '',
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
      if (!user || !formData.table_name) {
        setColumns([])
        return
      }
      setLoadingSchema(true)
      try {
        const { data: res, error } = await supabase.functions.invoke('get-sql-tables', {
          body: { action: 'get_columns', table_name: formData.table_name, usuario_id: user.id },
        })
        if (error) throw error
        if (res.error) throw new Error(res.error)

        const fetchedCols = res.data.map((c: any) => ({ name: c.column_name, type: c.data_type }))
        setColumns(fetchedCols)

        const newColNames = fetchedCols.map((c: any) => c.name)
        setFormData((prev) => ({
          ...prev,
          fields_config: prev.fields_config.filter((f) => newColNames.includes(f.original_name)),
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
  }, [formData.table_name, user, toast])

  useEffect(() => {
    const fetchConfig = async () => {
      if (!id || !user) return
      try {
        const data = await getChart(id)
        if (data) {
          const loadedCampos = data.fields_config || []
          const normalizedCampos = loadedCampos.map((c: any) => {
            return {
              ...c,
              is_filter: c.is_filter || false,
            }
          })

          setFormData({
            name: data.name,
            table_name: data.table_name,
            fields_config: normalizedCampos,
            type: data.type,
            description: data.description || '',
          })
          if (data.description) setUserEditedDesc(true)
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
    const typeLabel = formData.type || 'barra'
    const table = formData.table_name || 'uma tabela'
    const fields =
      formData.fields_config.length > 0
        ? formData.fields_config
            .map((f) => f.display_name)
            .join(', ')
            .replace(/, ([^,]*)$/, ' e $1')
        : 'dados gerais'
    return `Gráfico de ${typeLabel} comparando ${fields} da tabela ${table}.`
  }, [formData.type, formData.table_name, formData.fields_config])

  useEffect(() => {
    if (!userEditedDesc && (formData.table_name || formData.fields_config.length > 0)) {
      setFormData((prev) => ({ ...prev, description: generatedDescription }))
    }
  }, [generatedDescription, userEditedDesc, formData.table_name, formData.fields_config.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.table_name || !formData.type) {
      return toast({
        title: 'Atenção',
        description: 'Preencha os campos obrigatórios.',
        variant: 'destructive',
      })
    }

    setLoading(true)

    try {
      if (id) {
        await updateChart(id, formData)
      } else {
        await createChart(formData)
      }

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
