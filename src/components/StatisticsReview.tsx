import { useState, useCallback, useMemo } from 'react'
import { CollapsibleSection, FadeIn, Stagger, StaggerItem } from '@engineeringlabs/frontboot'
import { BarChart3, CheckCircle, XCircle } from 'lucide-react'
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
            <BarChart3 className="w-5 h-5 text-[var(--fb-accent)]" />
            <h4 className="text-sm font-medium text-[var(--fb-text)]">
              Statistics Review
            </h4>
            {lintResult?.studyType && lintResult.studyType.type !== 'unknown' && (
              <Badge variant="info" className="text-xs">
                {lintResult.studyType.type}
              </Badge>
            )}
          </div>
        </div>

        <Stagger>
          {/* Quick Stats */}
          <StaggerItem>
            <CollapsibleSection
              title="Statistical Elements"
              defaultCollapsed={false}
              icon={<BarChart3 size={14} />}
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
          </StaggerItem>

          {/* Study Design Checklist */}
          {lintResult?.studyDesignChecklist && lintResult.studyDesignChecklist.length > 0 && (
            <StaggerItem>
              <CollapsibleSection
                title={`Study Design Checklist (${lintResult.studyType.type})`}
                defaultCollapsed={true}
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
            </StaggerItem>
          )}

          {/* Sample Size Adequacy */}
          {lintResult?.sampleAdequacy && (
            <StaggerItem>
              <CollapsibleSection
                title="Sample Size Analysis"
                defaultCollapsed={true}
                className="mt-4"
              >
                <SampleAdequacyPanel adequacy={lintResult.sampleAdequacy} />
              </CollapsibleSection>
            </StaggerItem>
          )}

          {/* Effect Size Interpretation */}
          {effectSizeAnalysis.length > 0 && (
            <StaggerItem>
              <CollapsibleSection
                title="Effect Size Interpretation"
                defaultCollapsed={true}
                className="mt-4"
              >
                <div className="space-y-2">
                  {effectSizeAnalysis.map((es, idx) => (
                    <EffectSizeItem key={idx} effectSize={es} />
                  ))}
                </div>
              </CollapsibleSection>
            </StaggerItem>
          )}

          {/* Detected Tests */}
          {calculations?.detectedTests && calculations.detectedTests.length > 0 && (
            <StaggerItem>
              <CollapsibleSection
                title="Detected Statistical Tests"
                defaultCollapsed={true}
                className="mt-4"
              >
                <div className="space-y-2">
                  {calculations.detectedTests.map((test, idx) => (
                    <TestItem key={idx} test={test} />
                  ))}
                </div>
              </CollapsibleSection>
            </StaggerItem>
          )}

          {/* Issues Summary */}
          {allIssues.length > 0 && (
            <StaggerItem>
              <CollapsibleSection
                title={`Issues Found (${allIssues.length})`}
                defaultCollapsed={false}
                count={allIssues.length}
                statusColor={mustFix > 0 ? 'error' : shouldFix > 0 ? 'warning' : 'info'}
                className="mt-4"
              >
                <div className="flex items-center gap-2 mb-3 p-2 bg-[var(--fb-surface)] rounded-lg">
                  <span className="text-sm text-[var(--fb-text-muted)]">Summary:</span>
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
                    className="text-xs text-[var(--fb-accent)] hover:underline mt-2"
                  >
                    {showAllIssues ? 'Show less' : `Show all ${allIssues.length} issues`}
                  </button>
                )}
              </CollapsibleSection>
            </StaggerItem>
          )}
        </Stagger>

        {allIssues.length === 0 && lintResult && (
          <FadeIn>
            <div className="p-3 bg-[var(--fb-success)]/10 rounded-lg mt-4">
              <p className="text-sm text-[var(--fb-success)]">
                No statistical reporting issues detected.
              </p>
            </div>
          </FadeIn>
        )}

        {/* AI Analysis Section */}
        {aiConfig?.enabled !== false && (
          <div className="border-t border-[var(--fb-border)] pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-xs font-medium text-[var(--fb-text-muted)]">
                AI Methodology Analysis
              </h5>
              {aiConfigured && (
                <div className="flex items-center gap-2">
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as 'openai' | 'anthropic')}
                    className="text-xs px-2 py-1 rounded border border-[var(--fb-border)] bg-[var(--fb-surface)] text-[var(--fb-text)]"
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
              <p className="text-xs text-[var(--fb-text-muted)]">
                Add API key to enable AI analysis
              </p>
            )}

            {aiConfigured && wordCount < minWords && (
              <p className="text-xs text-[var(--fb-text-muted)]">
                Minimum {minWords} words required ({wordCount} current)
              </p>
            )}

            {aiError && (
              <div className="p-3 bg-[var(--fb-error)]/10 rounded-lg">
                <p className="text-sm text-[var(--fb-error)]">{aiError}</p>
              </div>
            )}

            {aiResult && (
              <FadeIn>
                <div className="space-y-3">
                  {/* Methodology Score */}
                  <div className="flex items-center justify-between p-3 bg-[var(--fb-surface)] rounded-lg">
                    <span className="text-sm text-[var(--fb-text-muted)]">
                      Methodology Score
                    </span>
                    <span className={`text-lg font-bold ${
                      aiResult.methodologyScore >= 8 ? 'text-[var(--fb-success)]' :
                      aiResult.methodologyScore >= 6 ? 'text-[var(--fb-accent)]' :
                      aiResult.methodologyScore >= 4 ? 'text-[var(--fb-warning)]' :
                      'text-[var(--fb-error)]'
                    }`}>
                      {aiResult.methodologyScore}/10
                    </span>
                  </div>

                  {/* Study Type Assessment */}
                  {aiResult.studyTypeAssessment && (
                    <div className="p-3 bg-[var(--fb-surface)] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[var(--fb-text-muted)]">
                          Study Type: {aiResult.studyTypeAssessment.detectedType}
                        </span>
                        <span className="text-xs text-[var(--fb-text-muted)]">
                          {(aiResult.studyTypeAssessment.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      {aiResult.studyTypeAssessment.checklistResults && aiResult.studyTypeAssessment.checklistResults.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {aiResult.studyTypeAssessment.checklistResults.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <span className={`w-2 h-2 rounded-full ${
                                item.status === 'present' ? 'bg-[var(--fb-success)]' :
                                item.status === 'missing' ? 'bg-[var(--fb-error)]' :
                                'bg-[var(--fb-warning)]'
                              }`} />
                              <span className="text-[var(--fb-text-muted)]">{item.item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Concerns */}
                  {aiResult.concerns.length > 0 && (
                    <div className="space-y-2">
                      <h6 className="text-xs font-medium text-[var(--fb-text-muted)]">
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
                      <h6 className="text-xs font-medium text-[var(--fb-text-muted)] mb-2">
                        Recommendations
                      </h6>
                      <ul className="space-y-1">
                        {aiResult.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-[var(--fb-text)]">
                            <span className="text-[var(--fb-accent)] mt-0.5">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </FadeIn>
            )}
          </div>
        )}

        {/* Add Issues Button */}
        {onAddIssues && allIssues.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--fb-border)]">
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

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-2 bg-[var(--fb-surface)] rounded">
      <p className="text-lg font-bold text-[var(--fb-text)]">{value}</p>
      <p className="text-xs text-[var(--fb-text-muted)]">{label}</p>
    </div>
  )
}

function ChecklistItem({ label, passed, severity }: { label: string; passed: boolean; severity: IssueSeverity }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-[var(--fb-surface)] rounded text-sm">
      {passed ? (
        <CheckCircle size={14} className="text-[var(--fb-success)]" />
      ) : (
        <XCircle size={14} className="text-[var(--fb-error)]" />
      )}
      <span className={`flex-1 ${passed ? 'text-[var(--fb-text)]' : 'text-[var(--fb-text-muted)]'}`}>
        {label}
      </span>
      {!passed && (
        <span className={`text-xs ${
          severity === 'must-fix' ? 'text-[var(--fb-error)]' :
          severity === 'should-fix' ? 'text-[var(--fb-warning)]' :
          'text-[var(--fb-info)]'
        }`}>
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
  const percentage = required.medium > 0 ? Math.min((extracted / required.medium) * 100, 100) : 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--fb-text-muted)]">
          Detected N: <span className="font-bold text-[var(--fb-text)]">{extracted}</span>
        </span>
        <Badge variant={adequate ? 'success' : 'should-fix'}>
          {adequate ? 'Adequate' : 'May be underpowered'}
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-[var(--fb-text-muted)]">
          <span>Required for medium effect</span>
          <span>n ≈ {required.medium}</span>
        </div>
        <Progress value={percentage} max={100} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center p-2 bg-[var(--fb-surface)] rounded">
          <p className="font-medium text-[var(--fb-text)]">n ≈ {required.large}</p>
          <p className="text-[var(--fb-text-muted)]">Large effect</p>
        </div>
        <div className="text-center p-2 bg-[var(--fb-surface)] rounded">
          <p className="font-medium text-[var(--fb-text)]">n ≈ {required.medium}</p>
          <p className="text-[var(--fb-text-muted)]">Medium effect</p>
        </div>
        <div className="text-center p-2 bg-[var(--fb-surface)] rounded">
          <p className="font-medium text-[var(--fb-text)]">n ≈ {required.small}</p>
          <p className="text-[var(--fb-text-muted)]">Small effect</p>
        </div>
      </div>

      <p className="text-xs text-[var(--fb-text-muted)]">{recommendation}</p>
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
  return (
    <div className="p-2 bg-[var(--fb-surface)] rounded text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-[var(--fb-text)]">
          {effectSize.type}: {effectSize.value.toFixed(3)}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${
          effectSize.magnitude === 'large' ? 'bg-[var(--fb-success)]/20 text-[var(--fb-success)]' :
          effectSize.magnitude === 'medium' ? 'bg-[var(--fb-warning)]/20 text-[var(--fb-warning)]' :
          effectSize.magnitude === 'small' ? 'bg-[var(--fb-info)]/20 text-[var(--fb-info)]' :
          'bg-[var(--fb-surface-hover)] text-[var(--fb-text-muted)]'
        }`}>
          {effectSize.magnitude}
        </span>
      </div>
      <p className="text-xs text-[var(--fb-text-muted)]">{effectSize.interpretation}</p>
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
    <div className="p-2 bg-[var(--fb-surface)] rounded text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-[var(--fb-text)]">{test.test}</span>
        {requirements && (
          <span className="text-xs text-[var(--fb-text-muted)]">
            {requirements.dataType} data
          </span>
        )}
      </div>
      {requirements && (
        <div className="text-xs text-[var(--fb-text-muted)]">
          <span>Requires: {requirements.requiredReporting?.slice(0, 3).join(', ')}</span>
        </div>
      )}
    </div>
  )
}

function IssueItem({ issue }: { issue: Issue }) {
  return (
    <div className="flex items-start gap-2 p-2 bg-[var(--fb-surface)] rounded text-sm">
      <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
        issue.severity === 'must-fix' ? 'bg-[var(--fb-error)]/20 text-[var(--fb-error)]' :
        issue.severity === 'should-fix' ? 'bg-[var(--fb-warning)]/20 text-[var(--fb-warning)]' :
        'bg-[var(--fb-info)]/20 text-[var(--fb-info)]'
      }`}>
        {issue.severity}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[var(--fb-text)]">{issue.description}</p>
        {issue.suggestion && (
          <p className="text-xs text-[var(--fb-text-muted)] mt-1">
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
  return (
    <div className="p-2 bg-[var(--fb-surface)] rounded text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--fb-accent)]/20 text-[var(--fb-accent)]">
          {concern.category}
        </span>
        <span className={`text-xs ${
          concern.severity === 'high' ? 'text-[var(--fb-error)]' :
          concern.severity === 'medium' ? 'text-[var(--fb-warning)]' :
          'text-[var(--fb-text-muted)]'
        }`}>
          {concern.severity}
        </span>
      </div>
      <p className="text-[var(--fb-text)]">{concern.description}</p>
      {concern.suggestion && (
        <p className="text-xs text-[var(--fb-text-muted)] mt-1">
          {concern.suggestion}
        </p>
      )}
    </div>
  )
}
