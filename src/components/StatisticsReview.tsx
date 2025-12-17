import { useState, useCallback, useMemo } from 'react'
import { lintStatistics, StatisticsLintResult, analyzeEffectSizesInText, getTestRequirementsInfo } from '../lib/statistics-linter'
import { analyzeStatistics, isStatisticsAIConfigured, StatisticsAIResult, getDefaultProvider } from '../lib/statistics-ai'
import { calculateStatistics, StatisticsCalculationResult } from '../lib/statistics-calculator'
import { config } from '../config'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Progress } from './ui/Progress'
import type { Issue, IssueSeverity } from '../types'

interface StatisticsReviewProps {
  text: string
  sectionId: string
  sectionName?: string
  onAddIssues?: (issues: Issue[]) => void
}

export function StatisticsReview({ text, sectionId, sectionName, onAddIssues }: StatisticsReviewProps) {
  const [aiResult, setAIResult] = useState<StatisticsAIResult | null>(null)
  const [aiLoading, setAILoading] = useState(false)
  const [aiError, setAIError] = useState<string | null>(null)
  const [provider, setProvider] = useState<'openai' | 'anthropic'>(getDefaultProvider())
  const [showAllIssues, setShowAllIssues] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['stats', 'issues']))

  const statsConfig = config.externalCheckers?.statisticsLinter
  const aiConfig = config.externalCheckers?.statisticsAI

  // Run pattern-based analysis immediately
  const lintResult = useMemo<StatisticsLintResult | null>(() => {
    if (!statsConfig?.enabled || !text.trim()) return null
    return lintStatistics(text, sectionId, {
      includeChecklist: sectionId === 'methodology' || sectionId === 'methods',
      includeSampleAdequacy: true,
    })
  }, [text, sectionId, statsConfig?.enabled])

  // Run calculations
  const calculations = useMemo<StatisticsCalculationResult | null>(() => {
    if (!text.trim()) return null
    return calculateStatistics(text)
  }, [text])

  // Effect size analysis
  const effectSizeAnalysis = useMemo(() => {
    if (!text.trim()) return []
    return analyzeEffectSizesInText(text)
  }, [text])

  const aiConfigured = isStatisticsAIConfigured()
  const wordCount = text.trim().split(/\s+/).length
  const minWords = aiConfig?.minWords || 100

  const runAIAnalysis = useCallback(async () => {
    if (!text.trim() || wordCount < minWords) return

    setAILoading(true)
    setAIError(null)

    try {
      const result = await analyzeStatistics(text, {
        provider,
        sectionName,
      })
      setAIResult(result)
    } catch (err) {
      setAIError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAILoading(false)
    }
  }, [text, provider, sectionName, wordCount, minWords])

  const handleAddIssues = useCallback(() => {
    if (!onAddIssues) return
    const issues: Issue[] = []
    if (lintResult?.issues) issues.push(...lintResult.issues)
    if (aiResult?.issues) issues.push(...aiResult.issues)
    onAddIssues(issues)
  }, [lintResult, aiResult, onAddIssues])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  if (!statsConfig?.enabled) {
    return null
  }

  const allIssues = [
    ...(lintResult?.issues || []),
    ...(aiResult?.issues || []),
  ]
  const displayIssues = showAllIssues ? allIssues : allIssues.slice(0, 5)

  const mustFix = allIssues.filter(i => i.severity === 'must-fix').length
  const shouldFix = allIssues.filter(i => i.severity === 'should-fix').length
  const consider = allIssues.filter(i => i.severity === 'consider').length

  return (
    <Card>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Statistics Review
            </h4>
            {lintResult?.studyType && lintResult.studyType.type !== 'unknown' && (
              <Badge variant="info" className="text-xs">
                {lintResult.studyType.type}
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <CollapsibleSection
          title="Statistical Elements"
          isOpen={expandedSections.has('stats')}
          onToggle={() => toggleSection('stats')}
        >
          {lintResult && (
            <div className="grid grid-cols-5 gap-2">
              <StatBox label="Tests" value={lintResult.stats.statisticalTests} />
              <StatBox label="P-values" value={lintResult.stats.pValues} />
              <StatBox label="Effect Sizes" value={lintResult.stats.effectSizes} />
              <StatBox label="CIs" value={lintResult.stats.confidenceIntervals} />
              <StatBox label="Sample N" value={lintResult.stats.sampleSizes} />
            </div>
          )}
        </CollapsibleSection>

        {/* Study Design Checklist */}
        {lintResult?.studyDesignChecklist && lintResult.studyDesignChecklist.length > 0 && (
          <CollapsibleSection
            title={`Study Design Checklist (${lintResult.studyType.type})`}
            isOpen={expandedSections.has('checklist')}
            onToggle={() => toggleSection('checklist')}
            className="mt-4"
          >
            <div className="space-y-2">
              {lintResult.studyDesignChecklist.map((item) => (
                <ChecklistItem
                  key={item.checkItem}
                  label={item.label}
                  passed={item.passed}
                  severity={item.severity}
                />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Sample Size Adequacy */}
        {lintResult?.sampleAdequacy && (
          <CollapsibleSection
            title="Sample Size Analysis"
            isOpen={expandedSections.has('sample')}
            onToggle={() => toggleSection('sample')}
            className="mt-4"
          >
            <SampleAdequacyPanel adequacy={lintResult.sampleAdequacy} />
          </CollapsibleSection>
        )}

        {/* Effect Size Interpretation */}
        {effectSizeAnalysis.length > 0 && (
          <CollapsibleSection
            title="Effect Size Interpretation"
            isOpen={expandedSections.has('effects')}
            onToggle={() => toggleSection('effects')}
            className="mt-4"
          >
            <div className="space-y-2">
              {effectSizeAnalysis.map((es, idx) => (
                <EffectSizeItem key={idx} effectSize={es} />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Detected Tests */}
        {calculations?.detectedTests && calculations.detectedTests.length > 0 && (
          <CollapsibleSection
            title="Detected Statistical Tests"
            isOpen={expandedSections.has('tests')}
            onToggle={() => toggleSection('tests')}
            className="mt-4"
          >
            <div className="space-y-2">
              {calculations.detectedTests.map((test, idx) => (
                <TestItem key={idx} test={test} />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Issues Summary */}
        {allIssues.length > 0 && (
          <CollapsibleSection
            title={`Issues Found (${allIssues.length})`}
            isOpen={expandedSections.has('issues')}
            onToggle={() => toggleSection('issues')}
            className="mt-4"
          >
            <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Summary:</span>
              {mustFix > 0 && (
                <Badge variant="must-fix" className="text-xs">
                  {mustFix} must-fix
                </Badge>
              )}
              {shouldFix > 0 && (
                <Badge variant="should-fix" className="text-xs">
                  {shouldFix} should-fix
                </Badge>
              )}
              {consider > 0 && (
                <Badge variant="consider" className="text-xs">
                  {consider} consider
                </Badge>
              )}
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {displayIssues.map((issue, idx) => (
                <IssueItem key={issue.id || idx} issue={issue} />
              ))}
            </div>
            {allIssues.length > 5 && (
              <button
                onClick={() => setShowAllIssues(!showAllIssues)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2"
              >
                {showAllIssues ? 'Show less' : `Show all ${allIssues.length} issues`}
              </button>
            )}
          </CollapsibleSection>
        )}

        {allIssues.length === 0 && lintResult && (
          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg mt-4">
            <p className="text-sm text-green-700 dark:text-green-300">
              No statistical reporting issues detected.
            </p>
          </div>
        )}

        {/* AI Analysis Section */}
        {aiConfig?.enabled !== false && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400">
                AI Methodology Analysis
              </h5>
              {aiConfigured && (
                <div className="flex items-center gap-2">
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as 'openai' | 'anthropic')}
                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    disabled={aiLoading}
                  >
                    <option value="anthropic">Claude</option>
                    <option value="openai">GPT-4</option>
                  </select>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={runAIAnalysis}
                    disabled={aiLoading || wordCount < minWords}
                  >
                    {aiLoading ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>
              )}
            </div>

            {!aiConfigured && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add API key to enable AI analysis
              </p>
            )}

            {aiConfigured && wordCount < minWords && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Minimum {minWords} words required ({wordCount} current)
              </p>
            )}

            {aiError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{aiError}</p>
              </div>
            )}

            {aiResult && (
              <div className="space-y-3">
                {/* Methodology Score */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Methodology Score
                  </span>
                  <span className={`text-lg font-bold ${
                    aiResult.methodologyScore >= 8 ? 'text-green-600 dark:text-green-400' :
                    aiResult.methodologyScore >= 6 ? 'text-blue-600 dark:text-blue-400' :
                    aiResult.methodologyScore >= 4 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {aiResult.methodologyScore}/10
                  </span>
                </div>

                {/* Study Type Assessment */}
                {aiResult.studyTypeAssessment && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Study Type: {aiResult.studyTypeAssessment.detectedType}
                      </span>
                      <span className="text-xs text-gray-400">
                        {(aiResult.studyTypeAssessment.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    {aiResult.studyTypeAssessment.checklistResults && aiResult.studyTypeAssessment.checklistResults.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {aiResult.studyTypeAssessment.checklistResults.slice(0, 5).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <span className={`w-2 h-2 rounded-full ${
                              item.status === 'present' ? 'bg-green-500' :
                              item.status === 'missing' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`} />
                            <span className="text-gray-600 dark:text-gray-400">{item.item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Concerns */}
                {aiResult.concerns.length > 0 && (
                  <div className="space-y-2">
                    <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Statistical Concerns
                    </h6>
                    {aiResult.concerns.map((concern, idx) => (
                      <ConcernItem key={idx} concern={concern} />
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {aiResult.recommendations.length > 0 && (
                  <div>
                    <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Recommendations
                    </h6>
                    <ul className="space-y-1">
                      {aiResult.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="text-indigo-500 mt-0.5">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Add Issues Button */}
        {onAddIssues && allIssues.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddIssues}
              className="w-full"
            >
              Add {allIssues.length} Issues to Section
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

interface CollapsibleSectionProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
  className?: string
}

function CollapsibleSection({ title, isOpen, onToggle, children, className = '' }: CollapsibleSectionProps) {
  return (
    <div className={className}>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h5>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  )
}

function ChecklistItem({ label, passed, severity }: { label: string; passed: boolean; severity: IssueSeverity }) {
  const severityColors = {
    'must-fix': 'text-red-500',
    'should-fix': 'text-yellow-500',
    'consider': 'text-blue-500',
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
      <span className={`w-2 h-2 rounded-full ${passed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
      <span className={`flex-1 ${passed ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
      </span>
      {!passed && (
        <span className={`text-xs ${severityColors[severity]}`}>
          {severity}
        </span>
      )}
    </div>
  )
}

interface SampleAdequacyPanelProps {
  adequacy: {
    extracted: number
    required: { small: number; medium: number; large: number }
    adequate: boolean
    recommendation: string
  }
}

function SampleAdequacyPanel({ adequacy }: SampleAdequacyPanelProps) {
  const { extracted, required, adequate, recommendation } = adequacy

  // Calculate percentage of medium effect requirement
  const percentage = required.medium > 0 ? Math.min((extracted / required.medium) * 100, 100) : 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Detected N: <span className="font-bold text-gray-900 dark:text-gray-100">{extracted}</span>
        </span>
        <Badge variant={adequate ? 'success' : 'should-fix'}>
          {adequate ? 'Adequate' : 'May be underpowered'}
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Required for medium effect</span>
          <span>n ≈ {required.medium}</span>
        </div>
        <Progress value={percentage} max={100} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <p className="font-medium text-gray-700 dark:text-gray-300">n ≈ {required.large}</p>
          <p className="text-gray-500">Large effect</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <p className="font-medium text-gray-700 dark:text-gray-300">n ≈ {required.medium}</p>
          <p className="text-gray-500">Medium effect</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
          <p className="font-medium text-gray-700 dark:text-gray-300">n ≈ {required.small}</p>
          <p className="text-gray-500">Small effect</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">{recommendation}</p>
    </div>
  )
}

interface EffectSizeItemProps {
  effectSize: {
    type: string
    value: number
    context: string
    magnitude: string
    interpretation: string
  }
}

function EffectSizeItem({ effectSize }: EffectSizeItemProps) {
  const magnitudeColors = {
    negligible: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    small: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    large: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  }

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {effectSize.type}: {effectSize.value.toFixed(3)}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${magnitudeColors[effectSize.magnitude as keyof typeof magnitudeColors] || magnitudeColors.negligible}`}>
          {effectSize.magnitude}
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{effectSize.interpretation}</p>
    </div>
  )
}

interface TestItemProps {
  test: {
    test: string
    configKey: string
    context: string
  }
}

function TestItem({ test }: TestItemProps) {
  const requirements = getTestRequirementsInfo(test.configKey)

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-gray-700 dark:text-gray-300">{test.test}</span>
        {requirements && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {requirements.dataType} data
          </span>
        )}
      </div>
      {requirements && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <span>Requires: {requirements.requiredReporting?.slice(0, 3).join(', ')}</span>
        </div>
      )}
    </div>
  )
}

function IssueItem({ issue }: { issue: Issue }) {
  const severityColors = {
    'must-fix': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'should-fix': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'consider': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  }

  return (
    <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
      <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${severityColors[issue.severity]}`}>
        {issue.severity}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-gray-700 dark:text-gray-300">{issue.description}</p>
        {issue.suggestion && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {issue.suggestion}
          </p>
        )}
      </div>
    </div>
  )
}

interface StatisticsConcern {
  category: string
  severity: 'high' | 'medium' | 'low'
  description: string
  suggestion: string
}

function ConcernItem({ concern }: { concern: StatisticsConcern }) {
  const severityColors = {
    high: 'text-red-600 dark:text-red-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-gray-500 dark:text-gray-400',
  }

  const categoryColors: Record<string, string> = {
    'test-selection': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'assumptions': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'interpretation': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'reporting': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'power': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'study-design': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  }

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs px-1.5 py-0.5 rounded ${categoryColors[concern.category] || 'bg-gray-200 text-gray-800'}`}>
          {concern.category}
        </span>
        <span className={`text-xs ${severityColors[concern.severity]}`}>
          {concern.severity}
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300">{concern.description}</p>
      {concern.suggestion && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {concern.suggestion}
        </p>
      )}
    </div>
  )
}
