import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Database, AlertCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

const COLORS = ['#FF8C00', '#0066CC', '#FFB347', '#4D94FF', '#FFE0B2', '#99C2FF']

export default function DashboardSQL() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasConfig, setHasConfig] = useState<boolean | null>(null)

  const checkConfigAndFetch = async (forceRefresh = false) => {
    if (!user) return
    setLoading(true)

    // Check if credentials exist
    const { data: creds } = await supabase
      .from('credenciais_sql_server' as any)
      .select('id')
      .eq('usuario_id', user.id)
      .maybeSingle()

    if (!creds) {
      setHasConfig(false)
      setLoading(false)
      return
    }
    setHasConfig(true)

    try {
      const { data: res, error } = await supabase.functions.invoke('fetch-sql-data', {
        body: { usuario_id: user.id, forceRefresh },
      })

      if (error) throw error
      if (res.error) throw new Error(res.error)

      setData(res.data)

      if (forceRefresh) {
        toast({
          title: 'Dashboard atualizado',
          description: 'Dados sincronizados com o SQL Server.',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: err.message || 'Falha na comunicação com o servidor.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkConfigAndFetch()
  }, [user])

  if (hasConfig === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
        <div className="p-6 bg-slate-100 rounded-full">
          <Database className="size-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Conexão Pendente</h2>
        <p className="text-slate-500 max-w-md">
          Para visualizar este dashboard, você precisa configurar as credenciais do seu banco de
          dados SQL Server.
        </p>
        <Button asChild className="bg-gradient-to-r from-sl-orange to-sl-blue text-white mt-4">
          <a href="/app/credenciais">Configurar Credenciais</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Database className="size-8 text-sl-blue" />
            Dashboard SQL Server
          </h2>
          <p className="text-slate-500 mt-1">
            Análise de dados extraídos da tabela DWBI_PBIv2_Conhecimento.
            {data?.last_update && (
              <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                Última atualização:{' '}
                {format(new Date(data.last_update), "dd/MM 'às' HH:mm", { locale: ptBR })}
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={() => checkConfigAndFetch(true)}
          disabled={loading}
          className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm"
        >
          {loading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 size-4" />
          )}
          {loading ? 'Sincronizando...' : 'Atualizar Dados'}
        </Button>
      </div>

      {loading && !data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="h-[300px] flex items-center justify-center bg-slate-50/50">
              <Loader2 className="size-8 text-slate-300 animate-spin" />
            </Card>
          ))}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico 1: Documentos por Mês (Bar) */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-700">
                Volume de Documentos por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ volume: { label: 'Documentos', color: 'hsl(var(--primary))' } }}
                className="h-[250px] w-full"
              >
                <BarChart data={data.documentos_mes}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="mes"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748B' }}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="volume" fill="#0066CC" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráfico 2: Valores por Mês (Line) */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-700">
                Valores Financeiros por Mês (R$)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ valor: { label: 'Valor', color: 'hsl(var(--primary))' } }}
                className="h-[250px] w-full"
              >
                <LineChart data={data.valores_mes}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="mes"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748B' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748B' }}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value: number) => `R$ ${value.toLocaleString()}`}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#FF8C00"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#FF8C00' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráfico 3: Análise por Cliente (Pie) */}
          <Card className="shadow-sm border-slate-200 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-700">
                Distribuição por Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ valor: { label: 'Faturamento' } }}
                className="h-[280px] w-full pb-4"
              >
                <PieChart>
                  <Pie
                    data={data.por_cliente}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="valor"
                    nameKey="cliente"
                  >
                    {data.por_cliente.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value: number) => `R$ ${value.toLocaleString()}`}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:col-span-1">
            {/* Gráfico 4: Análise por Tipo (Horizontal Bar) */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-700">
                  Tipos de Documento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ volume: { label: 'Volume' } }}
                  className="h-[250px] w-full"
                >
                  <BarChart data={data.por_tipo_documento} layout="vertical" margin={{ left: -20 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="#E2E8F0"
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="tipo"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="volume" fill="#FF8C00" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Gráfico 5: Análise por Status (Donut) */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-700">
                  Status Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ volume: { label: 'Qtd' } }}
                  className="h-[250px] w-full pb-4"
                >
                  <PieChart>
                    <Pie
                      data={data.por_status}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="volume"
                      nameKey="status"
                    >
                      {data.por_status.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.status === 'Erro' || entry.status === 'Cancelado'
                              ? '#EF4444'
                              : entry.status === 'Pendente'
                                ? '#F59E0B'
                                : '#10B981'
                          }
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
