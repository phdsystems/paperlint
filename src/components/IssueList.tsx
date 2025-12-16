import { useState } from 'react'
import type { Issue, IssueSeverity } from '../types'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'

interface IssueListProps {
  issues: Issue[]
  onRemove: (issueId: string) => void
  onUpdate: (issueId: string, updates: Partial<Issue>) => void
}

const severityOrder: IssueSeverity[] = ['must-fix', 'should-fix', 'consider']

export function IssueList({ issues, onRemove, onUpdate }: IssueListProps) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)

  if (issues.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>No issues found</p>
      </div>
    )
  }

  const groupedIssues = severityOrder.reduce((acc, severity) => {
    acc[severity] = issues.filter((issue) => issue.severity === severity)
    return acc
  }, {} as Record<IssueSeverity, Issue[]>)

  const severityLabels: Record<IssueSeverity, string> = {
    'must-fix': 'Must Fix',
    'should-fix': 'Should Fix',
    consider: 'Consider',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Badge variant="must-fix">Must Fix</Badge>
          <span>{groupedIssues['must-fix'].length}</span>
        </span>
        <span className="flex items-center gap-1">
          <Badge variant="should-fix">Should Fix</Badge>
          <span>{groupedIssues['should-fix'].length}</span>
        </span>
        <span className="flex items-center gap-1">
          <Badge variant="consider">Consider</Badge>
          <span>{groupedIssues['consider'].length}</span>
        </span>
      </div>

      {severityOrder.map((severity) => {
        const severityIssues = groupedIssues[severity]
        if (severityIssues.length === 0) return null

        return (
          <div key={severity}>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {severityLabels[severity]} ({severityIssues.length})
            </h4>
            <div className="space-y-2">
              {severityIssues.map((issue) => (
                <Card
                  key={issue.id}
                  className={`border-l-4 ${
                    severity === 'must-fix'
                      ? 'border-l-red-500'
                      : severity === 'should-fix'
                      ? 'border-l-yellow-500'
                      : 'border-l-blue-500'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() =>
                          setExpandedIssue(expandedIssue === issue.id ? null : issue.id)
                        }
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={severity}>{severityLabels[severity]}</Badge>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {issue.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(issue.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </Button>
                    </div>

                    {expandedIssue === issue.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                        {issue.location && (
                          <div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Location:
                            </span>
                            <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                              "{issue.location}"
                            </p>
                          </div>
                        )}
                        {issue.suggestion && (
                          <div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Suggestion:
                            </span>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {issue.suggestion}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Change severity:
                          </span>
                          {severityOrder
                            .filter((s) => s !== severity)
                            .map((s) => (
                              <button
                                key={s}
                                onClick={() => onUpdate(issue.id, { severity: s })}
                                className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                              >
                                {severityLabels[s]}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
