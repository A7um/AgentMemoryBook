# Chapter 2: Techniques — The Building Blocks of Agent Memory

Every memory system, no matter how sophisticated its marketing, is built from a combination of well-understood engineering techniques. This chapter maps each technique, explains how it works, and identifies which production systems use it.

## Technique 1: Context-Resident Compression

**What it is:** Keeping memory inside the context window itself, but in compressed form.

The simplest approach: instead of storing memories externally, summarize past interactions and inject the summary into every prompt. This is what ChatGPT does at scale.

```
System prompt:
  "You are a helpful assistant."
  
User Memory (always injected):
  - User's name is Sarah
  - Prefers concise answers
  - Works in fintech, uses Python
  
Recent Chat Summaries:
  - Dec 8: "Building a load balancer in Go" — asked about connection pooling
  - Dec 7: "Fitness routine" — wanted recovery advice
  
Current conversation messages...
```

**How compression works:**
- **Extractive:** Pull out key sentences verbatim
- **Abstractive:** LLM generates a shorter summary
- **Delta compression:** Only transmit what changed since last turn (RetainDB claims 50–90% token savings)

**Strengths:**
- Zero infrastructure — no vector DB, no graph DB
- Low latency — no retrieval step
- Works with any model

**Weaknesses:**
- Summary quality degrades with long histories
- Cannot handle "needle in a haystack" queries over thousands of sessions
- Lossy — details are permanently lost during summarization

**Who uses it:** OpenAI ChatGPT Memory (4-layer context injection), Claude Chat Memory, RetainDB (delta compression)

---

## Technique 2: Retrieval-Augmented Memory (Vector Stores)

**What it is:** Storing memories as embeddings in a vector database and retrieving the top-K most similar ones at query time.

This is the most common technique in production memory systems. It extends classical RAG by making the corpus *dynamic* — new memories are continuously added from conversations.

```
Write path:
  conversation → LLM extracts facts → embed facts → store in vector DB
  
Read path:
  user query → embed query → similarity search → top-K results → inject into prompt
```

**How similarity search works:**
1. Each memory is converted to a dense vector (e.g., 1536 dimensions for OpenAI `text-embedding-3-small`)
2. At query time, the query is embedded with the same model
3. The vector DB returns the K nearest neighbors by cosine similarity
4. Optional: a cross-encoder reranker rescores the results for precision

**The hybrid search pattern:**
Most production systems combine vector search with keyword search (BM25) because:
- Vector search excels at semantic similarity ("What does Alice do?" matches "Alice works at Google")
- Keyword search excels at exact matches ("Alice" matches documents containing "Alice")
- Combined retrieval catches what either alone would miss

**Strengths:**
- Scales to millions of memories
- Good semantic understanding
- Well-understood infrastructure (Pinecone, Qdrant, pgvector, ChromaDB)

**Weaknesses:**
- No relational reasoning ("Who are Alice's coworkers?" requires multiple hops)
- No temporal reasoning ("What did Alice do *last spring*?")
- Embedding quality is the ceiling — if the embedding model misses nuance, retrieval fails

**Who uses it:** Mem0 (core), Supermemory (hybrid), RetainDB, most systems as a base layer

---

## Technique 3: Knowledge Graphs

**What it is:** Storing memories as entities (nodes) and relationships (edges) in a graph structure, enabling multi-hop reasoning.

```
Entities (nodes):
  [Alice] [Google] [Paris] [Project X]

Relationships (edges):
  Alice --works_at--> Google
  Alice --lives_in--> Paris
  Alice --leads--> Project X
  Project X --deadline--> March 2026
```

This structure enables queries that vector search cannot: "What project does the person who lives in Paris lead?" requires traversing Alice → lives_in → Paris, then Alice → leads → Project X.

### Temporal Knowledge Graphs

Zep/Graphiti pioneered adding *temporal metadata* to graph edges:

```
Alice --lives_in--> New York   [valid_at: 2023-01, invalid_at: 2025-06]
Alice --lives_in--> London     [valid_at: 2025-06, invalid_at: null]
```

This bi-temporal model enables:
- Point-in-time queries: "Where did Alice live in 2024?"
- Change tracking: "When did Alice move?"
- Fact invalidation without data loss

### Graph Construction Pipeline

```
Raw conversation
    │
    ▼
Entity Extraction (LLM)
    │ "Alice works at Google"
    ▼
Relationship Generation (LLM)
    │ (Alice, works_at, Google)
    ▼
Conflict Detection
    │ Does this contradict existing edges?
    ▼
Resolution (LLM or rules)
    │ Add new / invalidate old / merge
    ▼
Graph Update
```

**Strengths:**
- Multi-hop reasoning
- Temporal reasoning (with temporal graphs)
- Explicit, auditable knowledge representation
- Supports community detection for high-level summaries

**Weaknesses:**
- Expensive to build (requires LLM calls for extraction)
- Graph quality depends heavily on the extraction LLM
- Retrieval from large graphs can be slow without careful indexing
- Maintaining consistency is complex

**Who uses it:** Zep/Graphiti (temporal KG), Mem0g (graph variant), Cognee (KG + vector hybrid), Hindsight (4-network graph)

---

## Technique 4: Hierarchical / Tree-Based Memory

**What it is:** Organizing memories in a tree structure that mirrors how humans categorize knowledge.

ByteRover pioneered this with its Context Tree:

```
.brv/context-tree/
├── market_analysis/                    # Domain
│   ├── competitor_landscape/           # Topic
│   │   ├── ai_infrastructure/          # Subtopic
│   │   │   ├── nvidia_earnings.md      # Entry
│   │   │   └── cloud_pricing.md        # Entry
│   │   └── consumer_apps/
│   └── industry_trends/
├── project_alpha/
│   ├── architecture_decisions/
│   └── team_context/
└── user_preferences/
```

OpenViking uses a similar approach with its virtual filesystem:

```
viking://user/memories/
├── profile.md
├── preferences/
├── entities/
└── events/

viking://agent/memories/
├── cases/
└── patterns/
```

### Tiered Context Loading

Both OpenViking and Supermemory implement multi-level summaries:

| Level | Token Size | Purpose |
|-------|-----------|---------|
| **L0 (Abstract)** | ~100 tokens | Ultra-short summary for quick relevance filtering |
| **L1 (Overview)** | ~2K tokens | Moderate detail for topic understanding |
| **L2 (Full)** | Full content | Complete data, loaded only when needed |

Retrieval starts at L0, checks relevance, then drills down to L1/L2 only for relevant branches. This reportedly cuts token consumption by 83–96%.

**Strengths:**
- Human-readable and debuggable
- Natural organization for browsing
- No vector DB infrastructure required (file-based)
- Progressive disclosure of detail

**Weaknesses:**
- Less effective for cross-cutting queries that span multiple branches
- Requires good taxonomy design (garbage in, garbage out)
- Manual or LLM-driven organization has overhead

**Who uses it:** ByteRover (Context Tree), OpenViking (AGFS filesystem), Claude Code (CLAUDE.md hierarchy)

---

## Technique 5: Structured Memory Networks

**What it is:** Partitioning memory into multiple *epistemically distinct* stores, each with its own semantics and retrieval behavior.

Hindsight's 4-network architecture is the canonical example:

| Network | Content | Source |
|---------|---------|--------|
| **World (W)** | Objective facts about the environment | "Alice works at Google" |
| **Experience (B)** | The agent's own past actions | "I recommended Python to Bob" |
| **Observation (O)** | Synthesized entity summaries | "Alice is a frequent Python user who recently moved" |
| **Opinion (S)** | The agent's evolving beliefs | "Alice would benefit from TypeScript" |

The key insight: facts and beliefs are *different things* and should be stored separately. A fact ("Alice uses Python") is verifiable. A belief ("Alice would benefit from TypeScript") is the agent's inference. Mixing them leads to hallucination.

### Retain → Recall → Reflect

Hindsight's three operations mirror human cognition:

1. **Retain:** Parse conversations into atomic facts, tag with timestamps and entities, store in World or Experience
2. **Recall:** Multi-strategy retrieval (semantic + keyword + graph + temporal) → cross-encoder reranking → token-budgeted context
3. **Reflect:** The agent reasons over retrieved memories to answer questions or update Observations and Opinions

**Strengths:**
- Epistemic clarity — you know *why* the agent believes something
- Traceable reasoning — beliefs link back to source facts
- Supports agent identity / disposition configuration

**Weaknesses:**
- More complex to implement than flat vector stores
- The distinction between Observation and Opinion can be subtle
- Requires careful prompt engineering for the reflect step

**Who uses it:** Hindsight (4 networks), Letta/MemGPT (core/recall/archival tiers), Honcho (peer models + conclusions)

---

## Technique 6: LLM-Driven Memory Curation

**What it is:** Using the LLM itself — the same one that reasons about tasks — to curate, organize, and maintain memory.

This is ByteRover's core innovation. Instead of a separate memory service that the agent *calls*, the agent *is* the memory curator:

```
Agent receives new information
    │
    ▼
Agent runs in sandbox with file access
    │
    ▼
Agent reads existing Context Tree
    │
    ▼
Agent decides: create / update / merge / delete entries
    │
    ▼
Agent writes changes to markdown files
    │
    ▼
Changes are atomic, version-controlled (git-like)
```

Mem0 uses a lighter version: the LLM decides ADD / UPDATE / DELETE / NOOP for each candidate memory by comparing it against the top-K existing memories.

**Strengths:**
- The agent understands the *meaning* of memory, not just vector similarity
- Can handle nuanced updates ("Actually, Alice's title is now VP, not Director")
- Auditable — changes are visible in files or logs

**Weaknesses:**
- Expensive — every memory operation requires an LLM call
- Slow — adds latency to every interaction
- Quality depends entirely on the LLM's judgment
- Risk of cascade errors (bad curation → bad retrieval → bad curation)

**Who uses it:** ByteRover (primary), Mem0 (update phase), Letta (self-editing tools), Cognee (cognify pipeline)

---

## Technique 7: Reflection and Self-Improvement

**What it is:** The agent periodically reviews its own memories to derive higher-level insights, consolidate related facts, and update beliefs.

This is inspired by the *reflection* mechanism from Generative Agents (Park et al., 2023), where simulated characters would periodically reflect on recent events to form higher-level observations.

In practice:

```
Periodic reflection trigger (e.g., after 5 sessions)
    │
    ▼
Retrieve all facts about entity X
    │
    ▼
LLM synthesizes: "Based on 12 interactions, Alice is a senior
    engineer who prefers concise communication, is learning Rust,
    and frequently works on distributed systems."
    │
    ▼
Store as Observation / Profile
    │
    ▼
Use observation as default context in future queries
```

Honcho calls this "dialectic reasoning" — after each conversation, it reasons about the exchange to derive "conclusions" about the user's preferences, habits, and goals.

**Strengths:**
- Produces high-quality summaries that capture patterns across many interactions
- Reduces retrieval burden (one observation replaces dozens of raw facts)
- Enables the agent to "learn" in a meaningful sense

**Weaknesses:**
- Reflection can be wrong — the agent may form incorrect beliefs
- Expensive (requires LLM calls during "sleep time")
- Stale reflections can persist if not periodically refreshed

**Who uses it:** Hindsight (reflect operation), Honcho (dialectic reasoning), Cognee (memify), OpenViking (memory extraction), Letta (sleep-time compute)

---

## Technique 8: Holographic Reduced Representations (HRR)

**What it is:** A mathematical technique from cognitive science that stores multiple key-value pairs in a single fixed-size complex-valued vector using circular convolution.

This is a niche but fascinating approach used by Nuggets:

```javascript
// Store
mem.remember('alice', 'lives_in', 'paris');
mem.remember('alice', 'works_at', 'acme');

// Recall — algebraic, sub-millisecond
const result = mem.recall('alice', 'lives_in');
// → 'paris' (in <1ms, zero API calls)
```

**How it works:**
1. Each key and value is encoded as a complex vector
2. Key and value are *bound* together via circular convolution
3. Multiple bindings are *superposed* (added) into one vector
4. To recall, *unbind* with the query key and find the nearest match

**Strengths:**
- Sub-millisecond retrieval, zero external dependencies
- No API calls, no vector DB, no embedding service
- Mathematically elegant constant-space storage

**Weaknesses:**
- Accuracy degrades as more facts are superposed (practical limit ~25 per topic)
- Only handles structured triples, not free-form text
- No semantic similarity — exact key matching only
- Complementary to, not a replacement for, vector search

**Who uses it:** Nuggets (holographic memory engine), hrr-memory (standalone library)

---

## Technique 9: Multi-Strategy Retrieval

**What it is:** Running multiple retrieval strategies in parallel and merging results through a reranker to maximize recall and precision.

Hindsight's TEMPR (Temporal Entity Memory Priming Retrieval) runs four strategies simultaneously:

| Strategy | Best For |
|----------|----------|
| **Semantic (Vector)** | Conceptual similarity, paraphrased queries |
| **Keyword (BM25)** | Names, technical terms, exact matches |
| **Graph Traversal** | Related entities, indirect connections |
| **Temporal** | Time-bounded queries ("last spring") |

Results are merged and passed through a cross-encoder reranker that scores each result's relevance to the original query. This adds latency (~50–200ms) but significantly improves precision.

ByteRover uses a 5-tier progressive strategy that escalates only when simpler tiers fail:

```
Tier 1: Cache lookup          (~0ms)
Tier 2: Full-text search      (~10ms)
Tier 3: Semantic search        (~50ms)
Tier 4: Graph traversal        (~100ms)
Tier 5: Agentic reasoning      (~500ms+, involves LLM call)
```

Most queries resolve at Tiers 1–3, keeping average latency low while maintaining a fallback for complex queries.

**Who uses it:** Hindsight (TEMPR), ByteRover (5-tier), Zep (hybrid semantic + BM25 + graph), Supermemory (hybrid vector + keyword + reranking)

---

## Technique 10: Memory Self-Editing

**What it is:** The agent has tools that allow it to modify its own memory during the course of a conversation.

Pioneered by MemGPT/Letta:

```python
# The agent has access to these tools:
core_memory_append(label="human", content="Sarah prefers dark mode")
core_memory_replace(label="human", old="works at startup", new="works at Google")
archival_memory_insert(content="Project requirements document...")
archival_memory_search(query="deployment architecture")
```

The agent decides *when* and *what* to remember. This is more flexible than automatic extraction because the agent can use judgment — but it also means the agent might forget to save important information or save irrelevant details.

Letta's V1 architecture refines this with:
- `memory_insert` — Add new information
- `memory_replace` — Update existing information
- `memory_rethink` — Rewrite a memory block with fresh reasoning
- `memory_apply_patch` — Apply structured edits

**Who uses it:** Letta/MemGPT (primary paradigm), Claude API Memory Tool (client-side CRUD)

---

## Technique Summary Matrix

| Technique | Latency | Accuracy | Complexity | Infrastructure |
|-----------|---------|----------|------------|---------------|
| Context Compression | ⚡ Very Low | ⚠️ Moderate | Low | None |
| Vector Store RAG | 🔄 Low-Medium | ✅ Good | Medium | Vector DB |
| Knowledge Graph | 🔄 Medium | ✅ Very Good | High | Graph DB |
| Hierarchical Tree | ⚡ Low | ✅ Good | Medium | Filesystem |
| Structured Networks | 🔄 Medium | ✅ Excellent | High | Multiple stores |
| LLM Curation | 🐌 High | ✅ Very Good | High | LLM API |
| Reflection | 🐌 High (async) | ✅ Excellent | High | LLM API |
| HRR | ⚡ Sub-ms | ⚠️ Structured only | Low | None |
| Multi-Strategy Retrieval | 🔄 Medium | ✅ Excellent | High | Multiple |
| Self-Editing | 🔄 Medium | ⚠️ Agent-dependent | Medium | LLM + Store |

The best systems combine multiple techniques. Hindsight uses structured networks + multi-strategy retrieval + reflection. Mem0 uses vector stores + LLM curation + knowledge graphs. ByteRover uses hierarchical trees + LLM curation + multi-tier retrieval.

---

**Next: [Chapter 3 — Provider Deep Dives](03_providers.md)** — Detailed analysis of every major memory system.
