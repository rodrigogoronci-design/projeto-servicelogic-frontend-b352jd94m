import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export default function NewReport() {
  const { id } = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    nome_relatorio: '',
    caminho_relatorio: '',
    data_inicial: '',
    data_final: '',
    frequencia_horas: '24',
    ativo: true,
  })

  useEffect(() => {
    if (id && user) {
      const fetchReport = async () => {
        const { data, error } = await supabase
          .from('configuracao_relatorios' as any)
          .select('*')
          .eq('id', id)
          .eq('usuario_id', user.id)
          .single()

        if (data && !error) {
          setFormData({
            nome_relatorio: data.nome_relatorio,
            caminho_relatorio: data.caminho_relatorio,
            data_inicial: data.data_inicial || '',
            data_final: data.data_final || '',
            frequencia_horas: String(data.frequencia_horas || 24),
            ativo: data.ativo ?? true,
          })
        }
      }
      fetchReport()
    }
  }, [id, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (
      !formData.nome_relatorio ||
      !formData.caminho_relatorio ||
      !formData.data_inicial ||
      !formData.data_final
    ) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        usuario_id: user.id,
        nome_relatorio: formData.nome_relatorio,
        sistema_origem: 'Servicelogic',
        caminho_relatorio: formData.caminho_relatorio,
        data_inicial: formData.data_inicial,
        data_final: formData.data_final,
        frequencia_horas: Number(formData.frequencia_horas),
        ativo: formData.ativo,
        atualizado_em: new Date().toISOString(),
      }

      let error
      if (id) {
        const res = await supabase
          .from('configuracao_relatorios' as any)
          .update(payload)
          .eq('id', id)
        error = res.error
      } else {
        const res = await supabase.from('configuracao_relatorios' as any).insert(payload)
        error = res.error
      }

      if (error) throw error

      toast({
        title: id ? 'Relatório atualizado!' : 'Relatório salvo com sucesso!',
      })
      navigate('/app/relatorios')
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/app/relatorios')}
          className="rounded-full"
        >
          <ArrowLeft className="size-5 text-slate-500" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {id ? 'Editar Relatório' : 'Novo Relatório'}
          </h2>
          <p className="text-slate-500">Configure as regras de extração do sistema legado.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <form onSubmit={handleSubmit}>
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle>Configuração Geral</CardTitle>
            <CardDescription>Dados necessários para a integração da API externa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome do Relatório <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome"
                required
                placeholder="Ex: Faturamento Mensal Consolidado"
                value={formData.nome_relatorio}
                onChange={(e) => setFormData({ ...formData, nome_relatorio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caminho">
                Caminho do Relatório (Endpoint) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="caminho"
                required
                placeholder="/api/v1/export/faturamento"
                value={formData.caminho_relatorio}
                onChange={(e) => setFormData({ ...formData, caminho_relatorio: e.target.value })}
                className="font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="data_inicial">
                  Data Inicial <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="data_inicial"
                  type="date"
                  required
                  value={formData.data_inicial}
                  onChange={(e) => setFormData({ ...formData, data_inicial: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_final">
                  Data Final <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="data_final"
                  type="date"
                  required
                  value={formData.data_final}
                  onChange={(e) => setFormData({ ...formData, data_final: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-t border-slate-100 pt-6">
              <div className="space-y-2">
                <Label htmlFor="frequencia">Frequência de Execução (Horas)</Label>
                <Input
                  id="frequencia"
                  type="number"
                  min="1"
                  max="720"
                  required
                  value={formData.frequencia_horas}
                  onChange={(e) => setFormData({ ...formData, frequencia_horas: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 md:mt-0">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(val) => setFormData({ ...formData, ativo: val })}
                  className="data-[state=checked]:bg-sl-orange"
                />
                <div className="space-y-0.5">
                  <Label
                    htmlFor="ativo"
                    className="text-base cursor-pointer font-medium text-slate-800"
                  >
                    Status da Automação
                  </Label>
                  <p className="text-xs text-slate-500">
                    {formData.ativo ? 'Automação ativada e operante' : 'Automação pausada'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 bg-gradient-to-r from-sl-orange to-sl-blue text-white btn-scale shadow-md h-11 px-6"
              >
                <Save className="size-4" />
                {isSubmitting ? 'Salvando...' : 'Salvar Configuração'}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
