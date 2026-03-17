import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import ProtectedRoute from '@/components/ProtectedRoute'
import MainLayout from '@/components/MainLayout'
import Index from './pages/Index'
import DashboardSQL from './pages/DashboardSQL'
import Credentials from './pages/Settings/Credentials'
import ExecutionLogs from './pages/Logs/ExecutionLogs'
import ChartList from './pages/Charts/ChartList'
import ChartForm from './pages/Charts/ChartForm'
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
            <Route index element={<DashboardSQL />} />
            <Route path="graficos" element={<ChartList />} />
            <Route path="graficos/novo" element={<ChartForm />} />
            <Route path="graficos/:id" element={<ChartForm />} />
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
