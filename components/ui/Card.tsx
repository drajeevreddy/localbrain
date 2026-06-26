interface CardProps {
  children: React.ReactNode
  className?: string
  bordered?: boolean
  hover?: boolean
}

export default function Card({ children, className = '', bordered = false, hover = false }: CardProps) {
  return (
    <div
      className={`bg-[#0a0a0c] rounded-xl p-8 transition-all duration-300 ${
        bordered ? 'border border-[rgba(255,255,255,0.14)]' : ''
      } ${hover ? 'hover-lift hover-glow cursor-default' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
