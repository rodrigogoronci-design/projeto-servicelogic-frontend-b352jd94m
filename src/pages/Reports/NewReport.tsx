import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Save, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export default function NewReport() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialFormState = {
    nome_relatorio: '',
    caminho_relatorio: '',
    parametros: '{\n  "exportFormat": "csv",\n  "includeHeaders": true\n}',
    frequencia_horas: '24',
    ativo: true,
  }

  const [formData, setFormData] = useState(initialFormState)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      let parsedParams = {}
      try {
        parsedParams = JSON.parse(formData.parametros)
      } catch {
        toast({
          title: 'JSON Inválido',
          description: 'O formato dos parâmetros não é um JSON válido.',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }

      const { error } = await supabase.from('configuracao_relatorios' as any).insert({
        user_id: user.id,
        nome_relatorio: formData.nome_relatorio,
        sistema_origem: 'Servicelogic',
        caminho_relatorio: formData.caminho_relatorio,
        parametros: parsedParams,
        frequencia_horas: Number(formData.frequencia_horas),
        ativo: formData.ativo,
      })

      if (error) throw error

      toast({
        title: 'Relatório salvo com sucesso!',
        description: `A automação para "${formData.nome_relatorio}" foi configurada.`,
      })
      setFormData(initialFormState)
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Ocorreu um erro ao persistir as configurações.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData(initialFormState)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/app">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Novo Relatório</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Cadastro de Relatórios</h2>
        <p className="text-muted-foreground">
          Configure as regras de extração e automação de dados.
        </p>
      </div>

      <Card className="border-0 shadow-subtle bg-white">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Configuração Geral</CardTitle>
            <CardDescription>
              Preencha os dados necessários para a integração do relatório (Sistema Origem:
              Servicelogic).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                className="focus-visible:ring-sl-orange"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caminho">
                Caminho do Relatório (Endpoint / Arquivo) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="caminho"
                required
                placeholder="/api/v1/export/faturamento"
                value={formData.caminho_relatorio}
                onChange={(e) => setFormData({ ...formData, caminho_relatorio: e.target.value })}
                className="focus-visible:ring-sl-orange font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parametros">Parâmetros (JSON)</Label>
              <Textarea
                id="parametros"
                rows={5}
                className="font-mono text-sm bg-slate-50 focus-visible:ring-sl-orange"
                value={formData.parametros}
                onChange={(e) => setFormData({ ...formData, parametros: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
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
                  className="focus-visible:ring-sl-orange w-full md:w-1/2"
                />
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(val) => setFormData({ ...formData, ativo: val })}
                  className="data-[state=checked]:bg-sl-orange"
                />
                <div className="space-y-0.5">
                  <Label htmlFor="ativo" className="text-base cursor-pointer">
                    Status da Automação
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.ativo ? 'Relatório ativo e processando.' : 'Relatório pausado.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="gap-2"
                disabled={isSubmitting}
              >
                <RefreshCw className="size-4" />
                Limpar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 bg-gradient-corporate btn-scale text-white border-0 shadow-md"
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
