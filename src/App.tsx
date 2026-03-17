import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import MainLayout from '@/components/MainLayout'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import NewReport from './pages/Reports/NewReport'
import ImportedData from './pages/Data/ImportedData'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />

        <Route path="/app" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="relatorios/novo" element={<NewReport />} />
          <Route path="dados" element={<ImportedData />} />
          <Route
            path="configuracoes"
            element={
              <div className="p-4 text-muted-foreground">
                Página de configurações em construção...
              </div>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
