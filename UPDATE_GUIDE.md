# AgentMemoryBook — Update Guide for AI Agents

> This document instructs an AI agent how to keep the AgentMemoryBook current with the evolving agent memory landscape. It is designed to prevent two critical failure modes: **inertia** (updating content without recognizing landscape shifts) and **coverage gaps** (missing top-tier new practices).

---

## When to Run

| Trigger | Frequency | Scope |
|---------|-----------|-------|
| **Scheduled sweep** | Every 2-4 weeks | Full update cycle |
| **Benchmark record broken** | As it happens | Chapters 5 (Benchmarks) + affected provider |
| **Major provider launch** | As it happens | New provider chapter + Chapter 3 index |
| **Major architecture change** | As it happens | Affected provider chapter + possibly Chapter 2 |
| **Manual request** | On demand | As specified |

---

## Phase 1: Landscape Assessment (MANDATORY — Before Any Edits)

**You must complete this phase before touching any book content.** Write your answers in `research/latest_assessment.md`.

### Five Questions to Answer

1. **What are the top 3 patterns becoming standard across providers that weren't standard last month?**
   - Example: "Agentic retrieval is now default in 4 of 12 providers — was only 1 last cycle."
   - If you find one, this is a candidate for a new section in Chapter 2 (Techniques).

2. **Is any technique from Chapter 2 now obsolete or superseded?**
   - Read each technique heading in `src/02_techniques.md`. For each one, find one real-world example from the last 30 days that either confirms or contradicts our description.
   - If you can't find a confirming example for a technique, flag it as potentially stale.

3. **Has any provider moved into a fundamentally different category than where we placed them?**
   - Example: "Mem0 shipped a full agent framework, not just memory — the 'Best For' section needs rethinking."

4. **Are the decision criteria in Chapter 6 still the right axes to compare on?**
   - Check if the decision tree recommendations still hold. Would you give different advice today?

5. **Has a new *category* of memory system emerged that the book doesn't have a name for?**
   - Example: "Three new providers all do 'memory-as-code-context' — this is a new pattern we haven't categorized."

### Landscape Assessment Output Format

```markdown
# Landscape Assessment — [DATE]

## Landscape Shifts
- [List any shifts discovered, or "None detected"]

## Stale Content Flags  
- [List any techniques/providers whose descriptions no longer match reality]

## New Category Candidates
- [List any emerging patterns that might need a new section]

## Recommendation
- [ ] Patch update (individual file changes only)
- [ ] Structural update (Chapter 2 or 6 needs revision)
- [ ] Major update (new technique category, new comparison axis, or restructure)
```

**If the recommendation is "Structural update" or "Major update," complete the restructure BEFORE doing individual provider updates.** Otherwise, you'll slot new information into the wrong framework.

---

## Phase 2: Multi-Source Discovery

### Anti-Coverage-Gap Rule

> You MUST search from multiple angles. If you only search for what you already know about, you will miss what you don't know about. Each search category below covers a different blind spot.

### 2.1 — New Providers & Products

Run ALL of these searches. Do not skip any.

| # | Search Query | What It Catches |
|---|-------------|-----------------|
| 1 | `GitHub: "agent memory" created:>30-days-ago sort:stars` | New repos gaining traction |
| 2 | `GitHub: "memory" "agent" "LLM" stars:>500 created:>90-days-ago` | Established newcomers we missed |
| 3 | `"How I built memory for my AI agent" [CURRENT_YEAR]` | Practitioner posts revealing unknown tools |
| 4 | `"migrated from Mem0 to" OR "switched from Hindsight to" OR "replaced Zep with"` | Competitors surfaced through migration stories |
| 5 | `site:news.ycombinator.com "agent memory" [CURRENT_YEAR]` | Hacker News launches and discussions |
| 6 | `site:producthunt.com "agent memory" OR "AI memory"` | Product launches |
| 7 | `"best agent memory" [CURRENT_YEAR] reddit OR discord` | Crowd wisdom and recommendations |

### 2.2 — Benchmark Updates

| # | Search Query | What It Catches |
|---|-------------|-----------------|
| 8 | `"LongMemEval" score OR accuracy [CURRENT_YEAR]` | New benchmark submissions |
| 9 | `"LoCoMo" benchmark results [CURRENT_YEAR]` | New benchmark submissions |
| 10 | `Check: github.com/vectorize-io/hindsight-benchmarks` | Official Hindsight leaderboard (most comprehensive) |
| 11 | `Check: supermemory.ai/research` | MemoryBench updates |

### 2.3 — Architecture & Technique Evolution

| # | Search Query | What It Catches |
|---|-------------|-----------------|
| 12 | `arXiv: "agent memory" submitted in last 30 days` | New academic techniques |
| 13 | `"context engineering" AND "memory" [CURRENT_YEAR]` | The broader context engineering trend |
| 14 | `For each provider in the book: check their GitHub releases page` | Breaking changes to existing systems |
| 15 | `For each provider in the book: check their /blog or /changelog` | Feature announcements |

### 2.4 — Ecosystem & Integration Signals

| # | Search Query | What It Catches |
|---|-------------|-----------------|
| 16 | `Check: LangChain integrations page for new memory providers` | Framework adoption signals |
| 17 | `Check: OpenClaw/Claude Code/Cursor plugin marketplaces` | IDE adoption signals |
| 18 | `"agent memory" site:crunchbase.com OR "raises" OR "seed round"` | Funding = commercial commitment |

### 2.5 — Competitor Cross-Reference (Critical for coverage gaps)

> For EACH provider currently in the book, visit their "Comparison" or "Alternatives" page. If they mention a competitor we don't cover, investigate it.

| Provider | Where to Check |
|----------|---------------|
| Mem0 | mem0.ai — check comparison pages, blog |
| Hindsight | vectorize.io/articles — they publish detailed comparisons |
| Supermemory | supermemory.ai — check comparison content |
| Zep | getzep.com/blog — check competitor mentions |
| ByteRover | byterover.dev/blog — check benchmark posts (they list all competitors) |
| RetainDB | retaindb.com — check "How we compare" section |

If ANY provider mentions a competitor that is not in the book, investigate whether it meets the inclusion threshold (see Phase 3).

---

## Phase 3: Evaluation Rubric

### When to ADD a new provider chapter

A new provider qualifies for its own chapter if it meets **2 or more** of these criteria:

| Criterion | Threshold |
|-----------|-----------|
| GitHub stars | > 500 |
| Published paper | arXiv or peer-reviewed venue |
| Benchmark submission | Appears on LongMemEval or LoCoMo leaderboard |
| Production usage | Named customer OR mentioned in a "how we built" post |
| Novel architecture | Does something no existing provider in the book does |
| Funding | Raised seed round or higher |
| Framework integration | Available as plugin in 2+ agent frameworks |

If it meets only 1 criterion, add it to a "Notable Mentions" section in `src/03_providers.md` instead of creating a full chapter.

### When to UPDATE an existing provider chapter

| Signal | Action |
|--------|--------|
| New major version (e.g., v2.0) with architecture changes | Rewrite architecture section, update diagrams |
| New benchmark score | Update numbers in provider chapter + Chapter 5 |
| New SDK/API (breaking changes) | Update code examples |
| New feature that changes "Best For" | Update Strengths/Limitations/Best-For sections |
| Minor feature addition | Do NOT update. Not everything needs to be in the book. |

### When to ADD a new technique to Chapter 2

A technique qualifies if:
- Used by 3+ providers in the book, AND
- Not already described in Chapter 2, AND
- Represents a meaningfully different approach (not just a minor variation)

### When to RESTRUCTURE

Restructure the book (change chapter organization, add/remove sections) if:
- A new category of memory system has emerged that doesn't fit existing provider groupings
- The decision criteria in Chapter 6 no longer reflect the actual trade-offs teams face
- A technique has become so universal it's no longer a differentiator (move it from Chapter 2 to Chapter 1 as a "baseline")

---

## Phase 4: Cross-Cutting Synthesis (MANDATORY)

> Every update cycle MUST produce at least one cross-cutting insight. If you only produced per-provider patches, you failed.

Write a synthesis entry in `research/trends.md` answering:

1. **What changed about the *field* this month?** (Not individual products — the field.)
2. **What's converging?** (Are providers becoming more similar? In what ways?)
3. **What's diverging?** (Are there new forks in approach that weren't visible before?)
4. **What surprised you?** (What didn't match your expectations based on the current book content?)

### Trends Tracker Format

Append to `research/trends.md`:

```markdown
## [DATE] Update Cycle

### Field-Level Changes
- [Observations about the overall landscape]

### Convergence Signals
- [Things becoming standard across providers]

### Divergence Signals  
- [New forks in approach]

### Surprises
- [Unexpected findings]

### Pattern Watch
- [PATTERN_NAME]: Seen in [provider1, provider2]. First observed [date]. 
  Status: monitoring / promoting to Chapter 2 / promoted
```

**Promotion rule:** When a pattern appears in 3+ providers across 2+ update cycles, promote it to a book-level topic (Chapter 2 technique or Chapter 3 category).

---

## Phase 5: Execute Updates

### File Map — What to Touch for Each Update Type

| Update Type | Files to Modify |
|------------|----------------|
| **New benchmark scores** | `src/05_benchmarks.md` (leaderboard tables), affected `src/providers/{name}.md`, `README.md` (if ranking changed) |
| **New provider** | Create `src/providers/{name}.md`, add to `src/SUMMARY.md`, `src/03_providers.md`, `src/introduction.md` (comparison table), `README.md` (comparison table) |
| **Provider architecture change** | `src/providers/{name}.md` (rewrite architecture section + diagrams) |
| **New technique** | `src/02_techniques.md` (add section), reference from relevant `src/providers/*.md` |
| **Consumer AI update** | `src/04_consumer_memory.md` |
| **Decision criteria change** | `src/06_decision_guide.md` (update decision tree + recommendations) |
| **New future challenge** | `src/07_future.md` |

### New Provider Chapter Template

Every new provider chapter MUST include ALL of these sections:

```
# {Provider Name} — {One-Line Description}

> **One-liner:** {What it does in one sentence}

| Stat | Value |
|------|-------|
| **Website** | |
| **GitHub** | {stars} |
| **License** | |
| **Paper** | (if exists) |

## Architecture Overview
{Mermaid diagram(s) — MANDATORY}

## How It Works — Step by Step
{Concrete scenario walkthrough}

## Real Code Examples
{Working SDK code with comments — Python at minimum}

## Benchmark Performance
{Numbers with source citations}

## Strengths
## Limitations
## Best For

## Links
```

**Non-negotiable requirements:**
- At least 2 Mermaid diagrams (architecture + data flow)
- At least 1 working code example with real SDK calls
- At least 1 step-by-step scenario walkthrough
- Honest limitations section (not just marketing copy)

---

## Phase 6: Anti-Inertia Checks

Run these checks AFTER completing your updates, BEFORE committing:

### Check 1: Did you just slot new info into old categories?

Re-read your landscape assessment from Phase 1. Did your updates reflect the shifts you identified? If you identified a landscape shift but your updates are all per-provider patches, you have an inertia problem. Go back and restructure.

### Check 2: Is the comparison table still accurate?

Read the comparison table in `README.md` and `src/introduction.md` end to end. Does each row still accurately describe that provider? Is the "Best For" column still correct given what you learned?

### Check 3: Would a reader making a decision today get good advice from Chapter 6?

Walk through 3 scenarios from the decision tree. For each one, verify the recommended provider is still the best choice. If not, update the tree.

### Check 4: Are you missing anyone?

Count the providers in the book. Count the providers that appeared in your Phase 2 searches. If any provider with 2+ qualification criteria (Phase 3 rubric) is missing, add it.

### Check 5: Did you produce a cross-cutting insight?

If your `research/trends.md` entry for this cycle is empty or trivial, you haven't done the synthesis work. Go back to Phase 4.

---

## Phase 7: Commit & Changelog

### Changelog Entry Format

Append to `research/changelog.md`:

```markdown
## [DATE] — Update Cycle

### Assessment
- Landscape shift detected: [yes/no]
- Update type: [patch / structural / major]

### Changes Made
- [File]: [What changed and why]

### Considered but Rejected
- [Provider/technique]: [Why it didn't meet the threshold]

### Flagged for Next Cycle
- [Things to watch that aren't ready yet]

### Sources Consulted
- [List of URLs, papers, repos checked]
```

### Commit Convention

```
Update: [YYYY-MM-DD] — [patch|structural|major]

- [Summary of changes]
- [New providers added, if any]
- [Benchmark updates, if any]
```

---

## Anti-Pattern Checklist

Before finalizing, confirm you did NOT do any of these:

- [ ] **Added a provider just because it's new.** (Did it meet 2+ criteria from the rubric?)
- [ ] **Updated code examples without testing them.** (Are the SDK calls real and current?)
- [ ] **Removed old benchmark numbers.** (Keep old numbers — show progression, don't replace.)
- [ ] **Rewrote a chapter that was still accurate.** (Don't touch what isn't stale.)
- [ ] **Used marketing copy as fact.** (Did you verify claims against papers, benchmarks, or source code?)
- [ ] **Skipped the landscape assessment.** (Phase 1 is mandatory. No exceptions.)
- [ ] **Produced zero cross-cutting insights.** (Phase 4 is mandatory. No exceptions.)
- [ ] **Searched only for things you already knew about.** (Did you run ALL 18+ search queries from Phase 2?)

---

## File Structure Reference

```
AgentMemoryBook/
├── src/                          # Book content (mdbook)
│   ├── SUMMARY.md                # Table of contents
│   ├── introduction.md           # Landing page
│   ├── 01_foundations.md          # Chapter 1
│   ├── 02_techniques.md          # Chapter 2 — techniques to update/extend
│   ├── 03_providers.md           # Chapter 3 — provider index to update
│   ├── 04_consumer_memory.md     # Chapter 4
│   ├── 05_benchmarks.md          # Chapter 5 — leaderboards to update
│   ├── 06_decision_guide.md      # Chapter 6 — decision tree to validate
│   ├── 07_future.md              # Chapter 7
│   └── providers/                # One file per provider
│       ├── mem0.md
│       ├── openviking.md
│       ├── hindsight.md
│       ├── byterover.md
│       ├── zep.md
│       ├── supermemory.md
│       ├── honcho.md
│       ├── letta.md
│       ├── cognee.md
│       ├── retaindb.md
│       ├── nuggets.md
│       └── claude_code.md
├── research/                     # Agent working files (not in book)
│   ├── trends.md                 # Cross-cycle pattern tracker
│   ├── changelog.md              # Update history
│   └── latest_assessment.md      # Most recent landscape assessment
├── README.md                     # GitHub landing page — keep comparison table current
├── book.toml                     # mdbook config
└── UPDATE_GUIDE.md               # This file
```
