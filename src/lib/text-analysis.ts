import type { Issue, SectionType } from '../types'
import { config, getCompiledPatterns, getContractionPatterns, getCitationPatterns } from '../config'

// Passive voice patterns (not configurable - grammar rules)
const PASSIVE_PATTERNS = [
  /\b(is|are|was|were|been|being)\s+(\w+ed)\b/gi,
  /\b(is|are|was|were|been|being)\s+(\w+en)\b/gi,
]

// First person singular (not configurable - grammar rules)
const FIRST_PERSON_SINGULAR = /\b(I|my|mine|myself)\b/g

export interface TextAnalysisResult {
  wordCount: number
  sentenceCount: number
  avgWordsPerSentence: number
  avgSyllablesPerWord: number
  fleschReadingEase: number
  fleschKincaidGrade: number
  passiveVoiceCount: number
  passiveVoicePercentage: number
  issues: Issue[]
  citationStyle: string | null
  citationCount: number
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (word.length <= 3) return 1

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')

  const syllables = word.match(/[aeiouy]{1,2}/g)
  return syllables ? syllables.length : 1
}

function getWords(text: string): string[] {
  return text.match(/\b[a-zA-Z]+\b/g) || []
}

function getSentences(text: string): string[] {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0)
}

function detectCitationStyle(text: string): { style: string | null; count: number } {
  let maxCount = 0
  let detectedStyle: string | null = null

  const citationPatterns = getCitationPatterns()
  for (const [style, pattern] of Object.entries(citationPatterns)) {
    const matches = text.match(pattern) || []
    if (matches.length > maxCount) {
      maxCount = matches.length
      detectedStyle = style.toUpperCase()
    }
  }

  return { style: detectedStyle, count: maxCount }
}

function findPatternIssues(
  text: string,
  patterns: { pattern: RegExp; suggestion: string }[],
  severity: 'must-fix' | 'should-fix' | 'consider',
  category: string,
  sectionId: string
): Issue[] {
  const issues: Issue[] = []
  let issueIndex = 0

  for (const { pattern, suggestion } of patterns) {
    const matches = text.match(pattern)
    if (matches) {
      for (const match of matches) {
        issues.push({
          id: `${sectionId}-${category}-${issueIndex++}`,
          severity,
          description: `${category}: "${match}" found`,
          location: match,
          suggestion,
        })
      }
    }
  }

  return issues
}

export function analyzeText(
  text: string,
  sectionType: SectionType,
  sectionId: string
): TextAnalysisResult {
  const issues: Issue[] = []
  let issueIndex = 0

  const words = getWords(text)
  const sentences = getSentences(text)
  const wordCount = words.length
  const sentenceCount = sentences.length

  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0

  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0)
  const avgSyllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 0

  // Flesch Reading Ease: 206.835 - 1.015(words/sentences) - 84.6(syllables/words)
  const fleschReadingEase = wordCount > 0 && sentenceCount > 0
    ? Math.max(0, Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord))
    : 0

  // Flesch-Kincaid Grade Level: 0.39(words/sentences) + 11.8(syllables/words) - 15.59
  const fleschKincaidGrade = wordCount > 0 && sentenceCount > 0
    ? Math.max(0, 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59)
    : 0

  // Passive voice detection
  let passiveCount = 0
  for (const pattern of PASSIVE_PATTERNS) {
    const matches = text.match(pattern) || []
    passiveCount += matches.length
  }
  const passivePercentage = sentenceCount > 0 ? (passiveCount / sentenceCount) * 100 : 0

  // Citation detection
  const { style: citationStyle, count: citationCount } = detectCitationStyle(text)

  // Severity shortcuts from config
  const sev = config.patternSeverity

  // Word count validation (from config)
  const limits = config.wordLimits[sectionType]
  if (limits) {
    if (wordCount < limits.min) {
      issues.push({
        id: `${sectionId}-wordcount-${issueIndex++}`,
        severity: sev.wordCountViolation,
        description: `Word count (${wordCount}) below minimum (${limits.min})`,
        suggestion: `Add ${limits.min - wordCount} more words`,
      })
    } else if (wordCount > limits.max) {
      issues.push({
        id: `${sectionId}-wordcount-${issueIndex++}`,
        severity: sev.wordCountViolation,
        description: `Word count (${wordCount}) exceeds maximum (${limits.max})`,
        suggestion: `Remove ${wordCount - limits.max} words`,
      })
    }
  }

  // Informal language (from config)
  const informalPatterns = getCompiledPatterns(config.informalPatterns)
  issues.push(...findPatternIssues(text, informalPatterns, sev.informalLanguage, 'Informal language', sectionId))

  // Contractions (from config)
  const contractionPatterns = getContractionPatterns()
  for (const pattern of contractionPatterns) {
    const matches = text.match(pattern)
    if (matches) {
      for (const match of matches) {
        issues.push({
          id: `${sectionId}-contraction-${issueIndex++}`,
          severity: sev.contractions,
          description: `Contraction "${match}" found`,
          location: match,
          suggestion: 'Expand contractions in academic writing',
        })
      }
    }
  }

  // Weak hedging (from config)
  const weakHedgingPatterns = getCompiledPatterns(config.weakHedging)
  issues.push(...findPatternIssues(text, weakHedgingPatterns, sev.weakHedging, 'Weak hedging', sectionId))

  // Overclaiming (from config)
  const overclaimingPatterns = getCompiledPatterns(config.overclaiming)
  issues.push(...findPatternIssues(text, overclaimingPatterns, sev.overclaiming, 'Overclaiming', sectionId))

  // First person singular
  const firstPersonMatches = text.match(FIRST_PERSON_SINGULAR)
  if (firstPersonMatches && firstPersonMatches.length > 0) {
    issues.push({
      id: `${sectionId}-firstperson-${issueIndex++}`,
      severity: sev.firstPersonSingular,
      description: `First person singular used ${firstPersonMatches.length} times`,
      suggestion: 'Consider using "we" or passive constructions',
    })
  }

  // Passive voice warning (threshold from config)
  if (passivePercentage > config.readability.passiveVoice.warning) {
    issues.push({
      id: `${sectionId}-passive-${issueIndex++}`,
      severity: sev.passiveVoice,
      description: `High passive voice usage (${passivePercentage.toFixed(0)}%)`,
      suggestion: 'Consider converting some sentences to active voice',
    })
  }

  // Readability warning (threshold from config)
  if (fleschReadingEase < config.readability.fleschReadingEase.moderate) {
    issues.push({
      id: `${sectionId}-readability-${issueIndex++}`,
      severity: sev.lowReadability,
      description: `Low readability score (${fleschReadingEase.toFixed(0)})`,
      suggestion: 'Consider simplifying sentence structure',
    })
  }

  // Long sentences (threshold from config)
  if (avgWordsPerSentence > config.readability.sentenceLength.error) {
    issues.push({
      id: `${sectionId}-sentences-${issueIndex++}`,
      severity: sev.longSentences,
      description: `Average sentence length (${avgWordsPerSentence.toFixed(0)} words) is high`,
      suggestion: `Aim for ${config.readability.sentenceLength.warning} words per sentence or less`,
    })
  }

  return {
    wordCount,
    sentenceCount,
    avgWordsPerSentence,
    avgSyllablesPerWord,
    fleschReadingEase,
    fleschKincaidGrade,
    passiveVoiceCount: passiveCount,
    passiveVoicePercentage: passivePercentage,
    issues,
    citationStyle,
    citationCount,
  }
}

// Check abstract-specific requirements (uses config)
export function analyzeAbstract(text: string, sectionId: string): Issue[] {
  const issues: Issue[] = []
  let idx = 0
  const abstractConfig = config.abstractValidation
  const sev = config.patternSeverity

  // Check for citations in abstract
  if (abstractConfig.forbidCitations) {
    const citationPatterns = getCitationPatterns()
    for (const pattern of Object.values(citationPatterns)) {
      if (pattern.test(text)) {
        issues.push({
          id: `${sectionId}-abs-citation-${idx++}`,
          severity: sev.abstractCitations,
          description: 'Citations found in abstract',
          suggestion: 'Remove citations - abstract should be self-contained',
        })
        break
      }
    }
  }

  // Check for undefined abbreviations
  if (abstractConfig.checkUndefinedAbbreviations) {
    const abbreviations = text.match(/\b[A-Z]{2,}\b/g) || []
    const uniqueAbbrevs = [...new Set(abbreviations)]
    for (const abbrev of uniqueAbbrevs) {
      const expandedPattern = new RegExp(`\\(${abbrev}\\)`, 'i')
      if (!expandedPattern.test(text)) {
        issues.push({
          id: `${sectionId}-abs-abbrev-${idx++}`,
          severity: sev.undefinedAbbreviations,
          description: `Abbreviation "${abbrev}" may not be defined`,
          location: abbrev,
          suggestion: 'Define abbreviation on first use or expand fully',
        })
      }
    }
  }

  // Check for quantified results
  if (abstractConfig.requireQuantifiedResults) {
    const quantPattern = new RegExp(abstractConfig.quantifiedResultsPattern, 'i')
    if (!quantPattern.test(text)) {
      issues.push({
        id: `${sectionId}-abs-quant-${idx++}`,
        severity: sev.missingQuantifiedResults,
        description: 'No quantified results found in abstract',
        suggestion: 'Include specific metrics (percentages, improvements, counts)',
      })
    }
  }

  return issues
}

// Check references section (uses config)
export function analyzeReferences(text: string, fullPaperText: string, sectionId: string): Issue[] {
  const issues: Issue[] = []
  let idx = 0
  const refConfig = config.referenceValidation
  const sev = config.patternSeverity

  // Find citation numbers in paper
  const paperCitations = fullPaperText.match(/\[(\d+)\]/g) || []
  const citedNumbers = [...new Set(paperCitations.map(c => parseInt(c.slice(1, -1))))]

  // Find reference numbers in references section
  const refNumbers = text.match(/^\[(\d+)\]/gm) || []
  const definedNumbers = refNumbers.map(r => parseInt(r.slice(1, -1)))

  // Check for orphan references
  if (refConfig.checkOrphanReferences) {
    for (const num of definedNumbers) {
      if (!citedNumbers.includes(num)) {
        issues.push({
          id: `${sectionId}-ref-orphan-${idx++}`,
          severity: sev.orphanReferences,
          description: `Reference [${num}] is defined but never cited`,
          suggestion: 'Remove unused reference or add citation in text',
        })
      }
    }
  }

  // Check for missing references
  if (refConfig.checkMissingReferences) {
    for (const num of citedNumbers) {
      if (!definedNumbers.includes(num)) {
        issues.push({
          id: `${sectionId}-ref-missing-${idx++}`,
          severity: sev.missingReferences,
          description: `Citation [${num}] has no corresponding reference`,
          suggestion: 'Add reference entry or fix citation number',
        })
      }
    }
  }

  // Check for URLs without access dates
  if (refConfig.requireAccessDates) {
    const urlPattern = /https?:\/\/[^\s]+/g
    const urls = text.match(urlPattern) || []
    if (urls.length > 0) {
      const accessDatePattern = new RegExp(refConfig.accessDateKeywords.join('|'), 'i')
      if (!accessDatePattern.test(text)) {
        issues.push({
          id: `${sectionId}-ref-url-${idx++}`,
          severity: sev.orphanReferences, // reuse for URL issues
          description: `${urls.length} URL(s) found without access dates`,
          suggestion: 'Add "Accessed: [date]" for web references',
        })
      }
    }
  }

  return issues
}

// Export config for use by other modules
export { config }
