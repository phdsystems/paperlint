/**
 * Statistics Linter
 * Config-driven detection of statistical reporting issues in academic papers
 */

import type { Issue, IssueSeverity } from '../types'
import { config, compilePattern } from '../config'
import type {
  ValidationRule,
  ValidationRuleCondition,
  StudyDesignCheckItem,
  StudyType,
} from '../config/types'
import {
  getPrimarySampleSize,
  assessSampleAdequacy,
  detectStudyType,
  detectStatisticalTests,
  analyzeEffectSizes,
} from './statistics-calculator'

// ============================================================================
// Types
// ============================================================================

export interface StatisticsLintResult {
  issues: Issue[]
  ruleResults: {
    ruleId: string
    ruleName: string
    issueCount: number
  }[]
  stats: {
    pValues: number
    effectSizes: number
    confidenceIntervals: number
    sampleSizes: number
    statisticalTests: number
  }
  studyType: {
    type: StudyType | 'unknown'
    confidence: number
  }
  studyDesignChecklist?: {
    checkItem: string
    label: string
    passed: boolean
    severity: IssueSeverity
  }[]
  sampleAdequacy?: {
    extracted: number
    required: { small: number; medium: number; large: number }
    adequate: boolean
    recommendation: string
  }
}

// ============================================================================
// Pattern Utilities
// ============================================================================

// Cache for compiled patterns
const patternCache = new Map<string, RegExp>()

/**
 * Get a pattern string from config by path (e.g., "pValue.zero")
 */
function getPatternString(patternPath: string): string | null {
  const statsConfig = config.statisticsConfig
  if (!statsConfig?.patterns) return null

  const parts = patternPath.split('.')
  let current: any = statsConfig.patterns

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part]
    } else {
      return null
    }
  }

  return typeof current === 'string' ? current : null
}

/**
 * Compile and cache a pattern from config path or raw regex string
 */
function getCompiledPattern(patternPath: string): RegExp | null {
  if (patternCache.has(patternPath)) {
    return patternCache.get(patternPath)!
  }

  // First try to get from config path
  let patternStr = getPatternString(patternPath)

  // If not found, treat as raw regex
  if (!patternStr) {
    patternStr = patternPath
  }

  try {
    const regex = compilePattern(patternStr, 'gi')
    patternCache.set(patternPath, regex)
    return regex
  } catch {
    return null
  }
}

/**
 * Count pattern matches in text
 */
function countMatches(text: string, pattern: RegExp): number {
  const matches = text.match(pattern)
  return matches ? matches.length : 0
}

/**
 * Find all matches in text
 */
function findMatches(text: string, pattern: RegExp): string[] {
  return text.match(pattern) || []
}

/**
 * Check if text matches any of the given pattern paths
 */
function matchesAny(text: string, patternPaths: string[]): boolean {
  for (const path of patternPaths) {
    const pattern = getCompiledPattern(path)
    if (pattern && countMatches(text, pattern) > 0) {
      return true
    }
  }
  return false
}

/**
 * Check if text is missing all of the given patterns
 */
function missingAll(text: string, patternPaths: string[]): boolean {
  for (const path of patternPaths) {
    const pattern = getCompiledPattern(path)
    if (pattern && countMatches(text, pattern) > 0) {
      return false // Found at least one
    }
  }
  return true // Missing all
}

// ============================================================================
// Rule Evaluation
// ============================================================================

/**
 * Evaluate a validation rule condition
 */
function evaluateCondition(
  condition: ValidationRuleCondition,
  text: string,
  sectionId: string
): { triggered: boolean; matches?: string[] } {
  // Check section restriction
  if (condition.sections && !condition.sections.includes(sectionId)) {
    return { triggered: false }
  }

  // Simple pattern match
  if (condition.matchPattern) {
    const pattern = getCompiledPattern(condition.matchPattern)
    if (pattern) {
      const matches = findMatches(text, pattern)
      if (matches.length > 0) {
        return { triggered: true, matches }
      }
    }
    return { triggered: false }
  }

  // Multiple patterns to match (any triggers)
  if (condition.matchPatterns) {
    for (const patternStr of condition.matchPatterns) {
      const pattern = getCompiledPattern(patternStr)
      if (pattern) {
        const matches = findMatches(text, pattern)
        if (matches.length > 0) {
          return { triggered: true, matches }
        }
      }
    }
    return { triggered: false }
  }

  // Count check (e.g., multiple p-values without correction)
  if (condition.type === 'count-check' && condition.pattern && condition.threshold) {
    const pattern = getCompiledPattern(condition.pattern)
    if (pattern) {
      const count = countMatches(text, pattern)
      if (count >= condition.threshold) {
        // Also check if missing required patterns
        if (condition.missingAllPatterns) {
          if (missingAll(text, condition.missingAllPatterns)) {
            return { triggered: true }
          }
        } else {
          return { triggered: true }
        }
      }
    }
    return { triggered: false }
  }

  // Sample size check (uses calculator)
  if (condition.type === 'sample-size-check') {
    const sampleSize = getPrimarySampleSize(text)
    const tests = detectStatisticalTests(text)

    if (sampleSize && tests.length > 0) {
      const adequacy = assessSampleAdequacy(sampleSize, tests[0].configKey)
      if (!adequacy.adequate) {
        return { triggered: true }
      }
    }
    return { triggered: false }
  }

  // Has any + missing all combination
  if (condition.hasAnyPattern && condition.missingAllPatterns) {
    if (matchesAny(text, condition.hasAnyPattern) && missingAll(text, condition.missingAllPatterns)) {
      return { triggered: true }
    }
    return { triggered: false }
  }

  return { triggered: false }
}

/**
 * Process a validation rule and generate issues
 */
function processRule(
  rule: ValidationRule,
  text: string,
  sectionId: string
): Issue[] {
  const result = evaluateCondition(rule.condition, text, sectionId)

  if (!result.triggered) {
    return []
  }

  // Generate issue(s)
  const issues: Issue[] = []

  if (result.matches && result.matches.length > 0) {
    // Create issue for each match
    result.matches.forEach((match, idx) => {
      issues.push({
        id: `${sectionId}-${rule.id}-${idx}`,
        severity: rule.severity,
        description: rule.description + (match ? `: "${match}"` : ''),
        location: match,
        suggestion: rule.suggestion,
      })
    })
  } else {
    // Single issue
    issues.push({
      id: `${sectionId}-${rule.id}-0`,
      severity: rule.severity,
      description: rule.description,
      suggestion: rule.suggestion,
    })
  }

  return issues
}

// ============================================================================
// Study Design Checklist
// ============================================================================

/**
 * Evaluate study design checklist items
 */
function evaluateStudyDesignChecklist(
  text: string,
  studyType: StudyType
): { checkItem: string; label: string; passed: boolean; severity: IssueSeverity }[] {
  const statsConfig = config.statisticsConfig
  if (!statsConfig?.studyDesignChecklist) return []

  const checklist = statsConfig.studyDesignChecklist[studyType]
  if (!checklist) return []

  return checklist.map((item: StudyDesignCheckItem) => {
    let passed = false

    // Check single pattern
    if (item.patternRef) {
      const pattern = getCompiledPattern(item.patternRef)
      if (pattern && countMatches(text, pattern) > 0) {
        passed = true
      }
    }

    // Check multiple patterns (any match passes)
    if (item.patternRefs) {
      passed = matchesAny(text, item.patternRefs)
    }

    return {
      checkItem: item.id,
      label: item.label,
      passed,
      severity: item.severity,
    }
  })
}

/**
 * Generate issues from failed checklist items
 */
function generateChecklistIssues(
  checklist: { checkItem: string; label: string; passed: boolean; severity: IssueSeverity }[],
  sectionId: string,
  studyType: StudyType
): Issue[] {
  const issues: Issue[] = []

  for (const item of checklist) {
    if (!item.passed) {
      issues.push({
        id: `${sectionId}-checklist-${item.checkItem}`,
        severity: item.severity,
        description: `${studyType.charAt(0).toUpperCase() + studyType.slice(1)} study: ${item.label} not found`,
        suggestion: `Consider addressing: ${item.label}`,
      })
    }
  }

  return issues
}

// ============================================================================
// Statistics Counting
// ============================================================================

/**
 * Count statistical elements in text using config patterns
 */
function countStatisticalElements(text: string): {
  pValues: number
  effectSizes: number
  confidenceIntervals: number
  sampleSizes: number
  statisticalTests: number
} {
  const statsConfig = config.statisticsConfig

  if (!statsConfig?.patterns) {
    return {
      pValues: 0,
      effectSizes: 0,
      confidenceIntervals: 0,
      sampleSizes: 0,
      statisticalTests: 0,
    }
  }

  // Count p-values
  let pValues = 0
  const pPattern = getCompiledPattern('pValue.reported')
  if (pPattern) pValues = countMatches(text, pPattern)

  // Count effect sizes
  let effectSizes = 0
  const effectPatterns = statsConfig.patterns.effectSizes || {}
  for (const key of Object.keys(effectPatterns)) {
    const pattern = getCompiledPattern(`effectSizes.${key}`)
    if (pattern) effectSizes += countMatches(text, pattern)
  }

  // Count confidence intervals
  let confidenceIntervals = 0
  const ciPatterns = statsConfig.patterns.confidenceInterval || {}
  for (const key of Object.keys(ciPatterns)) {
    const pattern = getCompiledPattern(`confidenceInterval.${key}`)
    if (pattern) confidenceIntervals += countMatches(text, pattern)
  }

  // Count sample sizes
  let sampleSizes = 0
  const samplePatterns = statsConfig.patterns.sampleSize || {}
  for (const key of Object.keys(samplePatterns)) {
    const pattern = getCompiledPattern(`sampleSize.${key}`)
    if (pattern) sampleSizes += countMatches(text, pattern)
  }

  // Count statistical tests
  let statisticalTests = 0
  const testPatterns = statsConfig.patterns.tests || {}
  for (const key of Object.keys(testPatterns)) {
    const pattern = getCompiledPattern(`tests.${key}`)
    if (pattern) statisticalTests += countMatches(text, pattern)
  }

  return {
    pValues,
    effectSizes,
    confidenceIntervals,
    sampleSizes,
    statisticalTests,
  }
}

// ============================================================================
// Main Linting Function
// ============================================================================

export function lintStatistics(
  text: string,
  sectionId: string,
  options?: {
    enabledRules?: string[]
    disabledRules?: string[]
    includeChecklist?: boolean
    includeSampleAdequacy?: boolean
  }
): StatisticsLintResult {
  const lintConfig = config.externalCheckers?.statisticsLinter
  const statsConfig = config.statisticsConfig

  // Return empty result if disabled
  if (!lintConfig?.enabled) {
    return {
      issues: [],
      ruleResults: [],
      stats: { pValues: 0, effectSizes: 0, confidenceIntervals: 0, sampleSizes: 0, statisticalTests: 0 },
      studyType: { type: 'unknown', confidence: 0 },
    }
  }

  const allIssues: Issue[] = []
  const ruleResults: StatisticsLintResult['ruleResults'] = []

  // Get enabled/disabled rules
  const enabledRules = options?.enabledRules || lintConfig.enabledRules || []
  const disabledRules = options?.disabledRules || lintConfig.disabledRules || []

  // Get validation rules from config
  const validationRules = statsConfig?.validationRules || []

  // Process each rule
  for (const rule of validationRules) {
    // Skip if rule is disabled or not in enabled list (if specified)
    if (disabledRules.includes(rule.id)) continue
    if (enabledRules.length > 0 && !enabledRules.includes(rule.id)) continue

    const issues = processRule(rule, text, sectionId)
    allIssues.push(...issues)

    ruleResults.push({
      ruleId: rule.id,
      ruleName: rule.name,
      issueCount: issues.length,
    })
  }

  // Detect study type
  const detectedStudyType = detectStudyType(text)

  // Evaluate study design checklist if applicable
  let studyDesignChecklist: StatisticsLintResult['studyDesignChecklist']
  if (
    (options?.includeChecklist !== false) &&
    detectedStudyType.type !== 'unknown' &&
    detectedStudyType.confidence > 0.3 &&
    (sectionId === 'methodology' || sectionId === 'methods')
  ) {
    studyDesignChecklist = evaluateStudyDesignChecklist(text, detectedStudyType.type)

    // Add checklist issues
    const checklistIssues = generateChecklistIssues(studyDesignChecklist, sectionId, detectedStudyType.type)
    allIssues.push(...checklistIssues)
  }

  // Assess sample size adequacy
  let sampleAdequacy: StatisticsLintResult['sampleAdequacy']
  if (options?.includeSampleAdequacy !== false) {
    const primarySample = getPrimarySampleSize(text)
    const tests = detectStatisticalTests(text)

    if (primarySample && tests.length > 0) {
      const adequacyResult = assessSampleAdequacy(primarySample, tests[0].configKey)
      sampleAdequacy = {
        extracted: adequacyResult.extracted,
        required: adequacyResult.required,
        adequate: adequacyResult.adequate,
        recommendation: adequacyResult.recommendation,
      }
    }
  }

  // Count statistical elements
  const stats = countStatisticalElements(text)

  return {
    issues: allIssues,
    ruleResults,
    stats,
    studyType: {
      type: detectedStudyType.type,
      confidence: detectedStudyType.confidence,
    },
    studyDesignChecklist,
    sampleAdequacy,
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get list of available rules with their metadata
 */
export function getStatisticsRules(): { id: string; name: string; description: string; severity: IssueSeverity }[] {
  const statsConfig = config.statisticsConfig
  if (!statsConfig?.validationRules) return []

  return statsConfig.validationRules.map(rule => ({
    id: rule.id,
    name: rule.name,
    description: rule.description,
    severity: rule.severity,
  }))
}

/**
 * Get test requirements for a given test type
 */
export function getTestRequirementsInfo(testKey: string) {
  const statsConfig = config.statisticsConfig
  if (!statsConfig?.testRequirements) return null

  return statsConfig.testRequirements[testKey] || null
}

/**
 * Get effect size threshold info
 */
export function getEffectSizeThresholds() {
  const statsConfig = config.statisticsConfig
  return statsConfig?.effectSizeThresholds || null
}

/**
 * Get sample size formulas
 */
export function getSampleSizeFormulas() {
  const statsConfig = config.statisticsConfig
  return statsConfig?.sampleSizeFormulas || null
}

/**
 * Analyze effect sizes in text with interpretation
 */
export function analyzeEffectSizesInText(text: string) {
  return analyzeEffectSizes(text)
}
