import type { Issue } from '../types'
import { config } from '../config'

export interface LanguageToolMatch {
  message: string
  shortMessage: string
  offset: number
  length: number
  replacements: { value: string }[]
  rule: {
    id: string
    description: string
    category: {
      id: string
      name: string
    }
  }
  context: {
    text: string
    offset: number
    length: number
  }
}

export interface LanguageToolResponse {
  software: {
    name: string
    version: string
  }
  language: {
    name: string
    code: string
  }
  matches: LanguageToolMatch[]
}

// Map LanguageTool categories to our severity levels
function mapCategoryToSeverity(categoryId: string): 'must-fix' | 'should-fix' | 'consider' {
  const severityMap: Record<string, 'must-fix' | 'should-fix' | 'consider'> = {
    // Grammar errors - should fix
    'GRAMMAR': 'should-fix',
    'TYPOS': 'should-fix',
    'PUNCTUATION': 'should-fix',
    'SPELLING': 'should-fix',

    // Style suggestions - consider
    'STYLE': 'consider',
    'REDUNDANCY': 'consider',
    'CASING': 'consider',
    'COMPOUNDING': 'consider',
    'COLLOCATIONS': 'consider',
    'CONFUSED_WORDS': 'should-fix',
    'REPETITIONS': 'consider',
    'SEMANTICS': 'consider',

    // Academic-specific
    'ACADEMIC': 'should-fix',
    'PLAIN_ENGLISH': 'consider',
  }

  return severityMap[categoryId] || 'consider'
}

export async function checkWithLanguageTool(
  text: string,
  sectionId: string,
  options?: {
    language?: string
    apiUrl?: string
  }
): Promise<Issue[]> {
  const ltConfig = config.externalCheckers?.languageTool

  if (!ltConfig?.enabled) {
    return []
  }

  const apiUrl = options?.apiUrl || ltConfig.apiUrl || 'https://api.languagetool.org/v2/check'
  const language = options?.language || ltConfig.language || 'en-US'

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text,
        language,
        enabledOnly: 'false',
      }),
    })

    if (!response.ok) {
      console.error('LanguageTool API error:', response.status)
      return []
    }

    const data: LanguageToolResponse = await response.json()

    return data.matches.map((match, index) => ({
      id: `${sectionId}-lt-${index}`,
      severity: mapCategoryToSeverity(match.rule.category.id),
      description: `${match.rule.category.name}: ${match.message}`,
      location: match.context.text.substring(
        match.context.offset,
        match.context.offset + match.context.length
      ),
      suggestion: match.replacements.length > 0
        ? `Consider: ${match.replacements.slice(0, 3).map(r => `"${r.value}"`).join(', ')}`
        : match.rule.description,
    }))
  } catch (error) {
    console.error('LanguageTool check failed:', error)
    return []
  }
}

// Check if LanguageTool is available
export async function isLanguageToolAvailable(): Promise<boolean> {
  const ltConfig = config.externalCheckers?.languageTool

  if (!ltConfig?.enabled) {
    return false
  }

  try {
    const response = await fetch(ltConfig.apiUrl || 'https://api.languagetool.org/v2/languages', {
      method: 'GET',
    })
    return response.ok
  } catch {
    return false
  }
}
