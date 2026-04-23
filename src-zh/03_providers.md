# 第三章：服务商深度解析

每家服务商都配有独立的深度解析，涵盖架构图、可运行的代码示例、端到端的演练流程，以及深入的技术剖析。

## 面向开发者的记忆框架

| # | 服务商 | 架构 | 深度解析 |
|---|--------|------|----------|
| 1 | **Mem0** | 两阶段提取 → 更新流水线 + 可选图谱 | [阅读 →](providers/mem0.md) |
| 2 | **OpenViking** | 文件系统范式 + 分层上下文（L0/L1/L2） | [阅读 →](providers/openviking.md) |
| 3 | **Hindsight** | 四网络结构化记忆（World/Experience/Observation/Opinion） | [阅读 →](providers/hindsight.md) |
| 4 | **ByteRover** | 层级上下文树 + 五级渐进式检索 | [阅读 →](providers/byterover.md) |
| 5 | **Zep / Graphiti** | 带双时态边的时序知识图谱 | [阅读 →](providers/zep.md) |
| 6 | **Supermemory** | 一体化方案：Memory Graph + RAG + Profiles + Connectors | [阅读 →](providers/supermemory.md) |
| 7 | **Honcho** | 辩证推理 + 深度用户身份建模 | [阅读 →](providers/honcho.md) |
| 8 | **Letta (MemGPT)** | 记忆即操作系统：Core（RAM）/ Recall（缓存）/ Archival（磁盘） | [阅读 →](providers/letta.md) |
| 9 | **Cognee** | ECL 流水线：Extract → Cognify → Load + 知识图谱 | [阅读 →](providers/cognee.md) |
| 10 | **RetainDB** | 7 种记忆类型 + 增量压缩，托管 SaaS | [阅读 →](providers/retaindb.md) |
| 11 | **Nuggets** | 全息缩减表示（HRR），零依赖 | [阅读 →](providers/nuggets.md) |

## 每篇深度解析涵盖哪些内容

所有服务商的章节都采用统一的行文结构：

- **架构图** — Mermaid 图呈现系统设计、数据流向与核心组件
- **真实代码示例** — 可直接运行的 SDK 代码（Python、TypeScript、CLI），行内注释清晰明了
- **逐步演练** — 从数据写入到检索返回，完整追踪一个场景在系统中的流转路径
- **冲突解决** — 遇到矛盾信息时，系统如何裁决和更新
- **基准测试表现** — 在 LongMemEval、LoCoMo 等评测中的实际数据
- **优势与局限** — 对各项取舍的客观剖析
- **最佳适用场景** — 该服务商最能发挥所长的典型用例
- **相关链接** — 文档、GitHub、论文及定价信息

## 按使用场景快速导航

**"我想要最简单的集成"** → [RetainDB](providers/retaindb.md)（3 行代码搞定）或 [Mem0](providers/mem0.md)

**"我想要最高准确率"** → [Hindsight](providers/hindsight.md)（LongMemEval 91.4%）或 [ByteRover](providers/byterover.md)（LoCoMo 92.2%）

**"我需要时序推理能力"** → [Zep/Graphiti](providers/zep.md)（双时态知识图谱）

**"我想要一站式平台"** → [Supermemory](providers/supermemory.md)（记忆 + RAG + 连接器一应俱全）

**"我想做深度用户个性化"** → [Honcho](providers/honcho.md)（辩证推理驱动）

**"我想要完整的智能体框架"** → [Letta](providers/letta.md)（记忆即操作系统 + 智能体运行时）

**"我需要构建领域知识图谱"** → [Cognee](providers/cognee.md)（ECL 流水线 + 本体支持）

**"我需要统一管理上下文"** → [OpenViking](providers/openviking.md)（文件系统范式）

**"我想要本地优先的编码智能体记忆"** → [ByteRover](providers/byterover.md)（基于文件的上下文树）

**"我想要零依赖、极速召回"** → [Nuggets](providers/nuggets.md)（全息记忆，亚毫秒级响应）

---

**下一章：[第四章 — 消费级 AI 记忆竞赛](04_consumer_memory.md)**
