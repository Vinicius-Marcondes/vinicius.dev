import type { HTMLAttributes } from 'react'
import { cx } from '../../lib'

type ScreenFrameProps = HTMLAttributes<HTMLDivElement>

export function ScreenFrame({ className, ...props }: ScreenFrameProps) {
  return <div className={cx('screen-frame', className)} {...props} />
}
