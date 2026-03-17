import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GripVertical, Plus, Save, ArrowLeft, Loader2, PieChart, Trash2 } from 'lucide-react'
import { ChartFormData } from '@/types/chart'

export default function DashboardForm() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [availableCharts, setAvailableCharts] = useState<(ChartFormData & { id: string })[]>([])

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [layout, setLayout] = useState<string[]>([])
  const [selectedChartToAdd, setSelectedChartToAdd] = useState('')

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        // Fetch all charts
        const { data: chartsData, error: chartsError } = await supabase
          .from('configuracao_graficos' as any)
          .select('*')
          .eq('usuario_id', user.id)

        if (chartsError) throw chartsError
        setAvailableCharts(chartsData || [])

        // If editing, fetch dashboard
        if (id) {
          const { data: dashData, error: dashError } = await supabase
            .from('dashboards' as any)
            .select('*')
            .eq('id', id)
            .single()

          if (dashError) throw dashError
          if (dashData) {
            setNome(dashData.nome)
            setDescricao(dashData.descricao || '')
            setLayout(dashData.configuracao_layout || [])
          }
        }
      } catch (err: any) {
        toast({ title: 'Erro', description: err.message, variant: 'destructive' })
        if (id) navigate('/app/dashboards')
      } finally {
        setInitialLoading(false)
      }
    }
    fetchData()
  }, [id, user])

  const handleAddChart = () => {
    if (!selectedChartToAdd) return
    setLayout((prev) => [...prev, selectedChartToAdd])
    setSelectedChartToAdd('')
  }

  const handleRemoveChart = (index: number) => {
    setLayout((prev) => {
      const newLayout = [...prev]
      newLayout.splice(index, 1)
      return newLayout
    })
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
    if (e.target instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.target, 20, 20)
    }
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === index) return

    const newLayout = [...layout]
    const item = newLayout.splice(draggedIdx, 1)[0]
    newLayout.splice(index, 0, item)

    setDraggedIdx(index)
    setLayout(newLayout)
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !nome) return

    setLoading(true)
    const payload = {
      usuario_id: user.id,
      nome,
      descricao,
      configuracao_layout: layout,
    }

    try {
      let error
      if (id) {
        const res = await supabase
          .from('dashboards' as any)
          .update(payload)
          .eq('id', id)
        error = res.error
      } else {
        const res = await supabase.from('dashboards' as any).insert(payload)
        error = res.error
      }

      if (error) throw error
      toast({ title: 'Sucesso', description: 'Dashboard salvo com sucesso.' })
      navigate('/app/dashboards')
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="size-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-fade-in-up pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-slate-500 hover:text-slate-900 border bg-white shadow-sm"
        >
          <Link to="/app/dashboards">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">
            {id ? 'Editar Dashboard' : 'Novo Dashboard'}
          </h2>
          <p className="text-slate-500 mt-1">
            Organize a disposição dos gráficos para compor seu painel.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="border-t-4 border-t-sl-blue shadow-sm">
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
            <CardDescription>Defina o nome e propósito deste dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome do Dashboard <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Resumo de Vendas"
                className="focus-visible:ring-sl-blue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Opcional"
                className="resize-none focus-visible:ring-sl-blue"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Composição e Layout</CardTitle>
            <CardDescription>
              Adicione gráficos e arraste-os para ordenar a exibição.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-slate-500">Selecione um Gráfico</Label>
                <Select value={selectedChartToAdd} onValueChange={setSelectedChartToAdd}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Escolher..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCharts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome_grafico}
                      </SelectItem>
                    ))}
                    {availableCharts.length === 0 && (
                      <SelectItem value="none" disabled>
                        Nenhum gráfico criado.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleAddChart}
                  disabled={!selectedChartToAdd}
                  className="w-full sm:w-auto gap-2 bg-sl-blue hover:bg-sl-blueLight text-white"
                >
                  <Plus className="size-4" /> Adicionar
                </Button>
              </div>
            </div>

            <div className="space-y-3 min-h-[200px] border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50">
              {layout.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                  <PieChart className="size-10 mb-2 opacity-30" />
                  <p className="text-sm">Nenhum gráfico adicionado ainda.</p>
                </div>
              ) : (
                layout.map((chartId, index) => {
                  const chart = availableCharts.find((c) => c.id === chartId)
                  return (
                    <div
                      key={`${chartId}-${index}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-transform ${draggedIdx === index ? 'opacity-50 scale-[0.98]' : 'hover:border-sl-blue'}`}
                    >
                      <GripVertical className="size-5 text-slate-400 shrink-0" />
                      <div className="flex-1 flex flex-col min-w-0">
                        <span className="font-medium text-sm text-slate-800 truncate">
                          {chart?.nome_grafico || 'Gráfico Removido'}
                        </span>
                        <span className="text-xs text-slate-500 truncate">
                          Tabela: {chart?.nome_tabela || '?'}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveChart(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" asChild className="bg-white">
                <Link to="/app/dashboards">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-sl-blue hover:bg-sl-blueLight text-white shadow-md px-6"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : (
                  <Save className="size-4 mr-2" />
                )}
                Salvar Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
