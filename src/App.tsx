import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import MainLayout from '@/components/MainLayout'
import DashboardSQL from './pages/DashboardSQL'
import Credentials from './pages/Settings/Credentials'
import ExecutionLogs from './pages/Logs/ExecutionLogs'
import ChartList from './pages/Charts/ChartList'
import ChartForm from './pages/Charts/ChartForm'
import DashboardList from './pages/Dashboards/DashboardList'
import DashboardForm from './pages/Dashboards/DashboardForm'
import DashboardViewer from './pages/Dashboards/DashboardViewer'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />

        <Route path="/app" element={<MainLayout />}>
          <Route index element={<DashboardSQL />} />

          <Route path="dashboards" element={<DashboardList />} />
          <Route path="dashboards/novo" element={<DashboardForm />} />
          <Route path="dashboards/:id/editar" element={<DashboardForm />} />
          <Route path="dashboards/:id" element={<DashboardViewer />} />

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
)

export default App
