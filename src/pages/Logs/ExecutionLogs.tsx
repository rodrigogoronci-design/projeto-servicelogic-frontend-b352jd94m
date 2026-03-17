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
import { RefreshCw, Play } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

export default function ExecutionLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchLogs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('log_execucoes')
      .select(`
        id, 
        data_execucao, 
        status, 
        mensagem_erro, 
        configuracao_relatorios (nome_relatorio)
      `)
      .order('data_execucao', { ascending: false })
      .limit(50)

    if (error) {
      toast({ title: 'Erro ao buscar logs', description: error.message, variant: 'destructive' })
    } else {
      setLogs(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const triggerSchedule = async () => {
    toast({ title: 'Iniciando agendador...' })
    const { error } = await supabase.functions.invoke('schedule-imports')
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Agendador executado', description: 'Verifique a lista para atualizações.' })
      setTimeout(fetchLogs, 2500) // delay to allow edge function logs to appear
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Logs de Execução</h2>
          <p className="text-muted-foreground">
            Acompanhe o status das extrações automáticas do Servicelogic.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={triggerSchedule}>
            <Play className="mr-2 h-4 w-4" />
            Forçar Agendador
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Execuções</CardTitle>
          <CardDescription>Lista das últimas 50 execuções de relatórios.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Relatório</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mensagem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nenhum log encontrado.
                  </TableCell>
                </TableRow>
              )}
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.data_execucao), 'dd/MM/yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    {/* @ts-expect-error */}
                    {log.configuracao_relatorios?.nome_relatorio || 'Desconhecido'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.status === 'Concluído'
                          ? 'default'
                          : log.status === 'Erro'
                            ? 'destructive'
                            : 'secondary'
                      }
                      className={
                        log.status === 'Concluído' ? 'bg-green-500 hover:bg-green-600' : ''
                      }
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate" title={log.mensagem_erro || ''}>
                    {log.mensagem_erro || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
