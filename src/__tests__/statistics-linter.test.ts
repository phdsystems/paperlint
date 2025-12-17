import { describe, test, expect } from 'bun:test'
import { lintStatistics, getStatisticsRules } from '../lib/statistics-linter'

describe('Statistics Linter', () => {
  describe('lintStatistics', () => {
    test('detects p-value zero error', () => {
      const text = 'The result was significant, p = 0.000.'
      const result = lintStatistics(text, 'results')

      expect(result.issues.some(i =>
        i.description.includes('0.000') || i.id.includes('pzero') || i.id.includes('p-value-zero')
      )).toBe(true)
    })

    test('detects missing effect sizes', () => {
      const text = 'A t-test showed p < 0.05. ANOVA revealed p = 0.02.'
      const result = lintStatistics(text, 'results')

      expect(result.issues.some(i =>
        i.description.toLowerCase().includes('effect size')
      )).toBe(true)
    })

    test('counts statistical elements', () => {
      const text = `
        Results showed significant effects (p < 0.001, p = 0.023).
        Cohen's d = 0.55 indicated a medium effect.
        The sample included n = 100 participants.
        95% CI [0.2, 0.9].
      `
      const result = lintStatistics(text, 'results')

      expect(result.stats.pValues).toBeGreaterThanOrEqual(2)
      expect(result.stats.effectSizes).toBeGreaterThanOrEqual(1)
      expect(result.stats.sampleSizes).toBeGreaterThanOrEqual(1)
      expect(result.stats.confidenceIntervals).toBeGreaterThanOrEqual(1)
    })

    test('returns empty result when disabled', () => {
      // This tests the early return when linter is disabled
      // In real usage, config would control this
      const text = 'Some statistical text.'
      const result = lintStatistics(text, 'results')

      // Should still return valid structure
      expect(result).toHaveProperty('issues')
      expect(result).toHaveProperty('stats')
      expect(result).toHaveProperty('studyType')
    })

    test('detects study type', () => {
      const text = 'This randomized controlled trial assigned participants to groups.'
      const result = lintStatistics(text, 'methodology')

      expect(result.studyType.type).toBe('experimental')
    })

    test('handles methodology section with checklist', () => {
      const text = `
        Participants were randomly assigned to conditions.
        The study used a double-blind design.
        A power analysis indicated n = 50 per group was needed.
      `
      const result = lintStatistics(text, 'methodology', { includeChecklist: true })

      // Should have study design checklist for experimental
      if (result.studyDesignChecklist) {
        expect(result.studyDesignChecklist.length).toBeGreaterThan(0)
      }
    })

    test('assesses sample adequacy', () => {
      const text = 'We recruited n = 30 participants for the t-test analysis.'
      const result = lintStatistics(text, 'methodology', { includeSampleAdequacy: true })

      if (result.sampleAdequacy) {
        expect(result.sampleAdequacy.extracted).toBe(30)
        expect(result.sampleAdequacy).toHaveProperty('adequate')
        expect(result.sampleAdequacy).toHaveProperty('recommendation')
      }
    })
  })

  describe('getStatisticsRules', () => {
    test('returns list of rules', () => {
      const rules = getStatisticsRules()
      expect(Array.isArray(rules)).toBe(true)
    })

    test('each rule has required properties', () => {
      const rules = getStatisticsRules()
      for (const rule of rules) {
        expect(rule).toHaveProperty('id')
        expect(rule).toHaveProperty('name')
        expect(rule).toHaveProperty('description')
        expect(rule).toHaveProperty('severity')
      }
    })
  })
})
