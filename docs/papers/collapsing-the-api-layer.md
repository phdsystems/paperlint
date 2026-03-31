# Collapsing the API Layer: Native Rust-to-TypeScript Integration via NAPI-RS

**Author:** Elvis Amukelani Hlongwane
**Organisation:** Software Engineering Labs Pty Ltd (SWE Labs)
**Date:** March 2026
**Type:** Technical White Paper

---

## Abstract

Modern full-stack applications follow a three-tier architecture: Frontend (TypeScript) communicates with Backend (Rust/Java/Go) through an API layer (REST/gRPC). This paper argues that when the frontend and backend run on the same machine, the API layer is unnecessary overhead — adding network latency, serialization cost, port management, and deployment complexity without improving safety. We demonstrate that NAPI-RS, a Rust-to-Node.js native binding framework, eliminates the internal API layer while preserving the identical safety boundary that REST provides. We validate this claim with a working proof-of-concept: a 138-rule Rust compliance engine callable from TypeScript via a single function call, with zero API server, zero serialization overhead, and identical safety guarantees.

---

## 1. Problem Statement

### 1.1 The Three-Tier Default

The dominant full-stack architecture separates concerns into three tiers:

```
Frontend (TypeScript/React)
    ↓ HTTP request (JSON)
API Layer (REST/gRPC — Axum, Express, Spring)
    ↓ function call
Backend Engine (Rust/Java — business logic)
    ↓ HTTP request
External Services (OpenAI, AWS, databases)
```

This model is justified when:
- Frontend and backend run on **different machines** (browser → server)
- Multiple **heterogeneous clients** consume the same API (web, mobile, CLI)
- Teams are **organisationally separated** and need a contract boundary

### 1.2 When the Model Breaks Down

In many production scenarios, the frontend and backend run on the **same machine**:

| Scenario | Frontend | Backend | Same machine? |
|----------|----------|---------|---------------|
| Electron desktop app | TypeScript UI | Rust engine | Yes |
| VS Code extension | TypeScript extension | Rust analyser | Yes |
| CI/CD pipeline | Node.js script | Rust tool | Yes |
| SSR (Next.js) | Server-side render | Rust processing | Yes |
| CLI with TUI | Node.js terminal | Rust core | Yes |
| Tauri application | TypeScript webview | Rust backend | Yes |

In these cases, the API layer introduces:

- **Network latency** — loopback HTTP adds 1-5ms per call, unnecessary on the same machine
- **Serialization overhead** — JSON encode/decode on both sides for data that never leaves the process
- **Port management** — backend must bind a port, frontend must discover it
- **Process lifecycle** — two processes to start, monitor, and stop
- **Deployment complexity** — two containers, two health checks, two log streams
- **Error handling duplication** — Rust errors → HTTP status codes → TypeScript error handling

### 1.3 The Core Question

> If the safety boundary between Rust and TypeScript is identical whether data crosses via HTTP or via function call, why pay the cost of HTTP?

---

## 2. The Safety Argument

### 2.1 Safety Boundaries in REST

In a REST architecture, the safety model is:

```
┌─────────────────────────────────┐
│  Rust (SAFE)                    │
│  - Memory safe (borrow checker) │
│  - Type safe (compiler)         │
│  - Thread safe (Send/Sync)      │
│  - Null safe (Option<T>)        │
│                                 │
│  ──── HTTP boundary ────────    │ ← Data serialized to JSON
│                                 │
│  TypeScript (UNSAFE)            │
│  - Dynamic types                │
│  - Nullable by default          │
│  - No ownership model           │
│  - Runtime errors               │
└─────────────────────────────────┘
```

Once data crosses the HTTP boundary as JSON, Rust's safety guarantees are gone. TypeScript can mutate, nullify, or delete any field. The HTTP layer does not add safety — it is merely a transport.

### 2.2 Safety Boundaries in NAPI-RS

```
┌─────────────────────────────────┐
│  Rust (SAFE)                    │
│  - Memory safe (borrow checker) │
│  - Type safe (compiler)         │
│  - Thread safe (Send/Sync)      │
│  - Null safe (Option<T>)        │
│                                 │
│  ──── NAPI boundary ────────    │ ← Data returned as JS value
│                                 │
│  TypeScript (UNSAFE)            │
│  - Dynamic types                │
│  - Nullable by default          │
│  - No ownership model           │
│  - Runtime errors               │
└─────────────────────────────────┘
```

The boundary is **identical**. The same Rust guarantees apply up to the boundary. The same TypeScript risks apply beyond it. The only difference is the transport mechanism — function call instead of HTTP.

### 2.3 Formal Equivalence

| Property | REST API | NAPI-RS |
|----------|----------|---------|
| Rust memory safety | Preserved | Preserved |
| Rust type safety | Preserved | Preserved |
| Rust thread safety | Preserved | Preserved |
| Rust error handling | `Result<T,E>` → HTTP 500 | `Result<T,E>` → `throw Error` |
| Rust `Option::None` | → JSON `null` | → JS `null` |
| Rust struct | → JSON object | → JS object |
| TypeScript can mutate result | Yes | Yes |
| TypeScript can nullify fields | Yes | Yes |
| TypeScript type checking | Via OpenAPI schema | Via `index.d.ts` (auto-generated) |
| **Safety delta** | **Zero** | **Zero** |

The safety argument for REST over NAPI-RS is **null**. There is no additional safety provided by serializing to JSON and deserializing back.

---

## 3. What You Gain

### 3.1 Performance

| Metric | REST API | NAPI-RS | Improvement |
|--------|----------|---------|-------------|
| Call overhead | 1-5ms (HTTP loopback) | ~1-10 microseconds | 100-1000x |
| Serialization | JSON encode + decode | Direct value passing | Eliminated |
| Connection setup | TCP handshake (first call) | None | Eliminated |
| Memory | Two process heaps | Single process heap | ~50% reduction |

### 3.2 Deployment

| Aspect | REST API | NAPI-RS |
|--------|----------|---------|
| Processes | 2 (frontend + backend) | 1 (Node.js with addon) |
| Ports | Backend binds port, frontend discovers | None |
| Containers | 2 Docker images | 1 Docker image |
| Health checks | 2 endpoints | 1 endpoint |
| Log streams | 2 stdout/stderr | 1 stdout/stderr |
| Startup sequence | Backend first, then frontend | Single `node app.js` |

### 3.3 Developer Experience

| Aspect | REST API | NAPI-RS |
|--------|----------|---------|
| Integration | HTTP client, URL config, error mapping | `import { review } from '@swe-labs/audit'` |
| Type safety | Manual OpenAPI → TypeScript codegen | Auto-generated `index.d.ts` |
| Debugging | Two debuggers, network traces | Single Node.js debugger |
| Testing | Integration tests with HTTP mocking | Unit tests with direct function calls |
| Distribution | Deploy server + publish client SDK | `npm publish` |

### 3.4 What You Lose

**Nothing** — with one caveat:

- If you need **cross-machine** communication (browser → server), you still need REST/gRPC.
- NAPI-RS is for **same-machine, same-process** integration only.

The REST API layer remains available for cross-machine clients. NAPI-RS is an additional distribution channel, not a replacement for all API usage.

---

## 4. Architecture: Write Once, Ship Everywhere

The architectural pattern that emerges is a **single Rust core with multiple surface layers**:

```
                    ┌─────────────────────┐
                    │   Rust Core Engine   │
                    │   (business logic)   │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                     │
    ┌─────▼─────┐      ┌──────▼──────┐      ┌──────▼──────┐
    │  NAPI-RS  │      │  Axum REST  │      │    CLI      │
    │  (npm)    │      │  (HTTP)     │      │   (clap)    │
    └─────┬─────┘      └──────┬──────┘      └──────┬──────┘
          │                    │                     │
    ┌─────▼─────┐      ┌──────▼──────┐      ┌──────▼──────┐
    │  Node.js  │      │  Browser /  │      │  Terminal   │
    │  Desktop  │      │  Mobile /   │      │  Scripts    │
    │  CI/CD    │      │  External   │      │  Automation │
    └───────────┘      └─────────────┘      └─────────────┘

    Same-machine         Cross-machine          Human
    integration          integration            interface
```

Additional surface layers:

| Surface | Technology | Target |
|---------|-----------|--------|
| NAPI-RS | `#[napi]` derive macro | Node.js / TypeScript |
| WASM | `wasm-bindgen` / `wasm-pack` | Browser / Deno |
| Python | PyO3 / Maturin | Python ecosystem |
| REST | Axum / Actix | Any HTTP client |
| gRPC | Tonic | Any gRPC client |
| CLI | Clap | Terminal users |

The Rust core is written **once**. Each surface layer is a thin wrapper — typically 50-100 lines of binding code. The business logic, safety guarantees, and test coverage live entirely in the Rust core.

---

## 5. Proof of Concept: SWE-COMPLIANCE Audit Engine

### 5.1 The Engine

SWE-COMPLIANCE struct-engine-audit is a Rust compliance engine:
- 14 workspace crates
- 138 built-in rules
- 12 parallel reviewers (via rayon)
- Scans Rust projects for architectural compliance
- Produces structured reports (JSON, text)

### 5.2 The NAPI-RS Bridge

We created a thin binding crate (`napi-bridge`) exposing 5 functions:

```rust
#[napi]
pub fn review(root: String) -> napi::Result<String> { ... }

#[napi]
pub fn format_report(report_json: String, format: String) -> napi::Result<String> { ... }

#[napi]
pub fn detect_project_kind(root: String) -> String { ... }

#[napi]
pub fn detect_application_type(root: String) -> Option<String> { ... }

#[napi]
pub fn default_rule_count() -> u32 { ... }
```

**Total binding code: 45 lines of Rust.** The entire compliance engine — 14 crates, 12,000+ lines, 811 tests — is now callable from TypeScript via `npm install`.

### 5.3 Test Results

```
=== NAPI-RS Bridge Test: struct-engine-audit ===

Built-in rules: 138
Project kind for orchestrator: Library
Application type: Lib

Review completed:
  Total checks: 138
  Passed: 80
  Failed: 23
  Skipped: 35
```

The test scanned the orchestrator crate (a real Rust project) from JavaScript. All 138 rules executed at native Rust speed, results returned as structured JSON, formatted as text — all via direct function calls. No server, no port, no HTTP.

### 5.4 What Was Required

| Component | Lines of code | Purpose |
|-----------|--------------|---------|
| `napi-bridge/Cargo.toml` | 12 | Crate configuration |
| `napi-bridge/src/lib.rs` | 45 | 5 `#[napi]` functions |
| `napi-bridge/package.json` | 15 | npm package config |
| `napi-bridge/index.js` | 2 | Native addon loader |
| **Total new code** | **74 lines** | Full TypeScript integration |

74 lines to expose a 12,000-line Rust engine to the entire Node.js ecosystem.

---

## 6. Implications for SWE Labs Ecosystem

### 6.1 Applicable Projects

| Project | Current API | NAPI-RS enables |
|---------|------------|-----------------|
| **XKVM** | CLI + gRPC | `npm install xkvm` — boot microVMs from TypeScript |
| **LLMBOOT** | REST (Axum) | `npm install llmboot` — 5 LLM backends as function calls |
| **SWERAG** | REST (Axum) | `npm install swerag` — full RAG pipeline in-process |
| **SWEVECDB** | REST (Axum) | `npm install swevecdb` — vector search as a library |
| **SWE-OBSERV** | HTTP gateway | `npm install swe-observ` — observability as a library |
| **SWEC** | CLI | `npm install swec` — penetration testing from TypeScript |
| **JUSTC** | CLI | `npm install justc` — compile Java from TypeScript |

### 6.2 The Distribution Model

For each Rust engine in the SWE Labs ecosystem:

1. **Write the engine in Rust** — with full safety, tests, documentation
2. **Add a `napi-bridge` crate** — 50-100 lines exposing the SAF facade
3. **`npm publish`** — TypeScript developers install and call it
4. **Keep REST/gRPC** — for cross-machine and non-Node.js clients
5. **Keep CLI** — for terminal users and shell scripts

The API layer becomes **optional** for same-machine integrations. It remains available for cross-machine clients. Both coexist.

---

## 7. Guidelines: Maximising Safety Across the Boundary

Regardless of whether the boundary is HTTP or NAPI-RS, these principles apply:

1. **Keep logic in Rust** — TypeScript should display/render, not process. Business rules, validation, transformation, and computation stay in Rust.

2. **Return validated types** — use the auto-generated `index.d.ts` for TypeScript type checking. Never return `any`.

3. **Don't expose raw mutable data** — return formatted strings, immutable reports, or serialized snapshots rather than mutable objects that TypeScript can corrupt.

4. **Validate inputs in Rust** — never trust what TypeScript passes in. Every `#[napi]` function should validate its arguments before passing them to the core engine.

5. **Error mapping** — map `Result<T,E>` to meaningful `napi::Error` messages. Don't leak Rust internals.

---

## 8. Conclusion

The API layer between frontend and backend exists to transport data across a trust and process boundary. When both layers run in the same process on the same machine, that transport is unnecessary overhead.

NAPI-RS eliminates it. The safety boundary — the point where Rust's guarantees end and TypeScript's dynamism begins — is identical whether data travels over HTTP or over a function call. There is no safety cost to removing the API layer. There is only gain: lower latency, simpler deployment, better developer experience, and fewer moving parts.

The pattern is proven at scale by SWC (Vercel), Rspack (ByteDance), and Turbopack (Vercel). SWE Labs now applies the same pattern to hypervisors (XKVM), compliance engines (SWE-COMPLIANCE), observability platforms (SWE-OBSERV), LLM frameworks (LLMBOOT), and the full RAG pipeline (SWERAG).

Write Rust once. Ship as npm. The API layer is optional.

---

## References

- NAPI-RS: https://napi.rs
- SWC (Rust-powered JS compiler): https://swc.rs
- Rspack (Rust-powered bundler): https://rspack.dev
- Turbopack (Rust-powered bundler): https://turbo.build/pack
- SWE Labs: https://github.com/sweengineeringlabs

---

**Software Engineering Labs Pty Ltd**
*Systems engineering. From first principles.*
