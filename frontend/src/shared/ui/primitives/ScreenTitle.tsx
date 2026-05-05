import type { HTMLAttributes } from 'react'
import { cx } from '../../lib'

type ScreenTitleProps = HTMLAttributes<HTMLHeadingElement>

export function ScreenTitle({ className, ...props }: ScreenTitleProps) {
  return <h1 className={cx('screen-title', className)} {...props} />
}
