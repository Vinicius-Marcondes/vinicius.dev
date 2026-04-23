import { footerNavigation, socialNavigation } from '../../../shared/config'
import { Container, InlineLabel, SignalLink } from '../../../shared/ui'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer__grid">
          <section>
            <InlineLabel>menu</InlineLabel>
            <div className="site-footer__links">
              {footerNavigation.map((item) => (
                <SignalLink key={item.to} to={item.to}>
                  {item.label}
                </SignalLink>
              ))}
            </div>
          </section>
          <section>
            <InlineLabel>channels</InlineLabel>
            <div className="site-footer__links">
              {socialNavigation.map((item) => (
                <SignalLink key={item.href} href={item.href}>
                  {item.label}
                </SignalLink>
              ))}
            </div>
          </section>
        </div>
      </Container>
    </footer>
  )
}
