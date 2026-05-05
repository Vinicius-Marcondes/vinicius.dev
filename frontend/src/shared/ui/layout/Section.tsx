import type { HTMLAttributes } from 'react'
import { cx } from '../../lib'

type SectionProps = HTMLAttributes<HTMLElement>

export function Section({ className, ...props }: SectionProps) {
  return <section className={cx('layout-section', className)} {...props} />
}
