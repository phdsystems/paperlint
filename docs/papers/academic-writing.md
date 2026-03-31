# Academic Writing

A comprehensive guide to academic writing for research papers in computer science and software engineering.

---

## Table of Contents

1. [Writing Fundamentals](#1-writing-fundamentals)
2. [Paper Structure](#2-paper-structure)
3. [Title, Abstract & Keywords](#3-title-abstract--keywords)
4. [Figures & Tables](#4-figures--tables)
5. [Citations & References](#5-citations--references)
6. [Paper Types & Venues](#6-paper-types--venues)
7. [Submission Process](#7-submission-process)
8. [Peer Review](#8-peer-review)
9. [Ethics](#9-ethics)
10. [LaTeX Essentials](#10-latex-essentials)
11. [Tools](#11-tools)
12. [Paper Review Process](#12-paper-review-process)

---

## 1. Writing Fundamentals

### Tone & Voice

| Principle | Avoid | Preferred |
|-----------|-------|-----------|
| **Formal register** | "This thing works great" | "This approach demonstrates efficacy" |
| **Objective stance** | "We believe this is best" | "Evidence suggests this approach is effective" |
| **Third person** | "I found that..." | "The results indicate..." |
| **No contractions** | "don't", "can't", "it's" | "do not", "cannot", "it is" |
| **Precise language** | "a lot of", "very big" | "substantial", "significant" |
| **No colloquialisms** | "at the end of the day" | Remove or rephrase formally |

### Hedging Language

Academic writing avoids absolutes. Use measured claims:

| Avoid | Prefer |
|-------|--------|
| "This proves..." | "This suggests..." / "This indicates..." |
| "always", "never" | "typically", "generally", "rarely" |
| "Obviously..." | "The evidence indicates..." |
| "is the best" | "may be more effective" / "appears to outperform" |
| "Everyone knows..." | "It is widely recognized..." |
| "will improve" | "may improve" / "is expected to improve" |

### Sentence Construction

**Do:**
- Use active voice for clarity: "The algorithm processes data" not "Data is processed"
- Keep sentences short for complex ideas (15-25 words average)
- Use parallel structure in lists
- Start paragraphs with topic sentences
- One idea per paragraph

**Avoid:**
- Run-on sentences
- Starting multiple sentences with "However," or "Therefore,"
- Dangling modifiers
- Stacked nouns: "system performance optimization strategy implementation"
- Nominalization overuse: "The utilization of..." → "Using..."

### Word Choice

| Avoid | Prefer |
|-------|--------|
| "very unique" | "unique" (absolutes need no modifier) |
| "in order to" | "to" |
| "due to the fact that" | "because" |
| "at this point in time" | "now" / "currently" |
| "a large number of" | "many" or specific number |
| "in the event that" | "if" |
| "prior to" | "before" |
| "utilize" | "use" |

---

## 2. Paper Structure

### IMRaD Format (Standard)

| Section | Purpose | Content |
|---------|---------|---------|
| **Introduction** | Why this matters | Problem, motivation, research questions, contributions |
| **Methods** / **Approach** | How you did it | Methodology, experimental setup, algorithms |
| **Results** | What you found | Data, measurements, observations (no interpretation) |
| **Discussion** | What it means | Interpretation, implications, comparison to prior work |
| **Conclusion** | Summary & future | Key findings, limitations, future work |

### Extended Structure (Common in CS)

```
1. Abstract
2. Introduction
3. Background / Related Work
4. Approach / Methodology / Design
5. Implementation (if applicable)
6. Evaluation / Experiments
7. Results
8. Discussion
9. Threats to Validity (for empirical papers)
10. Related Work (alternative placement)
11. Conclusion
12. Acknowledgments
13. References
14. Appendix (if needed)
```

### Section Guidelines

**Introduction (10-15% of paper)**
- Start broad, narrow to specific problem
- State research questions or hypotheses
- Summarize contributions (often as bullet list)
- Outline paper structure (optional)

**Related Work (10-15%)**
- Organize thematically, not chronologically
- Compare and contrast, don't just list
- Identify gaps your work addresses
- Position your work relative to existing literature

**Methodology (20-25%)**
- Sufficient detail for replication
- Justify design decisions
- Define metrics and evaluation criteria
- Describe datasets, participants, or experimental setup

**Results (15-20%)**
- Present data objectively
- Use figures and tables effectively
- Report statistical significance where applicable
- Don't interpret—save for Discussion

**Discussion (10-15%)**
- Interpret results in context
- Compare to hypotheses and prior work
- Acknowledge limitations
- Discuss implications

**Conclusion (5-10%)**
- Summarize key contributions
- State limitations honestly
- Propose concrete future work
- End with broader impact (optional)

---

## 3. Title, Abstract & Keywords

### Title

**Characteristics of good titles:**
- Specific and descriptive (not vague or overly broad)
- Contains key terms for searchability
- Indicates the contribution or finding
- 10-15 words typically
- No abbreviations (unless universally known)

**Patterns:**

| Pattern | Example |
|---------|---------|
| **Method: Result** | "SEA: A Stratified Architecture for JPMS-Enforced Isolation" |
| **Verb + Object** | "Improving API Usability Through Modular Encapsulation" |
| **Question** | "Can JPMS Enforce Consumer Isolation at Scale?" |
| **Topic: Subtitle** | "Modular Java Architecture: A Five-Layer Approach" |

**Avoid:**
- "A Study of..." / "An Investigation into..." (weak openings)
- Excessive punctuation or special characters
- Clickbait or sensationalist phrasing
- Questions (unless the paper answers definitively)

### Abstract

**Structure (typically 150-300 words):**

1. **Context** (1-2 sentences): Background and problem area
2. **Problem** (1-2 sentences): Specific gap or issue addressed
3. **Approach** (2-3 sentences): What you did / proposed solution
4. **Results** (2-3 sentences): Key findings with metrics
5. **Conclusion** (1 sentence): Significance and implications

**Example structure:**
```
[Context] Modern Java libraries face challenges in API management.
[Problem] Internal implementation details leak to consumers, causing coupling.
[Approach] We present SEA, a five-layer architecture using JPMS for enforcement.
[Results] Evaluation shows 94% reduction in API surface and zero leakage.
[Conclusion] SEA enables safe internal evolution while maintaining stability.
```

**Rules:**
- Self-contained (understandable without reading paper)
- No citations
- No undefined abbreviations
- No forward references ("Section 3 describes...")
- Quantify results where possible
- Write last (after paper is complete)

### Keywords

- 4-6 keywords/phrases
- Include synonyms for searchability
- Mix specific and general terms
- Match ACM CCS or IEEE taxonomy if required

**Example:**
```
Keywords: software architecture, modular design, Java Platform Module System,
JPMS, facade pattern, consumer isolation, API design
```

---

## 4. Figures & Tables

### When to Use

| Use Figures For | Use Tables For |
|-----------------|----------------|
| Trends and patterns | Precise numerical data |
| Architecture diagrams | Comparisons across categories |
| Workflows and processes | Feature matrices |
| Visualizing relationships | Experimental results |
| Screenshots (sparingly) | Configuration parameters |

### Figure Guidelines

**Design:**
- High resolution (300+ DPI for print)
- Readable when scaled to column width
- Consistent style throughout paper
- Colorblind-friendly palettes
- Vector formats preferred (PDF, SVG)

**Captions:**
- Below the figure
- Self-contained explanation
- Start with "Figure X:" or "Fig. X:"
- Describe what is shown, not what to conclude

**Example caption:**
```
Figure 3: Dependency flow between SEA modules. Arrows indicate
compile-time dependencies. The facade module aggregates all
internal modules while exposing only public APIs.
```

**Rules:**
- Reference every figure in text: "As shown in Figure 3..."
- Place figures near first reference
- Number consecutively
- Don't rely solely on color to convey information

### Table Guidelines

**Design:**
- Minimal borders (avoid grid lines)
- Align numbers by decimal point
- Use consistent precision
- Bold or highlight key values
- Horizontal rules: top, after header, bottom

**Captions:**
- Above the table
- Describe content and context
- Define abbreviations used

**Example:**
```
Table 2: API surface comparison across isolation approaches.
Values represent public types accessible to consumers.

| Approach              | Types | Methods | Reduction |
|-----------------------|------:|--------:|----------:|
| No isolation          |   847 |   4,231 |        — |
| Package-private       |   312 |   1,567 |    63.2% |
| SEA with JPMS         |    47 |     198 |    94.4% |
```

---

## 5. Citations & References

### Citation Practices

- **Cite all claims** not originating from your work
- **Primary sources** preferred over secondary summaries
- **Recent literature** includes work from last 3-5 years
- **Balanced coverage** represents multiple perspectives
- **Self-citation** used sparingly and only when relevant
- **Cite specifically** with page numbers for quotes or specific claims

### When to Cite

| Situation | Citation Needed? |
|-----------|------------------|
| Direct quote | Yes (with page number) |
| Paraphrased idea | Yes |
| Common knowledge in field | No |
| Your own prior work | Yes (unless same paper) |
| Statistical methods | Yes |
| Tools and datasets | Yes |
| General facts | No |

### Citation Styles

| Style | Domain | In-Text | Reference Format |
|-------|--------|---------|------------------|
| **IEEE** | Engineering, CS | [1] | [1] A. Author, "Title," *Journal*, vol. X, pp. Y-Z, Year. |
| **ACM** | Computing | [1] or (Author Year) | Author, A. Year. Title. *Journal* Vol, Issue, pp-pp. |
| **APA 7th** | Social sciences | (Author, Year) | Author, A. A. (Year). Title. *Journal*, *Vol*(Issue), pp. |
| **Chicago** | Humanities | Footnotes / (Author Year) | Author, A. *Title*. Place: Publisher, Year. |
| **Harvard** | Business, Sciences | (Author Year) | Author, A. (Year) Title. *Journal*, Vol(Issue), pp. |
| **MLA 9th** | Literature, Arts | (Author Page) | Author. "Title." *Journal*, vol. X, no. Y, Year, pp. |
| **Vancouver** | Medicine | (1) | 1. Author A. Title. Journal. Year;Vol(Issue):pp. |

**For CS papers:** IEEE and ACM are standard. Always check venue requirements.

### IEEE Style Examples

**Journal article:**
```
[1] R. C. Martin, "Design principles and design patterns,"
    Object Mentor, vol. 1, no. 34, pp. 1-20, 2000.
```

**Conference paper:**
```
[2] E. Gamma, R. Helm, R. Johnson, and J. Vlissides, "Design
    patterns: Abstraction and reuse of object-oriented design,"
    in Proc. ECOOP, 1993, pp. 406-431.
```

**Book:**
```
[3] N. Parlog, The Java Module System. Manning Publications, 2019.
```

**Online resource:**
```
[4] Oracle Corporation. "Java Platform Module System."
    [Online]. Available: https://openjdk.org/projects/jigsaw/.
    [Accessed: Dec. 15, 2024].
```

### ACM Style Examples

**Journal article:**
```
Robert C. Martin. 2000. Design principles and design patterns.
Object Mentor 1, 34 (2000), 1-20.
```

**Conference paper:**
```
Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides. 1993.
Design patterns: Abstraction and reuse of object-oriented design.
In Proceedings of ECOOP. 406-431.
```

---

## 6. Paper Types & Venues

### Paper Types

| Type | Length | Purpose |
|------|--------|---------|
| **Full paper** | 10-14 pages | Complete research contribution |
| **Short paper** | 4-6 pages | Preliminary results, position, vision |
| **Tool paper** | 4-6 pages | Software tool demonstration |
| **Experience report** | 6-10 pages | Industry practice, lessons learned |
| **Survey/SoK** | 15-25 pages | Systematization of knowledge |
| **Workshop paper** | 4-8 pages | Early-stage work, discussion |
| **Poster/Extended abstract** | 1-2 pages | Brief summary for poster session |
| **Journal article** | 20-40 pages | Comprehensive, extended research |

### Venues

**Top CS/SE Conferences:**
- ICSE (International Conference on Software Engineering)
- FSE/ESEC (Foundations of Software Engineering)
- ASE (Automated Software Engineering)
- OOPSLA (Object-Oriented Programming, Systems, Languages & Applications)
- PLDI (Programming Language Design and Implementation)

**Top Journals:**
- IEEE TSE (Transactions on Software Engineering)
- ACM TOSEM (Transactions on Software Engineering and Methodology)
- EMSE (Empirical Software Engineering)
- JSS (Journal of Systems and Software)
- IEEE Software

### Conference vs Journal

| Aspect | Conference | Journal |
|--------|------------|---------|
| **Timeline** | 3-6 months | 6-18 months |
| **Review rounds** | 1-2 | 2-4 |
| **Length** | 10-14 pages | 20-40 pages |
| **Presentation** | Required | Not required |
| **Acceptance rate** | 15-25% (top venues) | Higher |
| **Prestige** | High in CS | High across fields |

---

## 7. Submission Process

### Pre-Submission Checklist

**Content:**
- [ ] Abstract within word limit
- [ ] All figures/tables referenced in text
- [ ] All citations present in references
- [ ] No orphan references (cited but not used)
- [ ] Contributions clearly stated
- [ ] Limitations acknowledged
- [ ] Future work discussed

**Formatting:**
- [ ] Correct template used
- [ ] Page limit respected
- [ ] Font sizes match requirements
- [ ] Margins correct
- [ ] Anonymized (for double-blind review)
- [ ] Line numbers enabled (if required)

**Quality:**
- [ ] Spell-checked
- [ ] Grammar-checked
- [ ] Read aloud for flow
- [ ] Co-authors reviewed
- [ ] External colleague reviewed (if possible)

### Anonymization (Double-Blind)

**Remove:**
- Author names and affiliations
- Acknowledgments (or anonymize)
- Self-citations that reveal identity: "In our previous work [1]..."
- Repository URLs, project names
- Funding information that identifies institution

**Replace with:**
- "In prior work [1]..." (cite normally)
- "[Anonymous repository]" for URLs
- "[Anonymized for review]" for identifying information

**Check:**
- PDF metadata (author field)
- Figure/image metadata
- File names in supplementary material

### Cover Letter (Journals)

**Include:**
- Paper title and authors
- Brief summary (2-3 sentences)
- Significance and contribution
- Fit to journal scope
- Confirmation of originality
- Suggested reviewers (optional)
- Any conflicts of interest

---

## 8. Peer Review

### Review Criteria

Reviewers typically assess:

| Criterion | Questions |
|-----------|-----------|
| **Originality** | Is this novel? Does it advance the field? |
| **Significance** | Does it matter? Is the problem important? |
| **Soundness** | Is the methodology correct? Are claims supported? |
| **Clarity** | Is it well-written and understandable? |
| **Reproducibility** | Can others replicate this work? |
| **Related work** | Is prior work adequately covered? |
| **Presentation** | Are figures/tables effective? |

### Review Outcomes

| Decision | Meaning | Next Steps |
|----------|---------|------------|
| **Accept** | Ready for publication | Minor edits, camera-ready |
| **Minor revision** | Small changes needed | Revise and resubmit (no re-review) |
| **Major revision** | Significant changes needed | Revise and re-review |
| **Reject** | Not suitable | Revise substantially, try elsewhere |
| **Desk reject** | Out of scope / low quality | Reassess before resubmitting |

### Responding to Reviews

**Structure:**
```
We thank the reviewers for their constructive feedback.

## Response to Reviewer 1

> [Quote reviewer comment]

We agree with this observation. We have revised Section 3.2 to...
[Specific changes made, with line numbers if possible]

> [Next comment]

We respectfully disagree because... However, we have added
clarification in Section 4 to address this concern.
```

**Guidelines:**
- Thank reviewers genuinely
- Address every comment (even minor ones)
- Quote the original comment
- Be specific about changes made
- Reference line/page numbers
- Be respectful when disagreeing
- Provide evidence for rebuttals
- Highlight major changes in revision

---

## 9. Ethics

### Plagiarism

| Type | Description | Severity |
|------|-------------|----------|
| **Direct copying** | Verbatim text without quotes/citation | Severe |
| **Paraphrasing** | Rewording without citation | Severe |
| **Self-plagiarism** | Reusing own prior text without disclosure | Moderate |
| **Mosaic** | Piecing together sources | Moderate |
| **Idea plagiarism** | Using concepts without attribution | Moderate |

**Avoidance:**
- Always cite sources
- Use quotation marks for direct quotes
- Paraphrase substantially and cite
- Disclose prior publications of same work
- Use plagiarism detection before submission

### Authorship

**ICMJE Criteria (widely adopted):**

All authors must meet ALL of:
1. Substantial contribution to conception/design OR data acquisition/analysis
2. Drafting or critical revision of manuscript
3. Final approval of version to be published
4. Accountability for all aspects of work

**Not sufficient for authorship:**
- Funding acquisition alone
- Supervision alone
- Data collection alone
- Proofreading alone

**Author order conventions:**
- First author: Primary contributor
- Last author: Senior/supervising researcher (in some fields)
- Middle authors: Ordered by contribution
- Corresponding author: Handles communication

### Research Integrity

- Report results honestly (no fabrication/falsification)
- Disclose conflicts of interest
- Obtain ethics approval for human subjects
- Share data and code when possible
- Acknowledge funding sources
- Correct errors promptly
- Don't submit to multiple venues simultaneously

---

## 10. LaTeX Essentials

### Document Structure

```latex
\documentclass[sigconf]{acmart}  % ACM format
% or
\documentclass[conference]{IEEEtran}  % IEEE format

\begin{document}

\title{Your Paper Title}
\author{Author Name}
\affiliation{\institution{University}}

\begin{abstract}
Your abstract here.
\end{abstract}

\keywords{keyword1, keyword2, keyword3}

\maketitle

\section{Introduction}
Your introduction...

\section{Related Work}
\cite{martin2017clean} proposed...

\bibliographystyle{ACM-Reference-Format}  % or IEEEtran
\bibliography{references}

\end{document}
```

### Common Commands

**Text formatting:**
```latex
\textbf{bold}
\textit{italic}
\texttt{monospace}
\emph{emphasis}
```

**Sections:**
```latex
\section{Major Section}
\subsection{Subsection}
\subsubsection{Sub-subsection}
\paragraph{Paragraph heading}
```

**Lists:**
```latex
\begin{itemize}
    \item First item
    \item Second item
\end{itemize}

\begin{enumerate}
    \item Numbered item
    \item Another item
\end{enumerate}
```

**Figures:**
```latex
\begin{figure}[t]
    \centering
    \includegraphics[width=\columnwidth]{figure.pdf}
    \caption{Description of figure.}
    \label{fig:example}
\end{figure}

As shown in Figure~\ref{fig:example}...
```

**Tables:**
```latex
\begin{table}[t]
    \caption{Description of table.}
    \label{tab:example}
    \begin{tabular}{lrr}
        \toprule
        Method & Precision & Recall \\
        \midrule
        Baseline & 0.72 & 0.68 \\
        Our approach & 0.89 & 0.85 \\
        \bottomrule
    \end{tabular}
\end{table}
```

**Citations:**
```latex
\cite{author2020}           % [1] or (Author 2020)
\citet{author2020}          % Author [1] or Author (2020)
\citep{author2020}          % [1] or (Author 2020)
\cite{a2020,b2021,c2022}    % Multiple citations
```

**Cross-references:**
```latex
\label{sec:intro}           % Define label
Section~\ref{sec:intro}     % Reference section
Figure~\ref{fig:example}    % Reference figure
Table~\ref{tab:example}     % Reference table
```

### Useful Packages

```latex
\usepackage{booktabs}       % Professional tables
\usepackage{graphicx}       % Images
\usepackage{hyperref}       % Clickable links
\usepackage{cleveref}       % Smart references
\usepackage{listings}       % Code listings
\usepackage{algorithm2e}    % Algorithms
\usepackage{amsmath}        % Math
\usepackage{balance}        % Balance columns on last page
```

### BibTeX Entry Types

```bibtex
@article{key,
    author = {First Last and Second Author},
    title = {Article Title},
    journal = {Journal Name},
    volume = {10},
    number = {2},
    pages = {100--120},
    year = {2024}
}

@inproceedings{key,
    author = {Author Name},
    title = {Paper Title},
    booktitle = {Proc. Conference Name},
    pages = {1--10},
    year = {2024}
}

@book{key,
    author = {Author Name},
    title = {Book Title},
    publisher = {Publisher},
    year = {2024}
}

@online{key,
    author = {Author},
    title = {Page Title},
    url = {https://example.com},
    urldate = {2024-12-16}
}
```

---

## 11. Tools

### Writing Quality & Style

| Tool | Purpose | URL |
|------|---------|-----|
| **Grammarly** | Grammar, tone, clarity | grammarly.com |
| **ProWritingAid** | Style, readability, clichés | prowritingaid.com |
| **Writefull** | Academic phrasing, language | writefull.com |
| **Trinka AI** | Academic/technical writing | trinka.ai |
| **Hemingway Editor** | Readability, complexity | hemingwayapp.com |
| **LanguageTool** | Open-source grammar check | languagetool.org |
| **Paperpal** | Academic grammar checker | paperpal.com |
| **QuillBot** | Grammar, paraphrasing | quillbot.com |
| **PaperRater** | Grammar, plagiarism check | paperrater.com |

### LaTeX Editors & Platforms

| Tool | Purpose | URL |
|------|---------|-----|
| **Overleaf** | Collaborative online LaTeX | overleaf.com |
| **TeXstudio** | Desktop LaTeX IDE | texstudio.org |
| **VS Code + LaTeX Workshop** | VS Code extension | marketplace.visualstudio.com |

### Reference Management

| Tool | Purpose | URL |
|------|---------|-----|
| **Zotero** | Free, open-source | zotero.org |
| **Mendeley** | Reference manager, PDF reader | mendeley.com |
| **EndNote** | Commercial, feature-rich | endnote.com |
| **JabRef** | Open-source BibTeX manager | jabref.org |
| **Paperpile** | Google Docs integration | paperpile.com |

### Format Compliance

| Tool | Purpose | URL |
|------|---------|-----|
| **IEEE PDF eXpress** | IEEE format validation | ieee-pdf-express.org |
| **ACM TAPS** | ACM format validation | taps.acm.org |

### Plagiarism Detection

| Tool | Purpose | URL |
|------|---------|-----|
| **iThenticate** | Research plagiarism check | ithenticate.com |
| **Turnitin** | Institutional plagiarism | turnitin.com |

### Collaboration

| Tool | Purpose | URL |
|------|---------|-----|
| **Overleaf** | Real-time LaTeX collaboration | overleaf.com |
| **GitHub** | Version control | github.com |
| **Google Docs** | Easy collaboration (non-LaTeX) | docs.google.com |

### Visualization

| Tool | Purpose | URL |
|------|---------|-----|
| **draw.io** | Diagrams, flowcharts | draw.io |
| **Lucidchart** | Professional diagrams | lucidchart.com |
| **Mermaid** | Diagrams as code | mermaid.js.org |
| **matplotlib** | Python plotting | matplotlib.org |
| **TikZ** | LaTeX diagrams | ctan.org/pkg/pgf |

---

## Quick Reference Card

### Pre-Submission Checks
```
[ ] Spell-check and grammar-check complete
[ ] All figures/tables referenced
[ ] All citations in reference list
[ ] Abstract within word limit
[ ] Page limit respected
[ ] Anonymized (if double-blind)
[ ] PDF metadata cleaned
[ ] Co-author approval obtained
```

### Writing Checklist
```
[ ] Active voice used predominantly
[ ] Hedging language where appropriate
[ ] No unsupported claims
[ ] Technical terms defined
[ ] Acronyms expanded on first use
[ ] Consistent terminology throughout
[ ] Contributions clearly stated
[ ] Limitations acknowledged
```

### Common Errors to Avoid
```
- Overclaiming results
- Missing citations for claims
- Inconsistent terminology
- Vague metrics ("improved significantly")
- Buried contributions
- Ignored related work
- Missing limitations discussion
- Weak future work section
```

---

## 12. Paper Review Process

### Review Workflow

```
1. READ        → Read paper against guide criteria
2. SCORE       → Score each section (1-10)
3. CATEGORIZE  → Must fix / Should fix / Consider
4. FIX         → Apply fixes systematically
5. RE-VERIFY   → Confirm fixes, update scores
```

### Section-by-Section Review Checklist

#### Abstract
```
[ ] Within word limit (150-300 words typical)
[ ] Follows structure: Context → Problem → Approach → Results → Conclusion
[ ] Contains quantified results (percentages, metrics)
[ ] Metrics consistent with body of paper
[ ] No citations
[ ] No undefined abbreviations
[ ] No forward references
[ ] Self-contained (understandable alone)
```

#### Title
```
[ ] Specific and descriptive (not vague)
[ ] Contains searchable key terms
[ ] 10-15 words
[ ] No unexpanded abbreviations (unless universal)
[ ] Indicates contribution or finding
[ ] No weak openings ("A Study of...")
```

#### Introduction
```
[ ] Problem clearly stated
[ ] Concrete pain points (not abstract)
[ ] Research questions/hypotheses defined
[ ] Contributions explicitly listed
[ ] Paper structure outlined
[ ] Citations support claims
[ ] Appropriate hedging language
```

#### Related Work
```
[ ] Organized thematically (not chronologically)
[ ] Compares and contrasts (not just lists)
[ ] Identifies gaps addressed by this work
[ ] Positions work relative to prior art
[ ] Balanced coverage of perspectives
[ ] Recent work included (last 3-5 years)
```

#### Methodology
```
[ ] Sufficient detail for replication
[ ] Design decisions justified
[ ] Metrics and criteria defined
[ ] Datasets/participants described
[ ] Tools and versions specified
[ ] Limitations of method acknowledged
```

#### Results
```
[ ] Data presented objectively
[ ] Figures and tables effective
[ ] Statistical significance reported
[ ] No interpretation (save for Discussion)
[ ] All figures/tables referenced in text
[ ] Consistent precision in numbers
```

#### Discussion
```
[ ] Results interpreted in context
[ ] Comparison to hypotheses
[ ] Comparison to prior work
[ ] Limitations acknowledged honestly
[ ] Implications discussed
[ ] No new results introduced
```

#### Threats to Validity
```
[ ] Internal validity addressed
[ ] External validity addressed
[ ] Construct validity addressed
[ ] Mitigations described where applicable
[ ] Honest about limitations
```

#### Conclusion
```
[ ] Key contributions summarized
[ ] Limitations restated briefly
[ ] Concrete future work proposed
[ ] No new information introduced
[ ] Appropriate scope (not overclaiming)
```

#### References
```
[ ] All citations present in reference list
[ ] No orphan references (cited but not used in text)
[ ] Consistent citation style throughout
[ ] Web citations have URLs and access dates
[ ] Mix of seminal and recent work
[ ] Primary sources preferred
[ ] Author names and attributions correct
```

#### Formatting & Language
```
[ ] Correct template used
[ ] Page limit respected
[ ] Figures high resolution (300+ DPI)
[ ] Tables properly formatted (minimal borders)
[ ] Consistent terminology throughout
[ ] Acronyms expanded on first use
[ ] Formal tone (no colloquialisms)
[ ] Hedging language where appropriate
[ ] Active voice predominant
[ ] No contractions
```

### Issue Categorization

| Category | Criteria | Examples |
|----------|----------|----------|
| **Must Fix** | Factual errors, missing required sections, format violations | Wrong metrics, missing Threats to Validity, broken citations |
| **Should Fix** | Quality issues that weaken the paper | Informal language, incomplete references, missing data availability |
| **Consider** | Minor improvements, style preferences | Additional citations, word choice refinements |

### Scoring Rubric

| Score | Meaning | Characteristics |
|-------|---------|-----------------|
| 10 | Excellent | No issues, exemplary quality |
| 9 | Very Good | Minor style issues only |
| 8 | Good | Few substantive issues, easily fixed |
| 7 | Acceptable | Several issues needing attention |
| 6 | Weak | Significant issues affecting quality |
| 5 | Poor | Major revision needed |
| <5 | Reject | Fundamental problems |

### Review Report Template

```markdown
## Paper Review: [Title]

### Overall Assessment: [Strong Accept / Accept / Minor Revision / Major Revision / Reject]

---

### Strengths
| Aspect | Assessment |
|--------|------------|
| Structure | ... |
| Problem statement | ... |
| Evaluation | ... |

---

### Issues Found

#### Must Fix
1. [Issue]: [Current] → [Fix]
2. ...

#### Should Fix
1. [Issue]: [Current] → [Fix]
2. ...

#### Consider
1. [Issue]: [Suggestion]
2. ...

---

### Section Scores

| Section | Score | Notes |
|---------|-------|-------|
| Abstract | X/10 | ... |
| Introduction | X/10 | ... |
| ... | ... | ... |

**Overall: X.X/10**
```

### Post-Review Verification

After applying fixes:
```
[ ] All "Must Fix" items resolved
[ ] All "Should Fix" items addressed or justified
[ ] Metrics consistent throughout paper
[ ] No new errors introduced
[ ] Re-read affected sections for flow
[ ] Update section scores
[ ] Calculate new overall score
```
