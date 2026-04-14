# Chapter 3: Provider Deep Dives

Each provider has its own dedicated deep-dive chapter with architecture diagrams, real code examples, step-by-step walkthroughs, and detailed analysis.

## Developer-Focused Memory Frameworks

| # | Provider | Architecture | Deep Dive |
|---|----------|-------------|-----------|
| 1 | **Mem0** | Two-phase extract → update pipeline + optional graph | [Read →](providers/mem0.md) |
| 2 | **OpenViking** | Filesystem paradigm + tiered context (L0/L1/L2) | [Read →](providers/openviking.md) |
| 3 | **Hindsight** | 4-network structured memory (World/Experience/Observation/Opinion) | [Read →](providers/hindsight.md) |
| 4 | **ByteRover** | Hierarchical Context Tree + 5-tier progressive retrieval | [Read →](providers/byterover.md) |
| 5 | **Zep / Graphiti** | Temporal knowledge graph with bi-temporal edges | [Read →](providers/zep.md) |
| 6 | **Supermemory** | All-in-one: Memory Graph + RAG + Profiles + Connectors | [Read →](providers/supermemory.md) |
| 7 | **Honcho** | Dialectic reasoning + deep user identity modeling | [Read →](providers/honcho.md) |
| 8 | **Letta (MemGPT)** | Memory-as-OS: Core (RAM) / Recall (Cache) / Archival (Disk) | [Read →](providers/letta.md) |
| 9 | **Cognee** | ECL pipeline: Extract → Cognify → Load + knowledge graph | [Read →](providers/cognee.md) |
| 10 | **RetainDB** | 7 memory types + delta compression, managed SaaS | [Read →](providers/retaindb.md) |
| 11 | **Nuggets** | Holographic Reduced Representations (HRR), zero dependencies | [Read →](providers/nuggets.md) |

## What Each Deep Dive Includes

Every provider chapter follows a consistent structure:

- **Architecture Diagrams** — Mermaid diagrams showing system design, data flow, and key components
- **Real Code Examples** — Working SDK code (Python, TypeScript, CLI) with inline comments
- **Step-by-Step Walkthrough** — A concrete scenario traced through the system from ingestion to retrieval
- **Conflict Resolution** — How the system handles contradictions and updates
- **Benchmark Performance** — Numbers on LongMemEval, LoCoMo, and other evaluations
- **Strengths & Limitations** — Honest assessment of trade-offs
- **Best For** — Which use cases this provider excels at
- **Links** — Documentation, GitHub, papers, and pricing

## Quick Navigation by Use Case

**"I want the simplest integration"** → [RetainDB](providers/retaindb.md) (3 lines of code) or [Mem0](providers/mem0.md)

**"I want the highest accuracy"** → [Hindsight](providers/hindsight.md) (91.4% LongMemEval) or [ByteRover](providers/byterover.md) (92.2% LoCoMo)

**"I want temporal reasoning"** → [Zep/Graphiti](providers/zep.md) (bi-temporal knowledge graph)

**"I want an all-in-one platform"** → [Supermemory](providers/supermemory.md) (memory + RAG + connectors)

**"I want deep user personalization"** → [Honcho](providers/honcho.md) (dialectic reasoning)

**"I want a full agent framework"** → [Letta](providers/letta.md) (memory-as-OS + agent runtime)

**"I want domain knowledge graphs"** → [Cognee](providers/cognee.md) (ECL pipeline + ontology support)

**"I need unified context management"** → [OpenViking](providers/openviking.md) (filesystem paradigm)

**"I want local-first coding agent memory"** → [ByteRover](providers/byterover.md) (file-based Context Tree)

**"I want zero-dependency fast recall"** → [Nuggets](providers/nuggets.md) (holographic memory, sub-ms)

---

**Next: [Chapter 4 — The Consumer AI Memory Race](04_consumer_memory.md)**
