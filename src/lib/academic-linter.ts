/**
 * Academic Writing Linter
 * Lightweight browser-based linter with academic writing rules
 * Inspired by textlint and Vale academic style guides
 */

import type { Issue, IssueSeverity } from '../types'
import { config } from '../config'

interface LintRule {
  id: string
  name: string
  description: string
  severity: IssueSeverity
  check: (text: string, sectionId: string) => Issue[]
}

// Academic writing rules based on style guides
const academicRules: LintRule[] = [
  // Weasel words - vague quantifiers
  {
    id: 'weasel-words',
    name: 'Weasel Words',
    description: 'Vague quantifiers that weaken claims',
    severity: 'consider',
    check: (text, sectionId) => {
      const weaselWords = [
        'many', 'various', 'very', 'fairly', 'several', 'extremely',
        'remarkably', 'few', 'surprisingly', 'mostly', 'largely',
        'huge', 'tiny', 'excellent', 'interestingly', 'significantly',
        'substantially', 'clearly', 'vast', 'relatively', 'quite'
      ]
      const issues: Issue[] = []
      let idx = 0

      for (const word of weaselWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi')
        const matches = text.match(regex)
        if (matches) {
          issues.push({
            id: `${sectionId}-weasel-${idx++}`,
            severity: 'consider',
            description: `Weasel word "${matches[0]}" - consider quantifying or removing`,
            location: matches[0],
            suggestion: 'Replace with specific data or remove',
          })
        }
      }
      return issues
    },
  },

  // Passive voice (academic contexts may want some passive)
  {
    id: 'passive-voice-excessive',
    name: 'Excessive Passive Voice',
    description: 'Too much passive voice can obscure meaning',
    severity: 'consider',
    check: (text, sectionId) => {
      const issues: Issue[] = []
      // Count passive constructions
      const passivePattern = /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi
      const matches = text.match(passivePattern) || []
      const sentences = text.split(/[.!?]+/).filter(s => s.trim())

      if (sentences.length > 0 && matches.length / sentences.length > 0.5) {
        issues.push({
          id: `${sectionId}-passive-excessive`,
          severity: 'consider',
          description: `High passive voice ratio (${matches.length}/${sentences.length} sentences)`,
          suggestion: 'Consider using more active voice for clarity',
        })
      }
      return issues
    },
  },

  // Nominalization (turning verbs into nouns)
  {
    id: 'nominalization',
    name: 'Nominalization',
    description: 'Noun forms of verbs that could be simpler',
    severity: 'consider',
    check: (text, sectionId) => {
      const nominalizations: Record<string, string> = {
        'utilization': 'use',
        'implementation': 'implement',
        'optimization': 'optimize',
        'maximization': 'maximize',
        'minimization': 'minimize',
        'establishment': 'establish',
        'determination': 'determine',
        'investigation': 'investigate',
        'examination': 'examine',
        'demonstration': 'demonstrate/show',
        'communication': 'communicate',
        'documentation': 'document',
        'authorization': 'authorize',
        'initialization': 'initialize',
        'configuration': 'configure',
        'specification': 'specify',
        'modification': 'modify',
        'verification': 'verify',
        'validation': 'validate',
        'facilitation': 'facilitate/help',
      }

      const issues: Issue[] = []
      let idx = 0

      for (const [nominal, verb] of Object.entries(nominalizations)) {
        const regex = new RegExp(`\\b${nominal}\\b`, 'gi')
        const matches = text.match(regex)
        if (matches) {
          issues.push({
            id: `${sectionId}-nominal-${idx++}`,
            severity: 'consider',
            description: `Nominalization "${matches[0]}" could be simpler`,
            location: matches[0],
            suggestion: `Consider using "${verb}" instead`,
          })
        }
      }
      return issues
    },
  },

  // Redundant phrases
  {
    id: 'redundant-phrases',
    name: 'Redundant Phrases',
    description: 'Wordy phrases that can be simplified',
    severity: 'should-fix',
    check: (text, sectionId) => {
      const redundant: Record<string, string> = {
        'in order to': 'to',
        'due to the fact that': 'because',
        'at this point in time': 'now',
        'in the event that': 'if',
        'for the purpose of': 'to/for',
        'in spite of the fact that': 'although',
        'in the near future': 'soon',
        'at the present time': 'now',
        'in a position to': 'can',
        'is able to': 'can',
        'has the ability to': 'can',
        'whether or not': 'whether',
        'the reason why is that': 'because',
        'in close proximity to': 'near',
        'a large number of': 'many',
        'a small number of': 'few',
        'the vast majority of': 'most',
        'in the process of': '(remove)',
        'it is important to note that': '(remove)',
        'it should be noted that': '(remove)',
        'it is worth mentioning that': '(remove)',
        'needless to say': '(remove)',
        'it goes without saying': '(remove)',
      }

      const issues: Issue[] = []
      let idx = 0

      for (const [phrase, replacement] of Object.entries(redundant)) {
        const regex = new RegExp(phrase, 'gi')
        const matches = text.match(regex)
        if (matches) {
          issues.push({
            id: `${sectionId}-redundant-${idx++}`,
            severity: 'should-fix',
            description: `Redundant phrase "${matches[0]}"`,
            location: matches[0],
            suggestion: `Replace with "${replacement}"`,
          })
        }
      }
      return issues
    },
  },

  // Sentence starters to avoid
  {
    id: 'weak-starters',
    name: 'Weak Sentence Starters',
    description: 'Sentences starting with weak constructions',
    severity: 'consider',
    check: (text, sectionId) => {
      const weakStarters = [
        { pattern: /(?:^|\.\s+)There is\b/gi, suggestion: 'Rephrase to be more direct' },
        { pattern: /(?:^|\.\s+)There are\b/gi, suggestion: 'Rephrase to be more direct' },
        { pattern: /(?:^|\.\s+)It is\b/gi, suggestion: 'Consider more specific subject' },
        { pattern: /(?:^|\.\s+)This is\b/gi, suggestion: 'Specify what "this" refers to' },
      ]

      const issues: Issue[] = []
      let idx = 0

      for (const { pattern, suggestion } of weakStarters) {
        const matches = text.match(pattern)
        if (matches && matches.length > 2) { // Allow some usage
          issues.push({
            id: `${sectionId}-starter-${idx++}`,
            severity: 'consider',
            description: `Frequent weak sentence starter "${matches[0].trim()}" (${matches.length} times)`,
            suggestion,
          })
        }
      }
      return issues
    },
  },

  // Hedge word clustering
  {
    id: 'hedge-clustering',
    name: 'Hedge Word Clustering',
    description: 'Multiple hedges in close proximity weaken claims',
    severity: 'should-fix',
    check: (text, sectionId) => {
      const hedges = ['may', 'might', 'could', 'possibly', 'perhaps', 'likely', 'seems', 'appears', 'suggests']
      const sentences = text.split(/[.!?]+/).filter(s => s.trim())
      const issues: Issue[] = []
      let idx = 0

      for (const sentence of sentences) {
        let hedgeCount = 0
        for (const hedge of hedges) {
          const regex = new RegExp(`\\b${hedge}\\b`, 'gi')
          const matches = sentence.match(regex)
          if (matches) hedgeCount += matches.length
        }

        if (hedgeCount >= 2) {
          issues.push({
            id: `${sectionId}-hedge-cluster-${idx++}`,
            severity: 'should-fix',
            description: `Multiple hedge words in one sentence (${hedgeCount} found)`,
            location: sentence.trim().substring(0, 50) + '...',
            suggestion: 'Remove some hedges to strengthen the claim',
          })
        }
      }
      return issues
    },
  },

  // Latin abbreviations
  {
    id: 'latin-abbreviations',
    name: 'Latin Abbreviations',
    description: 'Some style guides prefer English equivalents',
    severity: 'consider',
    check: (text, sectionId) => {
      const latin: Record<string, string> = {
        'e\\.g\\.': 'for example',
        'i\\.e\\.': 'that is',
        'etc\\.': 'and so on (or list all items)',
        'et al\\.': '(acceptable in citations)',
        'viz\\.': 'namely',
        'cf\\.': 'compare',
        'N\\.B\\.': 'note',
      }

      const issues: Issue[] = []
      let idx = 0

      for (const [abbrev, english] of Object.entries(latin)) {
        if (abbrev === 'et al\\.') continue // Common in academic writing
        const regex = new RegExp(`\\b${abbrev}`, 'gi')
        const matches = text.match(regex)
        if (matches) {
          issues.push({
            id: `${sectionId}-latin-${idx++}`,
            severity: 'consider',
            description: `Latin abbreviation "${matches[0]}"`,
            location: matches[0],
            suggestion: `Consider using "${english}" for clarity`,
          })
        }
      }
      return issues
    },
  },

  // Sentence length variation
  {
    id: 'sentence-variety',
    name: 'Sentence Length Variety',
    description: 'Monotonous sentence lengths reduce readability',
    severity: 'consider',
    check: (text, sectionId) => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim())
      if (sentences.length < 5) return []

      const lengths = sentences.map(s => s.trim().split(/\s+/).length)
      const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
      const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length
      const stdDev = Math.sqrt(variance)

      const issues: Issue[] = []
      if (stdDev < 3) { // Low variation
        issues.push({
          id: `${sectionId}-sentence-variety`,
          severity: 'consider',
          description: `Low sentence length variety (std dev: ${stdDev.toFixed(1)})`,
          suggestion: 'Mix short and long sentences for better flow',
        })
      }
      return issues
    },
  },

  // Repeated sentence starts
  {
    id: 'repeated-starts',
    name: 'Repeated Sentence Starts',
    description: 'Multiple sentences starting the same way',
    severity: 'consider',
    check: (text, sectionId) => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim())
      const starts: Record<string, number> = {}
      const issues: Issue[] = []

      for (const sentence of sentences) {
        const words = sentence.trim().split(/\s+/).slice(0, 2).join(' ').toLowerCase()
        starts[words] = (starts[words] || 0) + 1
      }

      let idx = 0
      for (const [start, count] of Object.entries(starts)) {
        if (count >= 3) {
          issues.push({
            id: `${sectionId}-repeat-start-${idx++}`,
            severity: 'consider',
            description: `${count} sentences start with "${start}"`,
            suggestion: 'Vary sentence openings for better flow',
          })
        }
      }
      return issues
    },
  },
]

export interface LintResult {
  issues: Issue[]
  ruleResults: {
    ruleId: string
    ruleName: string
    issueCount: number
  }[]
}

export function lintAcademicText(
  text: string,
  sectionId: string,
  options?: {
    enabledRules?: string[]
    disabledRules?: string[]
  }
): LintResult {
  const lintConfig = config.externalCheckers?.academicLinter

  if (!lintConfig?.enabled) {
    return { issues: [], ruleResults: [] }
  }

  const enabledRules = options?.enabledRules || lintConfig.enabledRules || academicRules.map(r => r.id)
  const disabledRules = options?.disabledRules || lintConfig.disabledRules || []

  const rulesToRun = academicRules.filter(
    rule => enabledRules.includes(rule.id) && !disabledRules.includes(rule.id)
  )

  const allIssues: Issue[] = []
  const ruleResults: LintResult['ruleResults'] = []

  for (const rule of rulesToRun) {
    const issues = rule.check(text, sectionId)
    allIssues.push(...issues)
    ruleResults.push({
      ruleId: rule.id,
      ruleName: rule.name,
      issueCount: issues.length,
    })
  }

  return { issues: allIssues, ruleResults }
}

// Get available rules for configuration
export function getAvailableRules(): { id: string; name: string; description: string }[] {
  return academicRules.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
  }))
}
