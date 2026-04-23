# 第二章：技术篇 — 智能体记忆的构建模块

每个记忆系统，不管营销包装得多花哨，底下都是一组成熟工程技术的排列组合。本章逐一拆解这些技术，讲清楚它们的工作原理，并指出哪些生产系统正在用它们。

## 技术 1：上下文内压缩

**是什么：** 把记忆留在上下文窗口里，但用压缩形式保存。

最简单的做法：不把记忆存到外面，而是把过去的对话总结一下，每次都塞进提示词里。ChatGPT 在大规模场景下就是这么干的。

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

**压缩的几种方式：**
- **抽取式：** 直接从原文中提取关键句子
- **生成式：** 让 LLM 生成更精炼的摘要
- **增量压缩：** 只传输上一轮以来的变化部分（RetainDB 声称能省下 50–90% 的 token）

**优势：**
- 零基础设施——不需要向量数据库，不需要图数据库
- 低延迟——没有检索环节
- 适用于任何模型

**劣势：**
- 历史记录越长，摘要质量越差
- 搞不定跨越数千个会话的"大海捞针"式查询
- 有损——细节在压缩过程中一去不返

**使用者：** OpenAI ChatGPT Memory（4 层上下文注入）、Claude Chat Memory、RetainDB（增量压缩）

---

## 技术 2：检索增强记忆（向量存储）

**是什么：** 把记忆转成嵌入向量存进向量数据库，查询时检索最相似的 top-K 条。

这是目前生产环境中最主流的记忆技术。它在经典 RAG 的基础上更进一步，让语料库变成*动态的*——新的记忆从对话中源源不断地写入。

```
Write path:
  conversation → LLM extracts facts → embed facts → store in vector DB
  
Read path:
  user query → embed query → similarity search → top-K results → inject into prompt
```

**相似度搜索是怎么工作的：**
1. 每条记忆被转换为一个稠密向量（比如 OpenAI `text-embedding-3-small` 输出 1536 维）
2. 查询时，用同一个模型把查询也嵌入成向量
3. 向量数据库通过余弦相似度返回 K 个最近邻
4. 可选步骤：用交叉编码器重排序器对结果重新打分，进一步提升精度

**混合搜索模式：**
多数生产系统会把向量搜索和关键词搜索（BM25）结合起来，原因很简单：
- 向量搜索擅长语义匹配（"Alice 做什么工作？"能匹配到"Alice 在 Google 工作"）
- 关键词搜索擅长精确匹配（"Alice"直接命中包含"Alice"的文档）
- 两者结合能捞到单独用任一种方式都会漏掉的结果

**优势：**
- 轻松扩展到数百万条记忆
- 语义理解能力过关
- 基础设施成熟（Pinecone、Qdrant、pgvector、ChromaDB）

**劣势：**
- 搞不定关系推理（"Alice 的同事都有谁？"需要多跳查询）
- 搞不定时间推理（"Alice *去年春天*做了什么？"）
- 嵌入质量就是天花板——嵌入模型漏掉了细微差别，检索就废了

**使用者：** Mem0（核心）、Supermemory（混合）、RetainDB，大多数系统把它当作基础层

---

## 技术 3：知识图谱

**是什么：** 把记忆以实体（节点）和关系（边）的形式存进图结构，天然支持多跳推理。

```
Entities (nodes):
  [Alice] [Google] [Paris] [Project X]

Relationships (edges):
  Alice --works_at--> Google
  Alice --lives_in--> Paris
  Alice --leads--> Project X
  Project X --deadline--> March 2026
```

有了这种结构，就能回答向量搜索搞不定的问题："住在巴黎的那个人负责什么项目？"——沿着 Alice → lives_in → Paris 走一步，再沿着 Alice → leads → Project X 走一步就行了。

### 时序知识图谱

Zep/Graphiti 率先在图的边上加入了*时间元数据*：

```
Alice --lives_in--> New York   [valid_at: 2023-01, invalid_at: 2025-06]
Alice --lives_in--> London     [valid_at: 2025-06, invalid_at: null]
```

这种双时间模型能做到：
- 时间点查询："Alice 2024 年住在哪里？"
- 变更追踪："Alice 什么时候搬的家？"
- 事实虽然失效，但数据不会丢

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
- 天生支持多跳推理
- 时间推理不在话下（配合时序图谱）
- 知识表示显式、可审计
- 可通过社区检测生成宏观摘要

**劣势：**
- 构建成本不低（实体抽取要调 LLM）
- 图的质量好不好，全看抽取用的 LLM 够不够聪明
- 大图上检索可能偏慢，除非索引设计得当
- 维护一致性是个麻烦事

**使用者：** Zep/Graphiti（时序知识图谱）、Mem0g（图变体）、Cognee（知识图谱 + 向量混合）、Hindsight（4 网络图）

---

## 技术 4：层级 / 树状记忆

**是什么：** 把记忆组织成树状结构，就像人类给知识分门别类一样。

ByteRover 用 Context Tree 率先实践了这个思路：

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

OpenViking 也用了类似方案，基于它的虚拟文件系统：

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

检索从 L0 起步，先判断相关性，再只对相关分支深入到 L1/L2。据称这能减少 83–96% 的 token 消耗。

**优势：**
- 人类一看就懂，调试方便
- 天然的浏览式组织结构
- 不依赖向量数据库（直接用文件系统）
- 细节可以渐进式展开

**劣势：**
- 跨分支的交叉查询效果不太行
- 分类法要设计好（分类烂了，结果也烂）
- 不管是手动组织还是让 LLM 来组织，都有额外开销

**使用者：** ByteRover（Context Tree）、OpenViking（AGFS 文件系统）、Claude Code（CLAUDE.md 层级结构）

---

## 技术 5：结构化记忆网络

**是什么：** 把记忆划分到多个*认知属性各异*的存储区，每个区有自己的语义和检索逻辑。

Hindsight 的 4 网络架构是这方面的典型代表：

| 网络 | 内容 | 来源 |
|------|------|------|
| **世界网络 (W)** | 关于环境的客观事实 | "Alice 在 Google 工作" |
| **经验网络 (B)** | 智能体自身的过去行为 | "我向 Bob 推荐了 Python" |
| **观察网络 (O)** | 综合性实体摘要 | "Alice 是一位频繁使用 Python 的用户，最近刚搬家" |
| **观点网络 (S)** | 智能体不断演变的信念 | "Alice 会从 TypeScript 中受益" |

这里的核心洞察是：事实和信念是*两码事*，必须分开存。事实（"Alice 使用 Python"）可以验证。信念（"Alice 会从 TypeScript 中受益"）是智能体自己推出来的。把它们搅在一起，幻觉就来了。

### 保留 → 回忆 → 反思

Hindsight 的三个操作与人类认知异曲同工：

1. **保留（Retain）：** 把对话拆解为原子事实，打上时间戳和实体标签，写入世界网络或经验网络
2. **回忆（Recall）：** 多策略并行检索（语义 + 关键词 + 图 + 时间）→ 交叉编码器重排序 → 在 token 预算内组装上下文
3. **反思（Reflect）：** 智能体对检索到的记忆进行推理，回答问题或更新自身的观察和观点

**优势：**
- 认知层次清晰——你能看出智能体*为什么*这么认为
- 推理有迹可循——信念可以追溯到源事实
- 天然支持智能体身份 / 性格设定

**劣势：**
- 比扁平的向量存储要复杂不少
- 观察和观点的界限有时候挺微妙
- 反思步骤的提示词需要仔细打磨

**使用者：** Hindsight（4 网络）、Letta/MemGPT（核心/回忆/归档三层）、Honcho（同伴模型 + 结论）

---

## 技术 6：LLM 驱动的记忆管理

**是什么：** 用 LLM 本身——就是那个干活推理的模型——来管理、组织和维护记忆。

这是 ByteRover 的核心创新。不是让智能体去*调用*一个独立的记忆服务，而是让智能体*自己就是*记忆管理者：

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

Mem0 用了一个更轻量的版本：让 LLM 把每条候选记忆和已有的 top-K 记忆做对比，然后决定执行 ADD / UPDATE / DELETE / NOOP。

**优势：**
- 智能体理解记忆的*含义*，而不只是看向量距离
- 能处理细腻的更新（"其实 Alice 现在是副总裁了，不是总监"）
- 可审计——变更记录在文件或日志里清清楚楚

**劣势：**
- 贵——每次记忆操作都要调一次 LLM
- 慢——每轮交互都会多出延迟
- 质量全看 LLM 的判断力
- 有级联错误风险（管理出错 → 检索出错 → 管理继续出错）

**使用者：** ByteRover（主要方式）、Mem0（更新阶段）、Letta（自编辑工具）、Cognee（cognify 流水线）

---

## 技术 7：反思与自我提升

**是什么：** 智能体定期回顾自己的记忆，从中提炼更高层次的洞察、整合相关事实并更新信念。

这个思路源自 Generative Agents（Park 等人，2023 年）中的*反思*机制——模拟角色会定期反思近期经历，形成更高层次的认知。

在实际系统中是这样运作的：

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

Honcho 把这叫做"辩证推理"——每次对话结束后，它会对交流内容进行推理，提炼出关于用户偏好、习惯和目标的"结论"。

**优势：**
- 输出高质量摘要，能捕捉跨多次交互的规律
- 减轻检索压力（一条观察抵得上几十条原始事实）
- 让智能体在真正有意义的层面上"学习"

**劣势：**
- 反思也会出错——智能体可能形成偏颇的信念
- 烧钱（后台"休眠"时也要调 LLM）
- 过时的反思如果不及时刷新，会一直赖着不走

**使用者：** Hindsight（reflect 操作）、Honcho（辩证推理）、Cognee（memify）、OpenViking（记忆提取）、Letta（休眠时计算）

---

## 技术 8：全息缩减表示（HRR）

**是什么：** 一种来自认知科学的数学技术，用循环卷积把多个键值对塞进单个固定大小的复值向量里。

这是 Nuggets 采用的方法——比较小众，但非常有意思：

```javascript
// Store
mem.remember('alice', 'lives_in', 'paris');
mem.remember('alice', 'works_at', 'acme');

// Recall — algebraic, sub-millisecond
const result = mem.recall('alice', 'lives_in');
// → 'paris' (in <1ms, zero API calls)
```

**背后的原理：**
1. 每个键和值被编码为一个复值向量
2. 键和值通过循环卷积*绑定*在一起
3. 多个绑定通过*叠加*（向量相加）存进同一个向量
4. 回忆时，用查询键*解绑*，找到最近匹配

**优势：**
- 亚毫秒级检索，零外部依赖
- 不用调 API，不用向量数据库，不用嵌入服务
- 数学上很优雅，常数空间存储

**劣势：**
- 塞进去的事实越多，精度越低（实际上限大约每个主题 25 条）
- 只认结构化三元组，自由文本喂不进去
- 没有语义相似度——只支持精确键匹配
- 只能作为向量搜索的补充，替代不了

**使用者：** Nuggets（全息记忆引擎）、hrr-memory（独立库）

---

## 技术 9：多策略检索

**是什么：** 同时跑多条检索策略，再用重排序器合并结果，把召回率和精确率都拉到最高。

Hindsight 的 TEMPR（Temporal Entity Memory Priming Retrieval，时序实体记忆启动检索）同时跑四条策略：

| 策略 | 最适场景 |
|------|----------|
| **语义（向量）** | 概念相似度、改写查询 |
| **关键词（BM25）** | 名称、技术术语、精确匹配 |
| **图遍历** | 相关实体、间接关联 |
| **时间** | 有时间范围的查询（"去年春天"） |

各路结果汇总后，交给交叉编码器重排序器逐一打分，评估每条结果与原始查询的相关性。这会多出约 50–200ms 延迟，但精确率的提升非常明显。

ByteRover 则采用 5 层渐进式策略，只在上一层搞不定时才往下走：

```
Tier 1: Cache lookup          (~0ms)
Tier 2: Full-text search      (~10ms)
Tier 3: Semantic search        (~50ms)
Tier 4: Graph traversal        (~100ms)
Tier 5: Agentic reasoning      (~500ms+, involves LLM call)
```

多数查询在前 1–3 层就能搞定，平均延迟保持在低位，同时为复杂查询留好了兜底方案。

**使用者：** Hindsight（TEMPR）、ByteRover（5 层）、Zep（混合语义 + BM25 + 图）、Supermemory（混合向量 + 关键词 + 重排序）

---

## 技术 10：记忆自编辑

**是什么：** 给智能体一组工具，让它在对话过程中能动手修改自己的记忆。

由 MemGPT/Letta 率先提出：

```python
# The agent has access to these tools:
core_memory_append(label="human", content="Sarah prefers dark mode")
core_memory_replace(label="human", old="works at startup", new="works at Google")
archival_memory_insert(content="Project requirements document...")
archival_memory_search(query="deployment architecture")
```

智能体自己拿主意——*什么时候*存、*存什么*。这比自动抽取灵活得多，因为智能体可以做判断——但硬币的另一面是，它可能忘了保存重要的东西，或者存了一堆无关紧要的细节。

Letta V1 架构在此基础上做了进一步改进：
- `memory_insert` — 添加新信息
- `memory_replace` — 更新已有信息
- `memory_rethink` — 用全新推理重写一整个记忆块
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

最厉害的系统都是多种技术组合出击。Hindsight 用的是结构化网络 + 多策略检索 + 反思。Mem0 的组合是向量存储 + LLM 管理 + 知识图谱。ByteRover 走的是层级树 + LLM 管理 + 多层检索的路线。

---

**下一章：[第三章 — 提供商深度剖析](03_providers.md)** — 逐一拆解每个主要记忆系统。
