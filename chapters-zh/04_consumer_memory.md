# 第四章：消费级 AI 记忆竞赛

当面向开发者的记忆框架在基准测试和架构上展开竞争时，三大 AI 公司已分别向数亿用户推出了记忆功能。它们的方案揭示了在超大规模下对"记忆应当是什么"的不同理念。

---

## OpenAI — ChatGPT 记忆

**发布时间：** 2024 年 2 月（有限范围）→ 2024 年 9 月（全层级开放）→ 2025 年 4 月（重大升级）

### 实际工作原理（逆向工程分析）

研究者 Manthan Gupta 的逆向工程揭示了一个出人意料的简单四层架构。没有向量数据库，没有对对话历史的 RAG，也没有知识图谱：

```
ChatGPT 处理每条消息时接收到的上下文窗口：

[0] System Instructions        — 行为规则
[1] Developer Instructions     — 应用配置
[2] Session Metadata           — 临时性（设备、位置、使用模式）
[3] User Memory                — 永久事实（始终包含）
[4] Recent Conversations       — 过往对话的轻量摘要
[5] Current Session Messages   — 当前对话的完整记录
[6] Your latest message
```

### 各层详解

**第 3 层 — Session Metadata（临时性）**
在会话开始时注入一次，包含设备信息、订阅层级、时区、使用模式。会话结束后消失。

**第 4 层 — User Memory（永久性）**
这些是明确存储的事实：
- "用户的名字是 Sarah"
- "偏好会议记录使用要点列表，底部附操作项"
- "经营一家社区咖啡店"

关键洞察：**这并非自动学习。** ChatGPT 只会在你明确告知时（如"请记住我是素食者"）或它自行决定保存并向你展示时才会存储事实。用户拥有完整的增删改查控制权。

截至 2025 年，Plus 和 Pro 用户可以存储数百条记忆。当容量达到上限时，ChatGPT 会自动降低相关性较低的记忆的优先级进行管理。

**第 5 层 — Recent Conversations（摘要）**
这是令人惊讶的发现。ChatGPT 没有对完整对话历史进行 RAG，而是维护一个轻量列表：

```
1. Dec 8, 2025: "Building a load balancer in Go"
   - asked about connection pooling
   - discussed goroutine patterns
2. Dec 7, 2025: "Fitness routine optimization"
   - wanted advice on recovery days
```

这是以深度换取速度的策略。无需嵌入搜索——摘要是预先计算好并直接注入的。

**第 6 层 — Current Session（滑动窗口）**
当前对话的完整记录，空间不足时进行裁剪。你的永久事实和摘要永远不会被裁剪——它们具有优先权。

### 2025 年 4 月升级：对话历史

最大的更新增加了"参考对话历史"功能——ChatGPT 现在会利用过去对话中的洞察（不仅限于明确保存的记忆）来定制回复。这通过两个可切换的设置实现：
- **参考已保存的记忆：** 始终开启的明确事实
- **参考对话历史：** ChatGPT 从过往对话中收集的洞察

### 为什么选择这种方案？

OpenAI 选择了简洁和速度而非复杂性：
- 无向量数据库延迟
- 无需每次查询计算嵌入
- 可扩展至数亿用户
- 确定性行为（相同记忆，相同回复）
- 用户清楚什么被记住了，并且可以控制

代价是：它无法像拥有完整对话检索的系统那样精准地回答"我们上个月讨论了哪些关于认证的内容？"这类问题。

---

## Anthropic — Claude 记忆

**时间线：** CLAUDE.md（2024）→ Claude Code Memory（2026 年 3 月）→ Chat Memory（2026 年 3 月）→ API Memory Tool（2025–2026）

### 三层架构

Claude 的记忆比 ChatGPT 更为复杂，反映了它作为消费级聊天产品和开发者工具的双重身份：

**第 1 层：CLAUDE.md 文件（静态上下文）**

```
~/.claude/CLAUDE.md          # 全局（所有项目加载）
/project/CLAUDE.md            # 项目根目录（该项目加载）
/project/src/CLAUDE.md        # 子目录（在 src/ 中工作时加载）
```

这些是纯 markdown 文件，Claude Code 在会话开始时自动读取。它们提供稳定的、人类可编辑的上下文：编码规范、架构决策、团队偏好。

**第 2 层：动态记忆文件（自动捕获）**

Claude Code 的自动记忆功能在会话过程中捕获决策和洞察：
- 以带 frontmatter 的 markdown 文件存储（过期日期、标签）
- 按目录结构组织：`~/.claude/memory/shared/`、`~/.claude/memory/agents/{name}/`
- 通过 memsearch 搜索（本地嵌入，无需 API 调用）
- 默认 90 天过期——事实必须被"晋升"才能保留

**第 3 层：API Memory Tool（客户端 CRUD）**

面向使用 Claude API 构建应用的开发者：

```json
{
  "tool": "memory",
  "command": "create",
  "path": "/memories/user_preferences.md",
  "content": "User prefers dark mode and concise answers"
}
```

该记忆工具是**客户端侧**的——Claude 发出工具调用，但由你的应用程序执行操作。这让开发者完全控制存储位置、加密方式和访问模式。

### Claude Chat Memory（消费端）

截至 2026 年 3 月，Claude 的聊天界面可以记住对话中的上下文：
- 对所有层级开放（包括免费用户）
- 生成跨会话携带的记忆摘要
- 在"设置 → 功能"中查看、编辑和删除记忆
- 协作工作会话不携带记忆（请改用上下文文件）

### 导入记忆功能

Claude 和 Gemini 现在都提供"导入记忆"工具——你可以从 ChatGPT 导出记忆，粘贴到 Claude 中，无需丢失上下文即可切换服务商。

### 设计理念

Anthropic 的方案体现了开发者优先的思维：
- **CLAUDE.md 就是文件** — 可版本控制、人类可读、Git 友好
- **无供应商锁定** — 你的记忆存储在你自己的文件系统中
- **渐进式复杂度** — 从文本文件起步，进阶到动态记忆，再到 API 工具
- **客户端控制** — API 记忆工具不在 Anthropic 的服务器上存储任何内容

---

## Google — Gemini 记忆

**时间线：** Past Chats（2025）→ Personal Intelligence（2026 年 1 月）→ Memory Import（2026 年 3 月）

### Personal Intelligence

Gemini 最具特色的记忆功能是连接你的 Google 应用：
- **Gmail：** 过往对话、旅行预订、购物记录
- **Google Photos：** 人物、地点、事件
- **YouTube：** 观看历史、兴趣
- **Google Search：** 搜索模式、兴趣

这与其他记忆系统有本质区别。Gemini 不是从 AI 对话中学习，而是直接接入你现有的数字生活。

### 工作原理

Google 描述了一个解决"上下文填充问题"的系统：

1. 你的数字足迹产生的数据量远超即使 1M token 的上下文窗口能容纳的范围
2. Gemini 有选择性地仅呈现与当前查询最相关的信息
3. 示例："什么轮胎适合我的车？"→ Gemini 检查你的 Gmail 中的购车记录，找到车辆品牌/型号，然后推荐兼容的轮胎

这由 Gemini 3 的 1M token 上下文窗口和高级工具使用能力驱动。该系统不以传统方式存储记忆——它从你的现有数据中*检索*。

### 记忆原语

| 功能 | 描述 |
|------|------|
| **Saved Memories** | 你明确告知 Gemini 记住的事实 |
| **Chat History Reference** | 从过去 Gemini 对话中获取的洞察 |
| **Personal Intelligence** | 实时访问 Gmail、Photos、YouTube、Search |
| **Import Memory** | 通过提示粘贴方式从 ChatGPT/Claude 复制记忆 |
| **Import Chat History** | 上传其他 AI 的 .zip 对话历史记录 |

### 隐私模型

- Personal Intelligence 默认关闭
- 你可以选择连接哪些应用（精细控制）
- Gemini 不会使用你的 Gmail/Photos 数据进行训练
- 引用的数据在查询时处理，不会被存储
- 可随时断开应用连接

### 设计理念

Google 的独特优势在于现有生态系统。ChatGPT 和 Claude 必须从对话中了解你，而 Gemini 可以直接*查看你的数据*。这意味着：
- 更快的个性化（无冷启动问题）
- 更丰富的上下文（你的整个数字历史）
- 但同时：更高的隐私敏感性和更复杂的授权模型

---

## 对比：三种理念

| 维度 | ChatGPT | Claude | Gemini |
|------|---------|--------|--------|
| **核心方案** | 精选事实列表 + 对话摘要 | 文件系统 + 动态文件 + API 工具 | Google 应用集成 + 记忆 |
| **记忆来源** | 仅对话 | 对话 + 文件 + API | Google 应用 + 对话 |
| **存储位置** | 服务端（OpenAI） | 客户端（你的文件系统） | 服务端（Google） |
| **基础设施** | 不可见 | 纯 markdown 文件 | Google 数据基础设施 |
| **开发者控制力** | 低（仅消费端） | 高（API 记忆工具） | 中等（消费端 + API） |
| **冷启动** | 必须从对话中学习 | 加载 CLAUDE.md 文件 | 连接现有 Google 应用 |
| **可移植性** | 通过设置导出 | Git 可追踪的文件 | 导入/导出工具 |
| **隐私模型** | 可选加入，可删除 | 客户端控制 | 精细的应用权限 |

### 这告诉我们什么

消费级 AI 记忆竞赛揭示了一个根本性的张力：**便利性 vs. 控制力**。

- **ChatGPT** 追求极致简洁——四层架构，无基础设施，对大多数用户"开箱即用"
- **Claude** 追求开发者控制——你的记忆、你的文件系统、你选择的存储方式
- **Gemini** 追求生态系统优势——你的 Google 数据本身就是最好的记忆来源

三者都没有使用面向开发者的系统所采用的复杂技术（知识图谱、时序推理、多策略检索）。在消费级规模下，简单快速胜过复杂精密。

这在市场上形成了一个明确的空白，由第三方记忆服务商来填补：当你需要比 ChatGPT/Claude/Gemini 原生提供的*更好*的记忆时，你就会转向 Mem0、Hindsight 或 OpenViking。

---

**下一章：[第五章 — 基准测试与评估](05_benchmarks.md)** — 我们如何衡量一个记忆系统是否真正有效？
