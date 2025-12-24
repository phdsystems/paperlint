import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-[var(--fb-accent)] text-white hover:bg-[var(--fb-accent-hover)] focus:ring-[var(--fb-accent)]',
      secondary: 'bg-[var(--fb-surface)] text-[var(--fb-text)] hover:bg-[var(--fb-surface-hover)] border border-[var(--fb-border)] focus:ring-[var(--fb-accent)]',
      ghost: 'bg-transparent text-[var(--fb-text)] hover:bg-[var(--fb-surface-hover)] focus:ring-[var(--fb-accent)]',
      danger: 'bg-[var(--fb-error)] text-white hover:opacity-90 focus:ring-[var(--fb-error)]',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
