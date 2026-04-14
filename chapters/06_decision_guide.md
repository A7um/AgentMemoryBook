# Chapter 6: Decision Guide — Choosing the Right Memory System

You've read about architectures, techniques, and benchmarks. Now: which system should you actually use? This chapter provides decision frameworks for different scenarios.

---

## The First Question: What Kind of Memory Do You Need?

| Memory Class | What It Means | Example Systems |
|-------------|---------------|-----------------|
| **Personalization** | Remembering individual user preferences and history | Mem0, RetainDB, Honcho |
| **Institutional Knowledge** | Building domain expertise from documents and data | Cognee, Zep/Graphiti |
| **Agent Learning** | Agents that improve from their own experience | Hindsight, Letta, OpenViking |
| **Unified Context** | Managing memory + knowledge + skills holistically | OpenViking, ByteRover, Supermemory |

Most applications need some combination. A customer support bot needs personalization (remember this user) AND institutional knowledge (know the product). A coding agent needs agent learning (remember architecture decisions) AND unified context (project files + memory).

---

## Decision Tree

```
START: What are you building?
│
├─► Consumer chat product (many users, simple personalization)
│   │
│   ├─► Want fastest integration? → RetainDB (3 lines of code)
│   ├─► Want open-source + proven? → Mem0 (largest community)
│   └─► Want deepest user modeling? → Honcho (dialectic reasoning)
│
├─► Coding agent / developer tool
│   │
│   ├─► Local-first, file-based? → ByteRover (Context Tree)
│   ├─► Full agent framework? → Letta (memory + agent runtime)
│   └─► Cross-tool memory? → OpenViking (filesystem paradigm)
│
├─► Enterprise knowledge system
│   │
│   ├─► Temporal reasoning critical? → Zep/Graphiti (bi-temporal KG)
│   ├─► Multi-source document ingestion? → Cognee (38+ connectors)
│   └─► All-in-one platform? → Supermemory (memory + RAG + connectors)
│
├─► Long-horizon autonomous agent
│   │
│   ├─► Need explainable reasoning? → Hindsight (4-network + reflect)
│   ├─► Need full agent OS? → Letta (memory-as-OS paradigm)
│   └─► Gaming / simulation? → Hindsight or Letta
│
└─► Lightweight / edge / offline
    │
    └─► Structured facts only? → Nuggets/HRR (zero dependencies)
```

---

## Scenario-Based Recommendations

### Scenario 1: "I need my chatbot to remember users"

**Best choices:** Mem0, RetainDB, or Honcho

| If you... | Choose | Why |
|-----------|--------|-----|
| Want the most battle-tested solution | **Mem0** | 38K+ stars, extensive docs, large community |
| Want the fastest integration | **RetainDB** | 3 lines of code, under 30 min setup |
| Want the deepest personalization | **Honcho** | Dialectic reasoning, automatic user modeling |
| Want a free, self-hosted option | **Mem0** | Apache 2.0, runs locally |

**Architecture pattern:**
```
User message → Memory retrieval → Context assembly → LLM → Response → Memory update
```

### Scenario 2: "I'm building a coding agent that remembers project context"

**Best choices:** ByteRover, Letta, or OpenViking

| If you... | Choose | Why |
|-----------|--------|-----|
| Want file-based, auditable memory | **ByteRover** | Markdown files, git-like version control |
| Want a full agent framework | **Letta** | Agent + memory + deployment in one stack |
| Want unified context (memory + resources + skills) | **OpenViking** | Filesystem paradigm with tiered loading |
| Want to integrate with Cursor/Claude Code | **ByteRover** or **OpenViking** | Both have MCP support |

### Scenario 3: "I need enterprise knowledge management with temporal reasoning"

**Best choices:** Zep/Graphiti or Cognee

| If you... | Choose | Why |
|-----------|--------|-----|
| Need "when did this change?" queries | **Zep/Graphiti** | Bi-temporal knowledge graph |
| Need to ingest from many data sources | **Cognee** | 38+ connectors, ECL pipeline |
| Need to process conversations + business data | **Zep** | Handles both via Graphiti |
| Want open-source graph engine | **Graphiti** | Standalone, can be used without Zep cloud |

### Scenario 4: "I want the highest possible accuracy on memory tasks"

**Best choices:** Hindsight or build custom

Based on current benchmarks:
- **LongMemEval:** Agentmemory V4 (96.2%) is custom-built; Hindsight (91.4%) is the best framework
- **LoCoMo:** ByteRover (92.2%) leads; Hindsight (89.6%) is close behind

If benchmark accuracy is your primary criterion:
1. Start with **Hindsight** — best accuracy among frameworks, MIT-licensed
2. Consider **ByteRover** for LoCoMo-style workloads
3. For absolute maximum, build custom (like Agentmemory V4) with a 6-signal hybrid retrieval pipeline

### Scenario 5: "I want an all-in-one solution that does everything"

**Best choice:** Supermemory

Supermemory bundles memory + RAG + user profiles + extractors + connectors into one API. The trade-off is less specialization in any single area, but the convenience is significant.

If you need self-hosted: **OpenViking** offers the closest all-in-one open-source alternative.

---

## Build vs. Buy Analysis

### When to Build Custom

- Your memory requirements are domain-specific (e.g., medical, legal, financial)
- You need full control over every aspect of the pipeline
- You have a team of 3+ engineers who can maintain the system
- Your scale justifies the investment (millions of users)
- You're optimizing for a specific benchmark or evaluation metric

### When to Use a Framework

- You need memory working in production within weeks, not months
- Your requirements align with what existing frameworks offer
- You want to benefit from community improvements and updates
- You don't have dedicated memory infrastructure engineers
- You're building a product, not a memory system

### The Hybrid Approach

Many production systems combine:
1. A framework for the core pipeline (e.g., Mem0 or Hindsight for extraction + retrieval)
2. Custom logic for domain-specific memory operations
3. A managed service for infrastructure (vector DB, graph DB)

---

## Cost Considerations

| System | Free Tier | Paid Starting At | Self-Hosted |
|--------|-----------|------------------|-------------|
| Mem0 | Open-source | $249/mo (Pro w/ graph) | Yes |
| OpenViking | Open-source | Free (cloud deploy) | Yes |
| Hindsight | Open-source | Cloud pricing TBD | Yes (Docker) |
| ByteRover | CLI free | SOC 2 cloud (custom) | Yes (local) |
| Zep/Graphiti | Graphiti open-source | 1K free credits, $25/mo | Graphiti only |
| Supermemory | 1M tokens/mo | $19/mo Pro | Enterprise only |
| Honcho | $100 free credits | $2/M tokens | Yes |
| Cognee | Open-source | $35/mo developer | Yes |
| RetainDB | 10K ops/mo | Usage-based | Enterprise |
| Letta | Open-source | Cloud pricing TBD | Yes |

### Hidden Costs

1. **LLM API calls for memory operations:** Most systems use GPT-4o-mini or similar for extraction/curation. At scale, this can cost $100–1,000+/month.
2. **Vector DB hosting:** If not self-hosted, managed vector DBs add $50–500/month depending on scale.
3. **Graph DB hosting:** Neo4j Aura starts at ~$65/month. Required for Zep, optional for Mem0g.
4. **Engineering time:** Self-hosted solutions require ongoing maintenance. Budget 10–20% of an engineer's time.

---

## Migration Paths

If you're already using one system and want to switch:

| From | To | Migration Difficulty |
|------|----|---------------------|
| No memory → Mem0 | Easy | Well-documented quickstart |
| No memory → RetainDB | Very Easy | 3 lines of code |
| Mem0 → Hindsight | Medium | Different abstraction (need to map memory types to networks) |
| Supermemory → RetainDB | Easy | RetainDB publishes migration guide |
| MEMORY.md files → Honcho | Easy | Honcho auto-detects and offers migration |
| MEMORY.md files → OpenViking | Easy | OpenViking imports from markdown |
| MemGPT → Letta V1 | Medium | Architecture change (heartbeats → native reasoning) |
| Any → ByteRover | Easy | `brv curate -f ~/notes/MEMORY.md` imports existing files |

---

## The Bottom Line

**If you're just starting out:** Pick Mem0 (largest community, most docs) or RetainDB (fastest integration).

**If accuracy is critical:** Pick Hindsight (best benchmark results from a framework).

**If you're building a coding agent:** Pick ByteRover (designed for it) or Letta (full framework).

**If you need enterprise knowledge:** Pick Zep/Graphiti (temporal reasoning) or Cognee (knowledge graphs).

**If you want everything in one API:** Pick Supermemory (broadest feature set).

**If personalization is your product:** Pick Honcho (deepest user modeling).

**If you want to understand the fundamentals:** Read this book, then build a simple prototype with Mem0's open-source code to see how the write–manage–read loop works in practice.

---

**Next: [Chapter 7 — The Future](07_future.md)** — Open challenges and where the field is heading.
