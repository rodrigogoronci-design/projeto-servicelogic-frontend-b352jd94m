import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Settings, Activity, BarChart3, PieChart, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard SQL', href: '/app', icon: BarChart3, exact: true },
  { name: 'Meus Dashboards', href: '/app/dashboards', icon: LayoutDashboard, exact: false },
  { name: 'Meus Gráficos', href: '/app/graficos', icon: PieChart, exact: false },
  { name: 'Logs & Monitoramento', href: '/app/logs', icon: Activity, exact: false },
  { name: 'Configurações', href: '/app/credenciais', icon: Settings, exact: false },
]

function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="flex items-center justify-center py-6 border-b border-slate-100">
        <div className="flex items-center gap-3 px-2">
          <div className="size-10 rounded-xl bg-gradient-to-br from-sl-orange to-sl-blue flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">Servicelogic</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 pt-6">
        <SidebarMenu>
          {navigation.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href)
            return (
              <SidebarMenuItem key={item.name} className="mb-2">
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-blue-50 text-sl-blue shadow-sm ring-1 ring-blue-100'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    <item.icon className={cn('size-5', isActive ? 'text-sl-orange' : '')} />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

function TopHeader() {
  const { toggleSidebar } = useSidebar()
  const location = useLocation()

  const currentNav =
    navigation.find((n) =>
      n.exact ? location.pathname === n.href : location.pathname.startsWith(n.href),
    ) || navigation[0]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 px-4 sm:px-6 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger onClick={toggleSidebar} className="md:hidden text-slate-500" />
        <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">
          {currentNav?.name || 'Servicelogic'}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-orange focus-visible:ring-offset-2 hover:bg-slate-50 p-1 pl-3 border border-transparent hover:border-slate-200">
              <span className="text-sm font-medium text-slate-700 hidden sm:block">
                Administrador
              </span>
              <Avatar className="size-9 border border-slate-200 shadow-sm">
                <AvatarImage
                  src={`https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1`}
                  alt="Avatar"
                />
                <AvatarFallback className="bg-sl-blue text-white">A</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-default hover:bg-transparent">
              <span className="font-medium text-sm text-slate-900">Administrador</span>
              <span className="text-xs text-slate-500 max-w-[180px] truncate">
                admin@servicelogic.com
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default function MainLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        <AppSidebar />
        <div className="flex w-full flex-col overflow-hidden">
          <TopHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1400px] animate-fade-in-up">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
