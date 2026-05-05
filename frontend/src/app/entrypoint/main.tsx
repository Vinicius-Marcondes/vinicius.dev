import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from '../providers'
import { router } from '../routes/router'
import '../styles/reset.css'
import '../../shared/styles/tokens.css'
import '../../shared/styles/themes.css'
import '../../shared/styles/motion.css'
import '../../shared/styles/effects.css'
import '../styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
)
