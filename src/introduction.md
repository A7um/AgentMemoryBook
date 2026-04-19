# AgentMemoryBook

> A comprehensive guide to understanding how state-of-the-art agent memory systems work — what techniques they use, how they differ, and which situations each one fits best.

**By [Atum](https://atum.li)**

---

## Who Is This For?

- **AI engineers** building agents that need to remember across sessions
- **Product builders** choosing a memory layer for their AI application
- **Researchers** studying the evolving landscape of agent memory architectures
- **Curious minds** who want to understand what makes an AI agent "remember"

## What's Inside

This book is organized into three parts:

**Part I — Concepts** covers the foundations: what agent memory is, the taxonomy of memory types, the write–manage–read loop, and the ten core engineering techniques that power every memory system.

**Part II — Provider Deep Dives** gives each major memory system its own chapter with architecture diagrams, real SDK code examples, step-by-step walkthroughs, and honest assessments. Twelve systems are covered: Mem0, OpenViking, Hindsight, ByteRover, Zep/Graphiti, Supermemory, Honcho, Letta (MemGPT), Cognee, RetainDB, Nuggets, and Claude Code (from the leaked source).

**Part III — Landscape & Decision Making** covers the consumer AI memory race (ChatGPT vs Claude vs Gemini), benchmarks and evaluation, a practical decision guide for choosing the right system, and open challenges for the future.

## Quick Comparison

| System | Architecture | Open Source | Best For |
|--------|-------------|-------------|----------|
| **Mem0** | Extract → Update pipeline + vector/graph | Yes (Apache 2.0) | Production chat agents |
| **OpenViking** | Filesystem paradigm + tiered context | Yes (Apache 2.0) | Unified context management |
| **Hindsight** | 4-network structured memory bank | Yes (MIT) | Long-horizon reasoning agents |
| **ByteRover** | Hierarchical Context Tree + file-based | Partial (CLI) | Coding agents |
| **Zep/Graphiti** | Temporal knowledge graph | Graphiti: Yes | Enterprise temporal reasoning |
| **Supermemory** | Memory graph + RAG + connectors | Core: Yes | All-in-one platform |
| **Honcho** | Dialectic reasoning + user modeling | Yes | Deep personalization |
| **Letta (MemGPT)** | Memory-as-OS (RAM/disk tiers) | Yes | Stateful autonomous agents |
| **Cognee** | Knowledge graph + vector hybrid | Yes (Apache 2.0) | Institutional knowledge |
| **RetainDB** | 7 memory types + delta compression | No (SaaS) | Quick integration |
| **Nuggets** | HRR superposed vectors | Yes | Lightweight local memory |
| **Claude Code** | Markdown files + Sonnet side-call | Source leaked | Dev with Claude |

## References

Key academic surveys referenced throughout this book:

- [Memory for Autonomous LLM Agents](https://arxiv.org/abs/2603.07670) (Du et al., Mar 2026)
- [Memory in the Age of AI Agents](https://arxiv.org/abs/2512.13564) (Zhang et al., Dec 2025)
- [Graph-based Agent Memory](https://arxiv.org/abs/2602.05665) (Feb 2026)
- [Memory Operations Survey](https://arxiv.org/abs/2505.00675) (Du et al., May 2025)
- [LongMemEval Benchmark](https://arxiv.org/abs/2410.10813) (Wu et al., ICLR 2025)

## License

This book is released under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). You are free to share and adapt, with attribution.
