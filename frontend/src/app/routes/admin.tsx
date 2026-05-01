import type { RouteObject } from 'react-router-dom'
import { AdminShell } from '../admin-shell'
import {
  AdminLoginPage,
  adminLoginAction,
  adminLoginLoader,
} from '../../pages/admin/login'
import { AdminDashboardPage, adminDashboardLoader } from '../../pages/admin/dashboard'

export const adminRoutes: RouteObject = {
  path: '/admin',
  element: <AdminShell />,
  children: [
    {
      index: true,
      loader: adminDashboardLoader,
      element: <AdminDashboardPage />,
    },
    {
      path: 'login',
      loader: adminLoginLoader,
      action: adminLoginAction,
      element: <AdminLoginPage />,
    },
    {
      path: 'dashboard',
      loader: adminDashboardLoader,
      element: <AdminDashboardPage />,
    },
  ],
}
