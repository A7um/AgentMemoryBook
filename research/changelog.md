# AgentMemoryBook — Update Changelog

---

## 2026-05-31 — May 2026 Update

### What triggered this update
- Scheduled update cycle (6 weeks since initial release)
- Major platform developments: Anthropic Dreaming (May 6), Google Memory Bank (May 19)
- Mem0 v3 architecture overhaul shipped
- New LongMemEval scores and V2 benchmark launch
- File-based memory (.MD paradigm) reached critical mass as dominant pattern
- User request to evaluate obra/superpowers and similar projects

### Platform scan results
- Scanned: Claude Code, Cursor, Codex, Windsurf, Copilot, Gemini CLI, OpenCode, OpenClaw, Hermes, Pi
- New memory integrations: Anthropic Dreaming, Google Memory Bank, TencentDB Agent Memory, agentmemory (rohitg00)
- Removed: Mem0 graph (Neo4j) variant discontinued in v3 OSS

### Changes made
- `src/02_techniques.md` + `src-zh/02_techniques.md`: Added Technique 11 (File-Based Memory / .MD Paradigm) covering AGENTS.md, CLAUDE.md, MEMORY.md, SKILL.md, obra/superpowers, agentmemory. Updated summary matrix.
- `src/04_consumer_memory.md` + `src-zh/04_consumer_memory.md`: Added Anthropic Dreaming section (May 6 ship, async consolidation, Harvey 6x result). Added Google Memory Bank section (I/O 2026, ADK 2.0, identity-scoped persistence). Updated comparison table.
- `src/05_benchmarks.md` + `src-zh/05_benchmarks.md`: Updated LongMemEval leaderboard to May 2026 (Exabase M-1 96.4%, Mem0 94.8%, Honcho 92.6%). Added LongMemEval-V2 section (451 questions, multimodal trajectories, LAFS scoring). Added insight about leaderboard compression.
- `src/07_future.md` + `src-zh/07_future.md`: Updated Open Challenge 1 (Continual Consolidation) with Anthropic Dreaming as first production implementation.
- `src/providers/mem0.md` + `src-zh/providers/mem0.md`: Updated stars (57K), added v3 architecture section (graph removed, entity linking, single-pass extraction, 94.8% LongMemEval), updated limitations and pricing.
- `src/03_providers.md` + `src-zh/03_providers.md`: Added agentmemory and TencentDB Agent Memory to provider index.
- `README.md` + `README.zh.md`: Updated Mem0 row in comparison table.
- All `chapters-zh/` mirrors synced with updated Chinese content.
- `research/trends.md`: Full platform landscape update for May 2026.

### Considered but rejected
- **obra/superpowers** — Not a memory provider; it's a skills/methodology framework built on top of the .MD paradigm. Covered in Chapter 2's Technique 11 section rather than as a separate provider. At 213K stars it's hugely popular, but its relationship to memory is indirect (it defines how agents use SKILL.md files, not how memory is stored/retrieved).
- **agentmemory (rohitg00)** — Mentioned in Chapter 2 and Chapter 3 index, but doesn't warrant a full provider deep-dive chapter yet. It's more of a memory infrastructure layer than a memory architecture. Worth monitoring for a future deep-dive if adoption continues.
- **TencentDB Agent Memory** — Added to Chapter 3 index. A full deep-dive could be added in a future cycle once it matures past v1.0-beta and more benchmark data is available.
- **ambient-context-kit** — Interesting Claude Code plugin for personal knowledge management, but too niche for inclusion. Covers a different use case (personal productivity) than the book's focus (agent memory architectures).
- **Andrej Karpathy's LLM Wiki pattern** — Mentioned conceptually in Technique 11 but not as a separate system, as it's a design pattern/gist rather than a shipping product.

---

## 2026-04-19 — Initial Release

### What triggered this update
- Initial book creation

### Platform scan results
- Surveyed integrations for OpenClaw, Hermes, Claude Code, Cursor, LangChain
- Identified 12 providers with meaningful platform support or community discussion

### Changes made
- Created full book: 7 chapters + 12 provider deep dives
- Set up mdbook + GitHub Pages

### Considered but rejected
- Several small GitHub repos (<200 stars, no platform integrations, no community discussion)
