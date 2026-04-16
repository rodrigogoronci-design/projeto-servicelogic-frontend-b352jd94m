import pb from '@/lib/pocketbase/client'
import { ChartFormData } from '@/types/chart'

export const getCharts = () =>
  pb
    .collection('charts')
    .getFullList<ChartFormData & { id: string; created: string }>({ sort: '-created' })
export const getChart = (id: string) =>
  pb.collection('charts').getOne<ChartFormData & { id: string }>(id)
export const createChart = (data: ChartFormData) => pb.collection('charts').create(data)
export const updateChart = (id: string, data: Partial<ChartFormData>) =>
  pb.collection('charts').update(id, data)
export const deleteChart = (id: string) => pb.collection('charts').delete(id)
