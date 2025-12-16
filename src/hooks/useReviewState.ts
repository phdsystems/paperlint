import { useState, useCallback, useMemo } from 'react'
import type { ReviewState, Section, Issue } from '../types'
import { sectionOrder, sectionLabels, createInitialChecklist } from '../lib/checklist-data'

const createInitialSections = (): Section[] => {
  return sectionOrder.map(sectionType => ({
    id: sectionType,
    name: sectionLabels[sectionType],
    content: '',
    checklist: createInitialChecklist(sectionType),
    score: 0,
    issues: [],
  }))
}

const initialState: ReviewState = {
  paperTitle: '',
  paperContent: '',
  sections: createInitialSections(),
  overallScore: 0,
  status: 'idle',
}

export function useReviewState() {
  const [state, setState] = useState<ReviewState>(initialState)

  const setPaperContent = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      paperContent: content,
      status: 'idle',
    }))
  }, [])

  const setPaperTitle = useCallback((title: string) => {
    setState(prev => ({ ...prev, paperTitle: title }))
  }, [])

  const setStatus = useCallback((status: ReviewState['status']) => {
    setState(prev => ({ ...prev, status }))
  }, [])

  const updateSectionContent = useCallback((sectionId: string, content: string) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, content } : s
      ),
    }))
  }, [])

  const toggleChecklistItem = useCallback((sectionId: string, itemId: string) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              checklist: s.checklist.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : s
      ),
    }))
  }, [])

  const updateSectionScore = useCallback((sectionId: string, score: number) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, score } : s
      ),
    }))
  }, [])

  const addIssue = useCallback((sectionId: string, issue: Issue) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, issues: [...s.issues, issue] } : s
      ),
    }))
  }, [])

  const removeIssue = useCallback((sectionId: string, issueId: string) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, issues: s.issues.filter(i => i.id !== issueId) }
          : s
      ),
    }))
  }, [])

  const updateIssue = useCallback((sectionId: string, issueId: string, updates: Partial<Issue>) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              issues: s.issues.map(i =>
                i.id === issueId ? { ...i, ...updates } : i
              ),
            }
          : s
      ),
    }))
  }, [])

  const updateChecklistFromAI = useCallback(
    (sectionId: string, updates: { itemId: string; suggested: boolean }[]) => {
      setState(prev => ({
        ...prev,
        sections: prev.sections.map(s =>
          s.id === sectionId
            ? {
                ...s,
                checklist: s.checklist.map(item => {
                  const update = updates.find(u => u.itemId === item.id)
                  return update ? { ...item, aiSuggested: update.suggested } : item
                }),
              }
            : s
        ),
      }))
    },
    []
  )

  const calculateSectionScore = useCallback((section: Section): number => {
    const checkedCount = section.checklist.filter(item => item.checked).length
    const totalCount = section.checklist.length
    if (totalCount === 0) return 0
    return Math.round((checkedCount / totalCount) * 10 * 10) / 10
  }, [])

  const overallScore = useMemo(() => {
    const scores = state.sections.map(s => calculateSectionScore(s))
    const validScores = scores.filter(s => s > 0)
    if (validScores.length === 0) return 0
    return Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
  }, [state.sections, calculateSectionScore])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  return {
    state: { ...state, overallScore },
    actions: {
      setPaperContent,
      setPaperTitle,
      setStatus,
      updateSectionContent,
      toggleChecklistItem,
      updateSectionScore,
      addIssue,
      removeIssue,
      updateIssue,
      updateChecklistFromAI,
      calculateSectionScore,
      reset,
    },
  }
}
