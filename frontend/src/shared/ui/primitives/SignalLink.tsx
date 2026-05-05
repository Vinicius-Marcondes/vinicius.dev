import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { cx } from '../../lib'

type SignalLinkProps = {
  children: ReactNode
  className?: string | ((args: { isActive: boolean }) => string)
  to?: string
  href?: string
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'>

export function SignalLink({
  children,
  className,
  href,
  to,
  ...props
}: SignalLinkProps) {
  if (to) {
    return (
      <NavLink
        to={to}
        className={
          typeof className === 'function'
            ? (args) => cx('signal-link', className(args))
            : cx('signal-link', className)
        }
      >
        {children}
      </NavLink>
    )
  }

  return (
    <a
      className={cx('signal-link', typeof className === 'string' ? className : undefined)}
      href={href}
      {...props}
    >
      {children}
    </a>
  )
}
