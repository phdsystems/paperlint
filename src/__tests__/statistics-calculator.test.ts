import { describe, test, expect } from 'bun:test'
import {
  extractSampleSizes,
  getPrimarySampleSize,
  computeRequiredN,
  getSampleSizeRequirements,
  assessSampleAdequacy,
  extractEffectSizes,
  interpretEffectSize,
  detectStudyType,
  detectStatisticalTests,
  calculateStatistics,
} from '../lib/statistics-calculator'

describe('Statistics Calculator', () => {
  describe('extractSampleSizes', () => {
    test('extracts n = X format', () => {
      const text = 'The study included n = 150 participants.'
      const sizes = extractSampleSizes(text)
      expect(sizes.length).toBeGreaterThan(0)
      expect(sizes.some(s => s.value === 150)).toBe(true)
    })

    test('extracts multiple sample sizes', () => {
      const text = 'Group A had n = 50 and group B had n = 45 participants.'
      const sizes = extractSampleSizes(text)
      expect(sizes.length).toBe(2)
    })

    test('handles text without sample sizes', () => {
      const text = 'This is a theoretical paper with no data.'
      const sizes = extractSampleSizes(text)
      expect(sizes.length).toBe(0)
    })
  })

  describe('getPrimarySampleSize', () => {
    test('returns largest sample size', () => {
      const text = 'We recruited n = 200 total, with n = 100 in each group.'
      const primary = getPrimarySampleSize(text)
      expect(primary).toBe(200)
    })

    test('returns null for no sample size', () => {
      const text = 'No numbers here.'
      const primary = getPrimarySampleSize(text)
      expect(primary).toBeNull()
    })
  })

  describe('computeRequiredN', () => {
    test('returns required N for t-test', () => {
      const required = computeRequiredN('t-test', 'medium')
      expect(required).toBeGreaterThan(0)
    })

    test('returns larger N for small effects', () => {
      const small = computeRequiredN('t-test', 'small')
      const large = computeRequiredN('t-test', 'large')
      expect(small).toBeGreaterThan(large!)
    })

    test('returns null for unknown test', () => {
      const required = computeRequiredN('unknown-test')
      expect(required).toBeNull()
    })
  })

  describe('getSampleSizeRequirements', () => {
    test('returns requirements for known test', () => {
      const req = getSampleSizeRequirements('anova')
      expect(req).not.toBeNull()
      expect(req?.small).toBeGreaterThan(req?.medium!)
      expect(req?.medium).toBeGreaterThan(req?.large!)
    })
  })

  describe('assessSampleAdequacy', () => {
    test('flags small samples as potentially underpowered', () => {
      const result = assessSampleAdequacy(20, 't-test')
      expect(result.adequate).toBe(false)
      expect(result.recommendation).toContain('may only detect large effects')
    })

    test('accepts adequate sample sizes', () => {
      const result = assessSampleAdequacy(500, 't-test')
      expect(result.adequate).toBe(true)
    })
  })

  describe('extractEffectSizes', () => {
    test('extracts Cohen\'s d', () => {
      const text = 'The effect size was Cohen\'s d = 0.65.'
      const effects = extractEffectSizes(text)
      expect(effects.length).toBeGreaterThan(0)
      expect(effects[0].value).toBeCloseTo(0.65, 2)
    })

    test('extracts correlation r', () => {
      const text = 'Variables were correlated, r = 0.42, p < .001.'
      const effects = extractEffectSizes(text)
      expect(effects.length).toBeGreaterThan(0)
    })

    test('extracts eta squared', () => {
      const text = 'ANOVA showed partial eta squared = 0.12.'
      const effects = extractEffectSizes(text)
      expect(effects.length).toBeGreaterThan(0)
    })
  })

  describe('interpretEffectSize', () => {
    test('classifies small Cohen\'s d', () => {
      const interp = interpretEffectSize(0.25, 'cohensD')
      expect(interp.magnitude).toBe('small')
    })

    test('classifies medium Cohen\'s d', () => {
      const interp = interpretEffectSize(0.55, 'cohensD')
      expect(interp.magnitude).toBe('medium')
    })

    test('classifies large Cohen\'s d', () => {
      const interp = interpretEffectSize(0.90, 'cohensD')
      expect(interp.magnitude).toBe('large')
    })

    test('classifies correlation r', () => {
      const interp = interpretEffectSize(0.35, 'correlationR')
      expect(interp.magnitude).toBe('medium')
    })
  })

  describe('detectStudyType', () => {
    test('detects experimental study', () => {
      const text = 'Participants were randomly assigned to treatment or control group in this randomized controlled trial.'
      const result = detectStudyType(text)
      expect(result.type).toBe('experimental')
      expect(result.confidence).toBeGreaterThan(0)
    })

    test('detects observational study', () => {
      const text = 'This cross-sectional survey examined correlations between variables in a cohort study.'
      const result = detectStudyType(text)
      expect(result.type).toBe('observational')
    })

    test('detects qualitative study', () => {
      const text = 'Semi-structured interviews were conducted using thematic analysis until data saturation was reached.'
      const result = detectStudyType(text)
      expect(result.type).toBe('qualitative')
    })

    test('returns unknown for ambiguous text', () => {
      const text = 'This paper discusses methodology.'
      const result = detectStudyType(text)
      expect(result.type).toBe('unknown')
    })
  })

  describe('detectStatisticalTests', () => {
    test('detects t-test', () => {
      const text = 'An independent samples t-test was conducted.'
      const tests = detectStatisticalTests(text)
      expect(tests.length).toBeGreaterThan(0)
      expect(tests.some(t => t.test.toLowerCase().includes('t-test'))).toBe(true)
    })

    test('detects ANOVA', () => {
      const text = 'A one-way ANOVA was used to compare group means.'
      const tests = detectStatisticalTests(text)
      expect(tests.some(t => t.test.includes('ANOVA'))).toBe(true)
    })

    test('detects chi-square', () => {
      const text = 'A chi-square test of independence was performed.'
      const tests = detectStatisticalTests(text)
      expect(tests.some(t => t.test.toLowerCase().includes('chi'))).toBe(true)
    })

    test('detects multiple tests', () => {
      const text = 'We used ANOVA for continuous outcomes and chi-square for categorical variables.'
      const tests = detectStatisticalTests(text)
      expect(tests.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('calculateStatistics', () => {
    test('returns comprehensive analysis', () => {
      const text = `
        This randomized controlled trial included n = 120 participants.
        An independent t-test showed significant differences, t(118) = 2.45, p = 0.016,
        with a medium effect size (Cohen's d = 0.52, 95% CI [0.15, 0.89]).
      `
      const result = calculateStatistics(text)

      expect(result.primarySampleSize).toBe(120)
      expect(result.studyType.type).toBe('experimental')
      expect(result.detectedTests.length).toBeGreaterThan(0)
      expect(result.effectSizes.length).toBeGreaterThan(0)
    })

    test('handles empty text', () => {
      const result = calculateStatistics('')
      expect(result.primarySampleSize).toBeNull()
      expect(result.studyType.type).toBe('unknown')
      expect(result.detectedTests.length).toBe(0)
    })
  })
})
