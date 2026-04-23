# Nuggets（全息记忆）— 深入解析

**GitHub:** [nicholasgriffintn/nuggets](https://github.com/nicholasgriffintn/nuggets) (233 stars) | **库:** [hrr-memory](https://www.npmjs.com/package/hrr-memory) | **许可证:** MIT | **语言:** 纯 TypeScript | **依赖:** 零

> 一个基于全息缩减表示（HRR）的 AI 记忆系统：通过循环卷积将事实压缩为固定大小的复数向量，实现亚毫秒级召回——不需要外部服务，不需要数据库，不需要 API 调用。

---

## 架构概览

Nuggets 走了一条与本书所有其他记忆系统都截然不同的路。它不依赖向量数据库、知识图谱或托管 API，而是用了一种来自认知科学的数学技巧——**全息缩减表示（HRR）**。核心思想很直觉：通过循环卷积把结构化事实"压"进一个固定大小的向量里。无论你往里塞多少条事实，向量的维度始终不变。

```mermaid
graph TB
    subgraph "HRR Memory Model"
        direction TB
        
        subgraph "Encoding (Binding)"
            KEY[Key Vector<br/>e.g., 'lives_in']
            VAL[Value Vector<br/>e.g., 'paris']
            CONV["⊛ Circular Convolution<br/>(Binding Operation)"]
            KEY --> CONV
            VAL --> CONV
            CONV --> PAIR[Bound Pair Vector]
        end
        
        subgraph "Storage (Superposition)"
            PAIR --> SUM["⊕ Vector Addition<br/>(Superposition)"]
            EXIST[Existing Memory Vector] --> SUM
            SUM --> MEM["Memory Trace<br/>(Fixed-size vector)<br/>Contains ALL facts"]
        end
        
        subgraph "Retrieval (Unbinding)"
            QUERY_KEY[Query Key<br/>e.g., 'lives_in']
            MEM --> CORR["⊛⁻¹ Circular Correlation<br/>(Unbinding Operation)"]
            QUERY_KEY --> CORR
            CORR --> NOISY[Noisy Result Vector]
            NOISY --> CLEAN[Clean-up Memory<br/>Match to known items]
            CLEAN --> RESULT["Result: 'paris'<br/>confidence: 0.98"]
        end
    end

    style CONV fill:#9b59b6,color:#fff
    style SUM fill:#e67e22,color:#fff
    style CORR fill:#2ecc71,color:#fff
    style MEM fill:#e74c3c,color:#fff
```

---

## 全息缩减表示的工作原理

### 核心原理

HRR 的精妙之处在于利用了一个数学性质：**循环卷积**可以把两个向量"绑"在一起，而它的近似逆运算——**循环相关**——可以把它们"解绑"。更妙的是，多对绑定结果可以通过简单的向量加法**叠加**到同一个向量中，而每一对仍然能被单独恢复出来。

打个比方：就像在同一张底片上做多次曝光，每张照片的信息都叠在一起，但只要你知道"滤镜"（也就是键向量），就能把特定的那张照片还原出来。

```mermaid
graph LR
    subgraph "Step 1: Assign Random Vectors"
        A["alice = [0.2, -0.5, 0.8, ...]"]
        B["lives_in = [-0.3, 0.7, 0.1, ...]"]
        C["paris = [0.6, -0.2, 0.4, ...]"]
        D["works_at = [0.1, 0.3, -0.6, ...]"]
        E["acme = [-0.4, 0.5, 0.2, ...]"]
    end
    
    subgraph "Step 2: Bind Facts"
        F["lives_in ⊛ paris = [bound₁]"]
        G["works_at ⊛ acme = [bound₂]"]
    end
    
    subgraph "Step 3: Superpose into Memory"
        H["alice_memory = bound₁ + bound₂"]
    end
    
    subgraph "Step 4: Query"
        I["alice_memory ⊛⁻¹ lives_in ≈ paris"]
        J["alice_memory ⊛⁻¹ works_at ≈ acme"]
    end
    
    A --> F
    B --> F
    C --> F
    A --> G
    D --> G
    E --> G
    F --> H
    G --> H
    H --> I
    H --> J
```

### 数学运算

| 运算 | 符号 | 作用 | 实现方式 |
|-----------|--------|---------|----------------|
| **绑定** | ⊛ | 把键和值"焊"在一起 | 频域中的循环卷积（先 FFT，再逐元素相乘） |
| **叠加** | ⊕ | 把多个绑定对合并到一个向量里 | 逐元素加法——就这么简单 |
| **解绑** | ⊛⁻¹ | 用键把对应的值"掏"出来 | 循环相关（与近似逆做卷积） |
| **清理** | — | 把带噪声的结果匹配到已知词条 | 与词汇表做余弦相似度，选最接近的 |

### 为什么叫"全息"？

这个名字借用了光学全息图的类比。全息图能将三维图像编码为二维干涉图案——即使只取全息图的一小块碎片，也能重建出整幅图像的模糊版本。HRR 与此异曲同工：多个事实被编码进同一个向量，每个事实都能被恢复，只是带有一定噪声。存储的事实越多，恢复时的噪声也越大——就像全息图碎片越小，还原出的图像越模糊。

---

## 代码示例

### `hrr-memory` 基本用法

```javascript
import { HRRMemory } from 'hrr-memory';

// Create a memory with default vector dimensions
const mem = new HRRMemory();

// Store facts as subject-relation-object triples
mem.store('alice', 'lives_in', 'paris');
mem.store('alice', 'works_at', 'acme');
mem.store('alice', 'speaks', 'french');
mem.store('bob', 'lives_in', 'london');
mem.store('bob', 'works_at', 'globex');

// Query: what does alice live in?
const result = mem.query('alice', 'lives_in');
console.log(result);
// { object: 'paris', confidence: 0.98, alternatives: [...] }

// Query: where does bob work?
const result2 = mem.query('bob', 'works_at');
console.log(result2);
// { object: 'globex', confidence: 0.95, alternatives: [...] }

// Query: what language does alice speak?
const result3 = mem.query('alice', 'speaks');
console.log(result3);
// { object: 'french', confidence: 0.93, alternatives: [...] }
```

### 单实体多事实记忆

```javascript
import { HRRMemory } from 'hrr-memory';

const mem = new HRRMemory({ dimensions: 1024 });

// Store a rich profile
mem.store('sarah', 'role', 'engineer');
mem.store('sarah', 'language', 'python');
mem.store('sarah', 'language', 'rust');
mem.store('sarah', 'editor', 'neovim');
mem.store('sarah', 'company', 'acme');
mem.store('sarah', 'project', 'analytics_pipeline');
mem.store('sarah', 'preference', 'dark_mode');

// Retrieve specific facts
console.log(mem.query('sarah', 'editor'));
// { object: 'neovim', confidence: 0.91 }

console.log(mem.query('sarah', 'company'));
// { object: 'acme', confidence: 0.89 }

// Note: multiple values for 'language' may return the most recent
// or highest-confidence one. Confidence degrades as more facts are added.
console.log(mem.query('sarah', 'language'));
// { object: 'rust', confidence: 0.72, alternatives: [{ object: 'python', confidence: 0.68 }] }
```

### 与 LLM 智能体集成

```javascript
import { HRRMemory } from 'hrr-memory';
import { readFileSync, writeFileSync, existsSync } from 'fs';

class AgentMemory {
  constructor() {
    this.hrr = new HRRMemory({ dimensions: 2048 });
    this.recallCount = {};  // track how often facts are recalled
    this.permanentPath = './MEMORY.md';
  }

  store(subject, relation, object) {
    this.hrr.store(subject, relation, object);
    console.log(`Stored: ${subject} ${relation} ${object}`);
  }

  recall(subject, relation) {
    const result = this.hrr.query(subject, relation);
    
    if (result && result.confidence > 0.5) {
      const key = `${subject}:${relation}:${result.object}`;
      this.recallCount[key] = (this.recallCount[key] || 0) + 1;

      // Memory promotion: facts recalled 3+ times → permanent context
      if (this.recallCount[key] >= 3) {
        this.promoteToPermament(subject, relation, result.object);
      }
      
      return result;
    }
    
    return null;
  }

  promoteToPermament(subject, relation, object) {
    const line = `- **${subject}** ${relation} **${object}**\n`;
    const existing = existsSync(this.permanentPath) 
      ? readFileSync(this.permanentPath, 'utf-8') 
      : '# Permanent Memory\n\n';
    
    if (!existing.includes(line.trim())) {
      writeFileSync(this.permanentPath, existing + line);
      console.log(`PROMOTED to MEMORY.md: ${subject} ${relation} ${object}`);
    }
  }
}

// Usage
const memory = new AgentMemory();

memory.store('user', 'prefers', 'dark_mode');
memory.store('user', 'language', 'python');
memory.store('user', 'project', 'ml_pipeline');

// First recall — count: 1
memory.recall('user', 'prefers');    // { object: 'dark_mode', confidence: 0.96 }

// Second recall — count: 2
memory.recall('user', 'prefers');    // { object: 'dark_mode', confidence: 0.96 }

// Third recall — PROMOTED to MEMORY.md
memory.recall('user', 'prefers');    // Writes to MEMORY.md
```

---

## 记忆晋升管线

Nuggets 有一套独特的**记忆晋升**机制：当某条事实被反复召回（默认阈值 3 次），它会从易失性的 HRR 存储"毕业"，晋升到持久化的 `MEMORY.md` 文件。这个文件可以直接写入智能体的系统提示词，确保最重要的记忆永不丢失。

```mermaid
graph LR
    subgraph "Volatile Layer (HRR)"
        HRR["HRR Memory<br/>─────────<br/>All facts stored as<br/>superposed vectors<br/>Sub-ms recall<br/>Degrades with volume"]
    end
    
    subgraph "Promotion Gate"
        COUNT["Recall Counter<br/>─────────<br/>Track: subject:relation:object<br/>Threshold: 3 recalls"]
    end
    
    subgraph "Permanent Layer (MEMORY.md)"
        MD["MEMORY.md<br/>─────────<br/># Permanent Memory<br/>- user prefers dark_mode<br/>- user language python<br/>─────────<br/>Included in system prompt<br/>Always in context"]
    end
    
    HRR -->|"recall()"| COUNT
    COUNT -->|"count < 3"| HRR
    COUNT -->|"count >= 3"| MD
    MD -->|"System prompt injection"| LLM[LLM Context]

    style HRR fill:#3498db,color:#fff
    style COUNT fill:#e67e22,color:#fff
    style MD fill:#2ecc71,color:#fff
```

### 晋升机制为什么重要

HRR 记忆虽然速度飞快，但本质上是有损的——存入的事实越多，置信度就越低。晋升机制巧妙地化解了这个矛盾：智能体真正离不开的那些事实（不断被召回的那些），会被转移到无损的纯文本格式，从此不再受 HRR 容量退化的影响。

| 属性 | HRR（易失层） | MEMORY.md（持久层） |
|----------|----------------|----------------------|
| **召回速度** | 亚毫秒 | 文件读取（< 1ms） |
| **容量** | 约 100 个事实后开始退化 | 无限（纯文本） |
| **准确度** | 70–98%（取决于事实密度） | 100%（精确文本匹配） |
| **持久性** | 仅在内存中（重启即丢） | 磁盘文件（永久保存） |
| **上下文使用** | 不进入 LLM 上下文 | 始终随系统提示词注入 |

---

## 性能特征

### 基准测试

| 操作 | 延迟 | 备注 |
|-----------|---------|-------|
| **存储（绑定 + 叠加）** | < 0.1ms | 基于 FFT，每维 O(n log n) |
| **查询（解绑 + 清理）** | < 0.5ms | 相关运算 + 词汇表扫描 |
| **存储 10 个事实** | ~0.97 平均置信度 | 几乎完美 |
| **存储 50 个事实** | ~0.85 平均置信度 | 依然靠谱 |
| **存储 100 个事实** | ~0.72 平均置信度 | 可用，偶有噪声 |
| **存储 200+ 个事实** | < 0.60 平均置信度 | 该启动晋升了 |

### 与向量搜索的对比

```mermaid
graph TB
    subgraph "HRR Memory"
        HRR_STORE["Store: O(n log n)<br/>per fact"]
        HRR_QUERY["Query: O(n log n)<br/>per query"]
        HRR_SPACE["Space: O(n)<br/>fixed-size vector"]
        HRR_DEP["Dependencies: ZERO"]
        HRR_LAT["Latency: < 1ms"]
    end
    
    subgraph "Vector Database"
        VEC_STORE["Store: O(n log n)<br/>per document + indexing"]
        VEC_QUERY["Query: O(log n)<br/>with HNSW index"]
        VEC_SPACE["Space: O(n × d)<br/>grows with documents"]
        VEC_DEP["Dependencies: Server + client"]
        VEC_LAT["Latency: 5-50ms"]
    end
```

| 维度 | HRR Memory | 向量数据库 |
|-----------|-----------|-----------------|
| **延迟** | 亚毫秒 | 通常 5–50ms |
| **依赖** | 零——纯数学运算 | 需要服务器 + 客户端 + 网络 |
| **存储** | 固定大小的向量，不随事实数量增长 | 随文档数线性扩张 |
| **容量** | ~100 个事实保持高置信度 | 轻松支撑数百万文档 |
| **查询方式** | 精确的键值查找 | 语义相似度匹配 |
| **部署形态** | 进程内运行，零基础设施 | 需要独立的数据库服务 |
| **成本** | $0 | 数据库托管费用 |
| **大规模表现** | 优雅退化（置信度平滑下降） | 稳定可靠（前提是嵌入质量好） |

### HRR 胜出的场景

- **轻量级智能体**：需要快速、本地的记忆能力，不想搞基础设施
- **边缘/嵌入式部署**：环境里根本没有外部服务可以调用
- **小规模事实集**（每实体 < 100 个事实）：置信度足够高
- **结构化键值数据**：天然适合主语-关系-宾语三元组
- **隐私敏感场景**：数据绝不能发往外部 API

### 向量搜索胜出的场景

- **大规模知识库**：文档数以千计乃至更多
- **语义查询**：需要"查找相似内容"而非精确键查找
- **非结构化内容**：段落、文档、对话记录
- **对准确度零容忍的生产系统**：无论规模大小都需要稳定表现

---

## `hrr-memory` 独立库

`hrr-memory` 是一个自包含的 TypeScript 库，封装了完整的 HRR 操作：

```javascript
import { HRRMemory } from 'hrr-memory';

// Configuration options
const mem = new HRRMemory({
  dimensions: 2048,    // Vector dimensionality (higher = more capacity)
  cleanupMethod: 'cosine',  // 'cosine' or 'dot' for clean-up matching
});

// Core API: store subject-relation-object triples
mem.store('subject', 'relation', 'object');

// Core API: query by subject and relation
const result = mem.query('subject', 'relation');
// → { object: string, confidence: number, alternatives: Array }

// Get all known subjects
const subjects = mem.getSubjects();

// Get all known relations for a subject
const relations = mem.getRelations('alice');

// Export/import memory state
const state = mem.export();
const restored = HRRMemory.import(state);
```

### API 参考

| 方法 | 描述 | 返回值 |
|--------|-------------|---------|
| `store(subject, relation, object)` | 绑定一个事实并叠加到记忆中 | `void` |
| `query(subject, relation)` | 解绑并经清理后检索结果 | `{ object, confidence, alternatives }` |
| `getSubjects()` | 列出所有已知主语 | `string[]` |
| `getRelations(subject)` | 列出某主语下的所有关系 | `string[]` |
| `export()` | 序列化当前记忆状态 | `object`（JSON 安全） |
| `HRRMemory.import(state)` | 从序列化状态恢复记忆 | `HRRMemory` |

---

## 分步实战：轻量级本地智能体记忆

### 场景

你要做一个完全本地运行的 CLI 编程助手——不调 API、不连数据库、不碰云服务。但你希望它能记住用户的偏好和项目上下文，跨会话保持连贯。

### 步骤 1：设置记忆

```javascript
import { HRRMemory } from 'hrr-memory';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const MEMORY_FILE = './agent_memory.json';
const PERMANENT_FILE = './MEMORY.md';

// Load existing memory or create new
let mem;
if (existsSync(MEMORY_FILE)) {
  const state = JSON.parse(readFileSync(MEMORY_FILE, 'utf-8'));
  mem = HRRMemory.import(state);
  console.log('Loaded existing memory');
} else {
  mem = new HRRMemory({ dimensions: 2048 });
  console.log('Created new memory');
}
```

### 步骤 2：从对话中学习

```javascript
function learnFromMessage(userMessage) {
  // Simple extraction patterns (in production, use an LLM)
  const patterns = [
    { regex: /I (?:use|prefer|like) (\w+)/i, relation: 'prefers' },
    { regex: /(?:my|the) project is (\w+)/i, relation: 'project' },
    { regex: /I'm (?:a|an) (\w+)/i, relation: 'role' },
    { regex: /I work (?:at|for) (\w+)/i, relation: 'company' },
  ];
  
  for (const { regex, relation } of patterns) {
    const match = userMessage.match(regex);
    if (match) {
      mem.store('user', relation, match[1].toLowerCase());
      console.log(`Learned: user ${relation} ${match[1].toLowerCase()}`);
    }
  }
}

// User says various things over time
learnFromMessage("I use neovim for everything");
// Learned: user prefers neovim

learnFromMessage("I'm an engineer at Acme");
// Learned: user role engineer
// Learned: user company acme

learnFromMessage("My project is analytics_pipeline");
// Learned: user project analytics_pipeline
```

### 步骤 3：召回记忆，构建上下文

```javascript
function buildContext() {
  const context = [];
  const relations = ['prefers', 'project', 'role', 'company', 'language'];
  
  for (const relation of relations) {
    const result = mem.query('user', relation);
    if (result && result.confidence > 0.6) {
      context.push(`User ${relation}: ${result.object} (confidence: ${result.confidence.toFixed(2)})`);
    }
  }
  
  // Include permanent memory if it exists
  if (existsSync(PERMANENT_FILE)) {
    context.push('\nPermanent memories:');
    context.push(readFileSync(PERMANENT_FILE, 'utf-8'));
  }
  
  return context.join('\n');
}

console.log(buildContext());
// User prefers: neovim (confidence: 0.94)
// User project: analytics_pipeline (confidence: 0.91)
// User role: engineer (confidence: 0.88)
// User company: acme (confidence: 0.85)
```

### 步骤 4：跨会话持久化

```javascript
// Save memory state to disk before exit
function saveMemory() {
  const state = mem.export();
  writeFileSync(MEMORY_FILE, JSON.stringify(state, null, 2));
  console.log('Memory saved to disk');
}

// Call on exit
process.on('beforeExit', saveMemory);
```

---

## 优势

- **零依赖**：纯 TypeScript 实现，不依赖任何外部服务、API 密钥或数据库
- **亚毫秒性能**：基于 FFT 的运算，快到感知不到延迟
- **天然隐私保护**：所有数据留在进程内，一个字节都不会离开你的机器
- **数学根基扎实**：HRR 源自认知科学，是经过数十年研究验证的理论框架
- **自动记忆晋升**：高频召回的事实会自动升级到持久存储，重要信息不会丢
- **存储占用极小**：不管存了多少条事实，向量大小始终固定——不存在存储膨胀问题
- **完全离线可用**：断网环境也能正常工作

## 局限性

- **容量有天花板**：单实体超过约 100 个事实后，置信度明显下滑——不适合大型知识库
- **只支持键值结构**：只能存储主语-关系-宾语三元组，自由文本没法塞进去
- **不支持语义搜索**：查询时必须给出精确的键，没法问"和 X 类似的内容"
- **事实越多越嘈杂**：叠加运算本质上有损，事实密度越高，检索噪声越大
- **不含抽取能力**：需要自行将自然语言拆解为三元组（或借助 LLM 做抽取）
- **社区规模小**：233 个 GitHub stars——属于小众项目，生态和社区支持有限
- **仅限 JS/TS**：没有 Python、Go 或其他语言的 SDK

## 最佳适用场景

- **轻量级本地智能体**：需要记忆但不想背负基础设施包袱
- **CLI 工具和脚本**：跨调用记住用户偏好，提升交互体验
- **边缘/嵌入式 AI**：没有网络、没有外部服务的受限环境
- **隐私优先的应用**：数据绝对不能离开设备
- **快速原型与实验**：一个自包含的包就能玩转结构化记忆
- **教学用途**：理解全息记忆的原理在实践中是如何运作的

---

## 延伸阅读

- [Nuggets GitHub 仓库](https://github.com/nicholasgriffintn/nuggets)
- [hrr-memory npm 包](https://www.npmjs.com/package/hrr-memory)
- [Holographic Reduced Representations (Plate, 1995)](https://doi.org/10.1109/72.377968) — 奠基性论文
- [Vector Symbolic Architectures Survey](https://arxiv.org/abs/2001.11797) — HRR 的更广泛理论背景
- [Kanerva's Hyperdimensional Computing](https://link.springer.com/article/10.1007/s12559-009-9009-8) — 相关方法
