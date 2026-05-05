import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '../../lib'

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  to?: string
}

export function ActionButton({
  children,
  className,
  to,
  type = 'button',
  ...props
}: ActionButtonProps) {
  if (to) {
    return (
      <Link to={to} className={cx('action-button', className)}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={cx('action-button', className)} {...props}>
      {children}
    </button>
  )
}
