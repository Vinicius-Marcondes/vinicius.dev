import { NavLink } from 'react-router-dom'
import logoMarkUrl from '../../../shared/assets/logo-mark.svg'
import { publicNavigation } from '../../../shared/config'
import { cx } from '../../../shared/lib'
import { Container } from '../../../shared/ui'

export function SiteHeader() {
  return (
    <header className="site-header">
      <Container>
        <div className="site-header__inner">
          <NavLink to="/" className="site-header__brand glitch-hover">
            <span className="site-header__brand-mark">
              <img src={logoMarkUrl} alt="" aria-hidden="true" width="18" height="18" />
            </span>
            <span className="site-header__brand-lockup">
              <span className="site-header__brand-name">vinicius.dev</span>
              <span className="site-header__brand-caption">late-night transmission // sao paulo</span>
            </span>
          </NavLink>
          <nav className="site-header__nav" aria-label="Primary navigation">
            {publicNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cx('site-header__link glitch-hover', isActive && 'is-active')}
              >
                <span className="site-header__link-cursor" aria-hidden="true">
                  ►
                </span>
                <span>
                  [ {item.label}
                  {item.detail ? <span className="site-header__link-detail">// {item.detail}</span> : null} ]
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      </Container>
    </header>
  )
}
