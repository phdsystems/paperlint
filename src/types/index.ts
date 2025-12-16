export type IssueSeverity = 'must-fix' | 'should-fix' | 'consider'

export interface ChecklistItem {
  id: string
  label: string
  checked: boolean
  aiSuggested?: boolean
}

export interface Section {
  id: string
  name: string
  content: string
  checklist: ChecklistItem[]
  score: number
  issues: Issue[]
}

export interface Issue {
  id: string
  severity: IssueSeverity
  description: string
  location?: string
  suggestion?: string
}

export interface ReviewState {
  paperTitle: string
  paperContent: string
  sections: Section[]
  overallScore: number
  status: 'idle' | 'parsing' | 'analyzing' | 'complete'
}

export interface AIAnalysisResult {
  sectionId: string
  issues: Issue[]
  suggestions: string[]
  checklistUpdates: { itemId: string; suggested: boolean }[]
  score: number
}

export type SectionType =
  | 'abstract'
  | 'title'
  | 'introduction'
  | 'related-work'
  | 'methodology'
  | 'results'
  | 'discussion'
  | 'threats-to-validity'
  | 'conclusion'
  | 'references'
  | 'formatting'
