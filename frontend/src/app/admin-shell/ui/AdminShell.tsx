import { Outlet } from 'react-router-dom'
import { Container, InlineLabel, ScreenFrame, SignalLink } from '../../../shared/ui'
import { adminNavigation } from '../../../shared/config'

export function AdminShell() {
  return (
    <div className="app-shell app-shell--admin">
      <header className="admin-shell__header">
        <Container>
          <div className="admin-shell__inner">
            <div>
              <InlineLabel>admin shell</InlineLabel>
              <h1 className="admin-shell__title">vinicius.dev control</h1>
            </div>
            <nav className="admin-shell__nav" aria-label="Admin navigation">
              {adminNavigation.map((item) => (
                <SignalLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? 'signal-link is-active' : 'signal-link'
                  }
                >
                  {item.label}
                </SignalLink>
              ))}
            </nav>
          </div>
        </Container>
      </header>
      <main className="app-shell__body">
        <Container>
          <ScreenFrame>
            <Outlet />
          </ScreenFrame>
        </Container>
      </main>
    </div>
  )
}
