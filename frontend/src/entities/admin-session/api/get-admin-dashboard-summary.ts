import { getJson } from '../../../shared/api'
import type { AdminDashboardSummary } from '../model/types'

export const getAdminDashboardSummary = (signal?: AbortSignal) =>
  getJson<AdminDashboardSummary>('/admin/dashboard/summary', { signal })
