import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw, Play, Search, Database, Globe } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'

export default function ExecutionLogs() {
  const { user } = useAuth()
  const [logsServicelogic, setLogsServicelogic] = useState<any[]>([])
  const [logsSql, setLogsSql] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')

  const fetchLogs = async () => {
    if (!user) return
    setLoading(true)

    const [resSl, resSql] = await Promise.all([
      supabase
        .from('log_execucoes' as any)
        .select('id, data_execucao, status, mensagem_erro, configuracao_relatorios(nome_relatorio)')
        .eq('usuario_id', user.id)
        .order('data_execucao', { ascending: false })
        .limit(100),
      supabase
        .from('log_execucoes_sql' as any)
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100),
    ])

    if (resSl.error)
      toast({
        title: 'Erro ao buscar logs SL',
        description: resSl.error.message,
        variant: 'destructive',
      })
    else setLogsServicelogic(resSl.data || [])

    if (resSql.error)
      toast({
        title: 'Erro ao buscar logs SQL',
        description: resSql.error.message,
        variant: 'destructive',
      })
    else setLogsSql(resSql.data || [])

    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [user])

  const triggerSchedule = async () => {
    toast({ title: 'Iniciando agendador...' })
    const { error } = await supabase.functions.invoke('schedule-imports')
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Agendador executado', description: 'Verifique a lista para atualizações.' })
      setTimeout(fetchLogs, 2500)
    }
  }

  const applyFilters = (logs: any[], dateField: string) => {
    return logs.filter((log) => {
      const matchDate = filterDate ? log[dateField].startsWith(filterDate) : true
      const matchStatus =
        filterStatus === 'todos' || log.status.toLowerCase().includes(filterStatus.toLowerCase())
      return matchDate && matchStatus
    })
  }

  const filteredSl = applyFilters(logsServicelogic, 'data_execucao')
  const filteredSql = applyFilters(logsSql, 'created_at')

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Monitoramento & Logs</h2>
          <p className="text-slate-500 mt-1">
            Histórico completo de extrações e integrações da plataforma.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs} disabled={loading} className="bg-white">
            <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
          <Button onClick={triggerSchedule} className="bg-sl-blue hover:bg-blue-800 text-white">
            <Play className="mr-2 size-4" /> Forçar Web Scraper
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex-1 flex gap-4 flex-col sm:flex-row">
          <div className="flex-1 max-w-xs">
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-white"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="sucesso">Sucesso</SelectItem>
              <SelectItem value="erro">Erro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="sql" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-200/50 p-1">
          <TabsTrigger
            value="sql"
            className="data-[state=active]:bg-white data-[state=active]:text-sl-blue gap-2"
          >
            <Database className="size-4" /> SQL Server
          </TabsTrigger>
          <TabsTrigger
            value="servicelogic"
            className="data-[state=active]:bg-white data-[state=active]:text-sl-orange gap-2"
          >
            <Globe className="size-4" /> Web Scraper
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sql" className="mt-4">
          <Card className="border-slate-200 shadow-sm border-t-4 border-t-sl-blue">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg">Operações SQL Server</CardTitle>
              <CardDescription>Testes de conexão e atualizações de dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Tipo de Operação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mensagem de Erro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSql.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                        Nenhum log encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredSql.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/50">
                      <TableCell className="whitespace-nowrap font-medium text-slate-600">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell className="font-medium">{log.operation_type}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.status.includes('Sucesso')
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-slate-500 max-w-xs truncate"
                        title={log.error_message || ''}
                      >
                        {log.error_message || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servicelogic" className="mt-4">
          <Card className="border-slate-200 shadow-sm border-t-4 border-t-sl-orange">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg">Execuções Servicelogic (Scraper)</CardTitle>
              <CardDescription>Histórico de extração de relatórios agendados.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Relatório Origem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mensagem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSl.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                        Nenhum log encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredSl.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/50">
                      <TableCell className="whitespace-nowrap font-medium text-slate-600">
                        {format(new Date(log.data_execucao), 'dd/MM/yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell className="font-medium text-slate-800">
                        {log.configuracao_relatorios?.nome_relatorio || 'Desconhecido'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.status === 'Concluído' || log.status === 'sucesso'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : log.status === 'Erro'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-slate-500 max-w-xs truncate"
                        title={log.mensagem_erro || ''}
                      >
                        {log.mensagem_erro || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
