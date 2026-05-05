import { Outlet } from 'react-router-dom'
import { SiteHeader } from '../../../widgets/site-header'
import { SiteFooter } from '../../../widgets/site-footer'

export function PublicShell() {
  return (
    <div className="app-shell app-shell--public fx-scanlines">
      <SiteHeader />
      <div className="app-shell__body">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  )
}
