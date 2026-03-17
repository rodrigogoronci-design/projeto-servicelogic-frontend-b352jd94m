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
import { LayoutDashboard, FileText, Database, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Relatórios', href: '/app/relatorios/novo', icon: FileText },
  { name: 'Dados Importados', href: '/app/dados', icon: Database },
  { name: 'Configurações', href: '/app/configuracoes', icon: Settings },
]

function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="flex items-center justify-center py-6">
        <div className="flex items-center gap-2 px-2">
          <div className="size-8 rounded-lg bg-gradient-corporate flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-sl-text">Servicelogic</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 pt-4">
        <SidebarMenu>
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (location.pathname.startsWith(item.href) && item.href !== '/app')
            return (
              <SidebarMenuItem key={item.name} className="mb-1">
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-sl-blue border-l-4 border-l-sl-orange shadow-sm'
                        : 'text-sl-muted hover:bg-slate-100 hover:text-sl-text border-l-4 border-l-transparent',
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
    navigation.find((n) => location.pathname.includes(n.href) && n.href !== '/app') || navigation[0]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 px-4 sm:px-6 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger onClick={toggleSidebar} className="md:hidden text-sl-muted" />
        <h1 className="text-lg font-semibold text-sl-text hidden sm:block">{currentNav.name}</h1>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Avatar className="size-9 border border-slate-200">
                <AvatarImage
                  src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=4"
                  alt="Admin"
                />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <span className="font-medium text-sm">Administrador</span>
              <span className="text-xs text-sl-muted">admin@servicelogic.com</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-red-600 cursor-pointer p-3 mt-1 border-t">
              <Link to="/" className="w-full flex items-center">
                <LogOut className="mr-2 size-4" />
                <span>Sair</span>
              </Link>
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
      <div className="flex min-h-screen w-full bg-sl-bg">
        <AppSidebar />
        <div className="flex w-full flex-col overflow-hidden">
          <TopHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
