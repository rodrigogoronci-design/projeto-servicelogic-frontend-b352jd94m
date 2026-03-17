import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export default function Logs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return
      setLoading(true)
      const { data, error } = await supabase
        .from('log_execucoes' as any)
        .select(`
          id, data_execucao, status, mensagem_erro,
          configuracao_relatorios (nome_relatorio)
        `)
        .eq('usuario_id', user.id)
        .order('data_execucao', { ascending: false })

      if (!error && data) {
        setLogs(data)
      }
      setLoading(false)
    }

    fetchLogs()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="size-6 text-sl-blue" /> Logs de Execução
        </h2>
        <p className="text-muted-foreground">
          Acompanhe o histórico de processamento dos relatórios automatizados.
        </p>
      </div>

      <Card className="border-0 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold w-[100px]">ID</TableHead>
                <TableHead className="font-semibold">Data</TableHead>
                <TableHead className="font-semibold">Relatório</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Mensagem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Nenhum log encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-500 text-xs">
                      {log.id.split('-')[0]}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.data_execucao), 'dd/MM/yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.configuracao_relatorios?.nome_relatorio || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {log.status === 'sucesso' ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <CheckCircle2 className="size-3 mr-1" /> Sucesso
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <AlertCircle className="size-3 mr-1" /> Erro
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm text-slate-600">
                      {log.mensagem_erro || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
