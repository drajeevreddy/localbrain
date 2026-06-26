interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-[#101012] text-[rgba(252,253,255,0.86)]',
    success: 'bg-[rgba(34,255,153,0.1)] text-[#11ff99]',
    warning: 'bg-[rgba(255,197,61,0.1)] text-[#ffc53d]',
    error: 'bg-[rgba(255,32,71,0.1)] text-[#ff2047]',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
