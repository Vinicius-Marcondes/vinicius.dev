import { createBrowserRouter } from 'react-router-dom'
import { adminRoutes } from './admin'
import { publicRoutes } from './public'

export const router = createBrowserRouter([publicRoutes, adminRoutes])
