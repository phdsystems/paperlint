import { HTMLAttributes, forwardRef } from 'react'
import type { IssueSeverity } from '../../types'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | IssueSeverity
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-[var(--fb-surface-hover)] text-[var(--fb-text)]',
      success: 'bg-[var(--fb-success)]/20 text-[var(--fb-success)]',
      warning: 'bg-[var(--fb-warning)]/20 text-[var(--fb-warning)]',
      error: 'bg-[var(--fb-error)]/20 text-[var(--fb-error)]',
      info: 'bg-[var(--fb-info)]/20 text-[var(--fb-info)]',
      'must-fix': 'bg-[var(--fb-error)]/20 text-[var(--fb-error)]',
      'should-fix': 'bg-[var(--fb-warning)]/20 text-[var(--fb-warning)]',
      'consider': 'bg-[var(--fb-info)]/20 text-[var(--fb-info)]',
    }

    return (
      <span
        ref={ref}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
