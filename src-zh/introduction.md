# AgentMemoryBook

> 一本全面的指南，带你深入了解最前沿的智能体记忆系统——它们用了哪些技术、彼此有何不同，又各自适合什么场景。

**作者：[Atum](https://atum.li)**

---

## 这本书写给谁？

- **AI 工程师**：在构建需要跨会话记忆能力的智能体
- **产品构建者**：正在为 AI 应用挑选记忆层方案
- **研究人员**：关注智能体记忆架构的前沿动态
- **好奇的探索者**：想知道 AI 智能体究竟是怎么"记住"东西的

## 你会读到什么

全书共分三部分：

**第一部分 — 核心概念**，打好基础：什么是智能体记忆、记忆类型的分类体系、写入—管理—读取循环，以及驱动所有记忆系统运转的十大核心工程技术。

**第二部分 — 供应商深度解析**，逐一拆解各主流记忆系统。每个系统配有架构图、真实 SDK 代码示例、逐步操作流程和客观点评，共覆盖十二个系统：Mem0、OpenViking、Hindsight、ByteRover、Zep/Graphiti、Supermemory、Honcho、Letta (MemGPT)、Cognee、RetainDB、Nuggets，以及 Claude Code（基于泄露源码的分析）。

**第三部分 — 全景分析与决策**，放眼更宏观的视角：消费级 AI 的记忆之争（ChatGPT vs Claude vs Gemini）、基准测试与评估方法、帮你选对系统的实用决策指南，以及面向未来的开放性挑战。

## 快速对比

| 系统 | 架构 | 开源 | 最适用于 |
|------|------|------|----------|
| **Mem0** | 提取→更新流水线 + 向量/图 | 是（Apache 2.0） | 生产级聊天智能体 |
| **OpenViking** | 文件系统范式 + 分层上下文 | 是（Apache 2.0） | 统一上下文管理 |
| **Hindsight** | 四网络结构化记忆库 | 是（MIT） | 长时程推理智能体 |
| **ByteRover** | 层次化上下文树 + 基于文件 | 部分开源（CLI） | 编程智能体 |
| **Zep/Graphiti** | 时序知识图谱 | Graphiti：是 | 企业级时序推理 |
| **Supermemory** | 记忆图 + RAG + 连接器 | 核心：是 | 一站式平台 |
| **Honcho** | 辩证推理 + 用户建模 | 是 | 深度个性化 |
| **Letta (MemGPT)** | 记忆即操作系统（RAM/磁盘分层） | 是 | 有状态自主智能体 |
| **Cognee** | 知识图谱 + 向量混合 | 是（Apache 2.0） | 组织级知识管理 |
| **RetainDB** | 7 种记忆类型 + 增量压缩 | 否（SaaS） | 快速集成 |
| **Nuggets** | HRR 叠加向量 | 是 | 轻量级本地记忆 |
| **Claude Code** | Markdown 文件 + Sonnet 侧调用 | 源码泄露 | 使用 Claude 开发 |

## 参考文献

以下是本书各章节引用的重要学术综述：

- [Memory for Autonomous LLM Agents](https://arxiv.org/abs/2603.07670)（Du 等，2026 年 3 月）
- [Memory in the Age of AI Agents](https://arxiv.org/abs/2512.13564)（Zhang 等，2025 年 12 月）
- [Graph-based Agent Memory](https://arxiv.org/abs/2602.05665)（2026 年 2 月）
- [Memory Operations Survey](https://arxiv.org/abs/2505.00675)（Du 等，2025 年 5 月）
- [LongMemEval Benchmark](https://arxiv.org/abs/2410.10813)（Wu 等，ICLR 2025）

## 许可协议

本书以 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 协议发布，欢迎自由分享与改编，但请注明出处。
