# AgentMemoryBook — Trends Tracker

> Track platform landscape shifts and patterns that emerge across providers. When a pattern shows up in 3+ providers, it's worth a section in Chapter 2.

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
