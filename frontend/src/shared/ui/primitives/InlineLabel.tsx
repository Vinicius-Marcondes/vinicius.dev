import type { HTMLAttributes } from 'react'
import { cx } from '../../lib'

type InlineLabelProps = HTMLAttributes<HTMLSpanElement>

export function InlineLabel({ className, ...props }: InlineLabelProps) {
  return <span className={cx('inline-label', className)} {...props} />
}
