/**
 * PaperReaderPanel - TabLayout component for book-like paper reading
 * Uses ReviewContext instead of wrapper props
 */

import { useReviewState } from '../../context/ReviewContext'
import { PaperReader } from '../PaperReader'

interface PaperReaderPanelProps {
  sectionId: string
}

export function PaperReaderPanel({ sectionId: _sectionId }: PaperReaderPanelProps) {
  const state = useReviewState()

  return (
    <PaperReader
      paperTitle={state.paperTitle}
      sections={state.sections}
    />
  )
}
