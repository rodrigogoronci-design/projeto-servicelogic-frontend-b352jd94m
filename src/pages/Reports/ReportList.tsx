import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
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
import { Edit, Trash2, Plus, Search, DownloadCloud } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export default function ReportList() {
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')

  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const fetchReports = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('configuracao_relatorios' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setReports(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReports()
  }, [user])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta configuração?')) return

    const { error } = await supabase
      .from('configuracao_relatorios' as any)
      .delete()
      .eq('id', id)

    if (!error) {
      setReports(reports.filter((r) => r.id !== id))
      toast({ title: 'Removido com sucesso!' })
    } else {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  const handleImportNow = async (report: any) => {
    toast({
      title: 'Sincronização Iniciada',
      description: `Iniciando extração para: ${report.nome_relatorio}`,
    })

    try {
      const { data, error } = await supabase.functions.invoke('extract-reports', {
        body: { token: 'auth', reportPath: report.caminho_relatorio },
      })
      if (error) throw error

      const processRes = await supabase.functions.invoke('process-data', {
        body: { fileData: data.fileData, configuracaoId: report.id },
      })

      if (processRes.error) throw processRes.error

      await supabase.from('log_execucoes' as any).insert({
        user_id: user?.id,
        relatorio_id: report.id,
        status: 'sucesso',
      })

      await supabase.from('dados_importados' as any).insert({
        user_id: user?.id,
        relatorio_id: report.id,
        status: processRes.data.status,
        registros: processRes.data.processedRows,
        payload: processRes.data.payload,
      })

      toast({
        title: 'Sincronização Concluída',
        description: `${processRes.data.processedRows} registros processados.`,
      })
    } catch (e: any) {
      toast({
        title: 'Erro na Sincronização',
        description: e.message || 'Falha ao processar o relatório',
        variant: 'destructive',
      })
    }
  }

  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.nome_relatorio.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === 'todos' || (statusFilter === 'ativo' ? r.ativo : !r.ativo)
    return matchesSearch && matchesStatus
  })

  const paginatedReports = filteredReports.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuração de Relatórios</h2>
          <p className="text-slate-500 mt-1">Gerencie as regras de extração e automação.</p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-sl-orange to-sl-blue hover:opacity-90 text-white border-0 shadow-md gap-2"
        >
          <Link to="/app/relatorios/novo">
            <Plus className="size-4" />
            Novo Relatório
          </Link>
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome..."
              className="pl-9 bg-white border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white border-slate-200">
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Nome do Relatório</TableHead>
                <TableHead className="font-semibold text-slate-700">Parâmetros (Período)</TableHead>
                <TableHead className="font-semibold text-slate-700">Frequência</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : paginatedReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    Nenhum relatório encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReports.map((row) => (
                  <TableRow key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900">
                      {row.nome_relatorio}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {row.parametros?.dataInicial
                        ? `${row.parametros.dataInicial} até ${row.parametros.dataFinal}`
                        : 'Não definido'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {row.frequencia_horas}h
                    </TableCell>
                    <TableCell>
                      {row.ativo ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          Ativo
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-slate-100 text-slate-600 border-slate-200"
                        >
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-sl-blue hover:bg-blue-50"
                          onClick={() => handleImportNow(row)}
                          title="Importar Agora"
                        >
                          <DownloadCloud className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-600 hover:text-sl-orange hover:bg-orange-50"
                          onClick={() => navigate(`/app/relatorios/${row.id}/editar`)}
                          title="Editar"
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(row.id)}
                          title="Deletar"
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

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
            <span className="text-sm text-slate-500">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
