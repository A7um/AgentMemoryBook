# Mem0 — AI 智能体的可扩展记忆层

> **一句话概述：** 一条两阶段"提取→更新"流水线，为任意 LLM 智能体提供可持久化、会自我维护的长期记忆。

| 指标 | 值 |
|---|---|
| **GitHub Stars** | 38 000+ |
| **许可证** | Apache 2.0 |
| **论文** | [arXiv:2504.19413](https://arxiv.org/abs/2504.19413)（2025 年 4 月） |
| **默认 LLM** | GPT-4o-mini |
| **存储** | 向量数据库 + 可选 Neo4j（图数据库） |
| **p95 延迟降低** | 相比全上下文降低 91% |
| **Token 成本节省** | ≈ 90% |
| **LOCOMO 得分** | 66.9%（Mem0）· 68.4%（Mem0g） |

---

## 架构概览

Mem0 的核心思路是：*你不需要把整段对话历史塞进每次提示*。它用一条轻量流水线，从每轮对话中**提取**原子事实，再把这些事实**合并**到一个已去重、已消解冲突的记忆库里。查询时，智能体只拉取少量相关记忆即可。

架构上分为两个必选阶段和一个可选的图层：

```mermaid
flowchart TB
    subgraph INPUT["Conversation Turn"]
        UM["User Message"]
        AR["Assistant Response"]
        CTX["Context Window\n(summary S + last M=10 messages)"]
    end

    subgraph EXTRACT["Phase 1 — Extraction"]
        LLM1["LLM (GPT-4o-mini)\nPrompt: 'Extract atomic facts\nfrom this exchange'"]
        FACTS["Candidate Facts\n[fact₁, fact₂, …]"]
    end

    subgraph UPDATE["Phase 2 — Update"]
        direction TB
        LOOP["For each candidate fact"]
        VS["Vector Search\ntop-K=10 similar\nexisting memories"]
        LLM2["LLM Decision\nADD · UPDATE · DELETE · NOOP"]
        EXEC["Execute operation\non memory store"]
    end

    subgraph STORE["Persistent Memory Store"]
        VDB[("Vector DB\n(dense embeddings)")]
        NEO["Neo4j\n(optional graph)"]
    end

    UM --> LLM1
    AR --> LLM1
    CTX --> LLM1
    LLM1 --> FACTS
    FACTS --> LOOP
    LOOP --> VS
    VS --> LLM2
    LLM2 --> EXEC
    EXEC --> VDB
    EXEC -.-> NEO

    style INPUT fill:#e8f4fd,stroke:#4a90d9
    style EXTRACT fill:#fff3cd,stroke:#d4a017
    style UPDATE fill:#d4edda,stroke:#28a745
    style STORE fill:#f8d7da,stroke:#dc3545
```

### Mem0g — 图变体

Mem0g 在基础架构上叠加了一张有向标记图 **G = (V, E, L)**，存放在 Neo4j 里。标准提取阶段跑完之后，会多走一条子流水线，把事实拆解为结构化的实体与关系。

```mermaid
flowchart LR
    subgraph GRAPH_PIPELINE["Mem0g — Graph Extension"]
        direction TB
        EE["Entity Extraction\nperson · place · project"]
        RG["Relationship Generation\n(works_at, lives_in, …)"]
        CD["Conflict Detection\nnew edge vs existing edges"]
        CR["LLM Resolution\nkeep new · keep old · merge"]
    end

    FACTS2["Candidate Facts"] --> EE
    EE --> RG
    RG --> CD
    CD --> CR
    CR --> NEO2[("Neo4j Graph\nG = (V, E, L)")]

    subgraph LEGEND["Graph Components"]
        direction LR
        V["V = entity nodes"]
        E["E = typed edges"]
        L["L = edge labels"]
    end

    style GRAPH_PIPELINE fill:#e8daef,stroke:#8e44ad
    style LEGEND fill:#fdfefe,stroke:#aab7b8
```

| 组件 | 作用 |
|---|---|
| **V（顶点）** | 实体节点 — 人物、地点、组织、项目 |
| **E（边）** | 有向、有类型的关系 — `works_at`、`lives_in`、`allergic_to` |
| **L（标签）** | 边上的可读标签，用于下游检索 |

---

## 工作原理 — 逐步拆解

下面用一个具体场景来走一遍：用户 **Alex** 和 AI 助手多轮对话，我们跟着看每一步记忆操作是怎么发生的。

### 第 1 轮 — 首次介绍

**用户：** *"你好，我叫 Alex。我是素食主义者，对坚果过敏。"*
**助手：** *"你好 Alex！我已经记下你是素食主义者并且对坚果过敏。"*

#### 第 1 阶段 — 提取

LLM 拿到当前这轮对话加上下文（此时还是空的），提取出：

| # | 候选事实 |
|---|---|
| 1 | Alex is a vegetarian |
| 2 | Alex is allergic to nuts |

#### 第 2 阶段 — 更新

先看**事实 1**（"Alex is a vegetarian"）：
1. 向量搜索现有记忆 → **0 条结果**（库还是空的）。
2. LLM 判定 → **ADD**。
3. 创建新记忆记录，同时生成嵌入向量。

再看**事实 2**（"Alex is allergic to nuts"）：
1. 同样的流程 → **ADD**。

**第 1 轮后的记忆存储状态：**

| ID | 记忆 | 创建时间 |
|---|---|---|
| m-001 | Alex is a vegetarian | T₁ |
| m-002 | Alex is allergic to nuts | T₁ |

### 第 2 轮 — 新信息

**用户：** *"我刚在 Google 找到了一份软件工程师的新工作。"*

#### 提取 → 1 条候选事实："Alex works at Google as a software engineer"
#### 更新 → 向量搜索返回 0 条强匹配 → **ADD**

| ID | 记忆 | 创建时间 |
|---|---|---|
| m-001 | Alex is a vegetarian | T₁ |
| m-002 | Alex is allergic to nuts | T₁ |
| m-003 | Alex works at Google as a software engineer | T₂ |

### 第 3 轮 — 矛盾（见下方冲突解决）

**用户：** *"实际上我刚从 Google 跳槽到 Meta 了。"*

#### 提取 → 1 条候选事实："Alex works at Meta"
#### 更新 → 向量搜索返回 **m-003**（相似度 ≈ 0.92）→ LLM 决策：**UPDATE**

| ID | 记忆 | 更新时间 |
|---|---|---|
| m-003 | Alex works at Meta as a software engineer | T₃ *（已更新）* |

---

## 请求流程 — 时序图

下面的时序图完整展示了一次 `add` 调用和一次 `search` 调用各自的生命周期：

```mermaid
sequenceDiagram
    participant App as Application
    participant SDK as Mem0 SDK
    participant EXT as Extraction LLM
    participant UPD as Update LLM
    participant VDB as Vector DB
    participant NEO as Neo4j (optional)

    Note over App,NEO: ── Add Memory ──

    App->>SDK: client.add(messages, user_id="alex")
    SDK->>SDK: Build context (summary S + last M=10 msgs)
    SDK->>EXT: "Extract atomic facts from this exchange"
    EXT-->>SDK: [fact₁, fact₂, …]

    loop For each candidate fact
        SDK->>VDB: Vector search(fact, top-K=10)
        VDB-->>SDK: Similar existing memories
        SDK->>UPD: "Compare fact vs existing. Decide: ADD/UPDATE/DELETE/NOOP"
        UPD-->>SDK: Decision + updated text (if UPDATE)

        alt ADD
            SDK->>VDB: Insert new memory + embedding
        else UPDATE
            SDK->>VDB: Replace memory text + re-embed
        else DELETE
            SDK->>VDB: Remove memory record
        else NOOP
            Note over SDK: No action taken
        end

        opt Graph mode enabled
            SDK->>NEO: Upsert entities & relationships
        end
    end

    SDK-->>App: { memories_added, memories_updated, memories_deleted }

    Note over App,NEO: ── Search Memory ──

    App->>SDK: client.search(query, user_id="alex")
    SDK->>VDB: Vector similarity search(query)
    VDB-->>SDK: Top-K matching memories
    opt Graph mode enabled
        SDK->>NEO: Traverse related entities
        NEO-->>SDK: Graph-augmented results
    end
    SDK-->>App: [{ memory, score, metadata }, …]
```

---

## 代码示例

### Python — 托管云（MemoryClient）

```python
# pip install mem0ai
from mem0 import MemoryClient

# Initialize with your Mem0 Platform API key
client = MemoryClient(api_key="your_api_key")

# ── Add memories from a conversation turn ──
messages = [
    {"role": "user", "content": "Hi, I'm Alex. I'm a vegetarian and I'm allergic to nuts."},
    {"role": "assistant", "content": "Hello Alex! I've noted that you're a vegetarian and have a nut allergy."}
]
result = client.add(messages, user_id="alex")
# result contains IDs of memories created / updated

# ── Add more context in a later turn ──
messages = [
    {"role": "user", "content": "I just started a new job at Google as a software engineer."},
    {"role": "assistant", "content": "Congratulations on your new role at Google!"}
]
client.add(messages, user_id="alex")

# ── Semantic search over memories ──
results = client.search(query="What does Alex do for work?", user_id="alex")
for r in results:
    print(r["memory"])  # "Alex works at Google as a software engineer"

# ── List all memories for a user ──
all_memories = client.get_all(user_id="alex")
for m in all_memories:
    print(m["memory"])

# ── Automatic conflict resolution ──
# Alex changed jobs — Mem0 will UPDATE the existing memory, not duplicate it.
messages = [
    {"role": "user", "content": "I actually just moved from Google to Meta."}
]
client.add(messages, user_id="alex")
# The memory "Alex works at Google …" is updated to "Alex works at Meta …"
```

### Python — 开源本地使用

```python
from mem0 import Memory

# No API key needed — runs entirely locally
m = Memory()

# Add a memory with optional metadata
m.add(
    "I'm working on improving my tennis skills.",
    user_id="alice",
    metadata={"category": "hobbies"}
)

# Search for relevant memories
results = m.search(query="What are Alice's hobbies?", user_id="alice")
for r in results:
    print(r["memory"])  # "Alice is working on improving her tennis skills"
```

### TypeScript / REST API（概念示例）

```typescript
// Mem0 exposes a REST API; any HTTP client works.
const MEM0_API = "https://api.mem0.ai/v1";
const headers = {
  "Authorization": "Token your_api_key",
  "Content-Type": "application/json",
};

// Add a memory
const addRes = await fetch(`${MEM0_API}/memories/`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    messages: [
      { role: "user", content: "I prefer dark mode in all my apps." },
      { role: "assistant", content: "Got it — dark mode preference saved!" },
    ],
    user_id: "alex",
  }),
});

// Search memories
const searchRes = await fetch(`${MEM0_API}/memories/search/`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    query: "What are Alex's UI preferences?",
    user_id: "alex",
  }),
});
const { results } = await searchRes.json();
console.log(results[0].memory); // "Alex prefers dark mode in all apps"
```

---

## 冲突解决 — 具体示例

冲突解决是 Mem0 的核心卖点：系统不会任由互相矛盾的事实堆积，而是主动发现并消解冲突。

### 场景

Alex 在三轮不同的对话中告诉助手三件事：

| 轮次 | 陈述 |
|---|---|
| T₁ | "I work at Google." |
| T₂ | "I just got promoted to Senior Engineer." |
| T₃ | "I left Google and joined Meta last week." |

### 解决过程追踪

```mermaid
flowchart TD
    T1["T₁ — 'I work at Google'"]
    T2["T₂ — 'I got promoted to Senior Engineer'"]
    T3["T₃ — 'I left Google, joined Meta'"]

    M1["m-001: Alex works at Google"]
    M1v2["m-001: Alex works at Google\nas Senior Engineer"]
    M1v3["m-001: Alex works at Meta\nas Senior Engineer"]

    T1 -->|ADD| M1
    T2 -->|"UPDATE m-001\n(additive — compatible fact)"| M1v2
    T3 -->|"UPDATE m-001\n(contradictory — replace employer)"| M1v3

    style T1 fill:#d5f5e3,stroke:#27ae60
    style T2 fill:#d6eaf8,stroke:#2980b9
    style T3 fill:#fadbd8,stroke:#e74c3c
    style M1 fill:#fdfefe,stroke:#aab7b8
    style M1v2 fill:#fdfefe,stroke:#aab7b8
    style M1v3 fill:#fdfefe,stroke:#aab7b8
```

**LLM 在 T₃ 时"看到"的内容：**

| 输入 | 值 |
|---|---|
| 候选事实 | "Alex works at Meta" |
| Top-1 已有记忆（相似度 ≈ 0.93） | "Alex works at Google as Senior Engineer" |

更新阶段的 LLM 提示会问：*"对比新事实和已有记忆，你该新增（ADD）、更新（UPDATE）、删除（DELETE），还是什么都不做（NOTHING）？"*

LLM 的判断逻辑：
- **雇主**变了（Google → Meta）— 矛盾，必须替换。
- **职位**（Senior Engineer）没变 — 保留。
- 最终决策：**UPDATE** → `"Alex works at Meta as Senior Engineer"`

### 决策矩阵

| 场景 | LLM 决策 | 示例 |
|---|---|---|
| 全新信息 | **ADD** | "Alex has a pet dog named Buddy" |
| 与已有记忆兼容的细化 | **UPDATE**（合并） | "Alex is a *Senior* Engineer"（添加职位） |
| 矛盾性替换 | **UPDATE**（替换） | "Alex moved from Google to Meta" |
| 信息被明确撤回 | **DELETE** | "I'm no longer allergic to nuts" |
| 重复或无关 | **NOOP** | "I work at Google"（已存储） |

---

## 性能

| 指标 | Mem0 | Mem0g（图） | 全上下文基线 |
|---|---|---|---|
| **LOCOMO 准确率** | 66.9% | 68.4% | 各异 |
| **对比 OpenAI Memory** | 准确率高出 26% | — | — |
| **p95 延迟** | **降低 91%** | — | 基线 |
| **Token 成本** | **节省约 90%** | — | 基线 |

### 怎么看这些数字

- **延迟和成本：** 只检索相关记忆而不是把整段历史塞进去，延迟和 Token 消耗都大幅下降——对长会话的生产部署来说，这是实打实的收益。
- **准确率的取舍：** 66.9% 的 LOCOMO 得分算扎实，但不算顶尖；图变体（Mem0g）靠捕捉结构化关系把分数拉到了 68.4%。
- **对比 OpenAI Memory：** 在 LOCOMO 基准上比 OpenAI 内置记忆高出 26%。原因不难理解：Mem0 的显式"提取→更新"流水线天然比 OpenAI 的隐式做法更系统。

---

## 优势

- **经过大规模验证** — 38K+ GitHub stars 加上庞大的生产用户群，可靠性有底气。
- **心智模型简单** — 两阶段"提取→更新"流水线，好理解、好调试、好扩展。
- **效率提升显著** — 相比把全部上下文塞进去，p95 延迟降低 91%，Token 省了约 90%。
- **部署灵活** — 开源本地跑（Apache 2.0）或托管云服务都行；LLM 和向量库都可以自带。
- **自动去重和冲突消解** — 更新阶段天然防止记忆膨胀，保持事实的时效性。
- **图扩展能力** — Mem0g 给需要结构化实体-关系推理的场景加了一层图能力。

## 局限性

- **冲突解决全靠 LLM** — 合并/更新的决策完全交给 LLM，没有确定性的兜底逻辑；遇到边界情况，结果可能不一致。
- **没有内置的时间推理** — 记忆虽然带时间戳，但系统本身不能做时间维度的查询（比如"Alex 去年在哪工作？"）。
- **图功能要额外付费** — Mem0g（基于 Neo4j）在托管平台上需要 Pro 方案，$249/月。
- **LOCOMO 得分有天花板** — 基础变体 66.9% 的成绩落后于更新的研究系统，图变体虽然缩小了差距但仍不算领先。
- **记忆按单用户隔离** — 记忆以 `user_id` 为索引；多智能体或跨用户共享记忆需要自己做编排。

## 最佳适用场景

| 使用场景 | 为什么选 Mem0 |
|---|---|
| 需要按用户做个性化的**生产聊天机器人** | SDK 简单、经过规模验证、延迟低 |
| 要记住历史工单的**客服智能体** | 自动去重，防止"记忆污染" |
| 记忆增强智能体的**快速原型** | 开源、pip 一装就能用、5 行代码集成 |
| 长会话场景下的**成本敏感部署** | 90% Token 节省直接砍掉 API 账单 |
| 需要在实体密集领域用**图层**的团队 | Mem0g + Neo4j（Pro 层级） |

---

## 定价

| 层级 | 价格 | 包含内容 |
|---|---|---|
| **开源版** | 免费 | 核心两阶段流水线、本地向量数据库 |
| **Cloud Free** | $0 | 托管服务、用量有限 |
| **Pro** | $249/月 | 图记忆（Mem0g）、优先支持、更高配额 |

---

## 链接

| 资源 | URL |
|---|---|
| **文档** | [docs.mem0.ai](https://docs.mem0.ai) |
| **GitHub** | [github.com/mem0ai/mem0](https://github.com/mem0ai/mem0) |
| **研究论文** | [arXiv:2504.19413](https://arxiv.org/abs/2504.19413) |
| **平台** | [app.mem0.ai](https://app.mem0.ai) |
| **PyPI 包** | [pypi.org/project/mem0ai](https://pypi.org/project/mem0ai/) |
