'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[#a1a4a5]">{label}</label>
        )}
        <input
          ref={ref}
          className={`bg-[#0a0a0c] text-[#fcfdff] border rounded-lg px-3.5 py-2.5 text-sm h-10 focus:outline-none placeholder:text-[#464a4d] transition-all duration-200 ${
            error
              ? 'border-[#ff2047] focus:border-[#ff2047] focus:shadow-[0_0_12px_rgba(255,32,71,0.15)]'
              : 'border-[rgba(255,255,255,0.14)] focus:border-[#3b9eff] focus:shadow-[0_0_12px_rgba(59,158,255,0.15)]'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[#ff2047] animate-fade-in-down">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
