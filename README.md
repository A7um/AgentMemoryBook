# AgentMemoryBook

A comprehensive guide to understanding how state-of-the-art (SOTA) agent memory systems work — what techniques they use, how they differ, and which situations each one fits best.

## Who Is This For?

- **AI engineers** building agents that need to remember across sessions
- **Product builders** choosing a memory layer for their AI application
- **Researchers** studying the evolving landscape of agent memory architectures
- **Curious minds** who want to understand what makes an AI agent "remember"

## How to Read This Book

The book is organized into three parts:

1. **[Foundations](chapters/01_foundations.md)** — What agent memory is, why it matters, and the core taxonomy
2. **[Techniques](chapters/02_techniques.md)** — The engineering building blocks: retrieval, graphs, compression, reflection, and more
3. **[Provider Deep Dives](chapters/03_providers.md)** — Detailed analysis of every major memory system
4. **[The Consumer AI Memory Race](chapters/04_consumer_memory.md)** — How OpenAI, Anthropic, and Google approach memory in their products
5. **[Benchmarks & Evaluation](chapters/05_benchmarks.md)** — How memory systems are measured and compared
6. **[Decision Guide](chapters/06_decision_guide.md)** — Choosing the right memory system for your use case
7. **[The Future](chapters/07_future.md)** — Open challenges and where the field is heading

## Quick Comparison Table

| System | Architecture | Open Source | Best For | LongMemEval | LoCoMo |
|--------|-------------|-------------|----------|-------------|--------|
| **Mem0** | Extract → Update pipeline + vector/graph | Yes (Apache 2.0) | Production chat agents | — | 66.9% |
| **OpenViking** | Filesystem paradigm + tiered context | Yes (Apache 2.0) | Unified context management | — | — |
| **Hindsight** | 4-network structured memory bank | Yes (MIT) | Long-horizon reasoning agents | 91.4% | 89.6% |
| **ByteRover** | Hierarchical Context Tree + file-based | Partial (CLI) | Coding agents | — | 92.2% |
| **Zep/Graphiti** | Temporal knowledge graph | Graphiti: Yes | Enterprise temporal reasoning | — | 75.1% |
| **Supermemory** | Memory graph + RAG + connectors | Core: Yes | All-in-one platform | 85.2% | #1 |
| **Honcho** | Dialectic reasoning + user modeling | Yes | Deep personalization | — | — |
| **Letta (MemGPT)** | Memory-as-OS (RAM/disk tiers) | Yes | Stateful autonomous agents | — | — |
| **Cognee** | Knowledge graph + vector hybrid | Yes (Apache 2.0) | Institutional knowledge | — | — |
| **RetainDB** | 7 memory types + delta compression | No (SaaS) | Quick integration, production | SOTA | — |
| **Nuggets (Holographic)** | HRR superposed vectors | Yes | Lightweight local memory | — | — |

## Contributing

Found an error or want to add a provider? Open an issue or submit a pull request.

## References

Key academic surveys referenced throughout this book:

- [Memory for Autonomous LLM Agents](https://arxiv.org/abs/2603.07670) (Du et al., Mar 2026)
- [Memory in the Age of AI Agents](https://arxiv.org/abs/2512.13564) (Zhang et al., Dec 2025)
- [Graph-based Agent Memory](https://arxiv.org/abs/2602.05665) (Feb 2026)
- [Memory Operations Survey](https://arxiv.org/abs/2505.00675) (Du et al., May 2025)
- [LongMemEval Benchmark](https://arxiv.org/abs/2410.10813) (Wu et al., ICLR 2025)

## License

This book is released under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). You are free to share and adapt, with attribution.
