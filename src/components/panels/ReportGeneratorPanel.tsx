/**
 * ReportGeneratorPanel - TabLayout component for report generation
 * Uses ReviewContext instead of wrapper props
 */

import { useReview } from '../../context/ReviewContext'
import { ReportGenerator } from '../ReportGenerator'

interface ReportGeneratorPanelProps {
  sectionId: string
}

export function ReportGeneratorPanel({ sectionId: _sectionId }: ReportGeneratorPanelProps) {
  const { state, actions } = useReview()

  return (
    <ReportGenerator
      state={state}
      calculateScore={actions.calculateSectionScore}
    />
  )
}
