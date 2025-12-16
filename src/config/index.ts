import type { AnalysisConfig } from './types'
import configData from './analysis-config.yaml'

// Export the loaded config
export const config: AnalysisConfig = configData as unknown as AnalysisConfig

// Helper to compile regex patterns from config strings
export function compilePattern(pattern: string, flags = 'gi'): RegExp {
  return new RegExp(pattern, flags)
}

// Helper to get patterns with compiled regex
export function getCompiledPatterns(patterns: { pattern: string; suggestion: string }[]) {
  return patterns.map(p => ({
    pattern: compilePattern(p.pattern),
    suggestion: p.suggestion
  }))
}

// Helper to get contractions as regex patterns
export function getContractionPatterns(): RegExp[] {
  return config.contractions.map(c =>
    compilePattern(`\\b${c.replace(/'/g, "'")}\\b`)
  )
}

// Helper to get citation patterns
export function getCitationPatterns(): Record<string, RegExp> {
  const compiled: Record<string, RegExp> = {}
  for (const [style, pattern] of Object.entries(config.citationPatterns)) {
    compiled[style] = compilePattern(pattern, 'g')
  }
  return compiled
}

// Re-export types
export type { AnalysisConfig } from './types'
