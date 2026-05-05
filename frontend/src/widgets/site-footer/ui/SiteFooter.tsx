import { footerNavigation, socialNavigation } from '../../../shared/config'
import { Container, InlineLabel, SignalLink } from '../../../shared/ui'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer__grid">
          <section className="site-footer__column">
            <InlineLabel>menu</InlineLabel>
            <div className="site-footer__links">
              {footerNavigation.map((item) => (
                <SignalLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? 'site-footer__link site-footer__link--active' : 'site-footer__link'
                  }
                >
                  <span className="site-footer__link-glyph" aria-hidden="true">
                    &gt;
                  </span>
                  <span>
                    {item.label}
                    {item.detail ? <span className="site-footer__link-detail">// {item.detail}</span> : null}
                  </span>
                </SignalLink>
              ))}
            </div>
          </section>
          <section className="site-footer__column">
            <InlineLabel>channels</InlineLabel>
            <div className="site-footer__links">
              {socialNavigation.map((item) => (
                <SignalLink
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="site-footer__link"
                >
                  <span className="site-footer__social-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </SignalLink>
              ))}
            </div>
          </section>
          <section className="site-footer__meta">
            <InlineLabel>signal</InlineLabel>
            <p className="site-footer__brand">vinicius.dev</p>
            <p className="site-footer__meta-copy">1987 cassette logic // 2026 online</p>
            <p className="site-footer__meta-copy site-footer__meta-copy--muted">
              no cookies // no tracking // no newsletter
            </p>
          </section>
        </div>
      </Container>
    </footer>
  )
}
