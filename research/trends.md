# AgentMemoryBook — Trends Tracker

> Append-only log of emerging patterns across update cycles. When a pattern appears in 3+ providers across 2+ update cycles, promote it to a book-level topic.

---

## 2026-04-19 — Initial Release

### Field-Level Changes
- Agent memory has moved from "can we make agents remember?" to "how do we make them remember well, at scale, with privacy?"
- The field went from 1 framework (MemGPT, 2023) to 15+ production systems in 18 months.
- LongMemEval top scores rose from ~60% to 96.2% in 18 months.

### Convergence Signals
- Nearly all providers now use hybrid retrieval (vector + keyword at minimum).
- Graph-based memory (knowledge graphs or entity graphs) is becoming standard, not differentiating.
- LLM-driven memory curation (the LLM decides what to remember) is now the default, replacing manual extraction rules.
- Multi-strategy retrieval with reranking is appearing in 5+ systems.

### Divergence Signals
- **File-based vs. DB-based**: ByteRover and Claude Code use plain files; Mem0, Hindsight, Zep use databases. Neither camp is winning.
- **All-in-one vs. focused**: Supermemory/OpenViking bundle everything; Hindsight/Zep focus narrowly. Market is splitting.
- **Temporal reasoning**: Only Zep/Graphiti has true bi-temporal edges. Others add timestamps but can't answer "when did this change?"

### Surprises
- Claude Code's memory system (leaked source) is far simpler than expected — markdown files, grep, no embeddings.
- ChatGPT's memory is also surprisingly simple — no vector DB, just a curated fact list.
- The most sophisticated architectures (Hindsight's 4 networks, Zep's temporal graph) significantly outperform simpler ones on benchmarks.

### Pattern Watch
- **Tiered context loading** (L0/L1/L2): Seen in [OpenViking, Supermemory]. First observed 2026-01. Status: monitoring
- **Memory-as-filesystem**: Seen in [OpenViking, ByteRover, Claude Code]. First observed 2025-12. Status: monitoring
- **Sleep-time consolidation**: Seen in [Claude Code/autoDream, Letta]. First observed 2025-07. Status: monitoring
- **Dialectic reasoning over memory**: Seen in [Honcho]. First observed 2025-10. Status: monitoring (unique to one provider)
