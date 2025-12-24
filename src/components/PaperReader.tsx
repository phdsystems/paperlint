import { useMemo } from 'react'
import { BookPageFlip } from '@engineeringlabs/frontboot'
import type { Page } from '@engineeringlabs/frontboot'
import { sectionLabels } from '../lib/checklist-data'
import type { Section, SectionType } from '../types'

interface PaperReaderProps {
  paperTitle: string
  sections: Section[]
}

// Map section types to icons
const sectionIcons: Record<string, string> = {
  title: 'FileText',
  abstract: 'FileText',
  introduction: 'BookOpen',
  'related-work': 'Search',
  methodology: 'Settings',
  results: 'BarChart3',
  discussion: 'Brain',
  'threats-to-validity': 'AlertTriangle',
  conclusion: 'CheckCircle',
  references: 'ExternalLink',
  formatting: 'FileEdit',
}

export function PaperReader({ paperTitle, sections }: PaperReaderProps) {
  // Convert sections to pages for BookPageFlip
  const pages: Page[] = useMemo(() => {
    // Filter sections that have content
    const sectionsWithContent = sections.filter(s => s.content.trim().length > 0)

    if (sectionsWithContent.length === 0) {
      return [{
        id: 'empty',
        title: 'No Content',
        icon: 'AlertCircle',
        content: (
          <div className="flex flex-col items-center justify-center h-full text-[var(--fb-text-muted)]">
            <p className="text-lg mb-2">No paper content available</p>
            <p className="text-sm">Go to the Input tab to add your paper</p>
          </div>
        ),
      }]
    }

    // Create title page
    const titlePage: Page = {
      id: 'cover',
      title: 'Cover',
      icon: 'GraduationCap',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <h1 className="text-3xl font-bold text-[var(--fb-text)] mb-6">
            {paperTitle || 'Untitled Paper'}
          </h1>
          <div className="text-[var(--fb-text-muted)] space-y-2">
            <p>{sectionsWithContent.length} sections</p>
            <p className="text-sm">Use arrow keys or buttons to navigate</p>
          </div>
        </div>
      ),
    }

    // Convert each section to a page
    const sectionPages: Page[] = sectionsWithContent.map(section => ({
      id: section.id,
      title: sectionLabels[section.id as SectionType] || section.name,
      icon: sectionIcons[section.id] || 'FileText',
      content: (
        <div className="h-full overflow-y-auto">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-[var(--fb-text)] leading-relaxed">
              {section.content}
            </div>
          </div>

          {/* Section metadata */}
          <div className="mt-6 pt-4 border-t border-[var(--fb-border)]">
            <div className="flex items-center justify-between text-xs text-[var(--fb-text-muted)]">
              <span>{section.content.split(/\s+/).length} words</span>
              <span>
                {section.issues.length > 0 && (
                  <span className="text-[var(--fb-warning)]">
                    {section.issues.length} issue{section.issues.length !== 1 ? 's' : ''}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      ),
    }))

    return [titlePage, ...sectionPages]
  }, [paperTitle, sections])

  return (
    <div className="h-[600px] bg-[var(--fb-surface)] rounded-xl shadow-lg overflow-hidden">
      <BookPageFlip
        pages={pages}
        defaultPage={0}
        showNavigation={true}
        showIndicator={true}
        showTitle={true}
        keyboardNavigation={true}
        duration={600}
        navigationPosition="sides"
        className="h-full"
      />
    </div>
  )
}
