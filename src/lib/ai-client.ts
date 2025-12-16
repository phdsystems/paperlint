import type { Issue, AIAnalysisResult, SectionType } from '../types'
import { sectionChecklists } from './checklist-data'

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

interface AnalysisOptions {
  provider: 'openai' | 'anthropic'
  sectionType: SectionType
  sectionContent: string
  fullPaperContent?: string
}

const SYSTEM_PROMPT = `You are an expert academic paper reviewer specializing in computer science and software engineering papers. Your task is to analyze paper sections against academic writing standards and provide constructive feedback.

When analyzing a section:
1. Evaluate against the provided checklist criteria
2. Identify specific issues with severity levels (must-fix, should-fix, consider)
3. Provide actionable suggestions for improvement
4. Be specific with line references or quotes when possible

Respond in JSON format with the following structure:
{
  "issues": [
    {
      "severity": "must-fix" | "should-fix" | "consider",
      "description": "Clear description of the issue",
      "location": "Quote or reference to the problematic text",
      "suggestion": "Specific fix or improvement"
    }
  ],
  "checklistResults": [
    { "itemId": "string", "passes": boolean, "reason": "brief explanation" }
  ],
  "score": number (1-10),
  "suggestions": ["general improvement suggestions"]
}`

function buildSectionPrompt(sectionType: SectionType, content: string): string {
  const checklist = sectionChecklists[sectionType]
  const checklistText = checklist.map(item => `- ${item.id}: ${item.label}`).join('\n')

  return `Analyze the following ${sectionType.toUpperCase()} section of an academic paper.

## Checklist Criteria:
${checklistText}

## Section Content:
${content}

Provide your analysis in the specified JSON format.`
}

async function callOpenAI(prompt: string): Promise<string> {
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
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
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

async function callAnthropic(prompt: string): Promise<string> {
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
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Anthropic API error')
  }

  const data = await response.json()
  return data.content[0].text
}

function parseAnalysisResponse(
  response: string,
  sectionId: string
): AIAnalysisResult {
  try {
    const parsed = JSON.parse(response)

    const issues: Issue[] = (parsed.issues || []).map((issue: any, index: number) => ({
      id: `${sectionId}-issue-${index}`,
      severity: issue.severity || 'consider',
      description: issue.description || '',
      location: issue.location,
      suggestion: issue.suggestion,
    }))

    const checklistUpdates = (parsed.checklistResults || []).map((result: any) => ({
      itemId: result.itemId,
      suggested: result.passes,
    }))

    return {
      sectionId,
      issues,
      suggestions: parsed.suggestions || [],
      checklistUpdates,
      score: Math.min(Math.max(parsed.score || 5, 1), 10),
    }
  } catch (e) {
    console.error('Failed to parse AI response:', e)
    return {
      sectionId,
      issues: [],
      suggestions: [],
      checklistUpdates: [],
      score: 5,
    }
  }
}

export async function analyzeSection(options: AnalysisOptions): Promise<AIAnalysisResult> {
  const { provider, sectionType, sectionContent } = options

  if (!sectionContent.trim()) {
    return {
      sectionId: sectionType,
      issues: [],
      suggestions: [],
      checklistUpdates: [],
      score: 0,
    }
  }

  const prompt = buildSectionPrompt(sectionType, sectionContent)

  let response: string
  if (provider === 'openai') {
    response = await callOpenAI(prompt)
  } else {
    response = await callAnthropic(prompt)
  }

  return parseAnalysisResponse(response, sectionType)
}

export function isAIConfigured(): { openai: boolean; anthropic: boolean } {
  return {
    openai: !!OPENAI_API_KEY,
    anthropic: !!ANTHROPIC_API_KEY,
  }
}
