import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ChartLivePreview } from './ChartLivePreview'
import { ChartFormData } from '@/types/chart'

interface ChartPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  config: ChartFormData | null
}

export function ChartPreviewModal({ isOpen, onClose, config }: ChartPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] h-auto max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl font-bold text-slate-800">
            {config?.nome_grafico || 'Prévia do Gráfico'}
          </DialogTitle>
          {config?.descricao && (
            <DialogDescription className="text-base">{config.descricao}</DialogDescription>
          )}
        </DialogHeader>

        <div className="mt-4 flex-1 min-h-[450px] overflow-hidden rounded-xl border p-2 bg-slate-50">
          {config && <ChartLivePreview formData={config} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
