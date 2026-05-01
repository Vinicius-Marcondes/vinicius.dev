import { getJson } from '../../../../shared/api'
import type { AdminDashboardSummary } from '../../../../entities/admin-session'

export const getAdminDashboardSummary = (signal?: AbortSignal) =>
  getJson<AdminDashboardSummary>('/admin/dashboard/summary', { signal })
