import { useState, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Textarea } from './ui/Textarea'
import type { SectionType } from '../types'
import { sectionOrder, sectionLabels } from '../lib/checklist-data'

interface PaperInputProps {
  paperContent: string
  paperTitle: string
  onContentChange: (content: string) => void
  onTitleChange: (title: string) => void
  onParse: (sections: { sectionId: SectionType; content: string }[]) => void
}

const SECTION_PATTERNS: Record<SectionType, RegExp> = {
  title: /^#\s+(.+?)(?:\n|$)/m,
  abstract: /(?:^#+\s*Abstract\s*\n|^Abstract\s*\n)([\s\S]*?)(?=\n#+\s|\n[A-Z][a-z]+\s*\n|$)/im,
  introduction: /(?:^#+\s*(?:\d+\.?\s*)?Introduction\s*\n)([\s\S]*?)(?=\n#+\s|$)/im,
  'related-work': /(?:^#+\s*(?:\d+\.?\s*)?(?:Related Work|Background|Literature Review)\s*\n)([\s\S]*?)(?=\n#+\s|$)/im,
  methodology: /(?:^#+\s*(?:\d+\.?\s*)?(?:Methodology|Methods|Approach|Design)\s*\n)([\s\S]*?)(?=\n#+\s|$)/im,
  results: /(?:^#+\s*(?:\d+\.?\s*)?(?:Results|Findings|Evaluation)\s*\n)([\s\S]*?)(?=\n#+\s|$)/im,
  discussion: /(?:^#+\s*(?:\d+\.?\s*)?Discussion\s*\n)([\s\S]*?)(?=\n#+\s|$)/im,
  'threats-to-validity': /(?:^#+\s*(?:\d+\.?\s*)?(?:Threats to Validity|Limitations)\s*\n)([\s\S]*?)(?=\n#+\s|$)/im,
  conclusion: /(?:^#+\s*(?:\d+\.?\s*)?(?:Conclusion|Conclusions|Summary)\s*\n)([\s\S]*?)(?=\n#+\s|$)/im,
  references: /(?:^#+\s*(?:\d+\.?\s*)?(?:References|Bibliography)\s*\n)([\s\S]*?)$/im,
  formatting: /$/,
}

export function PaperInput({
  paperContent,
  paperTitle,
  onContentChange,
  onTitleChange,
  onParse,
}: PaperInputProps) {
  const [parseStatus, setParseStatus] = useState<'idle' | 'parsing' | 'done'>('idle')

  const parseSections = useCallback(() => {
    setParseStatus('parsing')

    const sections: { sectionId: SectionType; content: string }[] = []

    for (const sectionType of sectionOrder) {
      if (sectionType === 'formatting') continue

      const pattern = SECTION_PATTERNS[sectionType]
      const match = paperContent.match(pattern)

      if (match) {
        const content = sectionType === 'title' ? match[1]?.trim() : match[1]?.trim()
        if (content) {
          sections.push({ sectionId: sectionType, content })

          if (sectionType === 'title' && !paperTitle) {
            onTitleChange(content)
          }
        }
      }
    }

    onParse(sections)
    setParseStatus('done')
  }, [paperContent, paperTitle, onParse, onTitleChange])

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        onContentChange(content)
      }
      reader.readAsText(file)
    },
    [onContentChange]
  )

  const wordCount = paperContent.trim().split(/\s+/).filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paper Input</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Paper Title
          </label>
          <input
            type="text"
            value={paperTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter paper title..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Paper Content
            </label>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {wordCount} words
            </span>
          </div>
          <Textarea
            value={paperContent}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Paste your paper content here (Markdown format recommended)..."
            className="min-h-[400px]"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-sm">Upload File</span>
            <input
              type="file"
              accept=".md,.txt,.tex"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <Button
            onClick={parseSections}
            disabled={!paperContent.trim() || parseStatus === 'parsing'}
          >
            {parseStatus === 'parsing' ? 'Parsing...' : 'Parse Sections'}
          </Button>

          {parseStatus === 'done' && (
            <span className="text-sm text-green-600 dark:text-green-400">
              Sections parsed successfully
            </span>
          )}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="font-medium mb-1">Detected Sections:</p>
          <div className="flex flex-wrap gap-2">
            {sectionOrder.filter(s => s !== 'formatting').map((section) => {
              const pattern = SECTION_PATTERNS[section]
              const hasContent = pattern.test(paperContent)
              return (
                <span
                  key={section}
                  className={`px-2 py-1 rounded text-xs ${
                    hasContent
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                  }`}
                >
                  {sectionLabels[section]}
                </span>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
