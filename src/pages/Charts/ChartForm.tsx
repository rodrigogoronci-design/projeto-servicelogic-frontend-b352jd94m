import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { useChartForm } from '@/hooks/use-chart-form'
import { ChartTypeSelector } from '@/components/Charts/ChartTypeSelector'
import { ChartFieldsSetup } from '@/components/Charts/ChartFieldsSetup'
import { ChartLivePreview } from '@/components/Charts/ChartLivePreview'

export default function ChartForm() {
  const { id } = useParams()

  const {
    formData,
    setFormData,
    tables,
    columns,
    loading,
    initialLoading,
    loadingSchema,
    userEditedDesc,
    setUserEditedDesc,
    generatedDescription,
    handleSubmit,
  } = useChartForm(id)

  if (initialLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="size-8 animate-spin text-slate-400 mb-4" />
        <p className="text-slate-500">Carregando configuração...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up pb-12">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-slate-500 hover:text-slate-900 border shadow-sm bg-white"
        >
          <Link to="/app/graficos">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">
            {id ? 'Editar Gráfico' : 'Novo Gráfico'}
          </h2>
          <p className="text-slate-500 mt-1">
            Configure os dados, formato visual e campos de exibição.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-t-4 border-t-sl-orange shadow-md">
            <CardHeader className="pb-4">
              <CardTitle>Detalhes da Origem</CardTitle>
              <CardDescription>Defina os dados base e o tipo de visualização.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome_grafico">
                    Nome do Gráfico <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nome_grafico"
                    required
                    placeholder="Ex: Faturamento Mensal"
                    value={formData.nome_grafico}
                    onChange={(e) => setFormData({ ...formData, nome_grafico: e.target.value })}
                    className="bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome_tabela">
                    Tabela Origem <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.nome_tabela}
                    onValueChange={(val) =>
                      setFormData({ ...formData, nome_tabela: val, campos_selecionados: [] })
                    }
                  >
                    <SelectTrigger className="bg-slate-50 focus:bg-white transition-colors">
                      <SelectValue placeholder="Selecione uma tabela" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                      {tables.length === 0 && (
                        <div className="p-2 text-sm text-slate-500 text-center">
                          Buscando tabelas...
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>
                  Tipo de Gráfico <span className="text-red-500">*</span>
                </Label>
                <ChartTypeSelector
                  value={formData.tipo_grafico}
                  onChange={(v) => setFormData({ ...formData, tipo_grafico: v })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="descricao">Descrição</Label>
                  {userEditedDesc && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-sl-blue"
                      onClick={() => {
                        setUserEditedDesc(false)
                        setFormData((prev) => ({ ...prev, descricao: generatedDescription }))
                      }}
                    >
                      Restaurar Auto-gerada
                    </Button>
                  )}
                </div>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o propósito deste gráfico..."
                  value={formData.descricao}
                  onChange={(e) => {
                    setFormData({ ...formData, descricao: e.target.value })
                    setUserEditedDesc(true)
                  }}
                  className="bg-slate-50 focus:bg-white transition-colors resize-none"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg">Configuração de Campos</Label>
                {loadingSchema && <Loader2 className="size-4 animate-spin text-slate-400" />}
              </div>
              <ChartFieldsSetup columns={columns} formData={formData} setFormData={setFormData} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-6">
            <Card className="shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  Prévia do Gráfico
                  {formData.campos_selecionados.length > 0 && (
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartLivePreview formData={formData} />
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                asChild
                className="bg-white hover:bg-slate-50 w-full sm:w-auto"
              >
                <Link to="/app/graficos">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-sl-blue hover:bg-sl-blueLight text-white px-8 w-full sm:w-auto shadow-md"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : (
                  <Save className="size-4 mr-2" />
                )}
                Salvar Gráfico
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
