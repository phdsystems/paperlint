import type { ChecklistItem } from '../types'
import { Checkbox } from './ui/Checkbox'

interface ChecklistProps {
  items: ChecklistItem[]
  onToggle: (itemId: string) => void
}

export function Checklist({ items, onToggle }: ChecklistProps) {
  const checkedCount = items.filter((item) => item.checked).length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
        <span>Checklist Progress</span>
        <span>
          {checkedCount} / {items.length} completed
        </span>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <Checkbox
            key={item.id}
            id={item.id}
            label={item.label}
            checked={item.checked}
            aiSuggested={item.aiSuggested}
            onChange={() => onToggle(item.id)}
          />
        ))}
      </div>
    </div>
  )
}
