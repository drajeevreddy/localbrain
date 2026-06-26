'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]'

    const variants = {
      primary: 'bg-white text-black hover:bg-[#f1f7fe] border border-transparent hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]',
      ghost: 'bg-[#101012] text-[#fcfdff] border border-[rgba(255,255,255,0.14)] hover:bg-[#1a1a1c] hover:border-[rgba(255,255,255,0.2)]',
      outline: 'bg-black text-[#fcfdff] border border-[rgba(255,255,255,0.14)] hover:bg-[#101012] hover:border-[rgba(255,255,255,0.2)]',
      danger: 'bg-[#ff2047] text-white hover:bg-[#e01a3d] border border-transparent hover:shadow-[0_0_20px_rgba(255,32,71,0.2)]',
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-md',
      md: 'h-9 px-4 text-sm rounded-md',
      lg: 'h-11 px-6 text-sm rounded-lg',
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
