import { NavLink } from 'react-router-dom'
import { publicNavigation } from '../../../shared/config'
import { cx } from '../../../shared/lib'
import { ChannelBug } from './ChannelBug'

export function SiteHeader() {
  return (
    <header className="site-header" role="banner">
      <NavLink to="/" className="site-header__home glitch-hover">
        [ vinicius.dev ]
      </NavLink>
      <nav className="site-header__nav" aria-label="Primary navigation">
        {publicNavigation.map((item, index) => (
          <span key={item.to} className="site-header__item-wrap">
            {index > 0 ? (
              <span className="site-header__separator" aria-hidden="true">
                ·
              </span>
            ) : null}
            <NavLink
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
          </span>
        ))}
      </nav>
      <ChannelBug />
    </header>
  )
}
