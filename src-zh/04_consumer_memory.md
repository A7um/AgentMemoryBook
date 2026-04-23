# 第四章：消费级 AI 记忆竞赛

开发者记忆框架还在基准测试和架构设计上你追我赶的时候，三大 AI 巨头已经悄然把记忆功能推到了数亿用户面前。它们各自的方案，折射出对"记忆应该长什么样"截然不同的产品哲学。

---

## OpenAI — ChatGPT 记忆

**发布时间：** 2024 年 2 月（小范围内测）→ 2024 年 9 月（全层级开放）→ 2025 年 4 月（重大升级）

### 实际工作原理（逆向工程分析）

研究者 Manthan Gupta 的逆向工程揭开了一个出乎意料的简洁架构——四层结构，没有向量数据库，没有对话历史的 RAG，也没有知识图谱：

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

### 逐层拆解

**第 3 层 — Session Metadata（临时性）**
会话开始时注入一次，包含设备信息、订阅等级、时区、使用习惯等。会话结束即丢弃。

**第 4 层 — User Memory（永久性）**
这里存放的是明确记录的事实：
- "用户的名字是 Sarah"
- "偏好会议记录使用要点列表，底部附操作项"
- "经营一家社区咖啡店"

关键发现：**这不是自动学习。** ChatGPT 只在两种情况下存储事实——你主动要求（比如"请记住我是素食者"），或者它自主判断值得保存并提示你确认。用户对记忆拥有完整的增删改查权限。

截至 2025 年，Plus 和 Pro 用户可以存储数百条记忆。存满之后，ChatGPT 会自动降低不太相关的记忆的优先级来腾出空间。

**第 5 层 — Recent Conversations（摘要）**
这一层的设计颇为出人意料。ChatGPT 并没有对完整对话历史做 RAG 检索，而是维护了一份轻量的摘要列表：

```
1. Dec 8, 2025: "Building a load balancer in Go"
   - asked about connection pooling
   - discussed goroutine patterns
2. Dec 7, 2025: "Fitness routine optimization"
   - wanted advice on recovery days
```

这是一个典型的以深度换速度的策略——不需要嵌入搜索，摘要预先计算好直接注入即可。

**第 6 层 — Current Session（滑动窗口）**
当前对话的完整记录，空间不够时会被裁剪。但你的永久事实和摘要永远不会被裁掉——它们享有最高优先级。

### 2025 年 4 月升级：对话历史加持

这次升级的最大亮点是"参考对话历史"功能——ChatGPT 不再局限于明确保存的记忆，还会从过往对话中提炼洞察来优化回复。具体通过两个开关控制：
- **参考已保存的记忆：** 常驻开启的明确事实
- **参考对话历史：** ChatGPT 从历史对话中提炼出的背景信息

### 为什么是这套方案？

OpenAI 选择了简洁和速度，而非炫技式的复杂架构：
- 没有向量数据库带来的额外延迟
- 不需要每次查询都计算嵌入
- 可以平滑扩展到数亿用户
- 行为确定可预测（相同记忆 → 相同回复）
- 用户一眼就能看清哪些信息被记住了，而且随时可以修改

代价也很明显：面对"我们上个月聊了哪些关于认证的内容？"这类问题，它远不如拥有完整对话检索能力的系统准确。

---

## Anthropic — Claude 记忆

**时间线：** CLAUDE.md（2024）→ Claude Code Memory（2026 年 3 月）→ Chat Memory（2026 年 3 月）→ API Memory Tool（2025–2026）

### 三层架构

Claude 的记忆体系比 ChatGPT 更加精密，这和它的双重角色密不可分——既是消费级聊天产品，也是开发者的生产力工具：

**第 1 层：CLAUDE.md 文件（静态上下文）**

```
~/.claude/CLAUDE.md          # 全局（所有项目加载）
/project/CLAUDE.md            # 项目根目录（该项目加载）
/project/src/CLAUDE.md        # 子目录（在 src/ 中工作时加载）
```

就是纯粹的 markdown 文件，Claude Code 启动时自动读取。它们提供稳定的、人类可直接编辑的上下文：编码规范、架构决策、团队偏好，一目了然。

**第 2 层：动态记忆文件（自动捕获）**

Claude Code 的自动记忆功能会在会话过程中捕获关键决策和洞察：
- 以带 frontmatter 的 markdown 文件存储（含过期日期、标签）
- 按目录层级组织：`~/.claude/memory/shared/`、`~/.claude/memory/agents/{name}/`
- 通过 memsearch 搜索（本地嵌入，无需调用 API）
- 默认 90 天过期——事实必须被主动"晋升"才能长期保留

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

这个记忆工具是**客户端侧**的——Claude 发出工具调用请求，但真正执行操作的是你的应用。存在哪里、怎么加密、谁能访问，全部由开发者说了算。

### Claude Chat Memory（消费端）

截至 2026 年 3 月，Claude 的聊天界面也支持跨会话记忆了：
- 所有层级均可使用（免费用户也不例外）
- 自动生成跨会话的记忆摘要
- 在"设置 → 功能"中查看、编辑和删除记忆
- 协作工作会话不携带记忆（这种场景请用上下文文件）

### 导入记忆功能

Claude 和 Gemini 如今都支持"导入记忆"——你可以把 ChatGPT 的记忆导出后粘贴进来，换服务商不用从零开始。

### 设计理念

Anthropic 的方案处处透着开发者优先的气质：
- **CLAUDE.md 本质上就是文件** — 可以用 Git 管理版本，人类直接读写，天然对版本控制友好
- **零供应商锁定** — 记忆就在你自己的文件系统里
- **渐进式复杂度** — 从纯文本文件起步，进阶到动态记忆，再到 API 工具，按需升级
- **客户端掌控一切** — API 记忆工具不会在 Anthropic 服务器上留存任何数据

---

## Google — Gemini 记忆

**时间线：** Past Chats（2025）→ Personal Intelligence（2026 年 1 月）→ Memory Import（2026 年 3 月）

### Personal Intelligence

Gemini 最独到的一手棋，是把记忆直接挂接到你已有的 Google 应用上：
- **Gmail：** 往来邮件、旅行预订、购物记录
- **Google Photos：** 人物、地点、事件
- **YouTube：** 观看记录、兴趣偏好
- **Google Search：** 搜索习惯、关注领域

这和其他记忆系统走的完全不是一条路。Gemini 不需要从 AI 对话中慢慢了解你——它直接接入你现有的数字生活，一步到位。

### 工作原理

Google 描述了一套解决"上下文填充问题"的方案：

1. 你的数字足迹产生的数据量，远非 1M token 的上下文窗口所能装下
2. Gemini 有选择性地只抽取与当前问题最相关的信息
3. 举个例子："什么轮胎适合我的车？"→ Gemini 翻你的 Gmail 找到购车记录，锁定车型，然后推荐兼容的轮胎

背后的支撑是 Gemini 3 的 1M token 上下文窗口和出色的工具调用能力。这套方案并不以传统方式存储记忆——它从你已有的数据中*按需检索*。

### 记忆原语

| 功能 | 描述 |
|------|------|
| **Saved Memories** | 你明确告诉 Gemini 要记住的事实 |
| **Chat History Reference** | 从过往 Gemini 对话中提炼的背景信息 |
| **Personal Intelligence** | 实时访问 Gmail、Photos、YouTube、Search |
| **Import Memory** | 通过粘贴提示词方式从 ChatGPT/Claude 迁移记忆 |
| **Import Chat History** | 上传其他 AI 的 .zip 对话历史记录 |

### 隐私模型

- Personal Intelligence 默认关闭
- 你可以精确控制连接哪些应用
- Gemini 不会用你的 Gmail/Photos 数据做训练
- 引用的数据仅在查询时处理，不做持久化存储
- 随时可以断开应用连接

### 设计理念

Google 的杀手锏在于它现成的生态体系。ChatGPT 和 Claude 得通过对话一点一点认识你，而 Gemini 上来就能*直接看你的数据*。这意味着：
- 个性化来得更快（完全没有冷启动问题）
- 上下文更加丰富（你整个数字生活的积累都在）
- 但硬币的另一面是：更高的隐私敏感度和更复杂的授权模型

---

## 三种理念正面交锋

| 维度 | ChatGPT | Claude | Gemini |
|------|---------|--------|--------|
| **核心方案** | 精选事实列表 + 对话摘要 | 文件系统 + 动态文件 + API 工具 | Google 应用集成 + 记忆 |
| **记忆来源** | 仅对话 | 对话 + 文件 + API | Google 应用 + 对话 |
| **存储位置** | 服务端（OpenAI） | 客户端（你的文件系统） | 服务端（Google） |
| **底层基础设施** | 不可见 | 纯 markdown 文件 | Google 数据基础设施 |
| **开发者掌控度** | 低（仅消费端） | 高（API 记忆工具） | 中等（消费端 + API） |
| **冷启动** | 得从对话中慢慢学 | 加载 CLAUDE.md 即刻就绪 | 连接已有 Google 应用 |
| **可移植性** | 通过设置导出 | Git 可追踪的文件 | 导入/导出工具 |
| **隐私模型** | 可选加入，可删除 | 客户端全权控制 | 精细的应用级权限 |

### 背后的信号

消费级 AI 记忆这场仗，归根结底是**便利性与控制力**之间的博弈。

- **ChatGPT** 押注极致简洁——四层架构，不堆基础设施，绝大多数用户开箱就能用
- **Claude** 押注开发者主权——你的记忆、你的文件系统、你说了算怎么存
- **Gemini** 押注生态围城——你在 Google 里攒下的数据，本身就是最强的记忆来源

耐人寻味的是，三家巨头都没有采用开发者记忆框架里那些重型武器（知识图谱、时序推理、多策略检索）。在亿级用户的规模下，简单快速永远比复杂精妙更实际。

这也恰恰在市场上撕开了一道口子——当你需要比 ChatGPT/Claude/Gemini 原生方案*更强*的记忆能力时，Mem0、Hindsight、OpenViking 这些第三方框架就有了用武之地。

---

**下一章：[第五章 — 基准测试与评估](05_benchmarks.md)** — 怎么衡量一个记忆系统到底好不好用？
