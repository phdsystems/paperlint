import { HTMLAttributes, forwardRef } from 'react'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className = '', value, max = 100, showLabel = false, size = 'md', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const getColor = () => {
      if (percentage >= 80) return 'bg-[var(--fb-success)]'
      if (percentage >= 60) return 'bg-[var(--fb-accent)]'
      if (percentage >= 40) return 'bg-[var(--fb-warning)]'
      return 'bg-[var(--fb-error)]'
    }

    const sizes = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    }

    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        <div className={`w-full bg-[var(--fb-surface-hover)] rounded-full overflow-hidden ${sizes[size]}`}>
          <div
            className={`${getColor()} ${sizes[size]} rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 text-sm text-[var(--fb-text-muted)] text-right">
            {value.toFixed(1)} / {max}
          </div>
        )}
      </div>
    )
  }
)

Progress.displayName = 'Progress'
