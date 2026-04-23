# RetainDB — 深入解析

**官网:** [retaindb.com](https://retaindb.com) | **许可证:** 专有（SaaS） | **基准测试:** LongMemEval SOTA（自报）

> 托管式记忆 SaaS，提供七种类型化记忆分类、增量压缩以实现大幅 token 节省，以及亚 40ms 检索——专为以最少工程投入实现生产集成而设计。

---

## 架构概览

RetainDB 是一个完全托管的服务，围绕两项关键创新构建：**类型化记忆分类**（7 种不同的记忆类型）和**增量压缩**（50–90% token 节省）。该架构专为生产环境设计：按用户隔离、SOC 2 就绪以及多 SDK 支持。

```mermaid
graph TB
    subgraph "Client Layer"
        SDK_JS[JavaScript/TypeScript SDK]
        SDK_PY[Python SDK]
        SDK_GO[Go SDK]
        MCP[MCP Protocol]
        MR[Memory Router]
    end

    subgraph "RetainDB Core"
        API[API Gateway]
        AUTH[Auth & Per-User Isolation]
        
        subgraph "Memory Classification"
            CLASS[Memory Type Classifier]
            CLASS --> F[Factual]
            CLASS --> P[Preference]
            CLASS --> E[Event]
            CLASS --> R[Relationship]
            CLASS --> O[Opinion]
            CLASS --> G[Goal]
            CLASS --> I[Instruction]
        end
        
        subgraph "Delta Compression Engine"
            DELTA[Delta Compressor]
            DELTA --> DEDUP[Deduplication]
            DELTA --> MERGE[Semantic Merge]
            DELTA --> COMPACT[Compaction]
        end
        
        subgraph "Retrieval Engine"
            RET[Sub-40ms Retrieval]
            RET --> VEC[Vector Index]
            RET --> TYPE_IDX[Type-Based Index]
            RET --> RECENCY[Recency Scoring]
        end
    end

    subgraph "Storage"
        STORE[(Per-User Isolated Store)]
    end

    SDK_JS --> API
    SDK_PY --> API
    SDK_GO --> API
    MCP --> API
    MR --> API
    API --> AUTH
    AUTH --> CLASS
    CLASS --> DELTA
    DELTA --> STORE
    STORE --> RET
    RET --> API

    style CLASS fill:#9b59b6,color:#fff
    style DELTA fill:#e67e22,color:#fff
    style RET fill:#2ecc71,color:#fff
    style AUTH fill:#e74c3c,color:#fff
```

---

## 7 种记忆类型

RetainDB 将每条存储的信息归类为七种语义类型之一。这种分类能够实现基于类型的检索策略和更精确的上下文构建。

```mermaid
graph TB
    subgraph "Memory Type Taxonomy"
        direction TB
        
        FACT["📋 FACTUAL<br/>─────────<br/>Objective facts about the user<br/><i>'Sarah is a senior engineer at Acme'</i>"]
        
        PREF["⭐ PREFERENCE<br/>─────────<br/>Likes, dislikes, choices<br/><i>'Prefers dark mode and Vim keybindings'</i>"]
        
        EVENT["📅 EVENT<br/>─────────<br/>Timestamped occurrences<br/><i>'Started Rust project in March 2026'</i>"]
        
        REL["🤝 RELATIONSHIP<br/>─────────<br/>Connections between entities<br/><i>'Works with Bob on Project Alpha'</i>"]
        
        OPIN["💭 OPINION<br/>─────────<br/>Subjective views and beliefs<br/><i>'Thinks microservices are overused'</i>"]
        
        GOAL["🎯 GOAL<br/>─────────<br/>Objectives and aspirations<br/><i>'Wants to learn distributed systems'</i>"]
        
        INST["📌 INSTRUCTION<br/>─────────<br/>Directives for the AI<br/><i>'Always show code examples in Python'</i>"]
    end
```

| 记忆类型 | 描述 | 检索优先级 | 示例 |
|-------------|-------------|-------------------|---------|
| **Factual** | 关于实体的客观事实 | 身份类问题优先级高 | "Sarah is a senior engineer at Acme Corp" |
| **Preference** | 喜好、厌恶、默认选择 | 个性化场景优先级高 | "Prefers dark mode, Vim keybindings, terse answers" |
| **Event** | 带时间戳的事件 | 时间相关查询优先级高 | "Started Rust project in March 2026" |
| **Relationship** | 人或事物之间的联系 | 社交上下文优先级高 | "Works with Bob on the analytics pipeline" |
| **Opinion** | 主观观点和看法 | 中等（取决于上下文） | "Thinks microservices add unnecessary complexity" |
| **Goal** | 目标、志向、计划 | 主动建议优先级高 | "Wants to get Kubernetes certified by June" |
| **Instruction** | 给 AI 的行为指令 | 最高（始终相关） | "Always provide code examples, never use emojis" |

### 为什么类型化记忆很重要

没有类型时，检索系统会将 "Sarah lives in Seattle" 和 "Sarah wants to move to Austin" 同等对待。有了类型后：

- **Factual**（"lives in Seattle"）在当前状态问题中被返回
- **Goal**（"wants to move to Austin"）在志向类问题中被返回
- 当两者冲突时，类型信号能区分哪个是当前事实，哪个是未来意图

---

## 增量压缩

增量压缩是 RetainDB 保持记忆存储精简的方法。RetainDB 不会存储事实的每个版本，而是仅计算和存储记忆状态之间的**变更（增量）**。

```mermaid
sequenceDiagram
    participant App as Application
    participant RDB as RetainDB
    participant Store as Memory Store

    Note over App,Store: Turn 1: Initial memory
    App->>RDB: "Sarah uses Python for data work"
    RDB->>Store: Store: {type: Factual, content: "Uses Python for data work"}

    Note over App,Store: Turn 5: Update
    App->>RDB: "Sarah now also uses Rust for systems programming"
    RDB->>RDB: Detect overlap with existing Factual memory
    RDB->>RDB: Compute delta: +Rust, context=systems
    RDB->>Store: Update: {type: Factual, content: "Uses Python (data) and Rust (systems)"}

    Note over App,Store: Turn 12: Further update
    App->>RDB: "Sarah switched entirely to Rust, dropped Python"
    RDB->>RDB: Detect contradiction
    RDB->>RDB: Compute delta: -Python, Rust=primary
    RDB->>Store: Update: {type: Factual, content: "Uses Rust (primary language)"}
    RDB->>Store: Archive: {type: Event, content: "Switched from Python to Rust, March 2026"}

    Note over RDB: Without delta compression: 3 separate memories (60+ tokens)<br/>With delta compression: 1 current fact + 1 event (25 tokens)
```

### Token 节省

| 场景 | 无压缩 | 使用增量压缩 | 节省 |
|----------|-------------------|------------|---------|
| 用户偏好（20 次更新） | ~400 tokens | ~80 tokens | **80%** |
| 项目上下文（50 次更新） | ~1,200 tokens | ~180 tokens | **85%** |
| 关系图谱（30 次更新） | ~600 tokens | ~60 tokens | **90%** |
| 混合记忆（100 轮次） | ~2,500 tokens | ~500 tokens | **80%** |

根据信息更新频率的不同，增量压缩可实现 **50–90% 的 token 节省**。这直接转化为更低的 LLM 成本和上下文窗口中更多的可用空间。

---

## `runTurn` 流程

RetainDB 的主要集成点是 `runTurn` 方法，它封装了整个对话轮次——在一次调用中处理记忆检索、上下文注入和记忆更新。

```mermaid
sequenceDiagram
    participant App as Your Application
    participant RDB as RetainDB SDK
    participant MEM as Memory Store
    participant LLM as Your LLM

    App->>RDB: db.user(userId).runTurn({ messages, generate })
    
    RDB->>MEM: Retrieve relevant memories for user
    MEM-->>RDB: Typed memories (Factual, Preference, Goal, ...)
    
    RDB->>RDB: Build context with retrieved memories
    RDB->>RDB: Apply delta compression
    RDB->>RDB: Inject memories into message context
    
    RDB->>LLM: generate(enrichedContext)
    LLM-->>RDB: LLM response
    
    RDB->>RDB: Extract new memories from conversation
    RDB->>RDB: Classify into 7 memory types
    RDB->>RDB: Delta compress against existing memories
    RDB->>MEM: Store/update memories
    
    RDB-->>App: { response, memoriesUpdated }
```

---

## 代码示例

### TypeScript / JavaScript

```typescript
import { RetainDB } from "@retaindb/sdk";

const db = new RetainDB({ apiKey: process.env.RETAINDB_KEY });

// The simplest integration: wrap your LLM call with runTurn
const userId = "user_sarah_42";
const messages = [
  { role: "user", content: "I just started learning Rust. Can you help?" }
];

const { response, memoriesUpdated } = await db.user(userId).runTurn({
  messages,
  generate: async (ctx) => {
    // ctx.messages includes injected memory context
    return await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: ctx.messages,
    });
  },
});

console.log(response);       // LLM response personalized with user memories
console.log(memoriesUpdated); // [ { type: "Goal", content: "Learning Rust" } ]
```

### 直接记忆操作

```typescript
const user = db.user("user_sarah_42");

// Manually add a memory
await user.addMemory({
  type: "Preference",
  content: "Prefers concise code examples over verbose explanations"
});

// Query specific memory types
const goals = await user.getMemories({ type: "Goal" });
console.log(goals);
// [{ type: "Goal", content: "Learning Rust", created: "2026-03-15", confidence: 0.92 }]

// Get all memories for context injection
const allMemories = await user.getMemories();
console.log(allMemories);
// Returns typed memories sorted by relevance + recency

// Search memories
const results = await user.searchMemories("programming languages");
console.log(results);
// [{ type: "Factual", content: "Uses Rust (primary language)", score: 0.94 },
//  { type: "Goal", content: "Learning Rust", score: 0.87 }]
```

### Python SDK

```python
from retaindb import RetainDB

db = RetainDB(api_key=os.environ["RETAINDB_KEY"])

user = db.user("user_sarah_42")

# Run a turn with memory
result = user.run_turn(
    messages=[{"role": "user", "content": "Help me with async Rust patterns"}],
    generate=lambda ctx: openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=ctx["messages"]
    )
)

print(result["response"])
print(result["memories_updated"])
```

### Memory Router 集成

Memory Router 自动将记忆路由到适当的类型并处理去重：

```typescript
import { RetainDB, MemoryRouter } from "@retaindb/sdk";

const db = new RetainDB({ apiKey: process.env.RETAINDB_KEY });
const router = new MemoryRouter(db);

// The router analyzes conversation and auto-classifies memories
await router.processConversation("user_sarah_42", [
  { role: "user", content: "I'm Sarah, I work at Acme Corp as a senior engineer" },
  { role: "assistant", content: "Nice to meet you, Sarah!" },
  { role: "user", content: "I prefer Python but I'm learning Rust. My goal is to build a game engine." },
  { role: "assistant", content: "That's exciting! Rust is great for game engines." },
]);

// The router automatically creates:
// - Factual: "Sarah is a senior engineer at Acme Corp"
// - Preference: "Prefers Python"
// - Goal: "Learning Rust to build a game engine"
// All delta-compressed against any existing memories
```

### MCP 集成

```typescript
// RetainDB also exposes an MCP (Model Context Protocol) server
// for integration with MCP-compatible AI frameworks

// In your MCP client configuration:
const mcpConfig = {
  servers: [{
    name: "retaindb",
    url: "https://mcp.retaindb.com",
    auth: { apiKey: process.env.RETAINDB_KEY }
  }]
};

// MCP tools exposed:
// - retaindb_add_memory(userId, content, type?)
// - retaindb_search_memories(userId, query, type?)
// - retaindb_get_context(userId, maxTokens)
```

---

## 分步实战：带记忆的客服智能体

### 场景

你正在构建一个客服聊天机器人，能够跨会话记住每位客户的历史记录、偏好和当前问题。

### 步骤 1：初始化 RetainDB

```typescript
import { RetainDB } from "@retaindb/sdk";
import OpenAI from "openai";

const db = new RetainDB({ apiKey: process.env.RETAINDB_KEY });
const openai = new OpenAI();
```

### 步骤 2：首次客户交互

```typescript
const customerId = "customer_12345";

const { response } = await db.user(customerId).runTurn({
  messages: [
    { role: "user", content: "Hi, I'm having trouble with my billing. I was charged twice for my Pro plan. My email is alice@example.com" }
  ],
  generate: async (ctx) => {
    return await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful customer support agent." },
        ...ctx.messages
      ]
    });
  }
});

// RetainDB automatically extracts and stores:
// - Factual: "Email is alice@example.com"
// - Factual: "Has Pro plan"
// - Event: "Double-charged for Pro plan (March 2026)"
// - Goal: "Wants billing issue resolved"
```

### 步骤 3：后续会话（几天后）

```typescript
// Alice comes back — RetainDB remembers everything
const { response } = await db.user(customerId).runTurn({
  messages: [
    { role: "user", content: "Hi, following up on my issue" }
  ],
  generate: async (ctx) => {
    // ctx.messages now includes injected memory:
    // "Customer alice@example.com, Pro plan, had double-charge issue in March"
    return await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful customer support agent. Use the customer's history to provide personalized support." },
        ...ctx.messages
      ]
    });
  }
});

// Agent can immediately reference the billing issue without Alice repeating it
```

### 步骤 4：记忆随时间演进

```typescript
// After the issue is resolved
const { response } = await db.user(customerId).runTurn({
  messages: [
    { role: "user", content: "The refund came through, thanks! Also, can I upgrade to the Enterprise plan?" }
  ],
  generate: async (ctx) => {
    return await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful customer support agent." },
        ...ctx.messages
      ]
    });
  }
});

// Delta compression updates:
// - Event: "Double-charge resolved, refund processed" (updated, not duplicated)
// - Goal: "Wants to upgrade from Pro to Enterprise" (new)
// - Factual: "Has Pro plan" → delta-compressed when upgrade completes
```

---

## 性能与合规

| 指标 | 值 |
|--------|-------|
| **检索延迟** | < 40ms (p95) |
| **LongMemEval 分数** | SOTA（自报） |
| **Token 节省** | 50–90%（通过增量压缩） |
| **用户隔离** | 按用户数据分区 |
| **合规性** | SOC 2 就绪 |
| **SDK** | JavaScript/TypeScript, Python, Go |
| **集成协议** | REST API, SDK, MCP |

---

## 优势

- **零成本集成**：`runTurn` 封装你现有的 LLM 调用——只需最少的代码改动
- **7 种类型化记忆分类**：语义分类实现了比无类型存储更精确的检索
- **增量压缩**：50–90% 的 token 节省在生产工作负载中效果显著
- **亚 40ms 检索**：生产级延迟，不会拖慢你的应用
- **多 SDK 支持**：原生支持 JS/TS、Python 和 Go SDK，加上 MCP 框架集成
- **SOC 2 就绪**：企业级数据隔离和合规态势

## 局限性

- **专有/闭源**：无自托管选项——完全依赖供应商
- **基准测试透明度**：SOTA LongMemEval 声明为自报，未公开方法论或可复现的基准测试
- **定价不透明**：基于用量的定价对高流量应用可能难以预测
- **定制性有限**：记忆类型分类固定为 7 种——无法添加自定义类型
- **无图谱能力**：与 Cognee 或 Supermemory 不同，RetainDB 不构建知识图谱
- **新入局者**：与成熟产品相比，生产环境的使用记录有限

## 最佳适用场景

- **需要快速集成的生产应用**——`runTurn` 以最少的工作量获得 80% 的价值
- **面向客户的产品**：按用户记忆隔离是硬性需求的场景
- **注重成本的团队**：增量压缩的 token 节省足以证明 SaaS 成本的合理性
- **多语言团队**：使用 JS、Python 和 Go 的服务
- **企业环境**：需要 SOC 2 合规就绪

---

## 延伸阅读

- [RetainDB 文档](https://docs.retaindb.com)
- [SDK 快速入门指南](https://docs.retaindb.com/quickstart)
- [增量压缩技术概述](https://retaindb.com/blog/delta-compression)
- [MCP 集成指南](https://docs.retaindb.com/integrations/mcp)
- 相关基准测试：[LongMemEval](https://arxiv.org/abs/2410.10813)
