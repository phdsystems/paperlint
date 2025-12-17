/**
 * Statistics AI Analysis Module
 * Uses LLM analysis to review statistical methodology and reporting
 * Enhanced with config-based knowledge for comprehensive review
 */

import type { Issue } from '../types'
import { config } from '../config'
import { detectStudyType, detectStatisticalTests } from './statistics-calculator'

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export interface StatisticsConcern {
  category: 'test-selection' | 'assumptions' | 'interpretation' | 'reporting' | 'power' | 'study-design'
  severity: 'high' | 'medium' | 'low'
  description: string
  suggestion: string
}

export interface StatisticsAIResult {
  methodologyScore: number // 1-10
  issues: Issue[]
  concerns: StatisticsConcern[]
  recommendations: string[]
  summary: string
  studyTypeAssessment?: {
    detectedType: string
    confidence: number
    checklistResults?: { item: string; status: 'present' | 'missing' | 'unclear' }[]
  }
}

// Build system prompt with config knowledge
function buildSystemPrompt(): string {
  const statsConfig = config.statisticsConfig

  let prompt = `You are an expert statistician reviewing academic papers. Analyze the statistical methodology and reporting in the provided text.

Your task is to identify statistical concerns and provide actionable feedback. Focus on:

1. STUDY DESIGN
   - Is the study design appropriate for the research question?
   - Are key design elements reported (randomization, blinding, controls)?
   - Is the sampling strategy described and appropriate?

2. TEST SELECTION
   - Is the statistical test appropriate for the data type?
   - Is it appropriate for the study design?
   - Are non-parametric alternatives needed?

3. ASSUMPTIONS
   - Are test assumptions mentioned?
   - Are assumption violations addressed?
   - Is there evidence of assumption testing?

4. INTERPRETATION
   - Are results interpreted correctly?
   - Is statistical significance confused with practical significance?
   - Are effect sizes interpreted appropriately?

5. REPORTING
   - Are all required statistics reported?
   - Is the p-value reported correctly (not as 0.000)?
   - Are confidence intervals provided?
   - Is sample size clearly stated?

6. POWER & SAMPLE SIZE
   - Is there evidence of power analysis?
   - Is the sample size justified?
   - Are there concerns about underpowered analyses?
`

  // Add test requirements knowledge
  if (statsConfig?.testRequirements) {
    prompt += `\n## Statistical Test Requirements (Reference)\n`
    for (const [testName, req] of Object.entries(statsConfig.testRequirements)) {
      const r = req as any
      prompt += `\n### ${testName.toUpperCase()}\n`
      prompt += `- Data type: ${r.dataType}\n`
      prompt += `- Assumptions: ${r.assumptions?.join(', ') || 'N/A'}\n`
      prompt += `- Required reporting: ${r.requiredReporting?.join(', ') || 'N/A'}\n`
      if (r.alternativeTests) {
        prompt += `- Alternatives: ${r.alternativeTests.join(', ')}\n`
      }
    }
  }

  // Add effect size interpretation guidelines
  if (statsConfig?.effectSizeThresholds) {
    prompt += `\n## Effect Size Interpretation (Cohen's Conventions)\n`
    for (const [esType, threshold] of Object.entries(statsConfig.effectSizeThresholds)) {
      const t = threshold as any
      prompt += `- ${esType}: small=${t.small}, medium=${t.medium}, large=${t.large} (${t.description})\n`
    }
  }

  // Add sample size requirements
  if (statsConfig?.sampleSizeFormulas) {
    prompt += `\n## Minimum Sample Sizes (80% power, α=0.05)\n`
    for (const [testType, formula] of Object.entries(statsConfig.sampleSizeFormulas)) {
      const f = formula as any
      prompt += `- ${testType}: small effect n≈${f.minimumRecommended.small_effect}, medium n≈${f.minimumRecommended.medium_effect}, large n≈${f.minimumRecommended.large_effect}\n`
    }
  }

  // Add study design checklists
  if (statsConfig?.studyDesignChecklist) {
    prompt += `\n## Study Design Checklists\n`

    if (statsConfig.studyDesignChecklist.experimental) {
      prompt += `\n### Experimental Studies\n`
      for (const item of statsConfig.studyDesignChecklist.experimental) {
        prompt += `- [${item.severity}] ${item.label}\n`
      }
    }

    if (statsConfig.studyDesignChecklist.observational) {
      prompt += `\n### Observational Studies\n`
      for (const item of statsConfig.studyDesignChecklist.observational) {
        prompt += `- [${item.severity}] ${item.label}\n`
      }
    }

    if (statsConfig.studyDesignChecklist.qualitative) {
      prompt += `\n### Qualitative Studies\n`
      for (const item of statsConfig.studyDesignChecklist.qualitative) {
        prompt += `- [${item.severity}] ${item.label}\n`
      }
    }
  }

  prompt += `

## Response Format

Respond in JSON format:
{
  "methodologyScore": number (1-10, overall methodology quality),
  "issues": [
    {
      "id": "unique-id",
      "severity": "must-fix" | "should-fix" | "consider",
      "description": "what is wrong",
      "suggestion": "how to fix it"
    }
  ],
  "concerns": [
    {
      "category": "test-selection" | "assumptions" | "interpretation" | "reporting" | "power" | "study-design",
      "severity": "high" | "medium" | "low",
      "description": "detailed concern",
      "suggestion": "specific recommendation"
    }
  ],
  "recommendations": ["prioritized list of improvements"],
  "summary": "2-3 sentence overall assessment",
  "studyTypeAssessment": {
    "detectedType": "experimental" | "observational" | "qualitative" | "mixed" | "unclear",
    "confidence": number (0-1),
    "checklistResults": [
      { "item": "checklist item description", "status": "present" | "missing" | "unclear" }
    ]
  }
}`

  return prompt
}

function buildAnalysisPrompt(text: string, sectionName?: string, context?: AnalysisContext): string {
  let prompt = `Analyze the statistical methodology and reporting in the following academic text:\n\n`

  if (sectionName) {
    prompt += `This is from the "${sectionName}" section of an academic paper.\n\n`
  }

  // Add detected context if available
  if (context) {
    if (context.studyType) {
      prompt += `Pre-detected study type: ${context.studyType.type} (confidence: ${(context.studyType.confidence * 100).toFixed(0)}%)\n`
    }
    if (context.detectedTests && context.detectedTests.length > 0) {
      prompt += `Detected statistical tests: ${context.detectedTests.map(t => t.test).join(', ')}\n`
    }
    if (context.sampleSize) {
      prompt += `Detected sample size: n=${context.sampleSize}\n`
    }
    prompt += '\n'
  }

  prompt += `--- TEXT TO ANALYZE ---\n${text}\n--- END TEXT ---\n\n`
  prompt += `Provide your analysis in the specified JSON format. Be thorough and specific. Focus on actionable feedback that would improve the statistical rigor of this research.`

  return prompt
}

interface AnalysisContext {
  studyType?: { type: string; confidence: number }
  detectedTests?: { test: string; configKey: string }[]
  sampleSize?: number
}

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'OpenAI API error')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Anthropic API error')
  }

  const data = await response.json()
  return data.content[0].text
}

function parseStatisticsResponse(response: string, sectionId: string): StatisticsAIResult {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    }

    const parsed = JSON.parse(jsonStr)

    return {
      methodologyScore: Math.min(Math.max(parsed.methodologyScore ?? 5, 1), 10),
      issues: (parsed.issues || []).map((issue: any, idx: number) => ({
        id: issue.id || `${sectionId}-stats-ai-${idx}`,
        severity: issue.severity || 'consider',
        description: issue.description || '',
        suggestion: issue.suggestion,
        location: issue.location,
      })),
      concerns: (parsed.concerns || []).map((concern: any) => ({
        category: concern.category || 'reporting',
        severity: concern.severity || 'medium',
        description: concern.description || '',
        suggestion: concern.suggestion || '',
      })),
      recommendations: parsed.recommendations || [],
      summary: parsed.summary || 'Analysis complete.',
      studyTypeAssessment: parsed.studyTypeAssessment ? {
        detectedType: parsed.studyTypeAssessment.detectedType || 'unclear',
        confidence: parsed.studyTypeAssessment.confidence ?? 0,
        checklistResults: parsed.studyTypeAssessment.checklistResults || [],
      } : undefined,
    }
  } catch (e) {
    console.error('Failed to parse statistics AI response:', e)
    return {
      methodologyScore: 5,
      issues: [],
      concerns: [],
      recommendations: [],
      summary: 'Failed to analyze statistics.',
    }
  }
}

export interface StatisticsAnalysisOptions {
  provider: 'openai' | 'anthropic'
  sectionName?: string
  includeContext?: boolean
}

export async function analyzeStatistics(
  text: string,
  options: StatisticsAnalysisOptions
): Promise<StatisticsAIResult> {
  const wordCount = text.trim().split(/\s+/).length
  const minWords = config.externalCheckers?.statisticsAI?.minWords || 100

  if (!text.trim() || wordCount < minWords) {
    return {
      methodologyScore: 5,
      issues: [],
      concerns: [{
        category: 'reporting',
        severity: 'low',
        description: `Text too short for comprehensive statistical review (minimum ${minWords} words)`,
        suggestion: 'Provide more context for accurate statistical analysis.',
      }],
      recommendations: ['Provide more text for comprehensive analysis.'],
      summary: 'Text is too short for reliable statistical methodology review.',
    }
  }

  const sectionId = options.sectionName?.toLowerCase().replace(/\s+/g, '-') || 'unknown'

  // Pre-analyze context if enabled
  let context: AnalysisContext | undefined
  if (options.includeContext !== false) {
    const studyType = detectStudyType(text)
    const detectedTests = detectStatisticalTests(text)

    // Extract sample size from text
    const sampleMatch = text.match(/\bn\s*=\s*(\d+)/i)
    const sampleSize = sampleMatch ? parseInt(sampleMatch[1], 10) : undefined

    context = {
      studyType: { type: studyType.type, confidence: studyType.confidence },
      detectedTests: detectedTests.map(t => ({ test: t.test, configKey: t.configKey })),
      sampleSize,
    }
  }

  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildAnalysisPrompt(text, options.sectionName, context)

  let response: string
  if (options.provider === 'openai') {
    response = await callOpenAI(systemPrompt, userPrompt)
  } else {
    response = await callAnthropic(systemPrompt, userPrompt)
  }

  return parseStatisticsResponse(response, sectionId)
}

export function isStatisticsAIConfigured(): boolean {
  return !!(OPENAI_API_KEY || ANTHROPIC_API_KEY)
}

/**
 * Get available providers based on configured API keys
 */
export function getAvailableProviders(): ('openai' | 'anthropic')[] {
  const providers: ('openai' | 'anthropic')[] = []
  if (ANTHROPIC_API_KEY) providers.push('anthropic')
  if (OPENAI_API_KEY) providers.push('openai')
  return providers
}

/**
 * Get the default provider from config or first available
 */
export function getDefaultProvider(): 'openai' | 'anthropic' {
  const configDefault = config.externalCheckers?.statisticsAI?.defaultProvider
  const available = getAvailableProviders()

  if (configDefault && available.includes(configDefault)) {
    return configDefault
  }

  return available[0] || 'anthropic'
}
