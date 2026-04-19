# AgentMemoryBook — Update Guide for AI Agents

> This is a product-practice-focused book. We care about what real agents and platforms actually use, not academic novelty. The bar for inclusion is simple: **if top-tier agent platforms support it, or developers are actively talking about it, it belongs here.**

---

## The Bar: What Qualifies for This Book

A memory system qualifies if it meets **any one** of:

1. **Supported by a top-tier agent platform** — OpenClaw, Hermes, Claude Code, Codex, Cursor, Windsurf, or similar have a plugin/integration for it
2. **Actively discussed by practitioners** — Shows up in Twitter/X threads, Reddit r/LocalLLaMA or r/MachineLearning, Hacker News front page, or developer Discord communities with real usage reports (not just launch announcements)
3. **Used in production by a known company** — Mentioned in a "how we built" post or case study

That's it. No star counts. No arxiv papers. If nobody's using it or talking about it, it doesn't matter how clever the architecture is.

---

## How to Check: The Platform Scan

This is the primary discovery method. Check what memory providers are supported by the platforms that matter.

### Platforms to Check

| Platform | Where to Check | Why It Matters |
|----------|---------------|----------------|
| **OpenClaw** | `docs.openclaw.ai` → Memory section, plugin marketplace | Most popular open-source agent framework |
| **Hermes Agent** | `hermes-agent.nousresearch.com/docs` → Memory Providers | Nous Research's agent, popular in open-source community |
| **Claude Code** | Plugin marketplace, MCP servers list | Anthropic's coding agent, huge user base |
| **Codex / ChatGPT** | OpenAI plugin ecosystem, memory API docs | OpenAI's agents |
| **Cursor** | MCP marketplace, context providers | Most popular AI IDE |
| **Windsurf** | Extensions, memory integrations | Growing AI IDE |
| **LangChain / LangGraph** | Integrations page, community packages | Most used agent framework |
| **CrewAI** | Integration docs | Popular multi-agent framework |
| **Mastra** | Plugin ecosystem | Rising JS agent framework |

### What to Look For

For each platform, answer:
- What memory providers does it officially support?
- Which ones were added in the last month?
- Are any providers we cover no longer listed? (possible deprecation signal)
- Is there a new provider listed that's NOT in our book?

**If a memory provider appears as an integration in 2+ of these platforms and is NOT in the book, that's a gap. Investigate and add it.**

---

## How to Check: The Conversation Scan

Search for what developers are actually talking about.

| Source | What to Search | What You're Looking For |
|--------|---------------|------------------------|
| **Twitter/X** | `"agent memory" min_faves:50` in the last 30 days | What practitioners are recommending to each other |
| **Reddit** | `r/LocalLLaMA` + `r/MachineLearning` + `r/ChatGPTCoding` for "memory" | Real usage reports, complaints, comparisons |
| **Hacker News** | `hn.algolia.com` search for "agent memory" last 30 days | What got upvoted = what developers care about |
| **Discord** | OpenClaw, Cursor, Claude Code community servers | What people are asking for help with |

**You're not looking for launch announcements.** You're looking for:
- "I switched from X to Y because..." (migration stories)
- "Been using X for 3 months, here's what I think..." (real usage)
- "X doesn't work for my use case because..." (limitations we should document)
- "Has anyone tried X for Y?" (signals demand for a use case we might not cover)

---

## When to Run

| Trigger | What to Do |
|---------|-----------|
| **Every 2-4 weeks** | Run both the Platform Scan and Conversation Scan |
| **A top platform adds a new memory provider** | Investigate the new provider immediately |
| **A provider we cover gets dropped from a platform** | Flag as potential deprecation, update if confirmed |
| **A new agent platform becomes popular** | Add it to the Platform Scan list |

---

## Before Updating: The Landscape Check

Before editing any files, answer these three questions:

1. **Has a new pattern emerged that multiple providers now share?** (e.g., "everyone now does tiered context loading" → needs a new section in Chapter 2, not just per-provider updates)
2. **Would the advice in Chapter 6 (Decision Guide) still be correct today?** Pick 2 scenarios, walk through the decision tree, check if the recommendation still holds.
3. **Is anything in the book now wrong?** (Not outdated — *wrong*. Provider changed architecture, got acquired, shut down, etc.)

If #1 is yes → update Chapter 2 before touching individual providers.
If #3 is yes → fix it first, that's highest priority.

---

## What to Update and Where

| What Happened | Files to Touch |
|--------------|---------------|
| **New provider qualifies** | Create `src/providers/{name}.md`, add to `src/SUMMARY.md`, `src/03_providers.md`, `src/introduction.md`, `README.md` |
| **Provider ships major new version** | Update `src/providers/{name}.md` — architecture, diagrams, code examples |
| **New benchmark scores** | `src/05_benchmarks.md` + affected provider chapter |
| **Platform drops a provider** | Note in provider chapter's Limitations section |
| **New pattern across 3+ providers** | Add to `src/02_techniques.md` |
| **Consumer AI memory update** | `src/04_consumer_memory.md` |
| **Decision guide is stale** | `src/06_decision_guide.md` |

### New Provider Chapter Template

Every new provider chapter MUST include:

- At least 2 Mermaid architecture diagrams
- Real working code example (from their actual SDK docs)
- One step-by-step scenario walkthrough
- Honest Strengths / Limitations / Best-For sections
- Which platforms integrate it

---

## What NOT to Do

- **Don't add a provider just because it launched.** Wait until a platform supports it or developers are using it.
- **Don't rewrite chapters that are still accurate.** Only change what's actually wrong or missing.
- **Don't remove old benchmark numbers.** Add new ones alongside old ones — show progression.
- **Don't trust marketing pages.** Verify against real usage reports and platform integration docs.
- **Don't make the book longer for the sake of it.** If a provider is minor, a mention in Chapter 3's index is enough. Not everything needs a full chapter.

---

## After Updating: Record What You Did

Append to `research/changelog.md`:

```markdown
## [DATE]

### What triggered this update
- [scheduled / new platform integration / conversation signal]

### Platform scan results
- [Which platforms checked, what new integrations found]

### Changes made
- [Files changed and why]

### Considered but rejected
- [Things found that didn't meet the bar, and why]
```

Append any new pattern observations to `research/trends.md`.

---

## File Structure

```
AgentMemoryBook/
├── src/                          # Book content (mdbook)
│   ├── SUMMARY.md                # Table of contents
│   ├── introduction.md
│   ├── 01_foundations.md
│   ├── 02_techniques.md          # Update when new patterns emerge
│   ├── 03_providers.md           # Provider index — update when adding/removing
│   ├── 04_consumer_memory.md
│   ├── 05_benchmarks.md          # Update with new scores
│   ├── 06_decision_guide.md      # Validate every cycle
│   ├── 07_future.md
│   └── providers/                # One file per provider
├── research/                     # Agent working files
│   ├── trends.md                 # Pattern tracker
│   └── changelog.md              # Update history
├── README.md
├── book.toml
└── UPDATE_GUIDE.md               # This file
```
