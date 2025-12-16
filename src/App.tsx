import { useState, useCallback } from 'react'
import { useReviewState } from './hooks/useReviewState'
import { PaperInput } from './components/PaperInput'
import { SectionReview } from './components/SectionReview'
import { ScoreCard } from './components/ScoreCard'
import { ReportGenerator } from './components/ReportGenerator'
import { Button } from './components/ui/Button'
import type { SectionType, AIAnalysisResult } from './types'
import { sectionLabels } from './lib/checklist-data'

type View = 'input' | 'review' | 'report'

export default function App() {
  const { state, actions } = useReviewState()
  const [currentView, setCurrentView] = useState<View>('input')
  const [selectedSection, setSelectedSection] = useState<string>('title')
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev)
    document.documentElement.classList.toggle('dark')
  }, [])

  const handleParseSections = useCallback(
    (sections: { sectionId: SectionType; content: string }[]) => {
      for (const { sectionId, content } of sections) {
        actions.updateSectionContent(sectionId, content)
      }
      setCurrentView('review')
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

  const currentSection = state.sections.find((s) => s.id === selectedSection)

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors ${darkMode ? 'dark' : ''}`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              PaperLint
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['input', 'review', 'report'] as View[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === view
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </nav>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            <Button variant="ghost" size="sm" onClick={actions.reset}>
              Reset
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'input' && (
          <PaperInput
            paperContent={state.paperContent}
            paperTitle={state.paperTitle}
            onContentChange={actions.setPaperContent}
            onTitleChange={actions.setPaperTitle}
            onParse={handleParseSections}
          />
        )}

        {currentView === 'review' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <div className="sticky top-6 space-y-4">
                <ScoreCard
                  score={state.overallScore}
                  label="Overall Score"
                  size="lg"
                />

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <span className="truncate">{sectionLabels[section.id as SectionType]}</span>
                          <div className="flex items-center gap-2">
                            {issueCount > 0 && (
                              <span className="px-1.5 py-0.5 text-xs rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                                {issueCount}
                              </span>
                            )}
                            <span
                              className={`text-xs font-medium ${
                                score >= 8
                                  ? 'text-green-600 dark:text-green-400'
                                  : score >= 6
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : score >= 4
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-red-600 dark:text-red-400'
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
            </div>

            <div className="col-span-9">
              {currentSection && (
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
              )}
            </div>
          </div>
        )}

        {currentView === 'report' && (
          <ReportGenerator state={state} calculateScore={actions.calculateSectionScore} />
        )}
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          PaperLint - Academic writing analysis
        </div>
      </footer>
    </div>
  )
}
