import { useMemo, useState, useCallback } from 'react'
import type { Section, SectionType, Issue } from '../types'
import { analyzeText, analyzeAbstract, analyzeReferences, TextAnalysisResult, config } from '../lib/text-analysis'
import { checkWithLanguageTool } from '../lib/language-tool'
import { lintAcademicText, LintResult } from '../lib/academic-linter'
import { AIDetection } from './AIDetection'
import { Card, CardContent } from './ui/Card'
import { Badge } from './ui/Badge'
import { Progress } from './ui/Progress'
import { Button } from './ui/Button'

interface TextAnalysisProps {
  section: Section
  fullPaperContent?: string
  onAddIssues: (issues: Issue[]) => void
}

interface ExternalCheckState {
  languageTool: {
    loading: boolean
    issues: Issue[]
    checked: boolean
    error: string | null
  }
  academicLinter: {
    loading: boolean
    result: LintResult | null
    checked: boolean
  }
}

function MetricCard({ label, value, unit, status }: {
  label: string
  value: string | number
  unit?: string
  status?: 'good' | 'warning' | 'error'
}) {
  const statusColors = {
    good: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
      <p className={`text-xl font-bold ${status ? statusColors[status] : 'text-gray-900 dark:text-gray-100'}`}>
        {value}{unit && <span className="text-sm font-normal ml-0.5">{unit}</span>}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  )
}

function ReadabilityGauge({ score, grade }: { score: number; grade: number }) {
  const { easy, moderate } = config.readability.fleschReadingEase
  const getReadabilityLevel = (score: number) => {
    if (score >= easy) return { level: 'Easy', color: 'text-green-600', status: 'good' as const }
    if (score >= moderate) return { level: 'Moderate', color: 'text-yellow-600', status: 'warning' as const }
    return { level: 'Difficult', color: 'text-red-600', status: 'error' as const }
  }

  const { level, color } = getReadabilityLevel(score)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Flesch Reading Ease
        </span>
        <span className={`text-sm font-semibold ${color}`}>
          {score.toFixed(0)} - {level}
        </span>
      </div>
      <Progress value={score} max={100} size="md" />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Grade level: {grade.toFixed(1)} (Flesch-Kincaid)
      </p>
    </div>
  )
}

export function TextAnalysis({ section, fullPaperContent, onAddIssues }: TextAnalysisProps) {
  const [externalChecks, setExternalChecks] = useState<ExternalCheckState>({
    languageTool: { loading: false, issues: [], checked: false, error: null },
    academicLinter: { loading: false, result: null, checked: false },
  })

  const analysis = useMemo<TextAnalysisResult | null>(() => {
    if (!section.content.trim()) return null
    return analyzeText(section.content, section.id as SectionType, section.id)
  }, [section.content, section.id])

  const specialIssues = useMemo<Issue[]>(() => {
    if (!section.content.trim()) return []

    const issues: Issue[] = []

    if (section.id === 'abstract') {
      issues.push(...analyzeAbstract(section.content, section.id))
    }

    if (section.id === 'references' && fullPaperContent) {
      issues.push(...analyzeReferences(section.content, fullPaperContent, section.id))
    }

    return issues
  }, [section.content, section.id, fullPaperContent])

  // Run LanguageTool check
  const runLanguageToolCheck = useCallback(async () => {
    if (!section.content.trim()) return

    setExternalChecks(prev => ({
      ...prev,
      languageTool: { ...prev.languageTool, loading: true, error: null }
    }))

    try {
      const issues = await checkWithLanguageTool(section.content, section.id)
      setExternalChecks(prev => ({
        ...prev,
        languageTool: { loading: false, issues, checked: true, error: null }
      }))
    } catch (error) {
      setExternalChecks(prev => ({
        ...prev,
        languageTool: {
          loading: false,
          issues: [],
          checked: true,
          error: 'Failed to connect to LanguageTool API'
        }
      }))
    }
  }, [section.content, section.id])

  // Run academic linter
  const runAcademicLinter = useCallback(() => {
    if (!section.content.trim()) return

    setExternalChecks(prev => ({
      ...prev,
      academicLinter: { ...prev.academicLinter, loading: true }
    }))

    // Run synchronously (browser-based)
    const result = lintAcademicText(section.content, section.id)
    setExternalChecks(prev => ({
      ...prev,
      academicLinter: { loading: false, result, checked: true }
    }))
  }, [section.content, section.id])

  // Run all external checks
  const runAllExternalChecks = useCallback(async () => {
    runAcademicLinter()
    await runLanguageToolCheck()
  }, [runAcademicLinter, runLanguageToolCheck])

  if (!analysis) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>Add content to see analysis</p>
      </div>
    )
  }

  // Combine all issues from all sources
  const externalIssues = [
    ...externalChecks.languageTool.issues,
    ...(externalChecks.academicLinter.result?.issues || [])
  ]
  const allIssues = [...analysis.issues, ...specialIssues, ...externalIssues]
  const mustFix = allIssues.filter(i => i.severity === 'must-fix').length
  const shouldFix = allIssues.filter(i => i.severity === 'should-fix').length
  const consider = allIssues.filter(i => i.severity === 'consider').length

  // Check if external checkers are enabled
  const ltEnabled = config.externalCheckers?.languageTool?.enabled
  const alEnabled = config.externalCheckers?.academicLinter?.enabled
  const hasExternalCheckers = ltEnabled || alEnabled

  const handleAddAllIssues = () => {
    // Filter out issues that already exist
    const existingIds = new Set(section.issues.map(i => i.id))
    const newIssues = allIssues.filter(i => !existingIds.has(i.id))
    if (newIssues.length > 0) {
      onAddIssues(newIssues)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <MetricCard
          label="Words"
          value={analysis.wordCount}
          status={
            analysis.wordCount === 0 ? 'error' :
            analysis.wordCount < 50 ? 'warning' : 'good'
          }
        />
        <MetricCard
          label="Sentences"
          value={analysis.sentenceCount}
        />
        <MetricCard
          label="Avg Words/Sentence"
          value={analysis.avgWordsPerSentence.toFixed(1)}
          status={
            analysis.avgWordsPerSentence > config.readability.sentenceLength.error ? 'error' :
            analysis.avgWordsPerSentence > config.readability.sentenceLength.warning ? 'warning' : 'good'
          }
        />
        <MetricCard
          label="Passive Voice"
          value={analysis.passiveVoicePercentage.toFixed(0)}
          unit="%"
          status={analysis.passiveVoicePercentage > config.readability.passiveVoice.warning ? 'warning' : 'good'}
        />
      </div>

      {/* Readability */}
      <Card>
        <CardContent className="p-4">
          <ReadabilityGauge
            score={analysis.fleschReadingEase}
            grade={analysis.fleschKincaidGrade}
          />
        </CardContent>
      </Card>

      {/* Citation Info */}
      {analysis.citationCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <Badge variant="info">{analysis.citationStyle}</Badge>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {analysis.citationCount} citation{analysis.citationCount !== 1 ? 's' : ''} detected
          </span>
        </div>
      )}

      {/* External Checkers */}
      {hasExternalCheckers && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                External Checkers
              </h4>
              <Button
                size="sm"
                variant="secondary"
                onClick={runAllExternalChecks}
                disabled={externalChecks.languageTool.loading || externalChecks.academicLinter.loading}
              >
                {(externalChecks.languageTool.loading || externalChecks.academicLinter.loading)
                  ? 'Checking...'
                  : 'Run All Checks'}
              </Button>
            </div>

            <div className="space-y-3">
              {/* LanguageTool */}
              {ltEnabled && (
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      LanguageTool
                    </span>
                    {externalChecks.languageTool.checked && !externalChecks.languageTool.error && (
                      <Badge variant={externalChecks.languageTool.issues.length > 0 ? 'should-fix' : 'success'}>
                        {externalChecks.languageTool.issues.length} issues
                      </Badge>
                    )}
                    {externalChecks.languageTool.error && (
                      <Badge variant="must-fix">Error</Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={runLanguageToolCheck}
                    disabled={externalChecks.languageTool.loading}
                  >
                    {externalChecks.languageTool.loading ? 'Checking...' : 'Check'}
                  </Button>
                </div>
              )}

              {/* Academic Linter */}
              {alEnabled && (
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Academic Linter
                    </span>
                    {externalChecks.academicLinter.checked && (
                      <Badge variant={(externalChecks.academicLinter.result?.issues.length || 0) > 0 ? 'consider' : 'success'}>
                        {externalChecks.academicLinter.result?.issues.length || 0} issues
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={runAcademicLinter}
                    disabled={externalChecks.academicLinter.loading}
                  >
                    {externalChecks.academicLinter.loading ? 'Checking...' : 'Check'}
                  </Button>
                </div>
              )}

              {/* Error message */}
              {externalChecks.languageTool.error && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {externalChecks.languageTool.error}
                </p>
              )}

              {/* Academic Linter Rule Summary */}
              {externalChecks.academicLinter.result && externalChecks.academicLinter.result.ruleResults.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Linter Rules:</p>
                  <div className="flex flex-wrap gap-1">
                    {externalChecks.academicLinter.result.ruleResults
                      .filter(r => r.issueCount > 0)
                      .map(r => (
                        <span
                          key={r.ruleId}
                          className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded"
                          title={r.ruleName}
                        >
                          {r.ruleId}: {r.issueCount}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues Summary */}
      {allIssues.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Issues Found ({allIssues.length})
              </h4>
              <button
                onClick={handleAddAllIssues}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Add all to Issues tab
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              {mustFix > 0 && (
                <span className="flex items-center gap-1">
                  <Badge variant="must-fix">{mustFix}</Badge>
                  <span className="text-xs text-gray-500">must-fix</span>
                </span>
              )}
              {shouldFix > 0 && (
                <span className="flex items-center gap-1">
                  <Badge variant="should-fix">{shouldFix}</Badge>
                  <span className="text-xs text-gray-500">should-fix</span>
                </span>
              )}
              {consider > 0 && (
                <span className="flex items-center gap-1">
                  <Badge variant="consider">{consider}</Badge>
                  <span className="text-xs text-gray-500">consider</span>
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {allIssues.slice(0, 10).map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
                >
                  <Badge variant={issue.severity} className="shrink-0 mt-0.5">
                    {issue.severity === 'must-fix' ? '!' : issue.severity === 'should-fix' ? '?' : '~'}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 dark:text-gray-200">{issue.description}</p>
                    {issue.suggestion && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {issue.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {allIssues.length > 10 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                  + {allIssues.length - 10} more issues
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {allIssues.length === 0 && (
        <div className="text-center py-4 text-green-600 dark:text-green-400">
          <svg
            className="w-8 h-8 mx-auto mb-2"
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
          <p className="text-sm">No issues detected</p>
        </div>
      )}

      {/* AI Content Detection */}
      {config.externalCheckers?.aiDetection?.enabled !== false && (
        <AIDetection text={section.content} sectionName={section.name} />
      )}
    </div>
  )
}
