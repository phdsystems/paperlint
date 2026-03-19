# PaperLint — Project Reference

## Project Overview

PaperLint is a web-based academic paper quality analyzer built in TypeScript (6,156 LOC, 33 files) with React 19. Provides 12 academic writing lint rules, statistical reporting validation (sample size, effect size, p-value patterns, power analysis), LLM-powered AI content detection (OpenAI GPT-4 Turbo + Anthropic Claude), 10-section checklists, real-time scoring (0-10 with A-F grades), LanguageTool grammar integration, and YAML-configurable rule engine. Client-side analysis with optional LLM enhancement.

## Your Role

_Title:_ _Team:_ _Duration:_ _Responsibilities:_

## Key Achievements

- _[e.g., "Built 12-rule academic writing linter detecting weasel words, passive voice, nominalizations, and hedge word clustering"]_
- _[e.g., "Implemented statistical reporting validator catching missing effect sizes, suspicious p-values, underpowered studies, and assumption violations"]_
- _[e.g., "Designed LLM-powered AI content detection with multi-indicator analysis and confidence scoring via OpenAI and Anthropic APIs"]_
- _[e.g., "Created YAML-configurable rule engine enabling pattern/threshold customization without code changes"]_
- _[e.g., "Built sample size calculators for experimental, observational, and qualitative study designs"]_

## Technical Scope

- **9 core analysis modules**: academic-linter (12 rules), statistics-linter (config-driven), statistics-calculator (sample/effect size), ai-detection (LLM-powered), statistics-ai (AI methodology review), text-analysis, ai-client (dual LLM), language-tool (grammar), checklist-data (10 sections).
- **10 React components**: PaperInput, SectionReview, TextAnalysis, StatisticsReview, AIDetection, ReportGenerator, ScoreCard, IssueList, Checklist, UI primitives.
- **Writing rules**: Weasel words, passive voice, nominalizations, redundant phrases, weak starters, hedge words, Latin abbreviations, sentence length variety, repeated starts.
- **Statistical checks**: Sample size adequacy, effect size interpretation, p-value patterns (suspicious zeros), confidence intervals, multiple comparisons, power analysis, study design, assumption testing.
- **AI detection**: Multi-indicator (structure consistency, vocabulary patterns, style analysis, content authenticity). Confidence scoring 0-100.
- **Scoring**: Weighted sections (methodology 1.2x, abstract 1.0x, title 0.5x). 3-tier severity (must-fix/should-fix/consider).
- **Configuration**: YAML rules for patterns, thresholds, severities. Runtime compilation and caching.

## Technology Stack

| Category | Technologies |
|----------|-------------|
| Language | TypeScript (strict mode) |
| UI | React 19, Tailwind CSS 4 |
| Build | Vite 6 / Bun |
| LLM | OpenAI SDK 4.76 (GPT-4 Turbo), Anthropic SDK 0.32 (Claude) |
| Grammar | LanguageTool API |
| Config | YAML (analysis-config.yaml) |
| Testing | Bun test runner |
| Export | PDF report generation |

## Keywords

TypeScript, React, academic writing, paper quality, writing analysis, statistical validation, p-value, effect size, sample size, power analysis, confidence interval, AI content detection, LLM, OpenAI, GPT-4, Anthropic, Claude, LanguageTool, grammar checking, academic integrity, peer review, research methodology, YAML configuration, real-time analysis, PDF report, scoring, severity levels, computer science, software engineering, PhD, academic publishing
