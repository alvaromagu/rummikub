import { InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input(props: InputProps) {
  return (
    <input 
      {...props} 
      className={
        cn(
          'border rounded px-2 py-1 w-full', 
          props.className
        )
      }
    />
  )
}