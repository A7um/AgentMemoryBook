# Chapter 5: Benchmarks & Evaluation

How do you know if a memory system actually works? This chapter covers the major benchmarks, their methodology, current leaderboard standings, and their limitations.

---

## The Two Major Benchmarks

### LongMemEval

**Paper:** Wu et al., ICLR 2025 | **Questions:** 500 | **Format:** Multi-session conversation → question-answer

LongMemEval is considered the **gold standard** benchmark for agent memory. Each test case provides:
- Multi-session conversation histories (~115K tokens across ~40 sessions)
- The system must ingest these into its memory
- Then answer questions requiring recall across sessions

**6 Question Types:**

| Category | # Questions | Tests |
|----------|-------------|-------|
| Temporal Reasoning | 133 | "When did Alice change jobs?" |
| Multi-Session Aggregation | 133 | Combining info from multiple conversations |
| Single-Session User Facts | 70 | Facts mentioned in one session |
| Single-Session Assistant Observations | 56 | What the assistant noticed |
| Knowledge Updates | 78 | Has the fact changed since it was stored? |
| Single-Session Preferences | 30 | User preferences mentioned once |

Plus 30 **unanswerable questions** to test whether the system knows when to say "I don't know."

**Scoring:** Correct / 500 × 100. Binary — you either get it right or you don't.

**Variants:**
- **LongMemEval-S:** Standard setting (~115K tokens, ~40 sessions)
- **LongMemEval-M:** Massive setting (up to 1.5M tokens, needle-in-haystack)

### LoCoMo (Long Conversation Memory)

**Paper:** ICLR 2025 | **Questions:** ~1,500–2,000 QA pairs | **Format:** Long multi-turn conversations

LoCoMo tests memory systems on long, multi-turn conversations with four question categories:

| Category | Tests |
|----------|-------|
| **Single-Hop** | Direct factual recall ("Where does Alice work?") |
| **Multi-Hop** | Requires combining facts ("What project does the person who lives in Paris lead?") |
| **Open Domain** | Broad, under-specified queries |
| **Temporal** | Time-dependent reasoning |

**Scoring:** Accuracy per category + overall, typically judged by LLM-as-a-Judge.

### Other Benchmarks

| Benchmark | Focus | Used By |
|-----------|-------|---------|
| **DMR (Deep Memory Retrieval)** | Fact retrieval from MemGPT's test suite | Zep (94.8% vs MemGPT 93.4%) |
| **ConvoMem** | Conversational memory quality | Supermemory (#1) |
| **MemoryBench** | Open-source benchmark framework | Supermemory (built it) |
| **MemoryAgentBench** | Agent-oriented: retrieval + test-time learning + forgetting | Academic research |
| **HotPotQA** | Multi-hop question answering (not memory-specific) | Cognee uses for comparison |

---

## Current Leaderboard (April 2026)

### LongMemEval Leaderboard

| System | Score | LLM | Notes |
|--------|-------|-----|-------|
| **Agentmemory V4** | **96.2%** | Claude Opus | Solo developer, 16 days, $1K API cost |
| **PwC Chronos** | 95.6% | — | Research team |
| **OMEGA** | 95.4% | — | Research |
| **Mastra** | 94.87% | GPT-5-mini | 10-point jump from model upgrade alone |
| **Hindsight** | 91.4% | OSS-20B | Best open-source model result |
| **Hindsight** | 89.0% | OSS-120B | — |
| **Supermemory** | 85.2% | GPT-4o | — |
| **Emergence AI** | 86.0% | — | — |
| **Zep** | 71.2% | — | — |
| **Full-context GPT-4o** | 60.2% | GPT-4o | Baseline |

### LoCoMo Leaderboard

| System | Single-Hop | Multi-Hop | Open Domain | Temporal | Overall |
|--------|-----------|-----------|-------------|----------|---------|
| **ByteRover 2.0** | 95.4% | 85.1% | 77.2% | 94.4% | **92.2%** |
| **Backboard** | 89.4% | 75.0% | 91.2% | 91.9% | 90.0% |
| **Hindsight (Gemini-3)** | — | — | 95.1% | — | **89.6%** |
| **Hindsight (OSS-120B)** | 76.8% | 62.5% | 93.7% | 79.4% | 85.7% |
| **Memobase** | 70.9% | 46.9% | 77.2% | 85.1% | 75.8% |
| **Zep** | 74.1% | 66.0% | 67.7% | 79.8% | 75.1% |
| **Mem0-Graph** | 65.7% | 47.2% | 75.7% | 58.1% | 68.4% |
| **Mem0** | 67.1% | 51.2% | 72.9% | 55.5% | 66.9% |
| **LangMem** | 62.2% | 47.9% | 71.1% | 23.4% | 58.1% |
| **OpenAI** | 63.8% | 42.9% | 62.3% | 21.7% | 52.9% |

---

## How to Read These Numbers

### What the Numbers Tell You

1. **Memory systems dramatically outperform full-context baselines.** Full-context GPT-4o scores 60.2% on LongMemEval — structured memory adds 30+ percentage points.

2. **Architecture matters more than model size.** Hindsight with an open-source 20B model (91.4%) beats full-context GPT-4o (60.2%) by 31 points on LongMemEval.

3. **The field is moving fast.** In 18 months, top LongMemEval scores went from ~60% to 96.2%.

4. **Temporal reasoning is the hardest category.** Most systems score lowest on temporal queries, which require understanding *when* things happened.

5. **Model choice matters a lot.** Mastra jumped 10 points just by switching from GPT-4o to GPT-5-mini with zero architecture changes.

### What the Numbers Don't Tell You

**1. Benchmark Overfitting**
The Agentmemory V4 creator was transparent: "I iterated 46 times on the same 500 questions." Every system in the space does this — there's no train/test split. Scores may not generalize to real-world workloads.

**2. Self-Reported Results**
There is no unified, independently-run leaderboard. Most scores are self-reported by the system's creators. Hindsight's benchmarks have been "independently reproduced by research collaborators at Virginia Tech," but this is the exception.

**3. Real-World Complexity**
LongMemEval hands you the haystack — a predefined set of conversations. Real-world memory systems must also decide **what to keep** from an unbounded stream of interactions. The ingestion problem is arguably harder than the retrieval problem, and benchmarks don't test it.

**4. Latency and Cost**
Benchmarks measure accuracy, not latency or token cost. A system scoring 96% but taking 5 seconds per query is not production-viable for real-time chat.

**5. Privacy and Multi-User Isolation**
Benchmarks operate in a single-user setting. Production systems must ensure User A's memories never leak into User B's context — a critical requirement that benchmarks don't evaluate.

---

## The 6 Unsolved Questions in Memory Evaluation

Drawing from the 2026 surveys:

### 1. Continual Consolidation
How well does a system handle months or years of accumulating memories? Current benchmarks test ~40 sessions. Real users may have thousands.

### 2. Selective Forgetting
Can the system gracefully forget outdated information? LongMemEval includes "knowledge update" questions, but doesn't test whether old facts are properly deprecated.

### 3. Causally Grounded Retrieval
Can the system retrieve the *reason* behind a fact, not just the fact itself? "Why did Alice switch to TypeScript?" requires causal reasoning, not just factual recall.

### 4. Trustworthy Reflection
When a system synthesizes observations from facts, how often does it get it wrong? There's no benchmark for reflection accuracy.

### 5. Multi-Agent Memory
When multiple agents share a memory store, how well do they coordinate? No benchmark tests this scenario.

### 6. Multimodal Memory
As agents work with images, audio, and video, how well can they store and retrieve non-text memories? This is entirely untested.

---

## Practical Evaluation Framework

If you're choosing a memory system for production, here's what to evaluate beyond benchmark scores:

| Dimension | What to Test | How to Test |
|-----------|-------------|-------------|
| **Retrieval Accuracy** | Does it find the right memories? | Run LongMemEval or LoCoMo locally |
| **Update Handling** | Does it handle contradictions? | Feed "moved to London" after "lives in NY" |
| **Latency** | Is it fast enough? | Measure p50 and p95 under load |
| **Token Efficiency** | How many tokens per query? | Compare with and without delta compression |
| **Scalability** | What happens at 10K+ memories? | Load test with synthetic data |
| **Privacy** | Is user data isolated? | Attempt cross-user retrieval |
| **Observability** | Can you see what was retrieved? | Check for retrieval logging / audit trail |
| **Degradation** | What happens when memory is wrong? | Inject incorrect facts, measure impact |

---

**Next: [Chapter 6 — Decision Guide](06_decision_guide.md)** — Which memory system should you choose?
