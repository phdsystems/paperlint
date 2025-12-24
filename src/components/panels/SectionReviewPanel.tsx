/**
 * SectionReviewPanel - TabLayout component for section review
 * Uses ReviewContext instead of wrapper props
 */

import { useReview, useSelectedSection } from '../../context/ReviewContext'
import { SectionReview } from '../SectionReview'

interface SectionReviewPanelProps {
  sectionId: string
}

export function SectionReviewPanel({ sectionId: _sectionId }: SectionReviewPanelProps) {
  const { state, actions, handleAIAnalysis } = useReview()
  const currentSection = useSelectedSection()

  if (!currentSection) {
    return (
      <div className="text-center text-[var(--fb-text-muted)] py-8">
        Select a section from the sidebar
      </div>
    )
  }

  return (
    <SectionReview
      section={currentSection}
      fullPaperContent={state.paperContent}
      onContentChange={(content) =>
        actions.updateSectionContent(currentSection.id, content)
      }
      onChecklistToggle={(itemId) =>
        actions.toggleChecklistItem(currentSection.id, itemId)
      }
      onIssueRemove={(issueId) =>
        actions.removeIssue(currentSection.id, issueId)
      }
      onIssueUpdate={(issueId, updates) =>
        actions.updateIssue(currentSection.id, issueId, updates)
      }
      onAddIssues={(issues) => {
        for (const issue of issues) {
          actions.addIssue(currentSection.id, issue)
        }
      }}
      onAIAnalysis={(result) => handleAIAnalysis(currentSection.id, result)}
      calculateScore={actions.calculateSectionScore}
    />
  )
}
