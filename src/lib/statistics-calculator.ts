/**
 * Statistics Calculator Module
 * Active calculations for sample size adequacy and effect size interpretation
 */

import { config, compilePattern } from '../config'
import type { StudyType } from '../config/types'

// ============================================================================
// Types
// ============================================================================

export interface ExtractedSampleSize {
  value: number
  context: string
  pattern: string
}

export interface ExtractedEffectSize {
  type: string
  value: number
  context: string
}

export interface EffectSizeInterpretation {
  magnitude: 'negligible' | 'small' | 'medium' | 'large'
  interpretation: string
  percentile?: string
}

export interface SampleAdequacyResult {
  adequate: boolean
  extracted: number
  required: {
    small: number
    medium: number
    large: number
  }
  recommendation: string
  testType: string
}

export interface DetectedStudyType {
  type: StudyType | 'unknown'
  confidence: number
  matchedPatterns: string[]
}

export interface DetectedStatisticalTest {
  test: string
  configKey: string
  context: string
}

// ============================================================================
// Pattern Helpers
// ============================================================================

function compilePatternSafe(pattern: string): RegExp | null {
  try {
    return compilePattern(pattern, 'gi')
  } catch {
    return null
  }
}

// ============================================================================
// Sample Size Extraction
// ============================================================================

/**
 * Extract sample sizes from text using config patterns
 */
export function extractSampleSizes(text: string): ExtractedSampleSize[] {
  const results: ExtractedSampleSize[] = []
  const statsConfig = config.statisticsConfig
  if (!statsConfig) return results

  const samplePatterns = statsConfig.patterns.sampleSize
  if (!samplePatterns) return results

  for (const [patternName, patternStr] of Object.entries(samplePatterns)) {
    const regex = compilePatternSafe(patternStr)
    if (!regex) continue

    const matches = text.matchAll(new RegExp(patternStr, 'gi'))
    for (const match of matches) {
      // Extract number from match
      const numMatch = match[0].match(/\d+/)
      if (numMatch) {
        const value = parseInt(numMatch[0], 10)
        if (value > 0 && value < 100000) { // Reasonable range
          results.push({
            value,
            context: match[0],
            pattern: patternName,
          })
        }
      }
    }
  }

  // Deduplicate by value
  const seen = new Set<number>()
  return results.filter(r => {
    if (seen.has(r.value)) return false
    seen.add(r.value)
    return true
  })
}

/**
 * Get the primary sample size (largest extracted value)
 */
export function getPrimarySampleSize(text: string): number | null {
  const sizes = extractSampleSizes(text)
  if (sizes.length === 0) return null
  return Math.max(...sizes.map(s => s.value))
}

// ============================================================================
// Sample Size Calculations
// ============================================================================

/**
 * Compute required sample size for a given test type and effect size
 */
export function computeRequiredN(
  testType: string,
  effectSize: 'small' | 'medium' | 'large' = 'medium',
  _power: number = 0.8,
  _alpha: number = 0.05
): number | null {
  const statsConfig = config.statisticsConfig
  if (!statsConfig) return null

  const formulas = statsConfig.sampleSizeFormulas
  if (!formulas) return null

  // Map test type to formula key
  const testToFormula: Record<string, string> = {
    't-test': 'twoGroupComparison',
    'tTest': 'twoGroupComparison',
    'paired t-test': 'pairedComparison',
    'correlation': 'correlation',
    'chi-square': 'chiSquare',
    'chiSquare': 'chiSquare',
    'anova': 'oneWayAnova',
    'ANOVA': 'oneWayAnova',
    'regression': 'regression',
  }

  const formulaKey = testToFormula[testType] || testType
  const formula = formulas[formulaKey]
  if (!formula) return null

  const effectKey = `${effectSize}_effect` as keyof typeof formula.minimumRecommended
  return formula.minimumRecommended[effectKey] ?? null
}

/**
 * Get all sample size requirements for a test type
 */
export function getSampleSizeRequirements(testType: string): {
  small: number
  medium: number
  large: number
  formula: string
  description: string
} | null {
  const statsConfig = config.statisticsConfig
  if (!statsConfig) return null

  const formulas = statsConfig.sampleSizeFormulas
  if (!formulas) return null

  const testToFormula: Record<string, string> = {
    't-test': 'twoGroupComparison',
    'tTest': 'twoGroupComparison',
    'paired t-test': 'pairedComparison',
    'correlation': 'correlation',
    'chi-square': 'chiSquare',
    'chiSquare': 'chiSquare',
    'anova': 'oneWayAnova',
    'ANOVA': 'oneWayAnova',
    'regression': 'regression',
  }

  const formulaKey = testToFormula[testType] || testType
  const formula = formulas[formulaKey]
  if (!formula) return null

  return {
    small: formula.minimumRecommended.small_effect,
    medium: formula.minimumRecommended.medium_effect,
    large: formula.minimumRecommended.large_effect,
    formula: formula.formula,
    description: formula.description,
  }
}

/**
 * Assess whether extracted sample size is adequate for detected test
 */
export function assessSampleAdequacy(
  extractedN: number,
  testType: string
): SampleAdequacyResult {
  const requirements = getSampleSizeRequirements(testType)

  if (!requirements) {
    return {
      adequate: true, // Can't assess
      extracted: extractedN,
      required: { small: 0, medium: 0, large: 0 },
      recommendation: 'Unable to determine sample size requirements for this test type.',
      testType,
    }
  }

  const { small, medium, large } = requirements

  let adequate = true
  let recommendation = ''

  if (extractedN < large) {
    adequate = false
    recommendation = `Sample size (n=${extractedN}) may only detect large effects. For medium effects, need n≈${medium}; for small effects, need n≈${small}.`
  } else if (extractedN < medium) {
    adequate = true // Marginal
    recommendation = `Sample size (n=${extractedN}) adequate for large effects only. For medium effects, consider n≈${medium}.`
  } else if (extractedN < small) {
    adequate = true
    recommendation = `Sample size (n=${extractedN}) adequate for medium effects. For small effects, need n≈${small}.`
  } else {
    adequate = true
    recommendation = `Sample size (n=${extractedN}) adequate for detecting small effects.`
  }

  return {
    adequate,
    extracted: extractedN,
    required: { small, medium, large },
    recommendation,
    testType,
  }
}

// ============================================================================
// Effect Size Extraction and Interpretation
// ============================================================================

/**
 * Extract effect sizes from text
 */
export function extractEffectSizes(text: string): ExtractedEffectSize[] {
  const results: ExtractedEffectSize[] = []
  const statsConfig = config.statisticsConfig
  if (!statsConfig) return results

  const effectPatterns = statsConfig.patterns.effectSizes
  if (!effectPatterns) return results

  const typeMapping: Record<string, string> = {
    cohensD: 'cohensD',
    correlationR: 'correlationR',
    etaSquared: 'etaSquared',
    partialEtaSquared: 'etaSquared',
    omegaSquared: 'omegaSquared',
    cramersV: 'cramersV',
    phi: 'cramersV',
    oddsRatio: 'oddsRatio',
    rSquared: 'rSquared',
  }

  for (const [patternName, patternStr] of Object.entries(effectPatterns)) {
    const matches = text.matchAll(new RegExp(patternStr, 'gi'))
    for (const match of matches) {
      // Extract numeric value
      const numMatch = match[0].match(/-?0?\.\d+|\d+\.?\d*/)
      if (numMatch) {
        const value = parseFloat(numMatch[0])
        if (!isNaN(value)) {
          results.push({
            type: typeMapping[patternName] || patternName,
            value: Math.abs(value), // Use absolute for interpretation
            context: match[0],
          })
        }
      }
    }
  }

  return results
}

/**
 * Interpret an effect size value
 */
export function interpretEffectSize(
  value: number,
  type: string
): EffectSizeInterpretation {
  const statsConfig = config.statisticsConfig
  if (!statsConfig) {
    return {
      magnitude: 'medium',
      interpretation: 'Unable to interpret effect size.',
    }
  }

  const thresholds = statsConfig.effectSizeThresholds
  if (!thresholds || !thresholds[type]) {
    return {
      magnitude: 'medium',
      interpretation: `Effect size of ${value} for ${type} (thresholds not configured).`,
    }
  }

  const threshold = thresholds[type]
  const absValue = Math.abs(value)

  let magnitude: 'negligible' | 'small' | 'medium' | 'large'
  let percentile: string | undefined

  // Special handling for odds ratio (distance from 1.0)
  if (type === 'oddsRatio') {
    const distance = Math.max(value, 1 / value) // Handle OR < 1
    if (distance < threshold.small) {
      magnitude = 'negligible'
    } else if (distance < threshold.medium) {
      magnitude = 'small'
    } else if (distance < threshold.large) {
      magnitude = 'medium'
    } else {
      magnitude = 'large'
    }
  } else {
    // Standard comparison
    if (absValue < threshold.small) {
      magnitude = 'negligible'
    } else if (absValue < threshold.medium) {
      magnitude = 'small'
    } else if (absValue < threshold.large) {
      magnitude = 'medium'
    } else {
      magnitude = 'large'
    }
  }

  // Generate interpretation
  const interpretations: Record<string, Record<string, string>> = {
    cohensD: {
      negligible: 'The standardized mean difference is negligible (< 0.2 SD).',
      small: 'The standardized mean difference is small (~0.2 SD).',
      medium: 'The standardized mean difference is medium (~0.5 SD).',
      large: 'The standardized mean difference is large (≥ 0.8 SD).',
    },
    correlationR: {
      negligible: 'The correlation is negligible (< 0.1).',
      small: 'The correlation is weak (~0.1-0.3).',
      medium: 'The correlation is moderate (~0.3-0.5).',
      large: 'The correlation is strong (≥ 0.5).',
    },
    etaSquared: {
      negligible: 'Less than 1% of variance explained.',
      small: 'About 1-6% of variance explained.',
      medium: 'About 6-14% of variance explained.',
      large: 'More than 14% of variance explained.',
    },
    rSquared: {
      negligible: 'Less than 2% of variance explained by the model.',
      small: 'About 2-13% of variance explained.',
      medium: 'About 13-26% of variance explained.',
      large: 'More than 26% of variance explained.',
    },
    cramersV: {
      negligible: 'The association is negligible.',
      small: 'The association is weak.',
      medium: 'The association is moderate.',
      large: 'The association is strong.',
    },
    oddsRatio: {
      negligible: 'The odds ratio indicates negligible association.',
      small: 'The odds ratio indicates a small effect.',
      medium: 'The odds ratio indicates a medium effect.',
      large: 'The odds ratio indicates a large effect.',
    },
  }

  const typeInterpretations = interpretations[type] || {
    negligible: `Negligible ${type} effect.`,
    small: `Small ${type} effect.`,
    medium: `Medium ${type} effect.`,
    large: `Large ${type} effect.`,
  }

  return {
    magnitude,
    interpretation: typeInterpretations[magnitude],
    percentile,
  }
}

/**
 * Analyze all effect sizes in text with interpretations
 */
export function analyzeEffectSizes(text: string): Array<ExtractedEffectSize & EffectSizeInterpretation> {
  const extracted = extractEffectSizes(text)
  return extracted.map(es => ({
    ...es,
    ...interpretEffectSize(es.value, es.type),
  }))
}

// ============================================================================
// Study Type Detection
// ============================================================================

/**
 * Detect study type from text
 */
export function detectStudyType(text: string): DetectedStudyType {
  const statsConfig = config.statisticsConfig
  if (!statsConfig || !statsConfig.studyTypeDetection) {
    return { type: 'unknown', confidence: 0, matchedPatterns: [] }
  }

  const detection = statsConfig.studyTypeDetection
  const scores: Record<StudyType, { count: number; patterns: string[] }> = {
    experimental: { count: 0, patterns: [] },
    observational: { count: 0, patterns: [] },
    qualitative: { count: 0, patterns: [] },
  }

  const lowerText = text.toLowerCase()

  for (const [studyType, patterns] of Object.entries(detection)) {
    for (const pattern of patterns) {
      const regex = compilePatternSafe(pattern)
      if (regex && regex.test(lowerText)) {
        scores[studyType as StudyType].count++
        scores[studyType as StudyType].patterns.push(pattern)
      }
    }
  }

  // Find the type with highest score
  let maxType: StudyType = 'experimental'
  let maxScore = 0
  let totalScore = 0

  for (const [type, data] of Object.entries(scores)) {
    totalScore += data.count
    if (data.count > maxScore) {
      maxScore = data.count
      maxType = type as StudyType
    }
  }

  if (maxScore === 0) {
    return { type: 'unknown', confidence: 0, matchedPatterns: [] }
  }

  const confidence = totalScore > 0 ? maxScore / totalScore : 0

  return {
    type: maxType,
    confidence: Math.min(confidence, 1),
    matchedPatterns: scores[maxType].patterns,
  }
}

// ============================================================================
// Statistical Test Detection
// ============================================================================

/**
 * Detect statistical tests used in text
 */
export function detectStatisticalTests(text: string): DetectedStatisticalTest[] {
  const results: DetectedStatisticalTest[] = []
  const statsConfig = config.statisticsConfig
  if (!statsConfig) return results

  const testPatterns = statsConfig.patterns.tests
  if (!testPatterns) return results

  const testNames: Record<string, string> = {
    tTest: 't-test',
    pairedTTest: 'Paired t-test',
    independentTTest: 'Independent t-test',
    anova: 'ANOVA',
    repeatedMeasuresAnova: 'Repeated Measures ANOVA',
    ancova: 'ANCOVA',
    manova: 'MANOVA',
    chiSquare: 'Chi-square',
    fisherExact: "Fisher's Exact Test",
    mannWhitney: 'Mann-Whitney U',
    wilcoxon: 'Wilcoxon Test',
    kruskalWallis: 'Kruskal-Wallis',
    friedman: 'Friedman Test',
    pearson: 'Pearson Correlation',
    spearman: 'Spearman Correlation',
    linearRegression: 'Linear Regression',
    logisticRegression: 'Logistic Regression',
    multipleRegression: 'Multiple Regression',
  }

  for (const [patternName, patternStr] of Object.entries(testPatterns)) {
    const regex = compilePatternSafe(patternStr)
    if (!regex) continue

    const match = text.match(regex)
    if (match) {
      results.push({
        test: testNames[patternName] || patternName,
        configKey: patternName,
        context: match[0],
      })
    }
  }

  return results
}

/**
 * Get requirements for detected tests
 */
export function getTestRequirements(testKey: string) {
  const statsConfig = config.statisticsConfig
  if (!statsConfig || !statsConfig.testRequirements) return null

  // Map pattern names to requirement keys
  const keyMapping: Record<string, string> = {
    tTest: 't-test',
    pairedTTest: 't-test',
    independentTTest: 't-test',
    anova: 'anova',
    repeatedMeasuresAnova: 'anova',
    chiSquare: 'chi-square',
    pearson: 'correlation',
    spearman: 'correlation',
    linearRegression: 'regression',
    multipleRegression: 'regression',
  }

  const reqKey = keyMapping[testKey] || testKey
  return statsConfig.testRequirements[reqKey] || null
}

// ============================================================================
// Comprehensive Analysis
// ============================================================================

export interface StatisticsCalculationResult {
  sampleSizes: ExtractedSampleSize[]
  primarySampleSize: number | null
  effectSizes: Array<ExtractedEffectSize & EffectSizeInterpretation>
  studyType: DetectedStudyType
  detectedTests: DetectedStatisticalTest[]
  sampleAdequacy: SampleAdequacyResult | null
}

/**
 * Run comprehensive statistical calculations on text
 */
export function calculateStatistics(text: string): StatisticsCalculationResult {
  const sampleSizes = extractSampleSizes(text)
  const primarySampleSize = getPrimarySampleSize(text)
  const effectSizes = analyzeEffectSizes(text)
  const studyType = detectStudyType(text)
  const detectedTests = detectStatisticalTests(text)

  // Assess sample adequacy for primary detected test
  let sampleAdequacy: SampleAdequacyResult | null = null
  if (primarySampleSize !== null && detectedTests.length > 0) {
    const primaryTest = detectedTests[0].configKey
    sampleAdequacy = assessSampleAdequacy(primarySampleSize, primaryTest)
  }

  return {
    sampleSizes,
    primarySampleSize,
    effectSizes,
    studyType,
    detectedTests,
    sampleAdequacy,
  }
}
