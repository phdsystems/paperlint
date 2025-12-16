/**
 * AI Content Detection Module
 * Uses LLM analysis to detect potentially AI-generated academic text
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export interface AIDetectionResult {
  isLikelyAI: boolean
  confidence: number // 0-100
  humanScore: number // 0-100
  aiScore: number // 0-100
  indicators: AIIndicator[]
  summary: string
  recommendations: string[]
}

export interface AIIndicator {
  type: 'positive' | 'negative' | 'neutral'
  category: string
  description: string
  severity: 'high' | 'medium' | 'low'
}

const DETECTION_SYSTEM_PROMPT = `You are an expert at detecting AI-generated academic text. Analyze the provided text for signs of AI generation vs human authorship.

Consider these indicators:

AI-GENERATED PATTERNS:
- Unnaturally consistent sentence structure and length
- Overuse of transitional phrases ("Furthermore", "Moreover", "It is important to note")
- Generic hedging language without specific claims
- Lack of personal voice or unique perspective
- Perfect grammar with no colloquialisms
- Repetitive paragraph structures
- Vague generalizations without concrete examples
- Overly balanced "on one hand... on the other hand" constructions
- Absence of domain-specific jargon misuse (humans sometimes misuse terms)
- Too-perfect topic sentences for each paragraph

HUMAN-WRITTEN PATTERNS:
- Varying sentence complexity and occasional awkwardness
- Personal anecdotes or unique examples
- Occasional grammatical quirks or stylistic choices
- Domain expertise with specific technical details
- Inconsistent formatting or structure
- Strong opinions or assertions
- References to specific experiences or observations
- Natural flow with occasional tangents
- Idiosyncratic word choices

Respond in JSON format:
{
  "isLikelyAI": boolean,
  "confidence": number (0-100, how confident you are in your assessment),
  "humanScore": number (0-100, likelihood of human authorship),
  "aiScore": number (0-100, likelihood of AI generation),
  "indicators": [
    {
      "type": "positive" | "negative" | "neutral",
      "category": "structure" | "vocabulary" | "style" | "content" | "consistency",
      "description": "specific observation",
      "severity": "high" | "medium" | "low"
    }
  ],
  "summary": "2-3 sentence overall assessment",
  "recommendations": ["actionable suggestions if AI-detected"]
}`

function buildDetectionPrompt(text: string, context?: string): string {
  let prompt = `Analyze the following academic text for signs of AI generation:\n\n`

  if (context) {
    prompt += `Context: ${context}\n\n`
  }

  prompt += `--- TEXT TO ANALYZE ---\n${text}\n--- END TEXT ---\n\n`
  prompt += `Provide your analysis in the specified JSON format. Be thorough but fair - not all polished writing is AI-generated.`

  return prompt
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
        { role: 'system', content: DETECTION_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2, // Lower temperature for more consistent detection
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
      max_tokens: 2048,
      system: DETECTION_SYSTEM_PROMPT,
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

function parseDetectionResponse(response: string): AIDetectionResult {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    }

    const parsed = JSON.parse(jsonStr)

    return {
      isLikelyAI: parsed.isLikelyAI ?? false,
      confidence: Math.min(Math.max(parsed.confidence ?? 50, 0), 100),
      humanScore: Math.min(Math.max(parsed.humanScore ?? 50, 0), 100),
      aiScore: Math.min(Math.max(parsed.aiScore ?? 50, 0), 100),
      indicators: (parsed.indicators || []).map((ind: any) => ({
        type: ind.type || 'neutral',
        category: ind.category || 'style',
        description: ind.description || '',
        severity: ind.severity || 'medium',
      })),
      summary: parsed.summary || 'Analysis complete.',
      recommendations: parsed.recommendations || [],
    }
  } catch (e) {
    console.error('Failed to parse AI detection response:', e)
    return {
      isLikelyAI: false,
      confidence: 0,
      humanScore: 50,
      aiScore: 50,
      indicators: [],
      summary: 'Failed to analyze text.',
      recommendations: [],
    }
  }
}

export interface DetectionOptions {
  provider: 'openai' | 'anthropic'
  context?: string // e.g., "This is an abstract from a computer science paper"
}

export async function detectAIContent(
  text: string,
  options: DetectionOptions
): Promise<AIDetectionResult> {
  if (!text.trim() || text.split(/\s+/).length < 50) {
    return {
      isLikelyAI: false,
      confidence: 0,
      humanScore: 50,
      aiScore: 50,
      indicators: [{
        type: 'neutral',
        category: 'content',
        description: 'Text too short for reliable analysis (minimum 50 words)',
        severity: 'low',
      }],
      summary: 'Text is too short for reliable AI detection analysis.',
      recommendations: ['Provide more text for accurate detection.'],
    }
  }

  const prompt = buildDetectionPrompt(text, options.context)

  let response: string
  if (options.provider === 'openai') {
    response = await callOpenAI(prompt)
  } else {
    response = await callAnthropic(prompt)
  }

  return parseDetectionResponse(response)
}

export function getDetectionLabel(result: AIDetectionResult): {
  label: string
  color: string
  description: string
} {
  if (result.confidence < 30) {
    return {
      label: 'Inconclusive',
      color: 'gray',
      description: 'Not enough confidence to determine authorship',
    }
  }

  if (result.aiScore >= 80) {
    return {
      label: 'Likely AI',
      color: 'red',
      description: 'Strong indicators of AI-generated content',
    }
  }

  if (result.aiScore >= 60) {
    return {
      label: 'Possibly AI',
      color: 'yellow',
      description: 'Some indicators of AI-generated content',
    }
  }

  if (result.humanScore >= 80) {
    return {
      label: 'Likely Human',
      color: 'green',
      description: 'Strong indicators of human authorship',
    }
  }

  return {
    label: 'Mixed',
    color: 'blue',
    description: 'Mixed indicators - may be human-edited AI or AI-assisted',
  }
}

export function isDetectionConfigured(): boolean {
  return !!(OPENAI_API_KEY || ANTHROPIC_API_KEY)
}
