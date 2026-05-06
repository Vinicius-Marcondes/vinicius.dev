import { redirect, type RouteObject } from 'react-router-dom'
import { AdminShell } from '../admin-shell'
import {
  AdminLoginPage,
  adminLoginAction,
  adminLoginLoader,
  adminLogoutAction,
} from '../../pages/admin/login'
import { AdminDashboardPage, adminDashboardLoader } from '../../pages/admin/dashboard'
import {
  AdminPhotoDetailPage,
  AdminPhotoUploadPage,
  AdminPhotosGalleryPage,
  adminPhotoDetailAction,
  adminPhotoDetailLoader,
  adminPhotoUploadAction,
  adminPhotosLoader,
} from '../../pages/admin/photos'

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
      path: 'photos',
      children: [
        {
          index: true,
          loader: adminPhotosLoader,
          element: <AdminPhotosGalleryPage />,
        },
        {
          path: 'upload',
          action: adminPhotoUploadAction,
          element: <AdminPhotoUploadPage />,
        },
        {
          path: ':id',
          loader: adminPhotoDetailLoader,
          action: adminPhotoDetailAction,
          element: <AdminPhotoDetailPage />,
        },
      ],
    },
    {
      path: 'logout',
      action: adminLogoutAction,
    },
  ],
}
