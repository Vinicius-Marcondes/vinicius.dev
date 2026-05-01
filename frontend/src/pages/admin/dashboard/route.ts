import { redirect, type LoaderFunctionArgs } from 'react-router-dom'
import { getAdminDashboardSummary } from '../../../entities/admin-session'
import { ApiRequestError } from '../../../shared/api'
import { mapDashboardSummary } from './model/mappers'

export const adminDashboardLoader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const summary = await getAdminDashboardSummary(request.signal)
    return mapDashboardSummary(summary)
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return redirect('/admin/login')
    }

    throw error
  }
}
