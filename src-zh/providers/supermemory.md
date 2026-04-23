# Supermemory — 深度解析

**官网：** [supermemory.ai](https://supermemory.ai) | **GitHub：** [supermemory-ai/supermemory](https://github.com/supermemory-ai/supermemory) | **许可协议：** 开源引擎 | **融资：** 260 万美元种子轮

> 一站式上下文管理平台——把记忆图谱、混合检索、多模态提取器和丰富的连接器生态整合进一个托管服务中。

---

## 架构概览

Supermemory 围绕**五个紧密协作的层**构建，形成一条完整的记忆流水线：从几十种来源的原始内容摄入，到智能提取和图谱构建，再到亚 300 毫秒的混合检索——全流程一气呵成。

```mermaid
graph TB
    subgraph "Layer 5: Connectors"
        C1[Notion] --> EX
        C2[Slack] --> EX
        C3[Google Drive] --> EX
        C4[Gmail] --> EX
        C5[S3 / Buckets] --> EX
        C6[Custom API] --> EX
    end

    subgraph "Layer 4: Extractors"
        EX[Multi-Modal Extraction Engine]
        EX --> |PDFs| PARSE[Document Parser]
        EX --> |Images| OCR[Vision / OCR]
        EX --> |Audio| TRANS[Transcription]
        EX --> |Video| VID[Frame + Audio Extract]
        PARSE --> MG
        OCR --> MG
        TRANS --> MG
        VID --> MG
    end

    subgraph "Layer 3: Retrieval"
        RET[Hybrid Retrieval Engine]
        RET --> VEC["Vector Search (dense embeddings)"]
        RET --> KW["Keyword Search (BM25)"]
        VEC --> RERANK[Cross-Encoder Reranker]
        KW --> RERANK
        RERANK --> RESULTS[Ranked Results < 300ms]
    end

    subgraph "Layer 2: Memory Graph"
        MG[Memory Graph Engine]
        MG --> ONT[Ontology-Aware Schema]
        MG --> NODES[Entity Nodes]
        MG --> EDGES[Relationship Edges]
        MG --> CONTRA[Contradiction Resolver]
        MG --> STALE[Staleness Detector]
        ONT --> RET
        NODES --> RET
        EDGES --> RET
    end

    subgraph "Layer 1: User Profiles"
        UP[User Profile Store]
        UP --> PREF[Preferences]
        UP --> HIST[Interaction History]
        UP --> META[Metadata & Tags]
        UP --> MG
    end

    style EX fill:#4a90d9,color:#fff
    style MG fill:#7b68ee,color:#fff
    style RET fill:#2ecc71,color:#fff
    style UP fill:#e67e22,color:#fff
    style RERANK fill:#27ae60,color:#fff
```

---

## 五层架构详解

### 第一层：用户画像

用户画像是 Supermemory 实现个性化的根基。每个用户（通过 `container_tag` 标识）都拥有一个隔离的画像空间，其中持续积累偏好、交互模式和元数据。

| 功能 | 描述 |
|------|------|
| **容器隔离** | 每个 `container_tag` 对应一个独立的记忆空间 |
| **偏好追踪** | 从用户内容和查询行为中自动识别 |
| **交互历史** | 完整的添加和搜索操作审计记录 |
| **元数据索引** | 支持自定义键值对，用于精细过滤 |

### 第二层：记忆图谱

记忆图谱是 Supermemory 最核心的差异化设计。不同于纯粹的向量存储，它维护着一张**本体感知图谱**——实体构成节点，关系构成带类型的边。

```mermaid
graph LR
    subgraph "Memory Graph Example"
        U[User: Sarah] -->|prefers| DM[Dark Mode]
        U -->|works_on| P1[Project Alpha]
        U -->|uses| PY[Python]
        U -->|uses| RS[Rust]
        P1 -->|requires| RS
        P1 -->|deployed_on| AWS[AWS Lambda]
        PY -.->|contradicted_by| RS
    end

    subgraph "Graph Operations"
        ADD[Add Edge] --> VALIDATE[Validate Against Ontology]
        VALIDATE --> CHECK[Check Contradictions]
        CHECK -->|Conflict| RESOLVE[Auto-Resolve]
        CHECK -->|No Conflict| STORE[Store Edge]
        RESOLVE --> STORE
    end
```

**矛盾解决：** 当新信息与已有记忆冲突时（比如"用户偏好浅色模式"遇上了"用户偏好深色模式"），Supermemory 会自动处理：
1. 通过对立边之间的语义相似度检测矛盾
2. 比较双方的时间戳和置信度分数
3. 保留更新、置信度更高的那条事实
4. 将被取代的事实归档，并附上 `superseded_by` 的引用指针

**过期淘汰：** 在可配置的 TTL 窗口内，如果某条记忆没有被访问或强化过，系统会自动降低它的权重，减少检索结果中的过时噪声。

### 第三层：检索引擎

Supermemory 的检索引擎将**向量搜索**和**关键词搜索**双剑合璧，再配合交叉编码器做精排，端到端延迟控制在 300 毫秒以内。

```mermaid
sequenceDiagram
    participant App as Application
    participant API as Supermemory API
    participant VEC as Vector Index
    participant KW as Keyword Index
    participant RR as Reranker

    App->>API: POST /v3/search { query, container_tag }
    API->>VEC: Dense embedding search (top-50)
    API->>KW: BM25 keyword search (top-50)
    VEC-->>API: Vector candidates
    KW-->>API: Keyword candidates
    API->>RR: Merge + cross-encoder rerank
    RR-->>API: Final ranked results
    API-->>App: Top-K results (< 300ms)
```

| 检索方法 | 角色 | 优势 |
|----------|------|------|
| **向量（稠密）** | 语义相似度匹配 | 能理解语义，对同义改写游刃有余 |
| **关键词（BM25）** | 精确词条匹配 | 精准命中名称、代码片段、ID 等 |
| **交叉编码器重排序器** | 最终相关性评分 | 显著提升排序质量 |

### 第四层：提取器

多模态提取引擎负责消化各种格式的内容：

| 内容类型 | 提取方法 | 输出 |
|----------|----------|------|
| **PDF** | 版面感知解析器 + OCR 兜底 | 带章节层级的结构化文本 |
| **图片** | 视觉模型 + OCR | 标题、文本内容、元数据 |
| **音频** | Whisper 级转录 | 带时间戳的转录文本 |
| **视频** | 帧采样 + 音频提取 | 关键帧 + 完整转录文本 |
| **网页** | HTML 转文本（去除模板噪声） | 干净的正文内容 |
| **代码文件** | AST 感知解析 | 函数、类、文档字符串 |

### 第五层：连接器

连接器实现了与外部数据源之间的**双向同步**：

```mermaid
graph LR
    subgraph "Connector Ecosystem"
        direction TB
        NOT[Notion] ---|Pages, Databases| SM[Supermemory]
        SLK[Slack] ---|Messages, Threads| SM
        GD[Google Drive] ---|Docs, Sheets, Slides| SM
        GM[Gmail] ---|Emails, Attachments| SM
        S3[AWS S3] ---|Objects, Buckets| SM
        GH[GitHub] ---|Issues, PRs, Code| SM
        CF[Confluence] ---|Pages, Spaces| SM
        API[Custom REST API] ---|Any JSON| SM
    end
```

连接器的几个关键能力：
- **增量同步**：只对新增和变更的内容重新索引，避免全量扫描
- **权限映射**：数据源的访问控制列表（ACL）可映射到检索过滤器中
- **Webhook 驱动**：源数据发生变更时即时触发更新

---

## API 参考

Supermemory 的 API 围绕两个核心端点展开。

### 添加记忆

```python
from supermemory import SuperMemory

client = SuperMemory(api_key="sm_...")

# Add a simple text memory
client.add(
    content="User prefers dark mode and uses Vim keybindings",
    container_tag="user_123"
)

# Add with metadata for filtering
client.add(
    content="Project Alpha deadline is March 2026",
    container_tag="user_123",
    metadata={"type": "project", "priority": "high"}
)

# Add a document (extractor auto-detects type)
client.add(
    content="https://docs.example.com/api-spec.pdf",
    container_tag="user_123",
    metadata={"source": "confluence"}
)
```

**`POST /v3/add`** — 摄入内容后自动运行提取，更新记忆图谱并建立检索索引。该接口具备幂等性，重复内容会被自动去重。

### 搜索记忆

```python
# Basic search
results = client.search.memories(
    query="What are the user's editor preferences?",
    container_tag="user_123"
)

for memory in results:
    print(f"[{memory.score:.2f}] {memory.content}")
    # [0.94] User prefers dark mode and uses Vim keybindings

# Filtered search with metadata
results = client.search.memories(
    query="upcoming deadlines",
    container_tag="user_123",
    filters={"type": "project"}
)

# Search with token budget
results = client.search.memories(
    query="everything about the user",
    container_tag="user_123",
    max_tokens=2000  # Fit within context window
)
```

**`POST /v3/search`** — 执行向量 + 关键词混合搜索，经重排序后返回结果。支持元数据过滤和 Token 预算控制。

---

## 分步演练：构建个性化编程助手

### 场景

假设你正在打造一个编程助手，它需要跨会话记住每位用户的技术栈偏好和项目上下文。

### 步骤 1：初始化并填充记忆

```python
from supermemory import SuperMemory

client = SuperMemory(api_key="sm_...")
USER = "dev_sarah_42"

# After the first conversation, store learned facts
client.add(
    content="Sarah is a senior backend engineer who primarily uses Python and FastAPI. "
            "She prefers type hints everywhere and uses Black for formatting.",
    container_tag=USER
)

client.add(
    content="Sarah's current project is a real-time analytics pipeline using "
            "Apache Kafka and ClickHouse. Deployed on AWS EKS.",
    container_tag=USER
)

client.add(
    content="Sarah prefers concise explanations with code examples. "
            "She dislikes verbose documentation-style responses.",
    container_tag=USER
)
```

### 步骤 2：接入外部数据源

```python
# Sync Sarah's relevant Notion workspace
client.connectors.create(
    type="notion",
    container_tag=USER,
    config={
        "workspace_id": "notion_ws_...",
        "page_filter": ["Engineering Wiki", "Project Alpha Docs"]
    }
)

# Sync her GitHub repos
client.connectors.create(
    type="github",
    container_tag=USER,
    config={
        "repos": ["sarahdev/analytics-pipeline", "sarahdev/shared-libs"],
        "include": ["README.md", "docs/**", "*.py"]
    }
)
```

### 步骤 3：查询时检索个性化上下文

```python
def get_personalized_context(user_id: str, user_query: str) -> str:
    """Build a personalized context block for the LLM."""
    results = client.search.memories(
        query=user_query,
        container_tag=user_id,
        max_tokens=3000
    )
    
    context_parts = []
    for memory in results:
        context_parts.append(f"- {memory.content}")
    
    return "## What I Know About This User\n" + "\n".join(context_parts)

# When Sarah asks: "How should I handle backpressure in my pipeline?"
context = get_personalized_context(USER, "backpressure handling in pipeline")
# Returns relevant memories about her Kafka + ClickHouse stack,
# her preference for concise code examples, and any relevant
# content synced from her Notion docs or GitHub repos.
```

### 步骤 4：对话结束后更新记忆

```python
# After Sarah mentions she's switching from ClickHouse to DuckDB
client.add(
    content="Sarah is migrating the analytics pipeline from ClickHouse to DuckDB "
            "for cost reasons. Migration started February 2026.",
    container_tag=USER
)
# Supermemory auto-detects the contradiction with the earlier ClickHouse mention
# and updates the memory graph accordingly, archiving the old fact.
```

---

## 基准测试

| 基准测试 | 得分 | 排名 |
|----------|------|------|
| **LongMemEval** | 85.2% | 顶级水平 |
| **LoCoMo** | — | 第一名（自行报告） |
| **ConvoMem** | — | 第一名（自行报告） |

LongMemEval 考核的是系统在长对话历史中回忆和推理分散信息的能力。Supermemory 拿下 85.2%，体现了混合检索 + 记忆图谱这套组合拳的实力。

---

## 定价

| 方案 | 价格 | Token 额度 | 功能 |
|------|------|-----------|------|
| **Free** | $0/月 | 100 万 tokens/月 | 核心 API，1 个连接器 |
| **Pro** | $19/月 | 1000 万 tokens/月 | 全部连接器，优先支持 |
| **Scale** | $399/月 | 无限制 | 自定义本体，SLA，专属基础设施 |

---

## 优势

- **一站式平台**：连接器、提取器、图谱、检索全部集成在同一个服务里，不必自己拼凑多个独立组件
- **亚 300 毫秒混合检索**：向量 + 关键词 + 重排序三管齐下，在生产级延迟下同时兼顾精度和召回率
- **矛盾自动化解**：记忆图谱自行处理冲突事实，无需开发者手动介入
- **原生多模态提取**：PDF、图片、音频、视频直接投喂即可，无需额外的预处理管线
- **开源引擎可自托管**：核心开源，想自己部署也没问题；云服务则为生产环境提供全托管支持

## 局限性

- **对云服务有依赖**：完整功能集（尤其是连接器部分）依赖云服务才能发挥
- **图谱构建不够透明**：记忆图谱基本由系统自动生成，低层级方案对本体的可控程度有限
- **基准数据的可信度存疑**：LoCoMo 和 ConvoMem 第一名的成绩均为官方自行披露，评测方法未公开
- **连接器深度参差不齐**：覆盖面确实广，但部分连接器在细粒度同步控制上可能不够灵活
- **入局时间尚短**：以 260 万美元种子轮的体量，跟 Mem0（38K+ stars）或 Letta（40K+ stars）相比，经过大规模生产验证的案例还偏少

## 最佳适用场景

- **希望开箱即用**且需要广泛覆盖各类数据源的团队
- **多模态应用**：需要同时处理文档、图片、音视频等多种内容格式
- **需要快速混合检索**但不想自建独立的向量索引和关键词索引的产品
- **初创及成长期公司**：希望跳过自建记忆基础设施的阶段，直接在成熟平台上起步

---

## 扩展阅读

- [Supermemory 文档](https://docs.supermemory.ai)
- [GitHub 仓库](https://github.com/supermemory-ai/supermemory)
- [记忆图谱技术概览](https://supermemory.ai/blog/memory-graph)
- 相关基准测试论文：[LongMemEval](https://arxiv.org/abs/2410.10813)、[LoCoMo](https://arxiv.org/abs/2402.10790)
