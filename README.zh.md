# AgentMemoryBook

**作者：[Atum](https://atum.li)**

> **[在线阅读本书 →](https://a7um.github.io/AgentMemoryBook/zh/)**
>
> [Read in English / 阅读英文版 →](README.md)

一本全面理解前沿（SOTA）智能体记忆系统的指南——它们使用了哪些技术、有何不同、各自适用于什么场景。

## 适合谁读？

- **AI 工程师**——构建需要跨会话记忆的智能体
- **产品构建者**——为 AI 应用选择记忆层
- **研究人员**——研究智能体记忆架构的演进格局
- **好奇心驱动者**——想要理解 AI 智能体如何"记住"

## 如何阅读本书

### 第一部分 — 核心概念

1. **[基础篇](chapters-zh/01_foundations.md)** — 什么是智能体记忆、为什么重要、核心分类法
2. **[技术篇](chapters-zh/02_techniques.md)** — 工程构建模块：检索、图、压缩、反思等

### 第二部分 — 服务商深度解析（含架构图与实际代码）

3. **[服务商索引](chapters-zh/03_providers.md)** — 概览与快速导航
   - [Mem0](chapters-zh/providers/mem0.md) — 两阶段提取/更新管线 + 图记忆
   - [OpenViking](chapters-zh/providers/openviking.md) — 文件系统范式 + 分层上下文加载
   - [Hindsight](chapters-zh/providers/hindsight.md) — 四网络结构化记忆（保留/回忆/反思）
   - [ByteRover](chapters-zh/providers/byterover.md) — 层级上下文树 + 五级检索
   - [Zep / Graphiti](chapters-zh/providers/zep.md) — 双时序边的时序知识图谱
   - [Supermemory](chapters-zh/providers/supermemory.md) — 一体化记忆 + RAG + 连接器平台
   - [Honcho](chapters-zh/providers/honcho.md) — 辩证推理 + 深度用户身份建模
   - [Letta (MemGPT)](chapters-zh/providers/letta.md) — 记忆即操作系统，自编辑智能体
   - [Cognee](chapters-zh/providers/cognee.md) — 知识图谱 + 向量混合，ECL 管线
   - [RetainDB](chapters-zh/providers/retaindb.md) — 7 种记忆类型 + 增量压缩（托管 SaaS）
   - [Nuggets](chapters-zh/providers/nuggets.md) — 全息缩减表示（零依赖）
   - [Claude Code](chapters-zh/providers/claude_code.md) — 泄露源码揭示 200 行索引、Sonnet 侧调用、KAIROS 守护进程

### 第三部分 — 全景分析与决策

4. **[消费级 AI 记忆竞赛](chapters-zh/04_consumer_memory.md)** — OpenAI、Anthropic 和 Google 的记忆方案
5. **[基准测试与评估](chapters-zh/05_benchmarks.md)** — LongMemEval、LoCoMo 排行榜与分析
6. **[决策指南](chapters-zh/06_decision_guide.md)** — 为你的使用场景选择合适的记忆系统
7. **[未来展望](chapters-zh/07_future.md)** — 开放挑战与前沿方向

## 快速对比表

| 系统 | 架构 | 开源 | 最佳适用 | LongMemEval | LoCoMo |
|------|------|------|----------|-------------|--------|
| **Mem0** | 提取 → 更新管线 + 向量/图 | 是 (Apache 2.0) | 生产级聊天智能体 | — | 66.9% |
| **OpenViking** | 文件系统范式 + 分层上下文 | 是 (Apache 2.0) | 统一上下文管理 | — | — |
| **Hindsight** | 四网络结构化记忆库 | 是 (MIT) | 长时域推理智能体 | 91.4% | 89.6% |
| **ByteRover** | 层级上下文树 + 基于文件 | 部分 (CLI) | 编程智能体 | — | 92.2% |
| **Zep/Graphiti** | 时序知识图谱 | Graphiti：是 | 企业级时序推理 | — | 75.1% |
| **Supermemory** | 记忆图 + RAG + 连接器 | 核心：是 | 一体化平台 | 85.2% | #1 |
| **Honcho** | 辩证推理 + 用户建模 | 是 | 深度个性化 | — | — |
| **Letta (MemGPT)** | 记忆即操作系统（RAM/磁盘分层） | 是 | 有状态自主智能体 | — | — |
| **Cognee** | 知识图谱 + 向量混合 | 是 (Apache 2.0) | 机构知识 | — | — |
| **RetainDB** | 7 种记忆类型 + 增量压缩 | 否 (SaaS) | 快速集成，生产环境 | SOTA | — |
| **Nuggets（全息）** | HRR 叠加向量 | 是 | 轻量级本地记忆 | — | — |
| **Claude Code** | Markdown 文件 + Sonnet 侧调用 | 源码泄露 | 使用 Claude 的个人/团队开发 | — | — |

## 智能体更新指南

本书旨在由 AI 智能体持续更新。请参阅 **[更新指南](UPDATE_GUIDE.md)** 了解如何：

- 发现当前哪些智能体平台处于顶级（不要假设——要研究）
- 扫描每个平台的记忆服务商集成
- 检查开发者正在讨论什么
- 决定什么内容有资格纳入
- 在不陷入惰性或覆盖盲区的情况下更新本书

## 贡献

发现错误或想添加服务商？请开 issue 或提交 pull request。

## 参考文献

本书引用的关键学术综述：

- [Memory for Autonomous LLM Agents](https://arxiv.org/abs/2603.07670) (Du et al., 2026 年 3 月)
- [Memory in the Age of AI Agents](https://arxiv.org/abs/2512.13564) (Zhang et al., 2025 年 12 月)
- [Graph-based Agent Memory](https://arxiv.org/abs/2602.05665) (2026 年 2 月)
- [Memory Operations Survey](https://arxiv.org/abs/2505.00675) (Du et al., 2025 年 5 月)
- [LongMemEval Benchmark](https://arxiv.org/abs/2410.10813) (Wu et al., ICLR 2025)

## 许可证

本书以 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 许可证发布。你可以自由分享和改编，但需注明出处。
