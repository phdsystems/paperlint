/**
 * ScoreSidebarPanel - TabLayout component for score sidebar
 * Uses ReviewContext instead of wrapper props
 */

import { useReview } from '../../context/ReviewContext'
import { ScoreCard } from '../ScoreCard'
import { sectionLabels } from '../../lib/checklist-data'
import type { SectionType } from '../../types'

interface ScoreSidebarPanelProps {
  sectionId: string
}

export function ScoreSidebarPanel({ sectionId: _sectionId }: ScoreSidebarPanelProps) {
  const { state, actions, selectedSection, setSelectedSection } = useReview()

  return (
    <div className="sticky top-6 space-y-4">
      <ScoreCard
        score={state.overallScore}
        label="Overall Score"
        size="lg"
      />

      <div className="bg-[var(--fb-surface)] rounded-lg shadow-sm border border-[var(--fb-border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--fb-border)]">
          <h3 className="text-sm font-medium text-[var(--fb-text-muted)]">
            Sections
          </h3>
        </div>
        <nav className="p-2 space-y-1">
          {state.sections.map((section) => {
            const score = actions.calculateSectionScore(section)
            const issueCount = section.issues.length
            return (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedSection === section.id
                    ? 'bg-[var(--fb-accent)]/10 text-[var(--fb-accent)]'
                    : 'text-[var(--fb-text)] hover:bg-[var(--fb-surface-hover)]'
                }`}
              >
                <span className="truncate">{sectionLabels[section.id as SectionType]}</span>
                <div className="flex items-center gap-2">
                  {issueCount > 0 && (
                    <span className="px-1.5 py-0.5 text-xs rounded bg-[var(--fb-error)]/10 text-[var(--fb-error)]">
                      {issueCount}
                    </span>
                  )}
                  <span
                    className={`text-xs font-medium ${
                      score >= 8
                        ? 'text-[var(--fb-success)]'
                        : score >= 6
                        ? 'text-[var(--fb-accent)]'
                        : score >= 4
                        ? 'text-[var(--fb-warning)]'
                        : 'text-[var(--fb-error)]'
                    }`}
                  >
                    {score.toFixed(1)}
                  </span>
                </div>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
