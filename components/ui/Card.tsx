interface CardProps {
  children: React.ReactNode
  className?: string
  bordered?: boolean
}

export default function Card({ children, className = '', bordered = false }: CardProps) {
  return (
    <div
      className={`bg-[#0a0a0c] rounded-xl p-8 ${bordered ? 'border border-[rgba(255,255,255,0.14)]' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
