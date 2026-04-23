# 第三章：服务商深度解析

每个服务商都有独立的深度解析章节，包含架构图、真实代码示例、逐步演练和详细分析。

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

## 每篇深度解析包含的内容

每个服务商的章节都遵循一致的结构：

- **架构图** — 使用 Mermaid 图展示系统设计、数据流和关键组件
- **真实代码示例** — 可运行的 SDK 代码（Python、TypeScript、CLI），附有行内注释
- **逐步演练** — 从数据摄入到检索，追踪一个具体场景在系统中的完整流程
- **冲突解决** — 系统如何处理矛盾信息和更新
- **基准测试表现** — 在 LongMemEval、LoCoMo 及其他评估中的数据
- **优势与局限** — 对取舍的客观评估
- **最佳适用场景** — 该服务商擅长的使用场景
- **相关链接** — 文档、GitHub、论文和定价

## 按使用场景快速导航

**"我想要最简单的集成"** → [RetainDB](providers/retaindb.md)（3 行代码）或 [Mem0](providers/mem0.md)

**"我想要最高准确率"** → [Hindsight](providers/hindsight.md)（LongMemEval 91.4%）或 [ByteRover](providers/byterover.md)（LoCoMo 92.2%）

**"我需要时序推理"** → [Zep/Graphiti](providers/zep.md)（双时态知识图谱）

**"我想要一体化平台"** → [Supermemory](providers/supermemory.md)（记忆 + RAG + 连接器）

**"我想要深度用户个性化"** → [Honcho](providers/honcho.md)（辩证推理）

**"我想要完整的智能体框架"** → [Letta](providers/letta.md)（记忆即操作系统 + 智能体运行时）

**"我需要领域知识图谱"** → [Cognee](providers/cognee.md)（ECL 流水线 + 本体支持）

**"我需要统一的上下文管理"** → [OpenViking](providers/openviking.md)（文件系统范式）

**"我想要本地优先的编码智能体记忆"** → [ByteRover](providers/byterover.md)（基于文件的上下文树）

**"我想要零依赖的快速召回"** → [Nuggets](providers/nuggets.md)（全息记忆，亚毫秒级）

---

**下一章：[第四章 — 消费级 AI 记忆竞赛](04_consumer_memory.md)**
