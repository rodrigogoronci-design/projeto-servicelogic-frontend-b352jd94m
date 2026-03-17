import { useState, useEffect } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

export default function ImportedData() {
  const { toast } = useToast()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('todos')
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const { data: records, error } = await supabase
      .from('dados_importados' as any)
      .select('*')
      .order('data_importacao', { ascending: false })

    if (!error && records) {
      setData(records)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleImportNow = () => {
    toast({
      title: 'Processo Iniciado',
      description: 'A importação manual foi colocada na fila de execução.',
    })
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('dados_importados' as any)
      .delete()
      .eq('id', id)
    if (!error) {
      setData(data.filter((item) => item.id !== id))
      toast({
        title: 'Registro removido',
        description: `O registro foi excluído com sucesso.`,
      })
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o registro',
        variant: 'destructive',
      })
    }
  }

  const openDetails = (record: any) => {
    setSelectedRecord(record)
    setIsDialogOpen(true)
  }

  const filteredData = data.filter((item) => {
    const matchesStatus = filterStatus === 'todos' || item.status === filterStatus
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dados Importados</h2>
          <p className="text-muted-foreground">
            Monitoramento e histórico de integrações executadas.
          </p>
        </div>
        <Button
          onClick={handleImportNow}
          className="bg-gradient-corporate text-white border-0 shadow-md gap-2 btn-scale"
        >
          <DownloadCloud className="size-4" />
          Importar Agora
        </Button>
      </div>

      <Card className="border-0 shadow-subtle overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID ou Origem..."
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
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
                <TableHead className="font-semibold w-[120px]">ID Importação</TableHead>
                <TableHead className="font-semibold">Data de Execução</TableHead>
                <TableHead className="font-semibold">Sistema Origem</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Nenhum registro encontrado para os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow key={row.id} className="hover:bg-blue-50/50 transition-colors group">
                    <TableCell className="font-medium text-sl-blue">
                      {row.id.split('-')[0]}
                    </TableCell>
                    <TableCell>
                      {format(new Date(row.data_importacao), "dd 'de' MMM, yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>{row.source}</TableCell>
                    <TableCell>
                      {row.status === 'processado' ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 gap-1.5 px-2.5 py-0.5"
                        >
                          <CheckCircle2 className="size-3.5" /> Processado
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 gap-1.5 px-2.5 py-0.5"
                        >
                          <AlertCircle className="size-3.5" /> Erro
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-sl-blue hover:bg-blue-100"
                          onClick={() => openDetails(row)}
                        >
                          <Eye className="size-4" />
                          <span className="sr-only">Visualizar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(row.id)}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Deletar</span>
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

      {/* Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Importação</DialogTitle>
            <DialogDescription>
              Informações completas sobre o lote de dados {selectedRecord?.id?.split('-')[0]}.
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Data/Hora</p>
                  <p className="font-medium">
                    {format(new Date(selectedRecord.data_importacao), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Origem</p>
                  <p className="font-medium">{selectedRecord.source}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                  <Badge
                    variant="outline"
                    className={
                      selectedRecord.status === 'processado'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }
                  >
                    {selectedRecord.status === 'processado'
                      ? 'Processado com Sucesso'
                      : 'Falha na Execução'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Registros Lidos</p>
                  <p className="font-medium">{Number(selectedRecord.registros).toLocaleString()}</p>
                </div>
              </div>

              {selectedRecord.error_details && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
                  <p className="text-sm font-semibold text-red-800 flex items-center gap-2 mb-1">
                    <AlertCircle className="size-4" /> Detalhes do Erro
                  </p>
                  <p className="text-sm text-red-600 font-mono bg-red-100/50 p-2 rounded break-words">
                    {selectedRecord.error_details}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
