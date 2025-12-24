import { useState, useCallback, useMemo } from 'react'
import { TabbedPanel, FadeIn } from '@engineeringlabs/frontboot'
import type { TabbedPanelConfig, TabbedPanelCallbacks, PanelTab } from '@engineeringlabs/frontboot'
import { ClipboardList, AlertCircle, BarChart3, FileEdit, Loader2, Sparkles } from 'lucide-react'
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

type TabId = 'checklist' | 'issues' | 'analysis' | 'content'

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
  const [activeTab, setActiveTab] = useState<TabId>('checklist')
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

  // TabbedPanel configuration
  const tabs: PanelTab[] = useMemo(() => [
    {
      id: 'checklist',
      label: 'Checklist',
      icon: <ClipboardList size={14} />,
      badge: section.checklist.length
    },
    {
      id: 'issues',
      label: 'Issues',
      icon: <AlertCircle size={14} />,
      badge: section.issues.length
    },
    {
      id: 'analysis',
      label: 'Analysis',
      icon: <BarChart3 size={14} />
    },
    {
      id: 'content',
      label: 'Content',
      icon: <FileEdit size={14} />
    },
  ], [section.checklist.length, section.issues.length])

  const panelConfig: TabbedPanelConfig = {
    tabs,
    position: 'top',
  }

  const panelCallbacks: TabbedPanelCallbacks = {
    onTabChange: (tabId) => setActiveTab(tabId as TabId),
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{section.name}</CardTitle>
          <ScoreCard score={score} label="Section Score" />
        </div>
      </CardHeader>
      <CardContent>
        <TabbedPanel
          config={panelConfig}
          callbacks={panelCallbacks}
          activeTabId={activeTab}
        >
          <div className="min-h-[300px] pt-4">
            <FadeIn key={activeTab}>
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
                        <span className="text-sm text-[var(--fb-text-muted)]">Provider:</span>
                        <select
                          value={aiProvider}
                          onChange={(e) => setAiProvider(e.target.value as 'openai' | 'anthropic')}
                          className="text-sm rounded border border-[var(--fb-border)] bg-[var(--fb-surface)] text-[var(--fb-text)] px-2 py-1"
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
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-1.5" />
                            Analyze with AI
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {!hasAI && (
                    <p className="text-sm text-[var(--fb-text-muted)]">
                      Configure VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY for AI analysis
                    </p>
                  )}

                  {analysisError && (
                    <p className="text-sm text-[var(--fb-error)]">{analysisError}</p>
                  )}
                </div>
              )}
            </FadeIn>
          </div>
        </TabbedPanel>
      </CardContent>
    </Card>
  )
}
