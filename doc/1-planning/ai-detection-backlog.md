# AI Detection Feature Backlog

## Overview

Add AI-generated content detection capabilities to PaperLint for identifying potentially AI-written academic text.

---

## Phase 1: LLM-Powered Detection [CURRENT]

**Status:** In Progress

**Approach:** Use existing Claude/OpenAI integration to analyze text for AI-generation patterns.

**Implementation:**
- Add detection prompts to ai-client.ts
- Create AIDetection component
- Integrate into TextAnalysis workflow
- Display confidence score and indicators

**Pros:**
- Quick implementation (uses existing AI client)
- No training required
- Good accuracy with proper prompting

**Cons:**
- API cost per analysis
- Requires internet connection
- Rate limits apply

**Deliverables:**
- [ ] `src/lib/ai-detection.ts` - Detection logic
- [ ] `src/components/AIDetection.tsx` - UI component
- [ ] Update `analysis-config.yaml` with detection settings
- [ ] Integration with section analysis

---

## Phase 2: Statistical Analysis

**Status:** Planned

**Approach:** Implement local heuristics that run in-browser without API calls.

**Metrics to Implement:**
- Perplexity scoring (text predictability)
- Burstiness analysis (sentence complexity variation)
- Vocabulary richness (type-token ratio)
- Sentence length variance
- Common AI phrase detection

**Implementation:**
- N-gram frequency models
- Entropy calculations
- Pattern matching for AI indicators

**Pros:**
- Free (no API costs)
- Instant results
- Works offline
- Privacy-preserving

**Cons:**
- Lower accuracy than ML models
- May produce false positives
- Requires calibration

**Deliverables:**
- [ ] `src/lib/statistical-detector.ts` - Core algorithms
- [ ] `src/lib/ai-phrase-patterns.ts` - Common AI phrases
- [ ] Perplexity calculator
- [ ] Burstiness analyzer
- [ ] Combined scoring system

---

## Phase 3: Browser-based ML Model

**Status:** Planned

**Approach:** Train a lightweight classifier and run it client-side with TensorFlow.js.

**Architecture:**
- DistilBERT or MobileBERT base
- Binary classification (human vs AI)
- Quantized for browser (~5-10MB)
- WebGPU acceleration where available

**Training Data Requirements:**
- Human-written academic papers (various disciplines)
- AI-generated academic text (GPT-4, Claude, etc.)
- Minimum 10k samples per class
- Balanced dataset

**Implementation:**
- Train model in Python (PyTorch/TensorFlow)
- Export to ONNX or TensorFlow.js format
- Load and run in browser
- Batch processing for long documents

**Pros:**
- High accuracy
- No ongoing API costs
- Works offline
- Fast inference

**Cons:**
- Initial training effort
- Model size impacts load time
- Needs periodic retraining

**Deliverables:**
- [ ] Training pipeline (`/ml/train.py`)
- [ ] Dataset collection scripts
- [ ] TensorFlow.js model export
- [ ] `src/lib/ml-detector.ts` - Browser inference
- [ ] Model versioning system

---

## Phase 4: Fine-tuned Custom Model

**Status:** Planned

**Approach:** Train a domain-specific model for academic writing detection.

**Model Options:**
- RoBERTa-base fine-tuned
- DeBERTa-v3 (best accuracy)
- SciBERT (academic domain)

**Hosting Options:**
- HuggingFace Inference API
- Self-hosted (Docker container)
- AWS SageMaker / GCP Vertex AI

**Training Strategy:**
- Collect academic papers from arXiv, PubMed
- Generate AI versions using multiple models
- Include paraphrased/edited AI text
- Cross-validation across disciplines

**Pros:**
- Highest accuracy
- Domain-specific tuning
- Customizable thresholds

**Cons:**
- Significant training effort
- Hosting costs
- Maintenance overhead

**Deliverables:**
- [ ] Training dataset pipeline
- [ ] Fine-tuning scripts
- [ ] Model evaluation framework
- [ ] API endpoint for inference
- [ ] `src/lib/api-detector.ts` - API client

---

## Phase 5: Third-party API Integration

**Status:** Planned

**Approach:** Integrate with established AI detection services as fallback/verification.

**Candidate APIs:**
- GPTZero (recommended - academic focus)
- Originality.ai
- Copyleaks
- Sapling

**Implementation:**
- Abstract detector interface
- Multiple provider support
- Fallback chain
- Result aggregation

**Deliverables:**
- [ ] `src/lib/external-detectors/gptzero.ts`
- [ ] `src/lib/external-detectors/originality.ts`
- [ ] Detector interface abstraction
- [ ] Config for API keys
- [ ] Cost tracking/limits

---

## Priority Matrix

| Phase | Effort | Accuracy | Cost | Offline |
|-------|--------|----------|------|---------|
| 1. LLM | Low | Good | $/call | No |
| 2. Statistical | Low | Fair | Free | Yes |
| 3. Browser ML | High | Good | Free | Yes |
| 4. Fine-tuned | High | Best | Hosting | No |
| 5. Third-party | Low | Good | $/call | No |

---

## Recommended Implementation Order

1. **Phase 1** - Quick win, leverages existing infrastructure
2. **Phase 2** - Add free local analysis as complement
3. **Phase 3** - Long-term investment for cost-free accurate detection
4. **Phase 4/5** - As needed for enterprise/research use cases

---

## Success Metrics

- Detection accuracy > 85% on test set
- False positive rate < 10%
- Analysis time < 3 seconds per section
- User satisfaction with detection feedback
