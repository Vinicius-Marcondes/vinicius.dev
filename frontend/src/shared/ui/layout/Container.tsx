import type { HTMLAttributes } from 'react'
import { cx } from '../../lib'

type ContainerProps = HTMLAttributes<HTMLDivElement>

export function Container({ className, ...props }: ContainerProps) {
  return <div className={cx('layout-container', className)} {...props} />
}
