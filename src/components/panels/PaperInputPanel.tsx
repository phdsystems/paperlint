/**
 * PaperInputPanel - TabLayout component for paper input
 * Uses ReviewContext instead of wrapper props
 */

import { useReview } from '../../context/ReviewContext'
import { PaperInput } from '../PaperInput'

interface PaperInputPanelProps {
  sectionId: string
}

export function PaperInputPanel({ sectionId: _sectionId }: PaperInputPanelProps) {
  const { state, actions, handleParseSections } = useReview()

  return (
    <PaperInput
      paperContent={state.paperContent}
      paperTitle={state.paperTitle}
      onContentChange={actions.setPaperContent}
      onTitleChange={actions.setPaperTitle}
      onParse={handleParseSections}
    />
  )
}
