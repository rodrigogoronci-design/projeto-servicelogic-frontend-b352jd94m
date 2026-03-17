import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, FileText, Activity } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Visão Geral</h2>
        <p className="text-muted-foreground">
          Acompanhe o status das integrações e relatórios automatizados.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-sl-muted">Total de Relatórios</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="size-4 text-sl-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sl-text">12</div>
            <p className="text-xs text-muted-foreground mt-1">+2 configurados este mês</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-sl-muted">Dados Processados</CardTitle>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Database className="size-4 text-sl-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sl-text">1,429</div>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              Operando normalmente
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-sl-muted">Taxa de Sucesso</CardTitle>
            <div className="p-2 bg-slate-100 rounded-lg">
              <Activity className="size-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sl-text">98.5%</div>
            <p className="text-xs text-muted-foreground mt-1">Últimas 24 horas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
