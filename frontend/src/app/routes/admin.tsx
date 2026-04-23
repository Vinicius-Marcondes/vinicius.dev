import type { RouteObject } from 'react-router-dom'
import { AdminShell } from '../admin-shell'
import { AdminLoginPage } from '../../pages/admin/login'
import { AdminDashboardPage } from '../../pages/admin/dashboard'

export const adminRoutes: RouteObject = {
  path: '/admin',
  element: <AdminShell />,
  children: [
    { index: true, element: <AdminDashboardPage /> },
    { path: 'login', element: <AdminLoginPage /> },
    { path: 'dashboard', element: <AdminDashboardPage /> },
  ],
}
