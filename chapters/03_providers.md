# Chapter 3: Provider Deep Dives

This chapter provides a detailed technical analysis of each major agent memory system. For each provider, we cover: architecture, core data flow, key differentiators, strengths, limitations, and ideal use cases.

---

## 1. Mem0

**Website:** [mem0.ai](https://mem0.ai) | **GitHub:** 38K+ stars | **License:** Apache 2.0 | **Paper:** [arXiv:2504.19413](https://arxiv.org/abs/2504.19413) (Apr 2025)

### Architecture

Mem0 uses a two-phase pipeline to manage long-term conversational memory:

```
┌──────────────────────────────────────────┐
│              EXTRACTION PHASE             │
│                                           │
│  Input: (user_message, assistant_response)│
│  Context: summary S + last M messages     │
│  LLM extracts: candidate facts            │
│  Output: [fact₁, fact₂, ...]             │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│               UPDATE PHASE                │
│                                           │
│  For each candidate fact:                 │
│    1. Vector search → top-K similar       │
│       existing memories                   │
│    2. LLM decides: ADD / UPDATE /         │
│       DELETE / NOOP                       │
│    3. Execute operation                   │
└──────────────────────────────────────────┘
```

**Mem0g (Graph Variant)** extends this with a directed labeled graph `G = (V, E, L)`:
- **V** = entity nodes (person, place, project)
- **E** = typed relationships (works_at, lives_in)
- **L** = labels on edges

Graph construction adds entity extraction and relationship generation steps. Conflict detection compares new edges against existing ones, with an LLM resolver deciding which to keep.

### Key Parameters
- `M = 10` (recent messages as context)
- `K = 10` (top-K similar memories for comparison)
- Default LLM: GPT-4o-mini for both phases
- Storage: vector DB (dense embeddings) + optional Neo4j for graph

### Strengths
- Production-proven with massive community (38K+ GitHub stars)
- Simple two-phase design is easy to understand and debug
- 91% lower p95 latency and 90% fewer tokens vs. full-context approaches
- Open-source core with managed cloud option

### Limitations
- All conflict resolution delegated to LLM — no product-level orchestration
- Graph features require Mem0 Pro ($249/mo)
- LoCoMo score (66.9%) lags behind newer systems
- No built-in temporal reasoning

### Best For
- Teams wanting a battle-tested, widely-adopted memory layer
- Production chatbots needing user personalization
- Quick integration (well-documented SDK)

---

## 2. OpenViking

**Website:** [openviking.ai](https://openviking.ai) | **GitHub:** 22K+ stars | **License:** Apache 2.0 | **By:** ByteDance/Volcengine

### Architecture

OpenViking is a **context database** that uses a filesystem paradigm to unify memory, resources, and skills:

```
viking://
├── session/{session_id}/          # Current session
│   ├── messages.jsonl
│   ├── .abstract.md               # L0: ~100 tokens
│   ├── .overview.md               # L1: ~2K tokens
│   └── history/
│       └── archive_NNN/
├── user/memories/                  # User memory
│   ├── profile.md
│   ├── preferences/
│   ├── entities/
│   └── events/
├── agent/memories/                 # Agent memory
│   ├── cases/                      # Problem-solution pairs
│   └── patterns/                   # Reusable patterns
└── resources/                      # External knowledge
```

### Core Concepts

**1. Tiered Context Loading (L0/L1/L2)**
Every resource is processed into three summary levels upon writing. At retrieval time, the system loads L0 first, checks relevance, then drills into L1/L2 only for relevant items. This reportedly reduces token consumption by 83–96%.

**2. Six Memory Categories**

| Category | Owner | Mergeable | Description |
|----------|-------|-----------|-------------|
| Profile | User | Yes | Identity and attributes |
| Preferences | User | Yes | Choices and settings |
| Entities | User | Yes | People, projects, orgs |
| Events | User | No | Timestamped events |
| Cases | Agent | No | Problem-solution pairs |
| Patterns | Agent | Yes | Reusable patterns |

**3. Self-Evolving Memory**
At session end, `commit()` triggers:
1. Conversation compression
2. Archive creation with L0/L1 summaries
3. LLM-based memory extraction into the six categories
4. Vector pre-filter + LLM deduplication against existing memories

### Strengths
- Unified paradigm for memory, resources, and skills
- Dramatic token savings via tiered loading
- Human-readable filesystem structure
- Strong backing from ByteDance (VikingDB team)
- 52% improvement in task completion rate reported

### Limitations
- Still in alpha — API may change
- Heavier setup than simpler solutions
- Python-only (Rust CLI available)
- Relatively new (Jan 2026), less battle-tested than Mem0

### Best For
- Complex agents that need unified context management (memory + knowledge + skills)
- Cost-sensitive deployments where token savings matter
- Teams building on ByteDance/Volcengine ecosystem

---

## 3. Hindsight

**Website:** [hindsight.vectorize.io](https://hindsight.vectorize.io) | **GitHub:** 9K+ stars | **License:** MIT | **Paper:** [arXiv:2512.12818](https://arxiv.org/abs/2512.12818) (Dec 2025)

### Architecture

Hindsight organizes memory into four epistemically distinct networks:

```
Memory Bank M = {W, B, O, S}
│
├── World Network (W)        → Objective third-person facts
├── Experience Network (B)   → Agent's own past actions  
├── Observation Network (O)  → Consolidated entity summaries
└── Opinion Network (S)      → Agent's evolving beliefs
```

### Three Core Operations

**Retain:** Extracts narrative facts from conversations, tags with timestamps and entities, stores in W (world facts) or B (experiences).

**Recall (TEMPR):** Four parallel retrieval strategies:
1. Semantic search (vector similarity)
2. Keyword search (BM25)
3. Graph traversal (entity connections)
4. Temporal search (time-bounded queries)

Results are merged through a cross-encoder reranker within a configurable token budget.

**Reflect (CARA):** Reasons over retrieved memories to:
- Answer questions with traceable citations
- Update Observations (consolidated entity summaries)
- Modify Opinions (beliefs) based on new evidence

### Memory Bank Configuration

Each bank can be configured with:
- **Mission:** Natural language identity ("I am a research assistant specializing in ML")
- **Directives:** Hard behavioral constraints
- **Disposition:** Soft personality traits (skepticism, empathy, literalism on 1–5 scales)

### Benchmark Results
- LongMemEval: **91.4%** (OSS-20B), **89.0%** (OSS-120B)
- LoCoMo: **89.61%** (Gemini-3), **85.67%** (OSS-120B)
- With an open-source 20B model, outperforms full-context GPT-4o

### Strengths
- State-of-the-art benchmark performance
- Epistemically clean — facts, experiences, observations, and beliefs are separated
- Self-hostable with one Docker command
- Extensive SDK support (Python, TypeScript, Go, REST, CLI)
- Academic paper with rigorous evaluation

### Limitations
- Higher complexity than simpler systems
- Reflection step adds latency and cost
- Newer product, smaller community than Mem0
- Requires thoughtful bank configuration for best results

### Best For
- Long-horizon agents that must explain their reasoning
- Systems where traceability matters (enterprise, healthcare, legal)
- Teams willing to invest in configuration for best accuracy
- Applications needing temporal and entity-aware recall

---

## 4. ByteRover

**Website:** [byterover.dev](https://www.byterover.dev) | **GitHub:** 4.2K+ stars | **License:** Proprietary CLI, open docs | **Paper:** [arXiv:2604.01599](https://arxiv.org/html/2604.01599v1) (Apr 2026)

### Architecture

ByteRover inverts the typical agent–memory relationship: the *same LLM* that reasons about tasks also curates memory.

```
┌─────────────────────────────────────────┐
│           AGENT LAYER                    │
│   LLM reasoning loop                    │
│   Produces both task outputs AND         │
│   memory operations (curate, query)      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         CONTEXT TREE (File-Based)        │
│                                          │
│   Domain → Topic → Subtopic → Entry      │
│   Each entry: markdown file with         │
│   maturity tier + recency metadata       │
│                                          │
│   .brv/context-tree/                     │
│   ├── architecture/                      │
│   │   ├── decisions/                     │
│   │   │   └── auth_jwt.md               │
│   │   └── patterns/                      │
│   └── team_context/                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      5-TIER PROGRESSIVE RETRIEVAL        │
│                                          │
│   1. Cache lookup        (~0ms)          │
│   2. Full-text search    (~10ms)         │
│   3. Semantic search     (~50ms)         │
│   4. Graph traversal     (~100ms)        │
│   5. Agentic reasoning   (~500ms+)       │
└─────────────────────────────────────────┘
```

### Key Differentiators
- **Zero infrastructure:** No vector DB, no graph DB, no embedding service. All knowledge lives in markdown files.
- **Git-like version control:** Branch, commit, merge, push/pull for the context tree
- **18 LLM providers** supported out of the box
- **MCP integration** with Cursor, Claude Code, OpenClaw

### Benchmark Results
- LoCoMo: **92.2%** (best), **96.1%** (reported in paper)
- LongMemEval: Competitive (exact numbers forthcoming)

### Strengths
- Human-readable, auditable memory (it's just markdown files)
- No external infrastructure dependencies
- Strong benchmark performance
- Local-first, privacy-preserving by default
- Works across IDEs via MCP

### Limitations
- Primarily designed for coding agents (less tested for general chat)
- CLI-based — less suitable for embedded use in web apps
- Newer system with smaller community
- LLM-driven curation adds cost per operation

### Best For
- Coding agents and developer tools
- Teams that want full control over their memory format
- Privacy-conscious deployments (local-first)
- Multi-tool workflows (Cursor + Claude Code + OpenClaw)

---

## 5. Zep / Graphiti

**Website:** [getzep.com](https://getzep.com) | **GitHub (Graphiti):** 24K+ stars | **License:** Graphiti is open-source | **Paper:** [arXiv:2501.13956](https://arxiv.org/abs/2501.13956) (Jan 2025)

### Architecture

Zep is a memory layer powered by Graphiti, a temporally-aware knowledge graph engine. The graph has three hierarchical tiers:

```
┌─────────────────────────────────────────┐
│      COMMUNITY SUBGRAPH (Gc)             │
│   High-level summaries of entity         │
│   clusters (generated via community      │
│   detection algorithms)                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│    SEMANTIC ENTITY SUBGRAPH (Gs)         │
│   Entities as nodes, relationships       │
│   as edges, with bi-temporal metadata:   │
│   - valid_at: when the fact became true  │
│   - invalid_at: when superseded          │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│      EPISODE SUBGRAPH (Ge)               │
│   Raw messages, text, and structured     │
│   data (maintains provenance)            │
└─────────────────────────────────────────┘
```

### Bi-Temporal Model

Every edge carries two timestamps:
- **valid_at:** When this relationship became true in the real world
- **invalid_at:** When this relationship was superseded (null if still current)

This enables queries like:
- "Where did Alice live in 2024?" → Finds the edge valid during that period
- "What changed about Alice?" → Finds edges with non-null invalid_at
- "What is Alice's current role?" → Finds the latest valid edge

### Retrieval

Zep combines:
- Semantic search over entity/edge embeddings
- BM25 full-text search
- Graph neighborhood traversal
- Temporal filtering
- Community-level summaries for broad queries

### Strengths
- Best-in-class temporal reasoning
- Handles dynamic, evolving data naturally
- Enterprise-focused (cross-session synthesis, business data integration)
- Graphiti is open-source and usable independently
- 94.8% on DMR benchmark (vs. MemGPT 93.4%)

### Limitations
- Requires Neo4j or compatible graph DB
- Higher infrastructure complexity
- Cloud features are not fully open-source
- Graph construction is LLM-intensive

### Best For
- Enterprise applications with evolving business data
- Systems requiring temporal reasoning ("What changed?")
- Cross-session information synthesis
- Applications where fact provenance and audit trails matter

---

## 6. Supermemory

**Website:** [supermemory.ai](https://supermemory.ai) | **GitHub:** Open-source engine | **Funding:** $2.6M seed

### Architecture

Supermemory is an all-in-one context platform with five layers:

| Layer | Function |
|-------|----------|
| **User Profiles** | Stable facts about users (auto-built from behavior) |
| **Memory Graph** | Ontology-aware vector graph with update/merge/contradict/infer edges |
| **Retrieval** | Hybrid vector + keyword search with sub-300ms latency and reranking |
| **Extractors** | Multi-modal chunking (PDFs, images, audio, video) |
| **Connectors** | Auto-sync from Notion, Slack, Google Drive, Gmail, S3, custom sources |

### Key Features
- **Automatic contradiction resolution:** "Moved from NY to London" updates, not duplicates
- **Stale information expiration:** Outdated facts get deprioritized or removed
- **Multi-modal extraction:** Understands PDFs, web pages, images, audio, video
- **15+ connectors** for automatic data ingestion

### API

```typescript
import { SuperMemory } from 'supermemory';
const client = new SuperMemory({ apiKey: 'sm_...' });

// Add memory
await client.add({ content: "User prefers dark mode", containerTag: "user_123" });

// Search
const results = await client.search.memories({ 
  query: "What are the user's preferences?",
  containerTag: "user_123"
});
```

### Benchmark Results
- LongMemEval: **85.2%** (GPT-4o)
- LoCoMo: #1 (self-reported)
- ConvoMem: #1 (self-reported)

### Strengths
- Broadest feature set: memory + RAG + profiles + connectors in one API
- Generous free tier (1M tokens/month, 10K queries)
- Multi-modal extraction out of the box
- Active plugin ecosystem (Claude Code, Cursor, OpenClaw)

### Limitations
- Closed source (no self-hosting except enterprise)
- LongMemEval score (85.2%) below Hindsight (91.4%)
- Breadth-over-depth trade-off — less specialized than focused systems
- Relatively young product (founded 2024)

### Best For
- Teams wanting an all-in-one platform (memory + RAG + connectors)
- Fast prototyping with generous free tier
- Multi-modal applications
- Consumer-facing products needing plugins for popular AI tools

---

## 7. Honcho

**Website:** [honcho.dev](https://honcho.dev) | **Funding:** $5.4M pre-seed | **By:** Plastic Labs

### Architecture

Honcho goes beyond memory into **personal identity modeling**. While other systems store facts, Honcho reasons about *who the user is*.

```
┌──────────────────────────────────────┐
│         PEER-BASED MODEL              │
│                                       │
│  Peer (User)  ←→  Peer (Agent)       │
│       │                │              │
│   Sessions (conversations)            │
│       │                               │
│   Messages (user + agent turns)       │
└──────────────┬───────────────────────┘
               │  (background processing)
               ▼
┌──────────────────────────────────────┐
│      DIALECTIC REASONING              │
│                                       │
│  After each conversation:             │
│  - Analyzes exchange                  │
│  - Derives "conclusions" about user   │
│  - Updates peer representation        │
│  - Tracks preferences, habits, goals  │
│  - Maps communication style           │
└──────────────────────────────────────┘
```

### Key Endpoints

| Endpoint | Purpose |
|----------|---------|
| `get_context` | Token-budgeted relevant context for current conversation |
| `working_representation` | Snapshot profile of a user (facts + deductions) |
| **Dialectic API** | Natural language queries: "What's the best way to explain X to this user?" |

### What Makes It Unique

The Dialectic API lets your agent *ask Honcho about the user* in natural language:
- "Is this user more task-oriented or relationship-oriented?"
- "What time of day is this user most engaged?"
- "How does this user prefer to receive feedback?"

This transforms memory from a lookup service into a reasoning partner.

### Strengths
- Deepest user modeling in the space
- Dialectic API enables runtime behavior adaptation
- Multi-agent awareness (separate profiles per peer)
- Automatic insight generation (no manual curation needed)

### Limitations
- Less focused on raw factual recall than competitors
- Newer platform, smaller community
- Pricing can add up ($2/M tokens ingested)
- Less suitable for non-conversational use cases

### Best For
- Products where personalization is the core value proposition
- Agents that need to adapt their communication style per user
- Multi-agent systems where different agents serve the same user
- Social / relationship-oriented AI applications

---

## 8. Letta (MemGPT)

**Website:** [letta.com](https://www.letta.com) | **GitHub:** 40K+ stars | **License:** Apache 2.0 | **Paper:** [arXiv:2310.08560](https://arxiv.org/abs/2310.08560) (Oct 2023)

### Architecture

Letta pioneered the **"LLM as Operating System"** paradigm, treating memory like a computer manages RAM and disk:

```
┌────────────────────────────────────┐
│         CORE MEMORY (RAM)           │
│  Always in context, every turn      │
│                                     │
│  Blocks:                            │
│  ├── persona: "I am a helpful..."   │
│  ├── human: "Sarah, fintech, Python"│
│  └── custom: project-specific data  │
│                                     │
│  Size-limited, agent self-edits     │
└────────────────┬───────────────────┘
                 │
┌────────────────┴───────────────────┐
│      RECALL MEMORY (Cache)          │
│  Searchable conversation history    │
│  conversation_search(query)         │
│  conversation_search_date(start,end)│
└────────────────┬───────────────────┘
                 │
┌────────────────┴───────────────────┐
│     ARCHIVAL MEMORY (Disk)          │
│  Long-term vector store             │
│  archival_memory_insert(content)    │
│  archival_memory_search(query)      │
└────────────────────────────────────┘
```

### Self-Editing Tools

The agent manages its own memory through tool calls:
- `core_memory_append(label, content)` — Add to a block
- `core_memory_replace(label, old, new)` — Edit a block
- `memory_rethink(label)` — Rewrite block with fresh reasoning
- `archival_memory_insert(content)` — Store long-term
- `archival_memory_search(query)` — Retrieve from long-term

### Evolution: MemGPT → Letta V1

The original MemGPT (2023) used `heartbeat` mechanisms and `send_message` as a tool. Letta V1 (2026) modernizes this:
- Native reasoning support (no more heartbeats)
- Direct assistant message generation
- Responses API support for OpenAI
- Compatible with any LLM (tool calling no longer required)
- Sleep-time compute for asynchronous memory management

### Strengths
- Foundational architecture that influenced the entire field
- Massive community (40K+ stars)
- Full-stack solution: memory + agent framework + deployment
- Letta Code CLI for local development
- Self-editing paradigm gives agents true autonomy

### Limitations
- Higher complexity than simpler memory layers
- Cost can be significant (LLM calls for every memory operation)
- V1 transition may require migration from MemGPT-style code
- Not specialized — does many things, masters of none

### Best For
- Building truly autonomous, long-running agents
- Research and experimentation
- Full-stack agent development (not just memory)
- Teams wanting a single framework for agent + memory

---

## 9. Cognee

**Website:** [cognee.ai](https://www.cognee.ai) | **GitHub:** 12K+ stars | **License:** Apache 2.0 (open-core) | **Funding:** $7.5M seed

### Architecture

Cognee builds **self-improving knowledge graphs** from diverse data sources:

```
ECL Pipeline (Extract → Cognify → Load):

1. ADD        → Ingest from 38+ sources (documents, images, audio, APIs)
2. COGNIFY    → 6-stage pipeline:
                ├── Classify documents
                ├── Check permissions
                ├── Extract chunks
                ├── LLM extracts entities & relationships
                ├── Generate summaries
                └── Embed everything
3. MEMIFY     → Self-improvement:
                ├── Prune stale nodes
                ├── Strengthen frequent connections
                ├── Reweight edges based on usage
                └── Add derived facts
4. SEARCH     → 14 retrieval modes:
                ├── Classic RAG
                ├── Graph traversal
                ├── Graph completion
                ├── Temporal search
                └── 10+ more
```

### Three Storage Layers (Unified)
- **Relational DB** — Metadata, permissions, user isolation
- **Vector Store** — Embeddings for semantic search (default: built-in; supports Qdrant, pgvector)
- **Graph Store** — Entities and relationships (default: Kuzu; supports Neo4j, FalkorDB, Neptune)

### Strengths
- Strongest institutional knowledge focus
- 38+ data source connectors
- Self-improving memory via feedback loops (memify)
- Flexible graph backend (works with many DBs)
- Active integrations (Claude Agent SDK, OpenAI Agents SDK, LangGraph)

### Limitations
- Python-only
- Primarily institutional knowledge, less focused on conversational personalization
- Cloud offering is newer and less proven
- Higher learning curve than simpler systems

### Best For
- Building domain knowledge from scattered documents
- Enterprise applications with compliance requirements
- Scientific research and knowledge management
- Teams already using graph databases

---

## 10. RetainDB

**Website:** [retaindb.com](https://www.retaindb.com) | **License:** Proprietary (SaaS)

### Architecture

RetainDB is a managed memory service optimized for fast integration:

```typescript
import { RetainDB } from "@retaindb/sdk";
const db = new RetainDB({ apiKey: process.env.RETAINDB_KEY });

const { response } = await db.user(userId).runTurn({
  messages,
  generate: (ctx) => llm.chat(ctx),
});
```

Three lines of code: import, initialize, use. The `runTurn` call handles retrieval, injection, generation, and storage automatically.

### 7 Memory Types

| Type | Description |
|------|-------------|
| Factual | Objective facts |
| Preference | User choices |
| Event | Timestamped occurrences |
| Relationship | Entity connections |
| Opinion | Subjective views |
| Goal | Future intentions |
| Instruction | Persistent directives |

### Key Features
- **Delta Compression:** 50–90% token savings by only sending what changed
- **<40ms retrieval latency** globally
- **Per-user data isolation** (no cross-user contamination)
- **Memory Router:** Drop in front of existing LLM calls, no code changes
- **MCP support** for Claude Desktop, Claude Code, Cursor

### Strengths
- Fastest time-to-integration (under 30 minutes)
- SOTA on LongMemEval (self-reported)
- Delta compression provides real cost savings
- SOC 2 ready, enterprise-grade security
- Self-hosted option available

### Limitations
- Closed source / proprietary
- Limited customization compared to open-source alternatives
- Pricing can scale with usage
- Less community visibility (no GitHub stars to gauge adoption)

### Best For
- Teams wanting production memory with minimal engineering investment
- Applications where time-to-market matters
- Enterprise deployments needing compliance (SOC 2, data isolation)

---

## 11. Nuggets (Holographic Memory)

**Website:** [github.com/NeoVertex1/nuggets](https://github.com/NeoVertex1/nuggets) | **License:** Open source | **233 stars**

### Architecture

Nuggets takes a radically different approach: **Holographic Reduced Representations (HRR)** for memory storage.

```
Each "nugget" = topic-scoped memory (e.g., learnings, preferences, project)

Facts are key-value pairs compressed into a fixed-size complex vector:
  alice.lives_in = paris     ──→  circular convolution
  alice.works_at = acme      ──→  superposed into same vector
  
Recall:
  query(alice, lives_in) ──→ unbind + cosine similarity ──→ paris (~1ms)
```

### Memory Promotion Pipeline

```
Session Memory (HRR vectors, ~/.nuggets/)
    │
    │  fact recalled 3+ times across sessions
    │
    ▼
Permanent Memory (MEMORY.md, always loaded as context)
```

Facts that prove persistently useful get "promoted" from holographic memory to permanent context. The agent gets faster and cheaper over time.

### Strengths
- Zero external dependencies (pure TypeScript math)
- Sub-millisecond recall
- Self-improving via promotion mechanism
- Works offline, local-first

### Limitations
- Only handles structured triples, not free-form text
- Accuracy limits per topic (~25 facts before degradation)
- Tiny community (233 stars)
- Requires Pi agent framework

### Best For
- Lightweight personal assistants
- IoT / edge devices with no network access
- Complementing other systems for fast structured fact recall

---

**Next: [Chapter 4 — The Consumer AI Memory Race](04_consumer_memory.md)** — How OpenAI, Anthropic, and Google approach memory.
