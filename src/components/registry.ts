/**
 * Component registry for Frontboot TabLayout
 * Maps component names from YAML config to React components
 *
 * Components receive { sectionId: string } and use ReviewContext for state
 */

import type { ComponentRegistry } from '@engineeringlabs/frontboot'
import {
  PaperInputPanel,
  ScoreSidebarPanel,
  SectionReviewPanel,
  PaperReaderPanel,
  ReportGeneratorPanel,
} from './panels'

export const componentRegistry: ComponentRegistry = {
  PaperInput: PaperInputPanel,
  ScoreSidebar: ScoreSidebarPanel,
  SectionReviewPanel: SectionReviewPanel,
  PaperReader: PaperReaderPanel,
  ReportGenerator: ReportGeneratorPanel,
}
