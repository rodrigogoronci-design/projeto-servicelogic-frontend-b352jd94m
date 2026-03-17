import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Trash2, DownloadCloud, Search, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export default function ImportedData() {
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterDate, setFilterDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    const { data: records, error } = await supabase
      .from('dados_importados' as any)
      .select(`
        *,
        configuracao_relatorios (nome_relatorio)
      `)
      .eq('user_id', user.id)
      .order('data_importacao', { ascending: false })

    if (!error && records) {
      setData(records)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este registro de importação?')) return
    const { error } = await supabase
      .from('dados_importados' as any)
      .delete()
      .eq('id', id)

    if (!error) {
      setData(data.filter((item) => item.id !== id))
      toast({ title: 'Registro removido com sucesso.' })
    } else {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  const filteredData = data.filter((item) => {
    const reportName = item.configuracao_relatorios?.nome_relatorio || ''
    const matchesStatus = filterStatus === 'todos' || item.status === filterStatus
    const matchesSearch =
      reportName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDate = !filterDate || item.data_importacao.startsWith(filterDate)
    return matchesStatus && matchesSearch && matchesDate
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rastreio de Importações</h2>
          <p className="text-slate-500">Monitoramento e histórico de integrações executadas.</p>
        </div>
        <Button
          onClick={() => navigate('/app/relatorios')}
          className="bg-white text-sl-blue border border-blue-200 shadow-sm hover:bg-blue-50 gap-2"
        >
          <DownloadCloud className="size-4" />
          Nova Importação
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Buscar por Relatório ou ID..."
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="date"
              className="w-full sm:w-auto bg-white"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[160px] bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="processado">Processados</SelectItem>
                <SelectItem value="erro">Com Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Nome do Relatório</TableHead>
                <TableHead className="font-semibold">Data de Importação</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                    <TableCell className="font-medium text-slate-400 text-xs">
                      {row.id.split('-')[0]}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {row.configuracao_relatorios?.nome_relatorio || 'Desconhecido'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {format(new Date(row.data_importacao), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {row.status === 'processado' ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          <CheckCircle2 className="size-3 mr-1" /> Sucesso
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <AlertCircle className="size-3 mr-1" /> Erro
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-sl-blue hover:bg-blue-50"
                          onClick={() => navigate(`/app/dados/${row.id}`)}
                          title="Visualizar Dados"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(row.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
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
