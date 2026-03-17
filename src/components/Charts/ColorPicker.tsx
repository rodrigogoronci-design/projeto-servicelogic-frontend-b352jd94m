import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { PaintBucket } from 'lucide-react'

const PRESET_COLORS = [
  '#FF8C00',
  '#0066CC',
  '#10B981',
  '#EF4444',
  '#8B5CF6',
  '#F59E0B',
  '#64748B',
  '#06B6D4',
]

export function ColorPicker({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded border border-slate-200 shadow-sm transition-transform hover:scale-105"
          style={{ backgroundColor: color }}
          title="Escolher Cor"
        >
          <PaintBucket className="size-3 text-white drop-shadow-md mix-blend-difference" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3">
        <div className="text-sm font-medium text-slate-700 mb-2">Selecione uma cor</div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`w-10 h-10 rounded border transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-slate-400 ring-offset-2' : 'border-slate-200'}`}
              style={{ backgroundColor: c }}
              onClick={() => onChange(c)}
              title={c}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">HEX</span>
          <Input
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-xs font-mono uppercase"
            maxLength={7}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
