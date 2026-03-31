# Research Methodology for Framework Validation

> **TLDR:** Guide for conducting formal user studies to validate the SDLC documentation framework. Covers survey, time-task, and interview methods with sample protocols.

## Table of Contents
- [Overview](#overview)
- [What Makes Research "Formal"](#what-makes-research-formal)
- [Study Methods](#study-methods)
- [Sample Protocols](#sample-protocols)
- [Statistical Requirements](#statistical-requirements)
- [Ethics Considerations](#ethics-considerations)
- [Reporting Results](#reporting-results)
- [Publication Readiness](#publication-readiness)

---

## Overview

The SDLC Documentation Framework paper presents anecdotal observations. To strengthen claims for peer-reviewed publication, formal user studies are required. This document outlines methodologies for empirical validation.

### Current Claims (Anecdotal)

| Claim | Evidence Level |
|-------|---------------|
| "Reduced navigation time" | Observation |
| "Structured thinking" | Observation |
| "Visible accountability" | Observation |

### Target Claims (Empirical)

| Claim | Required Evidence |
|-------|------------------|
| "43% faster documentation discovery" | Time-task study |
| "Developer satisfaction increased" | Survey with Likert scale |
| "Reduced onboarding time" | Controlled experiment |

---

## What Makes Research "Formal"

### Requirements

| Requirement | Description |
|-------------|-------------|
| **Defined methodology** | Written protocol before data collection |
| **Sample size** | Enough participants for statistical significance |
| **Controls** | Account for confounding variables |
| **Reproducibility** | Another researcher can repeat the study |
| **Transparency** | Report methods, data, and limitations |

### Informal vs Formal

| Aspect | Informal | Formal |
|--------|----------|--------|
| Sample | "A few team members" | "n=30 developers" |
| Method | "We noticed that..." | "Participants completed Task X..." |
| Measurement | "Seems faster" | "Mean time reduced by 43% (SD=12.3)" |
| Analysis | Anecdotal | Statistical (t-test, ANOVA) |
| Claim | "Developers find it easier" | "p<0.05, effect size d=0.8" |

---

## Study Methods

### Method 1: Survey

**Purpose:** Measure subjective experience and preferences

**When to use:**
- Assessing satisfaction
- Gathering opinions on usability
- Comparing perceived difficulty

**Sample questions (Likert 1-5):**

```
1. I can predict where documentation is located.
   [ ] Strongly Disagree ... [ ] Strongly Agree

2. The folder structure matches my mental model.
   [ ] Strongly Disagree ... [ ] Strongly Agree

3. I spend less time searching for docs than before.
   [ ] Strongly Disagree ... [ ] Strongly Agree
```

**Minimum sample:** n=30 for statistical analysis

---

### Method 2: Time-Task Study

**Purpose:** Measure objective performance differences

**When to use:**
- Comparing two approaches (A/B)
- Measuring efficiency gains
- Quantifying learning curve

**Design:**

```
Group A (Control):    Unstructured documentation
Group B (Treatment):  SDLC-structured documentation

Tasks:
1. Find the architecture diagram for module X
2. Locate the testing strategy
3. Find the setup instructions for local development
4. Identify who owns documentation for module Y

Measure: Time to completion (seconds)
```

**Minimum sample:** n=12 per group (total n=24)

---

### Method 3: Structured Interview

**Purpose:** Gather rich qualitative data

**When to use:**
- Understanding user reasoning
- Discovering unexpected issues
- Exploring edge cases

**Protocol:**

```
1. Background (2 min)
   - Role, experience level, familiarity with codebase

2. Task walkthrough (10 min)
   - "Show me how you would find X"
   - Think-aloud protocol

3. Reflection (5 min)
   - "What was easy/difficult?"
   - "What would you change?"

4. Comparison (3 min)
   - "How does this compare to other projects?"
```

**Minimum sample:** n=8-12 for thematic saturation

---

### Method 4: A/B Experiment

**Purpose:** Establish causal relationships

**Design:**

```
                    ┌─────────────────┐
                    │  Participants   │
                    │    (n=40)       │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
     ┌────────────────┐            ┌────────────────┐
     │   Group A      │            │   Group B      │
     │  (Control)     │            │  (Treatment)   │
     │  Flat docs/    │            │  SDLC structure│
     │  no structure  │            │                │
     └────────┬───────┘            └────────┬───────┘
              │                             │
              ▼                             ▼
     ┌────────────────┐            ┌────────────────┐
     │ Complete tasks │            │ Complete tasks │
     │ Measure time   │            │ Measure time   │
     │ Survey after   │            │ Survey after   │
     └────────────────┘            └────────────────┘
```

**Controls:**
- Random assignment to groups
- Same tasks for both groups
- Same time limit
- Blind evaluator (if possible)

---

## Sample Protocols

### Protocol A: Documentation Discovery Study

**Research Question:** Does SDLC-aligned folder structure reduce documentation discovery time?

**Hypothesis:** Developers using SDLC structure will locate documentation faster than those using unstructured folders.

**Participants:**
- n=24 software developers
- Mix of junior/senior
- No prior exposure to either structure

**Procedure:**

1. **Briefing (5 min)**
   - Explain study purpose
   - Obtain consent

2. **Familiarization (10 min)**
   - Brief tour of assigned structure
   - No task practice

3. **Task Phase (20 min)**
   - 5 documentation discovery tasks
   - Screen recording + timer
   - No assistance provided

4. **Survey (5 min)**
   - Likert scale questions
   - Open feedback

5. **Debrief (5 min)**
   - Explain study design
   - Answer questions

**Metrics:**
- Primary: Time to task completion (seconds)
- Secondary: Success rate (found/not found)
- Secondary: Subjective ease rating (1-5)

**Analysis:**
- Independent samples t-test (time comparison)
- Chi-square (success rate)
- Mann-Whitney U (Likert ratings)

---

### Protocol B: Longitudinal Adoption Study

**Research Question:** Does documentation compliance improve after framework adoption?

**Design:** Pre/post measurement over 3 months

**Metrics:**
- % of modules with complete compulsory files
- # of documentation-related questions in Slack/issues
- Time from module creation to documentation completion

**Data Collection:**
- Month 0: Baseline measurement
- Month 1: Framework introduced + PR template
- Month 3: Post-adoption measurement

---

## Statistical Requirements

### Sample Size Guidelines

| Study Type | Minimum n | Recommended n |
|------------|-----------|---------------|
| Survey | 30 | 50+ |
| Time-task | 12/group | 20/group |
| Interview | 8 | 12-15 |
| A/B experiment | 20/group | 30/group |

### Statistical Tests

| Data Type | Comparison | Test |
|-----------|------------|------|
| Continuous (normal) | 2 groups | Independent t-test |
| Continuous (normal) | 3+ groups | ANOVA |
| Continuous (non-normal) | 2 groups | Mann-Whitney U |
| Ordinal (Likert) | 2 groups | Mann-Whitney U |
| Categorical | 2+ groups | Chi-square |

### Reporting Standards

Always report:
- Sample size (n)
- Central tendency (mean or median)
- Variability (SD or IQR)
- Test statistic (t, F, U, χ²)
- p-value
- Effect size (Cohen's d, η², r)

**Example:**
> Developers using SDLC structure located documentation significantly faster (M=34.2s, SD=12.1) than those using flat structure (M=61.8s, SD=18.4), t(22)=4.31, p<.001, d=1.78.

---

## Ethics Considerations

### When IRB Approval is Required

- Publishing in academic venues
- Research involving human subjects
- Data collection beyond normal work activities

### When IRB May Not Be Required

- Internal process improvement
- Retrospective analysis of existing data
- Publicly available data

### Consent Requirements

Participants must be informed of:
- Study purpose
- What data is collected
- How data will be used
- Right to withdraw
- Data retention policy

### Sample Consent Statement

```
This study examines documentation navigation patterns. Your
participation involves completing documentation search tasks
while being timed. Screen activity will be recorded. All data
will be anonymized. Participation is voluntary and you may
withdraw at any time without consequence.
```

---

## Reporting Results

### For Technical Reports

```markdown
## Results

We measured documentation discovery time across 24 developers.
The SDLC group (n=12) completed tasks faster than the control
group (n=12).

| Metric | Control | SDLC | Difference |
|--------|---------|------|------------|
| Mean time (s) | 61.8 | 34.2 | -45% |
| Success rate | 75% | 92% | +17% |
```

### For Academic Publication

```markdown
## Results

A between-subjects experiment compared documentation discovery
time between SDLC-structured (n=12) and unstructured (n=12)
documentation. An independent samples t-test revealed
significantly faster discovery times for the SDLC condition
(M=34.2s, SD=12.1) compared to control (M=61.8s, SD=18.4),
t(22)=4.31, p<.001. The effect size was large (Cohen's d=1.78),
indicating practical significance.
```

---

## Publication Readiness

### Document Types

| Type | Rigor | Review | Audience |
|------|-------|--------|----------|
| **Technical Report** | Low-Medium | Internal/none | Team, organization |
| **White Paper** | Medium | Editorial | Industry practitioners |
| **Workshop Paper** | Medium-High | Peer review (light) | Academic + practitioners |
| **Conference Paper** | High | Peer review | Academic community |
| **Journal Article** | Highest | Peer review (rigorous) | Academic community |

### Current Paper Status

The SDLC Documentation Framework paper is currently a **Technical Report**:

| Requirement | Status | Gap |
|-------------|--------|-----|
| Original contribution | ✓ | - |
| Clear methodology | ✓ | - |
| Case study | ✓ | - |
| Formal user study | ✗ | Need empirical validation |
| IRB approval | ✗ | Required for human subjects |
| DOI-linked references | ✗ | Web references need upgrading |
| Peer review | ✗ | Not submitted |

### Upgrading to Peer-Reviewed Publication

#### Step 1: Strengthen References

Replace web-only references with DOI-linked academic papers:

| Current | Upgrade To |
|---------|------------|
| Stack Overflow Survey (website) | Empirical SE studies on developer time |
| Diátaxis (website) | Find citing academic papers or keep as practitioner reference |
| Arc42, C4 (websites) | Architecture documentation literature (IEEE/ACM) |

**Finding DOI-linked papers:**
- Google Scholar: Search topic, filter by citations
- ACM Digital Library: https://dl.acm.org
- IEEE Xplore: https://ieeexplore.ieee.org
- DBLP: https://dblp.org (computer science bibliography)

**Reference format with DOI:**
```
[1] T. D. LaToza and B. A. Myers, "Hard-to-answer questions about code,"
    in Proc. PLATEAU Workshop, 2010. doi:10.1145/1937117.1937125
```

#### Step 2: IRB Approval

**What is IRB?**
Institutional Review Board - ethics committee that reviews research involving human subjects.

**When required:**
- Conducting surveys with participants
- Observing/recording developer behavior
- Collecting any data from individuals
- Publishing in academic venues

**When NOT required:**
- Analyzing your own team's internal processes
- Using publicly available data
- Retrospective analysis of existing metrics
- Technical reports for internal use

**Process:**
1. Submit protocol to institution's IRB
2. Include: study design, consent forms, data handling plan
3. Wait for approval (weeks to months)
4. Conduct study only after approval
5. Report IRB approval number in paper

**Example statement:**
> This study was approved by [Institution] IRB (Protocol #2025-0123). All participants provided informed consent.

**No IRB? Alternatives:**
- Partner with university researcher who has IRB access
- Limit claims to observational/anecdotal
- Use only anonymized, retrospective data

#### Step 3: Conduct Formal Study

See [Study Methods](#study-methods) and [Sample Protocols](#sample-protocols) above.

#### Step 4: Target Venue

| Venue Type | Examples | Fit for This Paper |
|------------|----------|-------------------|
| SE Conferences | ICSE, FSE, ASE | High bar, needs strong empirical |
| Documentation/Tools | DocEng, SIGDOC | Good fit for documentation focus |
| Practitioner | IEEE Software, ACM Queue | Good fit, lower empirical bar |
| Workshops | CHASE, ICSME workshops | Good for early feedback |

**Recommendation:** Start with workshop paper or IEEE Software for practitioner focus.

### Checklist: Technical Report → Conference Paper

- [ ] Replace 50%+ web references with DOI-linked papers
- [ ] Obtain IRB approval for user study
- [ ] Conduct formal study (n≥24 for quantitative)
- [ ] Report statistics with effect sizes
- [ ] Add threats to validity section (done)
- [ ] Have external researchers review
- [ ] Format for target venue
- [ ] Submit and address reviewer feedback

---

## See Also

- [SDLC Documentation Framework](./sdlc_documentation_framework.md) - Main paper
- [Documentation Standard](../../docs/documentation-standard.md) - Implementation guide
