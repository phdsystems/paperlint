/**
 * ReviewContext - Global context for paper review state
 * Allows Frontboot components to access state via hooks instead of wrappers
 */

import { createContext, useContext, ReactNode } from 'react'
import type { ReviewState, Section, Issue, SectionType, AIAnalysisResult } from '../types'

interface ReviewActions {
  setPaperContent: (content: string) => void
  setPaperTitle: (title: string) => void
  updateSectionContent: (sectionId: string, content: string) => void
  toggleChecklistItem: (sectionId: string, itemId: string) => void
  addIssue: (sectionId: string, issue: Issue) => void
  removeIssue: (sectionId: string, issueId: string) => void
  updateIssue: (sectionId: string, issueId: string, updates: Partial<Issue>) => void
  updateChecklistFromAI: (sectionId: string, updates: { itemId: string; suggested: boolean }[]) => void
  calculateSectionScore: (section: Section) => number
  reset: () => void
}

interface ReviewContextValue {
  state: ReviewState
  actions: ReviewActions
  selectedSection: string
  setSelectedSection: (id: string) => void
  handleParseSections: (sections: { sectionId: SectionType; content: string }[]) => void
  handleAIAnalysis: (sectionId: string, result: AIAnalysisResult) => void
}

const ReviewContext = createContext<ReviewContextValue | null>(null)

export function ReviewProvider({
  children,
  value,
}: {
  children: ReactNode
  value: ReviewContextValue
}) {
  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  )
}

export function useReview() {
  const context = useContext(ReviewContext)
  if (!context) {
    throw new Error('useReview must be used within a ReviewProvider')
  }
  return context
}

// Convenience hooks
export function useReviewState() {
  const { state } = useReview()
  return state
}

export function useReviewActions() {
  const { actions } = useReview()
  return actions
}

export function useSelectedSection() {
  const { state, selectedSection } = useReview()
  return state.sections.find(s => s.id === selectedSection) || null
}
