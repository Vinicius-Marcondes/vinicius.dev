import { NavLink } from 'react-router-dom'
import logoMarkUrl from '../../../shared/assets/logo-mark.svg'
import { publicNavigation } from '../../../shared/config'
import { Container } from '../../../shared/ui'

export function SiteHeader() {
  return (
    <header className="site-header">
      <Container>
        <div className="site-header__inner">
          <NavLink to="/" className="site-header__brand">
            <img src={logoMarkUrl} alt="" aria-hidden="true" width="22" height="22" />
            <span>vinicius.dev</span>
          </NavLink>
          <nav className="site-header__nav" aria-label="Primary navigation">
            {publicNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'site-header__link glitch-hover is-active' : 'site-header__link glitch-hover'
                }
              >
                [ {item.label} ]
              </NavLink>
            ))}
          </nav>
        </div>
      </Container>
    </header>
  )
}
