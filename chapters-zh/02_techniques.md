# 第二章：技术篇 — 智能体记忆的构建模块

每个记忆系统，无论其营销宣传多么华丽，都是由一系列成熟的工程技术组合而成。本章逐一介绍每种技术，解释其工作原理，并指出哪些生产系统在使用它。

## 技术 1：上下文内压缩

**是什么：** 将记忆保留在上下文窗口内部，但以压缩形式存储。

最简单的方法：不将记忆存储到外部，而是对过去的交互进行摘要，并将摘要注入到每个提示词中。这正是 ChatGPT 在大规模场景下的做法。

```
System prompt:
  "You are a helpful assistant."
  
User Memory (always injected):
  - User's name is Sarah
  - Prefers concise answers
  - Works in fintech, uses Python
  
Recent Chat Summaries:
  - Dec 8: "Building a load balancer in Go" — asked about connection pooling
  - Dec 7: "Fitness routine" — wanted recovery advice
  
Current conversation messages...
```

**压缩的工作方式：**
- **抽取式：** 逐字提取关键句子
- **生成式：** LLM 生成更短的摘要
- **增量压缩：** 仅传输自上一轮以来的变化部分（RetainDB 声称可节省 50–90% 的 token）

**优势：**
- 零基础设施——不需要向量数据库，不需要图数据库
- 低延迟——没有检索步骤
- 适用于任何模型

**劣势：**
- 摘要质量随历史记录增长而下降
- 无法处理跨越数千个会话的"大海捞针"式查询
- 有损——细节在摘要过程中会永久丢失

**使用者：** OpenAI ChatGPT Memory（4 层上下文注入）、Claude Chat Memory、RetainDB（增量压缩）

---

## 技术 2：检索增强记忆（向量存储）

**是什么：** 将记忆以嵌入向量的形式存储在向量数据库中，并在查询时检索最相似的 top-K 条记忆。

这是生产记忆系统中最常见的技术。它扩展了经典 RAG，使语料库变为*动态的*——新的记忆从对话中持续添加。

```
Write path:
  conversation → LLM extracts facts → embed facts → store in vector DB
  
Read path:
  user query → embed query → similarity search → top-K results → inject into prompt
```

**相似度搜索的工作原理：**
1. 每条记忆被转换为一个稠密向量（例如，OpenAI `text-embedding-3-small` 的 1536 维）
2. 查询时，使用相同的模型对查询进行嵌入
3. 向量数据库通过余弦相似度返回 K 个最近邻
4. 可选：交叉编码器重排序器对结果进行重新评分以提高精度

**混合搜索模式：**
大多数生产系统将向量搜索与关键词搜索（BM25）结合使用，因为：
- 向量搜索擅长语义相似度（"Alice 做什么工作？"匹配"Alice 在 Google 工作"）
- 关键词搜索擅长精确匹配（"Alice"匹配包含"Alice"的文档）
- 组合检索能捕获单独使用任一方式时会遗漏的结果

**优势：**
- 可扩展到数百万条记忆
- 良好的语义理解能力
- 成熟的基础设施（Pinecone、Qdrant、pgvector、ChromaDB）

**劣势：**
- 无法进行关系推理（"Alice 的同事都有谁？"需要多跳查询）
- 无法进行时间推理（"Alice *去年春天*做了什么？"）
- 嵌入质量是天花板——如果嵌入模型遗漏了细微差别，检索就会失败

**使用者：** Mem0（核心）、Supermemory（混合）、RetainDB，大多数系统将其作为基础层

---

## 技术 3：知识图谱

**是什么：** 将记忆以实体（节点）和关系（边）的形式存储在图结构中，支持多跳推理。

```
Entities (nodes):
  [Alice] [Google] [Paris] [Project X]

Relationships (edges):
  Alice --works_at--> Google
  Alice --lives_in--> Paris
  Alice --leads--> Project X
  Project X --deadline--> March 2026
```

这种结构支持向量搜索无法完成的查询："住在巴黎的那个人负责什么项目？"需要遍历 Alice → lives_in → Paris，然后 Alice → leads → Project X。

### 时序知识图谱

Zep/Graphiti 率先在图的边上添加了*时间元数据*：

```
Alice --lives_in--> New York   [valid_at: 2023-01, invalid_at: 2025-06]
Alice --lives_in--> London     [valid_at: 2025-06, invalid_at: null]
```

这种双时间模型支持：
- 时间点查询："Alice 2024 年住在哪里？"
- 变更追踪："Alice 什么时候搬家的？"
- 事实失效但不丢失数据

### 图构建流水线

```
Raw conversation
    │
    ▼
Entity Extraction (LLM)
    │ "Alice works at Google"
    ▼
Relationship Generation (LLM)
    │ (Alice, works_at, Google)
    ▼
Conflict Detection
    │ Does this contradict existing edges?
    ▼
Resolution (LLM or rules)
    │ Add new / invalidate old / merge
    ▼
Graph Update
```

**优势：**
- 多跳推理
- 时间推理（使用时序图谱）
- 显式、可审计的知识表示
- 支持社区检测以生成高层摘要

**劣势：**
- 构建成本高（需要 LLM 调用进行抽取）
- 图的质量严重依赖抽取 LLM 的能力
- 在大型图上检索可能较慢，除非精心设计索引
- 维护一致性较为复杂

**使用者：** Zep/Graphiti（时序知识图谱）、Mem0g（图变体）、Cognee（知识图谱 + 向量混合）、Hindsight（4 网络图）

---

## 技术 4：层级 / 树状记忆

**是什么：** 将记忆组织成树状结构，类似于人类对知识进行分类的方式。

ByteRover 通过其 Context Tree 率先采用了这种方法：

```
.brv/context-tree/
├── market_analysis/                    # Domain
│   ├── competitor_landscape/           # Topic
│   │   ├── ai_infrastructure/          # Subtopic
│   │   │   ├── nvidia_earnings.md      # Entry
│   │   │   └── cloud_pricing.md        # Entry
│   │   └── consumer_apps/
│   └── industry_trends/
├── project_alpha/
│   ├── architecture_decisions/
│   └── team_context/
└── user_preferences/
```

OpenViking 使用类似方法，基于其虚拟文件系统：

```
viking://user/memories/
├── profile.md
├── preferences/
├── entities/
└── events/

viking://agent/memories/
├── cases/
└── patterns/
```

### 分层上下文加载

OpenViking 和 Supermemory 都实现了多级摘要：

| 层级 | Token 大小 | 用途 |
|------|-----------|------|
| **L0（摘要）** | ~100 tokens | 超短摘要，用于快速相关性过滤 |
| **L1（概览）** | ~2K tokens | 中等详细度，用于主题理解 |
| **L2（完整）** | 完整内容 | 完整数据，仅在需要时加载 |

检索从 L0 开始，检查相关性，然后仅对相关分支深入到 L1/L2。据报道这可减少 83–96% 的 token 消耗。

**优势：**
- 人类可读且易于调试
- 自然的浏览式组织结构
- 不需要向量数据库基础设施（基于文件）
- 渐进式细节展示

**劣势：**
- 对跨越多个分支的交叉查询效果较差
- 需要良好的分类法设计（垃圾进，垃圾出）
- 手动或 LLM 驱动的组织有额外开销

**使用者：** ByteRover（Context Tree）、OpenViking（AGFS 文件系统）、Claude Code（CLAUDE.md 层级结构）

---

## 技术 5：结构化记忆网络

**是什么：** 将记忆划分为多个*认知上不同*的存储区，每个区有自己的语义和检索行为。

Hindsight 的 4 网络架构是典型范例：

| 网络 | 内容 | 来源 |
|------|------|------|
| **世界网络 (W)** | 关于环境的客观事实 | "Alice 在 Google 工作" |
| **经验网络 (B)** | 智能体自身的过去行为 | "我向 Bob 推荐了 Python" |
| **观察网络 (O)** | 综合性实体摘要 | "Alice 是一位频繁使用 Python 的用户，最近刚搬家" |
| **观点网络 (S)** | 智能体不断演变的信念 | "Alice 会从 TypeScript 中受益" |

关键洞察：事实和信念是*不同的东西*，应该分开存储。事实（"Alice 使用 Python"）是可验证的。信念（"Alice 会从 TypeScript 中受益"）是智能体的推断。将它们混在一起会导致幻觉。

### 保留 → 回忆 → 反思

Hindsight 的三个操作类似于人类认知：

1. **保留（Retain）：** 将对话解析为原子事实，标注时间戳和实体，存储到世界网络或经验网络
2. **回忆（Recall）：** 多策略检索（语义 + 关键词 + 图 + 时间）→ 交叉编码器重排序 → token 预算内的上下文
3. **反思（Reflect）：** 智能体对检索到的记忆进行推理，回答问题或更新观察和观点

**优势：**
- 认知清晰度——你知道智能体*为什么*相信某事
- 可追溯的推理——信念可链接回源事实
- 支持智能体身份 / 性格配置

**劣势：**
- 比扁平向量存储更复杂
- 观察和观点之间的界限可能很微妙
- 反思步骤需要精心的提示词工程

**使用者：** Hindsight（4 网络）、Letta/MemGPT（核心/回忆/归档三层）、Honcho（同伴模型 + 结论）

---

## 技术 6：LLM 驱动的记忆管理

**是什么：** 使用 LLM 本身——即执行任务推理的同一个模型——来管理、组织和维护记忆。

这是 ByteRover 的核心创新。不是智能体*调用*一个独立的记忆服务，而是智能体*本身就是*记忆管理者：

```
Agent receives new information
    │
    ▼
Agent runs in sandbox with file access
    │
    ▼
Agent reads existing Context Tree
    │
    ▼
Agent decides: create / update / merge / delete entries
    │
    ▼
Agent writes changes to markdown files
    │
    ▼
Changes are atomic, version-controlled (git-like)
```

Mem0 使用了一个更轻量的版本：LLM 通过将每条候选记忆与现有 top-K 记忆进行比较，决定执行 ADD / UPDATE / DELETE / NOOP。

**优势：**
- 智能体理解记忆的*含义*，而不仅仅是向量相似度
- 能处理细微的更新（"实际上，Alice 的头衔现在是副总裁，不是总监"）
- 可审计——变更在文件或日志中可见

**劣势：**
- 昂贵——每次记忆操作都需要一次 LLM 调用
- 缓慢——为每次交互增加延迟
- 质量完全取决于 LLM 的判断能力
- 存在级联错误风险（错误的管理 → 错误的检索 → 错误的管理）

**使用者：** ByteRover（主要方式）、Mem0（更新阶段）、Letta（自编辑工具）、Cognee（cognify 流水线）

---

## 技术 7：反思与自我提升

**是什么：** 智能体定期回顾自己的记忆，以得出更高层次的洞察、整合相关事实并更新信念。

这受到 Generative Agents（Park 等人，2023 年）中*反思*机制的启发，其中模拟角色会定期反思近期事件以形成更高层次的观察。

在实践中：

```
Periodic reflection trigger (e.g., after 5 sessions)
    │
    ▼
Retrieve all facts about entity X
    │
    ▼
LLM synthesizes: "Based on 12 interactions, Alice is a senior
    engineer who prefers concise communication, is learning Rust,
    and frequently works on distributed systems."
    │
    ▼
Store as Observation / Profile
    │
    ▼
Use observation as default context in future queries
```

Honcho 将此称为"辩证推理"——在每次对话后，它对交流进行推理，得出关于用户偏好、习惯和目标的"结论"。

**优势：**
- 产出高质量的摘要，捕捉跨多次交互的模式
- 减轻检索负担（一条观察替代数十条原始事实）
- 使智能体能够在有意义的层面上"学习"

**劣势：**
- 反思可能出错——智能体可能形成错误的信念
- 昂贵（在"休眠时间"需要 LLM 调用）
- 过时的反思如果不定期刷新会持续存在

**使用者：** Hindsight（reflect 操作）、Honcho（辩证推理）、Cognee（memify）、OpenViking（记忆提取）、Letta（休眠时计算）

---

## 技术 8：全息缩减表示（HRR）

**是什么：** 一种源自认知科学的数学技术，使用循环卷积将多个键值对存储在单个固定大小的复值向量中。

这是 Nuggets 使用的一种小众但引人入胜的方法：

```javascript
// Store
mem.remember('alice', 'lives_in', 'paris');
mem.remember('alice', 'works_at', 'acme');

// Recall — algebraic, sub-millisecond
const result = mem.recall('alice', 'lives_in');
// → 'paris' (in <1ms, zero API calls)
```

**工作原理：**
1. 每个键和值被编码为一个复值向量
2. 键和值通过循环卷积进行*绑定*
3. 多个绑定通过*叠加*（相加）存储在一个向量中
4. 回忆时，用查询键进行*解绑*并找到最近匹配

**优势：**
- 亚毫秒级检索，零外部依赖
- 无 API 调用，无向量数据库，无嵌入服务
- 数学上优雅的常数空间存储

**劣势：**
- 随着更多事实被叠加，精度会下降（实际限制约为每个主题 25 条）
- 只能处理结构化三元组，不能处理自由文本
- 无语义相似度——仅支持精确键匹配
- 是向量搜索的补充而非替代

**使用者：** Nuggets（全息记忆引擎）、hrr-memory（独立库）

---

## 技术 9：多策略检索

**是什么：** 并行运行多种检索策略，并通过重排序器合并结果，以最大化召回率和精确率。

Hindsight 的 TEMPR（Temporal Entity Memory Priming Retrieval，时序实体记忆启动检索）同时运行四种策略：

| 策略 | 最适场景 |
|------|----------|
| **语义（向量）** | 概念相似度、改写查询 |
| **关键词（BM25）** | 名称、技术术语、精确匹配 |
| **图遍历** | 相关实体、间接关联 |
| **时间** | 有时间范围的查询（"去年春天"） |

结果被合并后经过交叉编码器重排序器，对每条结果与原始查询的相关性进行评分。这会增加延迟（约 50–200ms），但显著提高精确率。

ByteRover 使用 5 层渐进式策略，仅在较简单层失败时才逐级升级：

```
Tier 1: Cache lookup          (~0ms)
Tier 2: Full-text search      (~10ms)
Tier 3: Semantic search        (~50ms)
Tier 4: Graph traversal        (~100ms)
Tier 5: Agentic reasoning      (~500ms+, involves LLM call)
```

大多数查询在第 1–3 层即可解决，保持平均延迟较低，同时为复杂查询保留兜底方案。

**使用者：** Hindsight（TEMPR）、ByteRover（5 层）、Zep（混合语义 + BM25 + 图）、Supermemory（混合向量 + 关键词 + 重排序）

---

## 技术 10：记忆自编辑

**是什么：** 智能体拥有在对话过程中修改自身记忆的工具。

由 MemGPT/Letta 率先提出：

```python
# The agent has access to these tools:
core_memory_append(label="human", content="Sarah prefers dark mode")
core_memory_replace(label="human", old="works at startup", new="works at Google")
archival_memory_insert(content="Project requirements document...")
archival_memory_search(query="deployment architecture")
```

智能体自行决定*何时*以及*记住什么*。这比自动提取更灵活，因为智能体可以进行判断——但也意味着智能体可能忘记保存重要信息或保存无关的细节。

Letta 的 V1 架构通过以下方式对此进行了改进：
- `memory_insert` — 添加新信息
- `memory_replace` — 更新现有信息
- `memory_rethink` — 用全新推理重写一个记忆块
- `memory_apply_patch` — 应用结构化编辑

**使用者：** Letta/MemGPT（主要范式）、Claude API Memory Tool（客户端 CRUD）

---

## 技术总结矩阵

| 技术 | 延迟 | 准确度 | 复杂度 | 基础设施 |
|------|------|--------|--------|----------|
| 上下文压缩 | ⚡ 极低 | ⚠️ 中等 | 低 | 无 |
| 向量存储 RAG | 🔄 低-中 | ✅ 好 | 中 | 向量数据库 |
| 知识图谱 | 🔄 中 | ✅ 很好 | 高 | 图数据库 |
| 层级树 | ⚡ 低 | ✅ 好 | 中 | 文件系统 |
| 结构化网络 | 🔄 中 | ✅ 优秀 | 高 | 多种存储 |
| LLM 管理 | 🐌 高 | ✅ 很好 | 高 | LLM API |
| 反思 | 🐌 高（异步） | ✅ 优秀 | 高 | LLM API |
| HRR | ⚡ 亚毫秒 | ⚠️ 仅结构化 | 低 | 无 |
| 多策略检索 | 🔄 中 | ✅ 优秀 | 高 | 多种 |
| 自编辑 | 🔄 中 | ⚠️ 取决于智能体 | 中 | LLM + 存储 |

最好的系统会组合多种技术。Hindsight 使用结构化网络 + 多策略检索 + 反思。Mem0 使用向量存储 + LLM 管理 + 知识图谱。ByteRover 使用层级树 + LLM 管理 + 多层检索。

---

**下一章：[第三章 — 提供商深度剖析](03_providers.md)** — 每个主要记忆系统的详细分析。
