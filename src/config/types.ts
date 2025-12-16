import type { SectionType, IssueSeverity } from '../types'

export interface WordLimit {
  min: number
  max: number
}

export interface PatternConfig {
  pattern: string
  suggestion: string
}

export interface ReadabilityConfig {
  fleschReadingEase: {
    easy: number
    moderate: number
  }
  sentenceLength: {
    warning: number
    error: number
  }
  passiveVoice: {
    warning: number
  }
}

export interface SeverityConfig {
  label: string
  color: string
  weight: number
}

export interface AbstractValidationConfig {
  requireQuantifiedResults: boolean
  quantifiedResultsPattern: string
  forbidCitations: boolean
  checkUndefinedAbbreviations: boolean
}

export interface ReferenceValidationConfig {
  checkOrphanReferences: boolean
  checkMissingReferences: boolean
  requireAccessDates: boolean
  accessDateKeywords: string[]
}

export interface LanguageToolConfig {
  enabled: boolean
  apiUrl: string
  language: string
  enabledCategories: string[]
  disabledCategories: string[]
}

export interface AcademicLinterConfig {
  enabled: boolean
  enabledRules: string[]
  disabledRules: string[]
}

export interface AIDetectionConfig {
  enabled: boolean
  defaultProvider: 'openai' | 'anthropic'
  minWords: number
  thresholds: {
    likelyAI: number
    possiblyAI: number
    likelyHuman: number
    minConfidence: number
  }
}

export interface ExternalCheckersConfig {
  languageTool: LanguageToolConfig
  academicLinter: AcademicLinterConfig
  aiDetection?: AIDetectionConfig
}

export type PatternCategory =
  | 'contractions'
  | 'informalLanguage'
  | 'overclaiming'
  | 'weakHedging'
  | 'firstPersonSingular'
  | 'passiveVoice'
  | 'lowReadability'
  | 'longSentences'
  | 'wordCountViolation'
  | 'abstractCitations'
  | 'undefinedAbbreviations'
  | 'missingQuantifiedResults'
  | 'orphanReferences'
  | 'missingReferences'

export interface AnalysisConfig {
  wordLimits: Partial<Record<SectionType, WordLimit>>
  readability: ReadabilityConfig
  scoring: {
    sectionWeights: Partial<Record<SectionType, number>>
  }
  severity: Record<'mustFix' | 'shouldFix' | 'consider', SeverityConfig>
  grades: Record<string, number>
  patternSeverity: Record<PatternCategory, IssueSeverity>
  informalPatterns: PatternConfig[]
  contractions: string[]
  weakHedging: PatternConfig[]
  overclaiming: PatternConfig[]
  citationPatterns: Record<string, string>
  abstractValidation: AbstractValidationConfig
  referenceValidation: ReferenceValidationConfig
  externalCheckers?: ExternalCheckersConfig
}
