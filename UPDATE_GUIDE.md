# AgentMemoryBook — Update Guide for AI Agents

> This is a product-practice-focused book. We care about what real agents and platforms actually use, not academic novelty. The bar for inclusion is simple: **if top-tier agent platforms support it, or developers are actively talking about it, it belongs here.**

---

## The Bar: What Qualifies for This Book

A memory system qualifies if it meets **any one** of:

1. **Supported by a top-tier agent/coding platform** — Has a plugin, integration, or first-class support in a platform that developers are actively using right now. You must research what these platforms are (see below) — do NOT rely on a static list.
2. **Actively discussed by practitioners** — Shows up in Twitter/X threads, Reddit, Hacker News, or developer Discord/Slack communities with real usage reports (not just launch announcements)
3. **Used in production by a known company** — Mentioned in a "how we built" post or case study

That's it. No star counts. No arxiv papers. If nobody's using it or talking about it, it doesn't matter how clever the architecture is.

---

## Step 1: Discover What's Top-Tier Right Now

> **The list of top-tier platforms changes over time. You MUST research what they are — never rely on a hardcoded list.**

### How to Find the Current Top-Tier Platforms

Every update cycle, start by identifying what agent platforms and coding tools developers are actually using *right now*. Search for:

| Search | What It Reveals |
|--------|----------------|
| `"best AI coding agent" [CURRENT_YEAR]` | Which coding agents are currently leading |
| `"best AI agent framework" [CURRENT_YEAR]` | Which agent frameworks developers are choosing |
| `"AI coding assistant" comparison [CURRENT_YEAR]` | Which IDE tools are in the conversation |
| Twitter/X: `AI agent OR coding agent min_faves:100` last 30 days | What practitioners are actively using and recommending |
| Reddit: `r/LocalLLaMA` + `r/ChatGPTCoding` — sort by top, last month | What tools the community is rallying around |
| `"switched to" OR "migrated to" AI agent [CURRENT_YEAR]` | Which platforms are gaining users from others |
| Hacker News: `hn.algolia.com` — search `AI agent` last 30 days, sort by points | What's getting developer attention |

From this research, compile a list of **the platforms that matter today**. These fall into three categories:

**Category A — Agent/Coding Platforms** (the tools developers use daily)
- Examples as of early 2026: Claude Code, Cursor, Windsurf, Codex, OpenClaw, etc.
- These change. A platform that dominates today may be irrelevant in 6 months. Research, don't assume.

**Category B — Agent Frameworks** (what developers build agents with)
- Examples as of early 2026: LangChain/LangGraph, CrewAI, Mastra, AutoGen, etc.
- Same rule: research what developers are actually importing, not what was popular last quarter.

**Category C — AI Assistants with Built-in Memory** (consumer/prosumer products)
- Examples as of early 2026: ChatGPT, Claude, Gemini, etc.
- Track their memory features for Chapter 4.

### How to Find What Memory Providers Each Platform Supports

Once you have your platform list, for EACH platform:

1. **Check their docs** — Look for "memory", "context", "plugins", "integrations", "MCP servers", "extensions" sections
2. **Check their plugin/extension marketplace** — If they have one, search for "memory"
3. **Check their GitHub org** — Look for repos with "memory" in the name or integration examples
4. **Search** `"{platform name}" memory provider OR memory plugin [CURRENT_YEAR]` — Catches announcements and blog posts

### What to Look For

For each platform, answer:
- What memory providers does it officially support or integrate with?
- Which integrations were added recently?
- Are any providers we cover no longer listed? (deprecation signal)
- Is there a new provider listed that's NOT in our book?

**If a memory provider appears as an integration in 2+ current top-tier platforms and is NOT in the book, that's a gap. Investigate and add it.**

### Update the Platform Tracker

After each scan, update `research/trends.md` with the current platform landscape:

```markdown
### Platform landscape as of [DATE]

**Top-tier platforms identified this cycle:**
- [List what you found, with brief evidence of why each is top-tier]

**Memory integrations by platform:**
- [Platform A]: supports [mem provider 1, mem provider 2, ...]
- [Platform B]: supports [...]
- ...

**Changes since last cycle:**
- [New platforms that entered top-tier]
- [Platforms that dropped off]
- [New memory integrations added]
- [Memory integrations removed]
```

---

## Step 2: The Conversation Scan

Search for what developers are actually talking about. The specific communities and platforms where these conversations happen will shift — use the searches below to find where the conversation *currently* is, not where it was last cycle.

| What to Search | Why |
|---------------|-----|
| `"agent memory" site:twitter.com OR site:x.com` last 30 days | Practitioner recommendations |
| `"agent memory" site:reddit.com` last 30 days | Real usage reports and comparisons |
| `"agent memory" site:news.ycombinator.com` last 30 days | What developers upvote = what they care about |
| `"agent memory" site:dev.to OR site:medium.com` last 30 days | Practitioner blog posts with real experience |
| `"I switched from" AND "memory" AND "agent"` | Migration stories reveal what's gaining/losing |
| For each top-tier platform from Step 1: check their Discord/Slack/forum for "memory" discussions | What users of those platforms actually need |

**You're not looking for launch announcements.** You're looking for:
- "I switched from X to Y because..." (migration stories)
- "Been using X for 3 months, here's what I think..." (real usage)
- "X doesn't work for my use case because..." (limitations we should document)
- "Has anyone tried X for Y?" (signals demand for a use case we might not cover)

---

## When to Run

| Trigger | What to Do |
|---------|-----------|
| **Every 2-4 weeks** | Run Step 1 (platform discovery + scan) and Step 2 (conversation scan) |
| **A top platform adds a new memory provider** | Investigate the new provider immediately |
| **A provider we cover gets dropped from a platform** | Flag as potential deprecation, update if confirmed |
| **A new agent platform breaks out** | It will show up in Step 1 naturally — that's why you re-discover the platform list every cycle instead of using a static one |

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
