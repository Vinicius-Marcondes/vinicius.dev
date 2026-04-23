import type { CSSProperties, HTMLAttributes } from 'react'
import { cx } from '../../lib'

type StackProps = HTMLAttributes<HTMLDivElement> & {
  gap?: number
}

export function Stack({ className, gap = 12, style, ...props }: StackProps) {
  return (
    <div
      className={cx('layout-stack', className)}
      style={{ ...style, '--stack-gap': `${gap}px` } as CSSProperties}
      {...props}
    />
  )
}
