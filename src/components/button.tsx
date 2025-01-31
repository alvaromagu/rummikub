import { ButtonHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function Button (props: ButtonProps) {
  return (
    <button
      {...props}
      className={
        cn(
          'px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 hover:cursor-pointer',
          props.className
        )
      }
    />
  )
}