import pb from '@/lib/pocketbase/client'
import { DashboardData, DashboardItemData } from '@/types/chart'

export const getDashboards = () =>
  pb
    .collection('dashboards')
    .getFullList<DashboardData & { id: string; created: string }>({ sort: '-created' })
export const getDashboard = (id: string) =>
  pb.collection('dashboards').getOne<DashboardData & { id: string }>(id)
export const createDashboard = (data: Partial<DashboardData>) =>
  pb.collection('dashboards').create(data)
export const updateDashboard = (id: string, data: Partial<DashboardData>) =>
  pb.collection('dashboards').update(id, data)
export const deleteDashboard = (id: string) => pb.collection('dashboards').delete(id)

export const getDashboardItems = (dashboardId: string) =>
  pb.collection('dashboard_items').getFullList<DashboardItemData & { id: string }>({
    filter: `dashboard_id = "${dashboardId}"`,
    sort: 'sort_order',
    expand: 'chart_id',
  })

export const createDashboardItem = (data: DashboardItemData) =>
  pb.collection('dashboard_items').create(data)
export const updateDashboardItem = (id: string, data: Partial<DashboardItemData>) =>
  pb.collection('dashboard_items').update(id, data)
export const deleteDashboardItem = (id: string) => pb.collection('dashboard_items').delete(id)
