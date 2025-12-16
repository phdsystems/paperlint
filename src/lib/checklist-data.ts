import type { SectionType, ChecklistItem } from '../types'

type ChecklistDefinition = Omit<ChecklistItem, 'checked' | 'aiSuggested'>

export const sectionChecklists: Record<SectionType, ChecklistDefinition[]> = {
  abstract: [
    { id: 'abs-1', label: 'Within word limit (150-300 words typical)' },
    { id: 'abs-2', label: 'Follows structure: Context → Problem → Approach → Results → Conclusion' },
    { id: 'abs-3', label: 'Contains quantified results (percentages, metrics)' },
    { id: 'abs-4', label: 'Metrics consistent with body of paper' },
    { id: 'abs-5', label: 'No citations' },
    { id: 'abs-6', label: 'No undefined abbreviations' },
    { id: 'abs-7', label: 'No forward references' },
    { id: 'abs-8', label: 'Self-contained (understandable alone)' },
  ],
  title: [
    { id: 'title-1', label: 'Specific and descriptive (not vague)' },
    { id: 'title-2', label: 'Contains searchable key terms' },
    { id: 'title-3', label: '10-15 words' },
    { id: 'title-4', label: 'No unexpanded abbreviations (unless universal)' },
    { id: 'title-5', label: 'Indicates contribution or finding' },
    { id: 'title-6', label: 'No weak openings ("A Study of...")' },
  ],
  introduction: [
    { id: 'intro-1', label: 'Problem clearly stated' },
    { id: 'intro-2', label: 'Concrete pain points (not abstract)' },
    { id: 'intro-3', label: 'Research questions/hypotheses defined' },
    { id: 'intro-4', label: 'Contributions explicitly listed' },
    { id: 'intro-5', label: 'Paper structure outlined' },
    { id: 'intro-6', label: 'Citations support claims' },
    { id: 'intro-7', label: 'Appropriate hedging language' },
  ],
  'related-work': [
    { id: 'rw-1', label: 'Organized thematically (not chronologically)' },
    { id: 'rw-2', label: 'Compares and contrasts (not just lists)' },
    { id: 'rw-3', label: 'Identifies gaps addressed by this work' },
    { id: 'rw-4', label: 'Positions work relative to prior art' },
    { id: 'rw-5', label: 'Balanced coverage of perspectives' },
    { id: 'rw-6', label: 'Recent work included (last 3-5 years)' },
  ],
  methodology: [
    { id: 'meth-1', label: 'Sufficient detail for replication' },
    { id: 'meth-2', label: 'Design decisions justified' },
    { id: 'meth-3', label: 'Metrics and criteria defined' },
    { id: 'meth-4', label: 'Datasets/participants described' },
    { id: 'meth-5', label: 'Tools and versions specified' },
    { id: 'meth-6', label: 'Limitations of method acknowledged' },
  ],
  results: [
    { id: 'res-1', label: 'Data presented objectively' },
    { id: 'res-2', label: 'Figures and tables effective' },
    { id: 'res-3', label: 'Statistical significance reported' },
    { id: 'res-4', label: 'No interpretation (save for Discussion)' },
    { id: 'res-5', label: 'All figures/tables referenced in text' },
    { id: 'res-6', label: 'Consistent precision in numbers' },
  ],
  discussion: [
    { id: 'disc-1', label: 'Results interpreted in context' },
    { id: 'disc-2', label: 'Comparison to hypotheses' },
    { id: 'disc-3', label: 'Comparison to prior work' },
    { id: 'disc-4', label: 'Limitations acknowledged honestly' },
    { id: 'disc-5', label: 'Implications discussed' },
    { id: 'disc-6', label: 'No new results introduced' },
  ],
  'threats-to-validity': [
    { id: 'ttv-1', label: 'Internal validity addressed' },
    { id: 'ttv-2', label: 'External validity addressed' },
    { id: 'ttv-3', label: 'Construct validity addressed' },
    { id: 'ttv-4', label: 'Mitigations described where applicable' },
    { id: 'ttv-5', label: 'Honest about limitations' },
  ],
  conclusion: [
    { id: 'conc-1', label: 'Key contributions summarized' },
    { id: 'conc-2', label: 'Limitations restated briefly' },
    { id: 'conc-3', label: 'Concrete future work proposed' },
    { id: 'conc-4', label: 'No new information introduced' },
    { id: 'conc-5', label: 'Appropriate scope (not overclaiming)' },
  ],
  references: [
    { id: 'ref-1', label: 'All citations present in reference list' },
    { id: 'ref-2', label: 'No orphan references (cited but not used in text)' },
    { id: 'ref-3', label: 'Consistent citation style throughout' },
    { id: 'ref-4', label: 'Web citations have URLs and access dates' },
    { id: 'ref-5', label: 'Mix of seminal and recent work' },
    { id: 'ref-6', label: 'Primary sources preferred' },
    { id: 'ref-7', label: 'Author names and attributions correct' },
  ],
  formatting: [
    { id: 'fmt-1', label: 'Correct template used' },
    { id: 'fmt-2', label: 'Page limit respected' },
    { id: 'fmt-3', label: 'Figures high resolution (300+ DPI)' },
    { id: 'fmt-4', label: 'Tables properly formatted (minimal borders)' },
    { id: 'fmt-5', label: 'Consistent terminology throughout' },
    { id: 'fmt-6', label: 'Acronyms expanded on first use' },
    { id: 'fmt-7', label: 'Formal tone (no colloquialisms)' },
    { id: 'fmt-8', label: 'Hedging language where appropriate' },
    { id: 'fmt-9', label: 'Active voice predominant' },
    { id: 'fmt-10', label: 'No contractions' },
  ],
}

export const sectionLabels: Record<SectionType, string> = {
  abstract: 'Abstract',
  title: 'Title',
  introduction: 'Introduction',
  'related-work': 'Related Work',
  methodology: 'Methodology',
  results: 'Results',
  discussion: 'Discussion',
  'threats-to-validity': 'Threats to Validity',
  conclusion: 'Conclusion',
  references: 'References',
  formatting: 'Formatting & Language',
}

export const sectionOrder: SectionType[] = [
  'title',
  'abstract',
  'introduction',
  'related-work',
  'methodology',
  'results',
  'discussion',
  'threats-to-validity',
  'conclusion',
  'references',
  'formatting',
]

export function createInitialChecklist(sectionType: SectionType): ChecklistItem[] {
  return sectionChecklists[sectionType].map(item => ({
    ...item,
    checked: false,
    aiSuggested: undefined,
  }))
}
