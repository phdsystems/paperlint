import { useState, useCallback } from 'react'
import { detectAIContent, getDetectionLabel, isDetectionConfigured, AIDetectionResult } from '../lib/ai-detection'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'

interface AIDetectionProps {
  text: string
  sectionName?: string
}

export function AIDetection({ text, sectionName }: AIDetectionProps) {
  const [result, setResult] = useState<AIDetectionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('anthropic')

  const configured = isDetectionConfigured()

  const runDetection = useCallback(async () => {
    if (!text.trim()) return

    setLoading(true)
    setError(null)

    try {
      const detectionResult = await detectAIContent(text, {
        provider,
        context: sectionName ? `This is the ${sectionName} section of an academic paper` : undefined,
      })
      setResult(detectionResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Detection failed')
    } finally {
      setLoading(false)
    }
  }, [text, provider, sectionName])

  if (!configured) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg
              className="w-8 h-8 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm font-medium">AI Detection Not Configured</p>
            <p className="text-xs mt-1">Add VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY to enable</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const wordCount = text.trim().split(/\s+/).length

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              AI Content Detection
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'openai' | 'anthropic')}
              className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              disabled={loading}
            >
              <option value="anthropic">Claude</option>
              <option value="openai">GPT-4</option>
            </select>
            <Button
              size="sm"
              variant="secondary"
              onClick={runDetection}
              disabled={loading || wordCount < 50}
            >
              {loading ? 'Analyzing...' : 'Detect AI'}
            </Button>
          </div>
        </div>

        {wordCount < 50 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Minimum 50 words required ({wordCount} current)
          </p>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg mb-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Main Result */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <ResultBadge result={result} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Confidence: {result.confidence}%
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Human</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {result.humanScore}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">AI</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {result.aiScore}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Human</span>
                <span>AI</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${result.humanScore}%` }}
                />
                <div
                  className="bg-red-500 transition-all duration-500"
                  style={{ width: `${result.aiScore}%` }}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">{result.summary}</p>
            </div>

            {/* Indicators */}
            {result.indicators.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Detection Indicators
                </h5>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {result.indicators.map((indicator, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
                    >
                      <IndicatorIcon type={indicator.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded capitalize">
                            {indicator.category}
                          </span>
                          <span className={`text-xs ${
                            indicator.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                            indicator.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-gray-500 dark:text-gray-400'
                          }`}>
                            {indicator.severity}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                          {indicator.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && result.isLikelyAI && (
              <div>
                <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Recommendations
                </h5>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!result && !loading && wordCount >= 50 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Click "Detect AI" to analyze this section for AI-generated content
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function ResultBadge({ result }: { result: AIDetectionResult }) {
  const { label, color, description } = getDetectionLabel(result)

  const colorClasses = {
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${colorClasses[color as keyof typeof colorClasses]}`}
      title={description}
    >
      {label}
    </span>
  )
}

function IndicatorIcon({ type }: { type: 'positive' | 'negative' | 'neutral' }) {
  if (type === 'positive') {
    return (
      <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  }

  if (type === 'negative') {
    return (
      <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  }

  return (
    <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  )
}
