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
import { ChartGlobalFilters } from '@/components/Charts/ChartGlobalFilters'
import { mapToOldFormat } from '@/types/chart'

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
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in-up pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-slate-500 hover:text-slate-900 border shadow-sm bg-white"
        >
          <Link to="/graficos">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">
            {id ? 'Editar Gráfico' : 'Novo Gráfico'}
          </h2>
          <p className="text-slate-500 mt-1">
            Configure os dados, formato visual e campos de exibição em uma interface aprimorada.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="border-t-4 border-t-sl-orange shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Detalhes da Origem</CardTitle>
            <CardDescription>Defina os dados base e o tipo de visualização.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome do Gráfico <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  required
                  placeholder="Ex: Faturamento Mensal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-50 focus:bg-white transition-colors focus-visible:ring-sl-blue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="table_name">
                  Tabela Origem <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.table_name}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      table_name: val,
                      fields_config: { mappings: [], filters: [] },
                    })
                  }
                >
                  <SelectTrigger className="bg-slate-50 focus:bg-white transition-colors focus:ring-sl-blue">
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

            <div className="space-y-3 pt-2">
              <Label>
                Tipo de Gráfico <span className="text-red-500">*</span>
              </Label>
              <ChartTypeSelector
                value={formData.type}
                onChange={(v) => setFormData({ ...formData, type: v })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Descrição</Label>
                {userEditedDesc && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-sl-blue"
                    onClick={() => {
                      setUserEditedDesc(false)
                      setFormData((prev) => ({ ...prev, description: generatedDescription }))
                    }}
                  >
                    Restaurar Auto-gerada
                  </Button>
                )}
              </div>
              <Textarea
                id="description"
                placeholder="Descreva o propósito deste gráfico..."
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value })
                  setUserEditedDesc(true)
                }}
                className="bg-slate-50 focus:bg-white transition-colors resize-none focus-visible:ring-sl-blue"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <Label className="text-lg font-semibold text-slate-800">Campos do Gráfico</Label>
              {loadingSchema && <Loader2 className="size-5 animate-spin text-slate-400" />}
            </div>
            <ChartFieldsSetup columns={columns} formData={formData} setFormData={setFormData} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <Label className="text-lg font-semibold text-slate-800">Filtros Globais</Label>
            </div>
            <ChartGlobalFilters columns={columns} formData={formData} setFormData={setFormData} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="flex items-center justify-between text-lg">
              Prévia do Gráfico
              {formData.fields_config.mappings.length > 0 && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartLivePreview formData={mapToOldFormat(formData)} />

            <div className="mt-8 flex justify-end gap-4 border-t border-slate-100 pt-6">
              <Button
                type="button"
                variant="outline"
                asChild
                className="bg-white hover:bg-slate-50 w-full sm:w-auto"
              >
                <Link to="/graficos">Cancelar</Link>
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
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
