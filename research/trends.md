# AgentMemoryBook — Trends Tracker

> Track platform landscape shifts and patterns that emerge across providers. When a pattern shows up in 3+ providers, it's worth a section in Chapter 2.

---

## 2026-05-31 — May 2026 Update

### Platform landscape as of 2026-05-31

**Top-tier platforms identified this cycle:**
- **Claude Code** (Anthropic) — dominant terminal-first coding agent, Claude Opus 4.7, 1M context
- **Cursor** — most popular AI IDE, multi-agent cloud agents
- **OpenAI Codex** — major player now with GPT-5.5, async cloud sandboxes
- **Windsurf** — growing AI IDE, Gartner Leader designation
- **GitHub Copilot** — widest IDE support, new coding agent mode
- **Gemini CLI** — free tier with 1M token context, new Memory Bank
- **OpenCode** — open-source, 75+ LLM providers, fully offline
- **OpenClaw** (Volcengine/ByteDance) — leading open-source agent framework
- **Hermes** (Nous Research) — popular in open-source community
- **LangChain/LangGraph** — most used agent framework by import count
- **CrewAI** — popular multi-agent framework
- **Mastra** — rising JS agent framework
- **Pi** — minimalist Unix-style coding agent

**Memory integrations by platform:**
- **Claude Code**: Built-in CLAUDE.md + MEMORY.md + auto-memory, Dreaming (Managed Agents), obra/superpowers (skills), Mem0 plugin, Supermemory plugin, agentmemory plugin + MCP
- **Cursor**: agentmemory (MCP), ByteRover (MCP), OpenViking (MCP), Supermemory (MCP), RetainDB (MCP), .cursor/rules/
- **Codex**: AGENTS.md (native), agentmemory (MCP)
- **Windsurf**: agentmemory (MCP), .windsurf/rules/
- **Copilot**: copilot-instructions.md, AGENTS.md, Copilot Memory
- **Gemini CLI**: Memory Bank (via ADK 2.0), agentmemory (MCP)
- **OpenClaw**: TencentDB Agent Memory plugin, Honcho, OpenViking, Supermemory, ByteRover (via MCP)
- **Hermes**: TencentDB Agent Memory (Docker), Honcho, built-in MEMORY.md, agentmemory (MCP)
- **LangChain/LangGraph**: Mem0, Zep/Graphiti, Cognee, Letta

**Changes since last cycle (2026-04-19):**
- New platforms that entered top-tier: Codex (matured significantly), Gemini CLI (free tier), OpenCode, Pi
- Platforms that dropped off: None dropped, but relative rankings shifted (Codex now co-equal with Claude Code)
- New memory integrations added: Anthropic Dreaming, Google Memory Bank, TencentDB Agent Memory, agentmemory (rohitg00)
- Memory integrations removed: Mem0 graph (Neo4j) variant discontinued in v3 OSS

### Patterns confirmed this cycle

- **File-based memory (.MD paradigm)** — NOW DOMINANT. AGENTS.md (60K+ repos, Linux Foundation), CLAUDE.md, MEMORY.md, SKILL.md, .cursor/rules/, copilot-instructions.md. Every major coding platform supports some variant. Added as Technique 11 in Chapter 2.
- **Sleep-time consolidation** — SHIPPED. Anthropic's Dreaming is the first production implementation. Moves from "monitoring" to "confirmed pattern."
- **Cross-agent portable memory** — EMERGING. agentmemory (rohitg00) serves one memory store to Claude Code, Cursor, Codex, Windsurf, and 30+ agents simultaneously via MCP. Demonstrates the viability of vendor-neutral memory.
- **Memory-as-platform-primitive** — NEW PATTERN. Both Anthropic (Managed Agents + Dreaming) and Google (Memory Bank via ADK) now ship memory as a platform feature, not a third-party add-on. Memory is moving from "solved in framework" to "provided by platform."

### What developers are talking about

- **obra/superpowers** (213K stars) is the biggest phenomenon — an entire development methodology built on SKILL.md files that auto-trigger based on context. Not a memory system per se, but sits atop the .MD paradigm and defines how agents use their memory.
- **agentmemory** gaining rapid adoption as the answer to "my CLAUDE.md is 500 lines and Claude ignores half of it" — replaces static files with searchable, cross-agent MCP memory.
- **Dreaming** generating significant practitioner excitement. Harvey's 6x improvement is the most-cited stat. Developers asking when it'll be available outside Managed Agents.
- **AGENTS.md vs CLAUDE.md** — ongoing debate about which should be canonical. Consensus emerging: AGENTS.md for cross-tool, CLAUDE.md imports it and adds Claude-specific deltas.
- **LongMemEval V1 scores plateauing** — top systems clustered at 93-96%. LongMemEval-V2 launched to raise the bar.
- **Mem0's v3 simplification** — developers pleasantly surprised that graph memory removal actually improved scores (66.9% → 94.8%). Entity linking "just works" without Neo4j.
- **TencentDB Agent Memory** — getting attention in Chinese developer communities; zero-dependency local-first approach resonates.

---

## 2026-04-19 — Initial Release

### Platform landscape as of 2026-04-19

**Top-tier platforms identified this cycle:**
- **Claude Code** (Anthropic) — dominant coding agent, huge user base
- **Cursor** — most popular AI IDE
- **OpenClaw** (Volcengine/ByteDance) — leading open-source agent framework
- **Hermes** (Nous Research) — popular in open-source community
- **Codex** (OpenAI) — OpenAI's coding agent
- **Windsurf** — growing AI IDE
- **LangChain/LangGraph** — most used agent framework by import count
- **CrewAI** — popular multi-agent framework
- **Mastra** — rising JS agent framework

**Memory integrations by platform:**
- **OpenClaw**: Honcho, OpenViking, Supermemory, ByteRover (via MCP)
- **Hermes**: Honcho, built-in MEMORY.md
- **Claude Code**: Built-in memory.md + CLAUDE.md, Mem0 plugin, Supermemory plugin, OpenViking plugin
- **Cursor**: ByteRover (MCP), OpenViking (MCP), Supermemory (MCP), RetainDB (MCP)
- **LangChain/LangGraph**: Mem0, Zep/Graphiti, Cognee, Letta

### Patterns emerging
- **Memory-as-filesystem** (OpenViking, ByteRover, Claude Code) — 3 providers, worth watching
- **Tiered context loading** (OpenViking, Supermemory) — 2 providers, monitoring
- **Sleep-time consolidation** (Claude Code/autoDream, Letta) — 2 providers, monitoring

### What developers are talking about
- The 200-line cap in Claude Code is a major pain point — driving adoption of Mem0/Supermemory plugins
- ByteRover's local-first approach resonates with privacy-conscious developers
- Hindsight's benchmark numbers get cited frequently as "what to beat"
