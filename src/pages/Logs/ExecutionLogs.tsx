import { useEffect, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function ExecutionLogs() {
  const { user } = useAuth()
  const [logsSql, setLogsSql] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { toast } = useToast()

  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')

  const fetchLogs = async () => {
    if (!user) return
    setLoading(true)
    setErrorMsg(null)

    try {
      const records = await pb.collection('execution_logs').getList(1, 100, {
        filter: `user_id = "${user.id}"`,
        sort: '-created',
      })
      setLogsSql(records.items || [])
    } catch (error: any) {
      const msg = getErrorMessage(error)
      setErrorMsg(msg)
      toast({
        title: 'Erro ao buscar logs',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [user])

  const applyFilters = (logs: any[], dateField: string) => {
    return logs.filter((log) => {
      const matchDate = filterDate && log[dateField] ? log[dateField].startsWith(filterDate) : true
      const matchStatus =
        filterStatus === 'todos' ||
        (log.status && log.status.toLowerCase().includes(filterStatus.toLowerCase()))
      return matchDate && matchStatus
    })
  }

  const filteredSql = applyFilters(logsSql, 'created')

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Monitoramento & Logs</h2>
          <p className="text-slate-500 mt-1">
            Histórico completo de integrações e atualizações do banco de dados.
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading} className="bg-white">
          <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
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

      {errorMsg && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <Card className="border-slate-200 shadow-sm border-t-4 border-t-sl-blue mt-4">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-lg">Operações SQL Server</CardTitle>
          <CardDescription>Testes de conexão e execuções de queries do sistema.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Query SQL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mensagem de Erro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && logsSql.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredSql.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    Nenhum log encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSql.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50">
                    <TableCell className="whitespace-nowrap font-medium text-slate-600">
                      {log.created ? format(new Date(log.created), 'dd/MM/yyyy HH:mm:ss') : '-'}
                    </TableCell>
                    <TableCell
                      className="font-medium max-w-[250px] truncate"
                      title={log.sql_query || ''}
                    >
                      {log.sql_query || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          log.status && log.status.toLowerCase().includes('sucesso')
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }
                      >
                        {log.status || 'Desconhecido'}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-slate-500 max-w-xs truncate"
                      title={log.error_message || ''}
                    >
                      {log.error_message || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
