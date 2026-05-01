import { redirect, type RouteObject } from 'react-router-dom'
import { AdminShell } from '../admin-shell'
import {
  AdminLoginPage,
  adminLoginAction,
  adminLoginLoader,
  adminLogoutAction,
} from '../../pages/admin/login'
import { AdminDashboardPage, adminDashboardLoader } from '../../pages/admin/dashboard'

export const adminRoutes: RouteObject = {
  path: '/admin',
  element: <AdminShell />,
  children: [
    {
      index: true,
      loader: () => redirect('/admin/dashboard'),
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
    {
      path: 'logout',
      action: adminLogoutAction,
    },
  ],
}
