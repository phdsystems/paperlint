import { InputHTMLAttributes, forwardRef } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  aiSuggested?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, aiSuggested, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={`flex items-start gap-3 cursor-pointer group ${className}`}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            className="peer h-5 w-5 rounded border-2 border-gray-300 dark:border-gray-600 bg-transparent checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
            {...props}
          />
          {aiSuggested && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-500" title="AI suggested" />
          )}
        </div>
        {label && (
          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 select-none">
            {label}
            {aiSuggested && (
              <span className="ml-2 text-xs text-purple-600 dark:text-purple-400">(AI suggested)</span>
            )}
          </span>
        )}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
