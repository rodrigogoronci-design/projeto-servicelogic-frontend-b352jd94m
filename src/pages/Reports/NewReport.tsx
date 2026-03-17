import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Save, RefreshCw } from 'lucide-react'

export default function NewReport() {
  const { toast } = useToast()

  const initialFormState = {
    nome: '',
    sistema: 'servicelogic',
    caminho: '',
    parametros: '{\n  "exportFormat": "csv",\n  "includeHeaders": true\n}',
    frequencia: '24',
    ativo: true,
  }

  const [formData, setFormData] = useState(initialFormState)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: 'Relatório salvo com sucesso!',
      description: `A automação para "${formData.nome}" foi configurada.`,
    })
    setFormData(initialFormState)
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
              Preencha os dados necessários para a integração do relatório.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome">
                  Nome do Relatório <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nome"
                  required
                  placeholder="Ex: Faturamento Mensal Consolidado"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="focus-visible:ring-sl-orange"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sistema">Sistema de Origem</Label>
                <Select
                  value={formData.sistema}
                  onValueChange={(val) => setFormData({ ...formData, sistema: val })}
                >
                  <SelectTrigger className="focus-visible:ring-sl-orange">
                    <SelectValue placeholder="Selecione o sistema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="servicelogic">Servicelogic</SelectItem>
                    <SelectItem value="legado_erp">Legado ERP</SelectItem>
                    <SelectItem value="api_externa">API Externa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caminho">
                Caminho do Relatório (Endpoint / Arquivo) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="caminho"
                required
                placeholder="/api/v1/export/faturamento ou C:\dados\relatorio.csv"
                value={formData.caminho}
                onChange={(e) => setFormData({ ...formData, caminho: e.target.value })}
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
                  value={formData.frequencia}
                  onChange={(e) => setFormData({ ...formData, frequencia: e.target.value })}
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
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
                <RefreshCw className="size-4" />
                Limpar
              </Button>
              <Button
                type="submit"
                className="gap-2 bg-gradient-corporate btn-scale text-white border-0 shadow-md"
              >
                <Save className="size-4" />
                Salvar Configuração
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
