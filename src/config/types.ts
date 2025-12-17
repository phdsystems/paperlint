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

export interface StatisticsLinterConfig {
  enabled: boolean
  enabledRules: string[]
  disabledRules: string[]
}

export interface StatisticsAIConfig {
  enabled: boolean
  defaultProvider: 'openai' | 'anthropic'
  minWords: number
}

// Statistics configuration types
export type StudyType = 'experimental' | 'observational' | 'qualitative'

export interface StatisticsPatterns {
  pValue: Record<string, string>
  effectSizes: Record<string, string>
  sampleSize: Record<string, string>
  confidenceInterval: Record<string, string>
  tests: Record<string, string>
  testStatistics: Record<string, string>
  assumptions: Record<string, string>
  corrections: Record<string, string>
  powerAnalysis: Record<string, string>
  studyDesign: Record<string, string>
  qualitative: Record<string, string>
  robustness: Record<string, string>
}

export interface TestRequirement {
  dataType: string
  assumptions: string[]
  requiredReporting: string[]
  appropriateFor?: string[]
  notAppropriateFor?: string[]
  alternativeTests?: string[]
  postHoc?: string[]
  diagnostics?: string[]
}

export interface EffectSizeThreshold {
  small: number
  medium: number
  large: number
  description: string
}

export interface SampleSizeFormula {
  formula: string
  description: string
  parameters?: Record<string, number>
  minimumRecommended: {
    small_effect: number
    medium_effect: number
    large_effect: number
  }
}

export interface StudyDesignCheckItem {
  id: string
  label: string
  patternRef?: string
  patternRefs?: string[]
  severity: IssueSeverity
}

export interface ValidationRuleCondition {
  matchPattern?: string
  matchPatterns?: string[]
  hasAnyPattern?: string[]
  missingAllPatterns?: string[]
  type?: 'count-check' | 'sample-size-check'
  pattern?: string
  threshold?: number
  sections?: string[]
}

export interface ValidationRule {
  id: string
  name: string
  description: string
  severity: IssueSeverity
  condition: ValidationRuleCondition
  suggestion: string
}

export interface StatisticsConfig {
  patterns: StatisticsPatterns
  studyTypeDetection: Record<StudyType, string[]>
  testRequirements: Record<string, TestRequirement>
  effectSizeThresholds: Record<string, EffectSizeThreshold>
  sampleSizeFormulas: Record<string, SampleSizeFormula>
  studyDesignChecklist: Record<StudyType, StudyDesignCheckItem[]>
  validationRules: ValidationRule[]
}

export interface ExternalCheckersConfig {
  languageTool: LanguageToolConfig
  academicLinter: AcademicLinterConfig
  aiDetection?: AIDetectionConfig
  statisticsLinter?: StatisticsLinterConfig
  statisticsAI?: StatisticsAIConfig
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
  // Statistics-related categories
  | 'pValueZero'
  | 'exactPThreshold'
  | 'missingEffectSize'
  | 'missingCI'
  | 'missingSampleSize'
  | 'multipleComparisons'
  | 'significanceOnly'
  | 'missingPowerAnalysis'
  | 'missingAssumptions'
  | 'vagueSample'

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
  statisticsConfig?: StatisticsConfig
}
