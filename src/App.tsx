import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import ProtectedRoute from '@/components/ProtectedRoute'
import MainLayout from '@/components/MainLayout'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import ReportList from './pages/Reports/ReportList'
import NewReport from './pages/Reports/NewReport'
import ImportedData from './pages/Data/ImportedData'
import DataDetails from './pages/Data/DataDetails'
import Credentials from './pages/Settings/Credentials'
import ExecutionLogs from './pages/Logs/ExecutionLogs'
import NotFound from './pages/NotFound'

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="relatorios" element={<ReportList />} />
            <Route path="relatorios/novo" element={<NewReport />} />
            <Route path="relatorios/:id/editar" element={<NewReport />} />
            <Route path="dados" element={<ImportedData />} />
            <Route path="dados/:id" element={<DataDetails />} />
            <Route path="credenciais" element={<Credentials />} />
            <Route path="logs" element={<ExecutionLogs />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
