import { redirect, type LoaderFunctionArgs } from 'react-router-dom'
import { getAdminDashboardSummary } from '../../../entities/admin-session'
import { getChatRoomAccess } from '../../../entities/chat'
import { ApiRequestError } from '../../../shared/api'
import { mapDashboardSummary } from './model/mappers'

const chatRoomSlug = 'night-shift'

export const adminDashboardLoader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const [summary, roomAccess] = await Promise.all([
      getAdminDashboardSummary(request.signal),
      getChatRoomAccess(chatRoomSlug, request.signal).catch((error) => {
        if (error instanceof ApiRequestError && error.status === 404) {
          return null
        }

        throw error
      }),
    ])

    return mapDashboardSummary(summary, roomAccess)
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return redirect('/admin/login')
    }

    throw error
  }
}
