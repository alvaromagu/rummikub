import { HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export type H1Props = HTMLAttributes<HTMLHeadingElement>

export function H1 (props: H1Props) {
  return (
    <h1
      {...props}
      className={
        cn(
          'text-2xl font-semibold',
          props.className
        )
      }
    />
  )
}