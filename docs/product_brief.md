# PaperLint — Product Brief

## What It Is

PaperLint is a web-based academic paper quality analyzer that detects writing issues, validates statistical reporting, and identifies AI-generated content. It provides real-time, section-aware analysis with configurable rules, dual LLM support (OpenAI + Anthropic), and severity-prioritized feedback. Built in TypeScript with React 19.

## The Problem It Solves

Academic papers fail peer review for preventable reasons: vague language, passive voice overuse, missing effect sizes, suspicious p-value patterns, underpowered studies, and now — AI-generated content. Generic grammar tools don't understand academic conventions. Statistical review happens too late. Authors miss venue-specific requirements.

PaperLint catches these issues before submission with domain-specific rules, statistical methodology validation, and AI content detection — all running in the browser with optional LLM enhancement.

## Capabilities

| Feature | Detail |
|---------|--------|
| Writing analysis | 12 rules: weasel words, passive voice, nominalizations, redundant phrases, hedge words, Latin abbreviations, sentence variety |
| Statistical validation | Sample size adequacy, effect sizes, p-value patterns (suspicious zeros), confidence intervals, multiple comparisons, power analysis, assumption testing |
| AI content detection | LLM-powered multi-indicator analysis (structure, vocabulary, style, authenticity). Confidence scoring (0-100). OpenAI + Anthropic support |
| Section checklists | 10 sections (Title through References) with per-section criteria, word limits, and structure validation |
| Grammar checking | LanguageTool integration with configurable rules |
| Scoring | Weighted section scores (0-10), grade mapping (A-F), per-issue severity weighting |
| Report generation | PDF export with issue summaries, scores, and improvement suggestions |
| Configuration | YAML-based rules — patterns, thresholds, severities customizable without code changes |

## Severity Levels

| Level | Weight | Example |
|-------|--------|---------|
| Must-fix | 3 | Missing effect sizes, p-value without context |
| Should-fix | 2 | Excessive passive voice, missing confidence intervals |
| Consider | 1 | Sentence variety, Latin abbreviations |

## Technology Stack

TypeScript, React 19, Vite/Bun, Tailwind CSS 4, OpenAI SDK (GPT-4 Turbo), Anthropic SDK (Claude), LanguageTool API, YAML configuration.

## Who It's For

PhD students and researchers in computer science and software engineering writing papers for competitive venues (ICSE, FSE, OOPSLA, ACM/IEEE journals). Advisors reviewing student drafts. Research groups enforcing writing standards.
