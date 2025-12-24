import { useState, useCallback } from 'react'
import { TabLayout, useTheme, ThemeToggle, darkTheme, lightTheme } from '@engineeringlabs/frontboot'
import type { TabLayoutConfig, TabLayoutDataProvider } from '@engineeringlabs/frontboot'
import { useReviewState } from './hooks/useReviewState'
import { ReviewProvider } from './context/ReviewContext'
import { componentRegistry } from './components/registry'
import { Button } from './components/ui/Button'
import type { SectionType, AIAnalysisResult } from './types'
import layoutConfig from './config/layout.yaml'

export default function App() {
  const { state, actions } = useReviewState()
  const [selectedSection, setSelectedSection] = useState<string>('title')
  const { theme, setTheme } = useTheme()

  const handleParseSections = useCallback(
    (sections: { sectionId: SectionType; content: string }[]) => {
      for (const { sectionId, content } of sections) {
        actions.updateSectionContent(sectionId, content)
      }
    },
    [actions]
  )

  const handleAIAnalysis = useCallback(
    (sectionId: string, result: AIAnalysisResult) => {
      for (const issue of result.issues) {
        actions.addIssue(sectionId, issue)
      }
      if (result.checklistUpdates.length > 0) {
        actions.updateChecklistFromAI(sectionId, result.checklistUpdates)
      }
    },
    [actions]
  )

  // Calculate total issues
  const totalIssues = state.sections.reduce((sum, s) => sum + s.issues.length, 0)

  // Data provider for TabLayout
  const dataProvider: TabLayoutDataProvider = {
    getStat: (id: string) => {
      if (id === 'overallScore') return state.overallScore.toFixed(1)
      if (id === 'issueCount') return totalIssues
      return 0
    },
    onRefresh: actions.reset,
  }

  // Context value for ReviewProvider
  const reviewContextValue = {
    state,
    actions,
    selectedSection,
    setSelectedSection,
    handleParseSections,
    handleAIAnalysis,
  }

  return (
    <ReviewProvider value={reviewContextValue}>
      <div className="min-h-screen bg-[var(--fb-bg)] transition-colors">
        {/* Custom header with theme toggle and reset */}
        <header className="bg-[var(--fb-surface)] shadow-sm border-b border-[var(--fb-border)]">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-[var(--fb-accent)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h1 className="text-xl font-bold text-[var(--fb-text)]">
                PaperLint
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle
                theme={theme.name === 'dark' ? 'dark' : 'light'}
                onToggle={() => setTheme(theme.name === 'dark' ? lightTheme : darkTheme)}
              />
              <Button variant="ghost" size="sm" onClick={actions.reset}>
                Reset
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <TabLayout
            config={layoutConfig as TabLayoutConfig}
            components={componentRegistry}
            data={dataProvider}
          />
        </main>

        <footer className="border-t border-[var(--fb-border)] bg-[var(--fb-surface)] mt-12">
          <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-[var(--fb-text-muted)]">
            PaperLint - Academic writing analysis
          </div>
        </footer>
      </div>
    </ReviewProvider>
  )
}
