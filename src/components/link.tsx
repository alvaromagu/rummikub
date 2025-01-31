import { Link as WouterLink } from 'wouter'
import { cn } from '../utils/cn'

export type LinkProps = {
  href: string
  className?: string
  children: React.ReactNode
}

export function Link(props: LinkProps) {
  return (
    <WouterLink 
      {...props}
      className={cn(
        'transition-colors hover:text-cyan-600',
        props.className,
      )}
    />
  )
}