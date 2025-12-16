import { useState, useCallback } from 'react'
import type { Section, SectionType, AIAnalysisResult, Issue } from '../types'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Textarea } from './ui/Textarea'
import { Checklist } from './Checklist'
import { ScoreCard } from './ScoreCard'
import { IssueList } from './IssueList'
import { TextAnalysis } from './TextAnalysis'
import { analyzeSection, isAIConfigured } from '../lib/ai-client'

interface SectionReviewProps {
  section: Section
  fullPaperContent?: string
  onContentChange: (content: string) => void
  onChecklistToggle: (itemId: string) => void
  onIssueRemove: (issueId: string) => void
  onIssueUpdate: (issueId: string, updates: Partial<Section['issues'][0]>) => void
  onAddIssues: (issues: Issue[]) => void
  onAIAnalysis: (result: AIAnalysisResult) => void
  calculateScore: (section: Section) => number
}

export function SectionReview({
  section,
  fullPaperContent,
  onContentChange,
  onChecklistToggle,
  onIssueRemove,
  onIssueUpdate,
  onAddIssues,
  onAIAnalysis,
  calculateScore,
}: SectionReviewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'checklist' | 'issues' | 'analysis' | 'content'>('checklist')
  const [aiProvider, setAiProvider] = useState<'openai' | 'anthropic'>('anthropic')

  const aiConfig = isAIConfigured()
  const hasAI = aiConfig.openai || aiConfig.anthropic

  const handleAnalyze = useCallback(async () => {
    if (!section.content.trim()) {
      setAnalysisError('Please add content to analyze')
      return
    }

    setIsAnalyzing(true)
    setAnalysisError(null)

    try {
      const result = await analyzeSection({
        provider: aiProvider,
        sectionType: section.id as SectionType,
        sectionContent: section.content,
      })
      onAIAnalysis(result)
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }, [section.content, section.id, aiProvider, onAIAnalysis])

  const score = calculateScore(section)

  const tabs = [
    { id: 'checklist', label: 'Checklist', count: section.checklist.length },
    { id: 'issues', label: 'Issues', count: section.issues.length },
    { id: 'analysis', label: 'Analysis', count: null },
    { id: 'content', label: 'Content', count: null },
  ] as const

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{section.name}</CardTitle>
          <ScoreCard score={score} label="Section Score" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[300px]">
          {activeTab === 'checklist' && (
            <Checklist items={section.checklist} onToggle={onChecklistToggle} />
          )}

          {activeTab === 'issues' && (
            <IssueList
              issues={section.issues}
              onRemove={onIssueRemove}
              onUpdate={onIssueUpdate}
            />
          )}

          {activeTab === 'analysis' && (
            <TextAnalysis
              section={section}
              fullPaperContent={fullPaperContent}
              onAddIssues={onAddIssues}
            />
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <Textarea
                value={section.content}
                onChange={(e) => onContentChange(e.target.value)}
                placeholder={`Paste or edit ${section.name} content here...`}
                className="min-h-[250px]"
              />

              {hasAI && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Provider:</span>
                    <select
                      value={aiProvider}
                      onChange={(e) => setAiProvider(e.target.value as 'openai' | 'anthropic')}
                      className="text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1"
                      disabled={isAnalyzing}
                    >
                      {aiConfig.anthropic && (
                        <option value="anthropic">Claude (Anthropic)</option>
                      )}
                      {aiConfig.openai && <option value="openai">GPT-4 (OpenAI)</option>}
                    </select>
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !section.content.trim()}
                  >
                    {isAnalyzing ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        Analyze with AI
                      </>
                    )}
                  </Button>
                </div>
              )}

              {!hasAI && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configure VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY for AI analysis
                </p>
              )}

              {analysisError && (
                <p className="text-sm text-red-600 dark:text-red-400">{analysisError}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
