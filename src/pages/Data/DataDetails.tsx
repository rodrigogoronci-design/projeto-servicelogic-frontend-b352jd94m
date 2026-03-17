import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Download, Trash2, Database, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'

export default function DataDetails() {
  const { id } = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [record, setRecord] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id && user) {
      const fetchDetails = async () => {
        const { data, error } = await supabase
          .from('dados_importados' as any)
          .select('*, configuracao_relatorios(nome_relatorio)')
          .eq('id', id)
          .eq('usuario_id', user.id)
          .single()

        if (data && !error) setRecord(data)
        setLoading(false)
      }
      fetchDetails()
    }
  }, [id, user])

  const handleDelete = async () => {
    if (!confirm('Excluir este lote de dados importados?')) return
    const { error } = await supabase
      .from('dados_importados' as any)
      .delete()
      .eq('id', id)
    if (!error) {
      toast({ title: 'Dados excluídos' })
      navigate('/app/dados')
    }
  }

  const exportAsExcel = () => {
    toast({
      title: 'Exportação iniciada',
      description: 'O download do arquivo Excel começará em breve.',
    })
    setTimeout(() => {
      const el = document.createElement('a')
      el.href = 'data:text/plain;charset=utf-8,Mock%20Excel%20Data'
      el.download = `Export_${record?.configuracao_relatorios?.nome_relatorio || 'Data'}.xlsx`
      el.click()
    }, 1000)
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">Carregando detalhes...</div>
    )
  }

  if (!record) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="size-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-slate-700">Registro não encontrado</h3>
        <Button variant="link" onClick={() => navigate('/app/dados')} className="mt-2">
          Voltar para a lista
        </Button>
      </div>
    )
  }

  const payloadData = record.dados || {}
  const payloadKeys = Object.keys(payloadData)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/dados')}
            className="rounded-full"
          >
            <ArrowLeft className="size-5 text-slate-500" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
              <Database className="size-6 text-sl-blue" />
              Inspeção de Dados
            </h2>
            <p className="text-slate-500">Visualização estruturada da importação.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportAsExcel}
            className="gap-2 bg-white hover:bg-emerald-50 hover:text-emerald-700 border-slate-200"
          >
            <Download className="size-4" /> Exportar como Excel
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="gap-2">
            <Trash2 className="size-4" /> Deletar Dados
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Relatório</p>
            <p className="font-semibold text-slate-800 truncate">
              {record.configuracao_relatorios?.nome_relatorio || '-'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Data Execução</p>
            <p className="font-semibold text-slate-800">
              {format(new Date(record.data_importacao), 'dd/MM/yyyy HH:mm')}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
            <Badge
              variant="outline"
              className={
                record.status === 'processado'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }
            >
              {record.status === 'processado' ? 'Sucesso' : 'Falha'}
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Linhas Processadas</p>
            <p className="font-semibold text-slate-800">
              {Number(record.registros || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg">Conteúdo Extraído (Payload JSON)</CardTitle>
          <CardDescription>Estrutura bruta recuperada da API externa.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto max-h-[600px]">
          {payloadKeys.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nenhum dado contido no payload.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100/50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-700 border-b w-[200px]">
                    Propriedade
                  </th>
                  <th className="px-6 py-3 font-semibold text-slate-700 border-b">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payloadKeys.map((key) => (
                  <tr key={key} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900 bg-slate-50/30 align-top">
                      {key}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 break-all whitespace-pre-wrap">
                      {typeof payloadData[key] === 'object'
                        ? JSON.stringify(payloadData[key], null, 2)
                        : String(payloadData[key])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
