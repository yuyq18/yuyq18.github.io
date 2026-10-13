**大模型技术报告时间线与阅读重点**

**先按学习目标找报告**

| 想学习什么 | 首选报告 | 重点位置与阅读问题 |
|---|---|---|
| 预训练与后训练全流程 | Llama 3；Olmo 3 | Llama §3.1、§4.2–4.3；Olmo §3.3–3.6、§4–5：语料怎样变成专项能力？ |
| 数据配比、分阶段训练、去污染 | Olmo 3 | §3.3–3.6，附录 A.2–A.5：怎样设计小规模实验和独立留出集？ |
| 推理 RL 与可验证奖励 | DeepSeek-R1；Kimi k1.5 | R1 §2–3、附录 B.3/B.5；Kimi §2.1–2.3：题目难度、验证可靠性与输出长度怎样配合？ |
| **造题闭环** | **DeepSeek-V3.2**；Kimi K2 | V3.2 §3.2.3、§4.3；K2 §3.1.1：工具/环境 → 任务 → 解答 → 验证 → 筛选如何闭合？ |
| **造题质检** | **MiMo-V2.6** | §4.2.1–4.2.2：规格与测试是否一致？奖励是否稳定？错误解是否也能通过？ |
| Coding 环境自动构建 | GLM-5；Qwen3-Coder-Next | GLM §4.2.1–4.2.2；Qwen §2.1：Issue/PR、容器、参考补丁和 F2P/P2P 测试如何组装？ |
| 扩大任务覆盖与难度 | Kimi K3；MiniMax M2 系列 | K3 §4.2.2–4.2.3；M2 §4.1.3：知识图谱、种子任务与环境合成怎样扩充任务分布？ |
| **Online/Offline Anti-Hack** | **MiMo-V2.6** | §4.2.6、§4.3.2：环境清理、Hack Agent、离线审计和在线奖励纠正怎样协作？ |
| 通过测试之后的代码质量 | MiMo-V2.6 | §4.3：怎样奖励精确、可维护的补丁，抑制吞异常、放宽校验等捷径？ |
| **长程 Coding Agent 的训练系统** | **GLM-5；Kimi K3；MiniMax M2 系列** | GLM §4.1；K3 §5.3；M2 §6.2：长尾、状态持久化、抢占恢复、调度和 KV 复用怎么处理？ |
| 专项专家训练与能力合一 | DeepSeek-V4；Qwen3-Coder-Next | V4 §5.1；Qwen §4.2：专项 RL 为什么分开做，又怎样蒸馏回单一模型？ |
| 多模态与并行 Agent | Kimi K2.5 | §2–3、§4.4、附录 D：视觉与文本怎样联合训练？并行任务如何设计奖励？ |
| Benchmark 选择与自建评测 | Llama 3；GLM-5；MiMo-V2.6 | Llama §5；GLM §6.2；MiMo §5.2：公共基准之外，怎样检验真实工程能力？ |

**建议首轮精读**：Llama 3 → DeepSeek-R1 → Kimi K2 → GLM-5 → MiMo-V2.6。Olmo 3 用作数据与训练配方参考手册，其余按专题查阅。

**小词典**：SFT＝示范学习；RL＝根据任务反馈优化；OPD＝学生生成自己的轨迹、接受教师监督的蒸馏；Rollout＝一次完整尝试；Harness＝组织提示、工具和上下文的 Agent 执行框架；F2P＝修复前失败、修复后通过的测试；P2P＝修复前后都应通过的回归测试。

# 2024.07

## Llama 3 / Llama 3.1（The Llama 3 Herd of Models）

- **代表技术**：大规模高质量数据工程；迭代式 SFT＋DPO；执行反馈驱动的代码数据合成。与其记一种新算法，更值得记住它完整记录了工业训练流程。
- **精简特点**：从网页清洗、去重、数据配比，到代码、数学、多语言、工具使用的专项后训练，都有较具体的做法；适合作为后续报告的共同基线。
- **重点读**：§3.1 语料与配比；§4.2 数据质检；§4.3 专项能力；§5.1.4 污染分析。基础不熟时先读这篇。
- **要带走的问题**：怎样区分“多收数据”和“提高数据有效性”？怎样让生成的代码经过执行验证后成为训练数据？

### Web Data Curation：分层清洗与数据配比

网页经过专用 HTML 提取、URL/document/line 三层去重、规则过滤和 model-based quality filtering。Llama 2 为网页提供质量判断，再训练较轻的 DistilRoBERTa 分类器批量评分；代码与数学有独立的提取和过滤流水线。数据配比结合 scaling experiments、知识覆盖和下游表现确定，不只按各来源的原始规模采样。

### Iterative Post-training：示范与偏好数据随模型迭代

报告采用六轮后训练：每轮用最新模型生成新的合成数据，并收集新的 SFT 与 preference annotations。Reward Model 用于 rejection sampling，SFT 学习筛选后的示范，DPO 学习 chosen/rejected 偏好。人工还可修改优选回答，形成 edited > chosen > rejected 的排序。

### Execution Feedback：生成代码、执行、纠错再入库

从随机代码片段启发出题，再生成解答；用 parser/linter 做静态检查，在容器中生成并运行单元测试。失败时把诊断信息反馈给模型，继续修正。原文明确这些检查是近似的 correctness assessment，不能保证完整正确性；其目的在于改善直接使用模型自身生成数据的效果。

# 2024.12

## DeepSeek-V3

- **代表技术**：MLA、细粒度 MoE、无辅助损失负载均衡、FP8 训练、MTP。MLA/MoE 延续前代；这一版把算法与训练系统结合成高效率方案。
- **精简特点**：低成本训练来自架构、精度、通信、流水线和稳定性共同优化；后训练还利用推理模型生成与筛选专项数据。
- **重点读**：§3 训练基础设施，尤其 FP8 与并行；§4.1 数据构建；§5 SFT、RL 与推理蒸馏。它更适合学习训练系统，而不是造题平台。
- **要带走的问题**：精度降低后如何保证数值稳定？哪些成本来自计算，哪些来自通信与访存？

### MLA：低秩联合压缩 Key 与 Value

MLA 将各 attention head 的内容 Key/Value 压缩进共享 latent：

$$
c_t^{KV}=W^{DKV}h_t,\qquad
k_t^C=W^{UK}c_t^{KV},\qquad
v_t^C=W^{UV}c_t^{KV}.
$$

$h_t$ 是当前 token 的隐藏状态，$c_t^{KV}$ 是较低维的 KV latent。RoPE 对应的 Key 分量单独处理；生成时缓存 latent 与该位置分量，减少完整多头 KV 的存储。MLA 和细粒度/shared-expert MoE 均沿用前代设计。

### Auxiliary-Loss-Free Load Balancing：用偏置调路由

给每个 routed expert 增加偏置 $b_i$，以 $s_{i,t}+b_i$ 选择 Top-K；但专家输出的 gating weight 仍由原始 affinity $s_{i,t}$ 计算。每步降低 overloaded expert 的偏置、提高 underloaded expert 的偏置。报告仍保留权重很小的 sequence-wise auxiliary loss，避免单个序列极端失衡。

### FP8 Training：混合精度与细粒度量化

Linear 的 forward、activation backward、weight backward GEMM 主要使用 FP8；embedding、输出头、MoE gating、normalization、attention 等敏感组件保留较高精度，master weights 与 optimizer states 也保留高精度。对 activation 使用 token-wise $1\times128$ 分组，对 weight 使用 $128\times128$ 分组，并提高累加精度，控制 outlier 带来的量化误差。

### MTP：保留因果链的多 token 预测

每个 MTP depth 将上一深度的表示与后续 token 的 embedding 组合，经独立 Transformer block 预测更远的 token。各深度顺序连接，区别于独立输出头的并行预测；embedding 和 output head 与主模型共享。它增加训练监督密度，部署时可去掉，也可用于 speculative decoding。

# 2025.01

## Kimi k1.5

- **代表技术**：Long-context RL、Partial Rollout、Long2short。核心是扩大推理时计算，并让长轨迹训练在工程上可承受。
- **精简特点**：同时处理题目筛选、难度采样、长度惩罚与训练/推理调度；长推理能力还可迁移到短回答模型。
- **重点读**：§2.1 RL 题目筛选；§2.3.3–2.3.5 长度与采样；§2.6.2 Partial Rollout；§2.6.4 代码沙箱。
- **要带走的问题**：长样本为什么拖慢整批训练？怎样保留未完成轨迹继续生成？这讲的是长 CoT 基础，不能直接等同于长程 Coding Agent。

### Long-context RL：问题筛选、难度采样与长度控制

RL prompt set 强调 diversity、balanced difficulty 和 accurate evaluability，主要覆盖数学、代码与视觉推理。训练逐步扩大可用的推理长度；sampling strategy 可依据历史成功率提高较难问题的采样概率。优化采用 online policy mirror descent 的变体，结合相对旧策略的 KL 正则；不要直接把它称为 GRPO。

### Partial Rollouts：跨迭代续写长轨迹

每轮 rollout 设固定输出 token budget；超过预算的未完成响应存入 Replay Buffer，在后续迭代继续。旧片段直接复用，仅继续生成新的部分，训练时部分片段可不参与 loss。异步 workers 在长轨迹尚未结束时继续处理其他任务，减少单条长样本占用资源和拖慢迭代的问题。

### Long2short：把长推理能力转移给短回答

报告比较 model merging、Shortest Rejection Sampling、DPO 和 long2short RL。Shortest Rejection Sampling 对同题多次采样，选最短的正确回答做 SFT；DPO 使用最短正确解作为 positive，并选择更长的回答作为 negative。目标是在有限 test-time token budget 下保留更多推理能力。

## DeepSeek-R1

- **代表技术**：R1-Zero 的直接 RL、GRPO、可验证奖励；R1 的冷启动与分阶段训练；推理蒸馏。GRPO 沿用既有研究，R1 展示了其大规模推理训练效果。
- **精简特点**：用可检查的结果推动推理行为，再补可读性、语言一致性和通用能力；帮助理解 SFT、RL、轨迹筛选各自承担什么任务。
- **重点读**：本地修订版 §2–3；附录 B.3 数据配方、B.5 Reward Hacking。主文之后优先读附录，里面的工程信息更具体。
- **要带走的问题**：什么题能可靠自动判分？奖励上涨为什么可能伴随能力下降？冷启动、规则奖励与模型评分怎样分工？

### GRPO：用同题输出组计算相对优势

对一个问题采样 $G$ 个输出，以组内 reward 的均值和标准差计算 advantage：

$$
A_i=\frac{r_i-\operatorname{mean}(r_1,\ldots,r_G)}
{\operatorname{std}(r_1,\ldots,r_G)}.
$$

组内比较替代独立 critic 的价值估计，再结合 policy-ratio clipping 与 KL 项优化策略。GRPO 来自此前研究，R1 用它训练 R1-Zero 与 R1；这里的 $r_i$ 是第 $i$ 条输出的奖励。

### R1-Zero：不经初始 SFT 的推理 RL

从 DeepSeek-V3-Base 直接开始 RL，主要使用 accuracy reward 与 format reward：数学检查最终答案，代码依靠编译与测试，格式约束规定思考和答案的组织方式。原文观察到推理长度增长、反思和重新检查等行为，也报告了可读性较差与语言混杂的问题。

### R1：冷启动 → 推理 RL → 拒绝采样 SFT → 再次 RL

先用少量 cold-start 示范建立可读的思考格式，再做推理 RL；之后 rejection sampling 收集 reasoning 数据，并与 non-reasoning 数据联合 SFT，最后做第二阶段 RL。推理任务继续依靠可验证反馈；通用任务引入 model-based rewards，helpfulness 重点评价最终 summary，harmlessness 检查完整响应。

# 2025.07

## Kimi K2

- **代表技术**：MuonClip / QK-Clip；大规模 Agentic Data Synthesis；可验证奖励与 Self-Critique Rubric Reward 的结合。
- **精简特点**：预训练侧提升稳定性与 token 利用率，后训练侧规模化构建工具、任务和交互示范；从单题推理进一步走向工具 Agent。
- **重点读**：§3.1.1 工具使用数据合成；§3.2.1–3.2.2 验证器与开放任务奖励；§3.3.4 Agentic Rollout。§2.2 可补数据改写的作用。
- **要带走的问题**：如何从工具集合产生多样任务？哪些任务可以规则判分，哪些需要 rubric？“工具接口正确”与“业务任务完成”怎样分别检查？

### MuonClip / QK-Clip：约束 attention logits 爆炸

MuonClip 将 Muon、weight decay、RMS matching 与 QK-Clip 结合。QK-Clip 监控各 head 的最大 attention logit $S_{\max}^h$，计算缩放因子：

$$
\gamma_h=\min\left(1,\frac{\tau}{S_{\max}^h}\right).
$$

$\tau$ 是阈值。对 MLA，head-specific 内容 Query/Key 各缩放 $\sqrt{\gamma_h}$，rotary Query 缩放 $\gamma_h$，共享 rotary Key 不变，以免影响其他 heads。它调整权重来控制 logits，不能等同于梯度裁剪。

### Agentic Data Synthesis：工具 → Agent/任务 → 轨迹

#### 三阶段合成与角色分工

先汇集真实与合成 tool specifications；从工具库采样 tool-set，生成使用这些工具的 Agent、任务和 rubrics；最后生成工具调用轨迹。轨迹生成由执行 Agent、User Agent、Tool Simulator 协作，再由 Judge Agent 筛选。原文明确借鉴已有合成工作与 ACEBench，不宜称为首次提出 Agent 造题。

### Self-Critique Rubric Reward：让可验证反馈改进 critic

K2 actor 对通用 prompt 生成回答，K2 critic 根据 core、prescriptive 与人工编写的 rubrics 做 pairwise evaluation。critic 的初始能力由 SFT 建立；训练中再用 verifiable-reward prompts 的 on-policy rollouts 更新它。这样将客观可验证任务的信号用于校准开放任务的偏好判断。

# 2025.12

## DeepSeek-V3.2

- **代表技术**：DSA（DeepSeek Sparse Attention）、Thinking in Tool-Use、大规模 Agent 任务合成。
- **精简特点**：把推理放进多轮工具交互；用可执行的环境和工具产生“难解、易验证”任务。相比 K2，适合集中看推理过程与工具轨迹怎样衔接。
- **重点读**：**§3.2.3 学造题闭环**：环境/工具构建 → 任务与解答生成 → 验证筛选；§4.3 看合成任务的效果；§3.2.1 看思考上下文管理。
- **要带走的问题**：如何制造需要多步工具调用、又有明确正确终态的任务？合成任务是否促进了不同工具环境下的泛化？

### DSA：Lightweight Indexer 与 Top-K KV 选择

lightning indexer 用少量 heads 对历史位置打分，将各 head 的 ReLU Query–Key 相似度加权求和；核心 attention 只读取最高分位置的 KV。在已有 MLA 模型上通过 continued training 引入该机制。稀疏化减少主要 attention 计算，但 indexer 仍需对可见历史评分，不能直接认为所有开销都变成常数。

### Thinking Context Management：工具返回时保留推理

新 user message 到来时清除历史 reasoning；只有 tool calls/results 追加时，保留 reasoning，使模型不必每轮重新推导。即使移除思考，历史工具调用与结果仍保留。把工具输出包装成 user messages 的 Harness 会改变这一行为，因此交互协议也影响训练能力的发挥。

### General Agent Synthesis：工具受限的解答与可执行验证器

#### 从简单任务逐步增加难度

先在 sandbox database 中生成或收集数据，再实现任务专用工具。构造简单任务及 Python solution/verifier；solution 只能调用工具或做逻辑计算，不能直接访问数据库。验证通过后逐步加难，同时更新 solution/verifier；工具不足时扩充工具。最终保留 non-zero pass@100 的任务，形成可执行的 environment/tools/task/verifier 组合。

#### Search 与 Code 分别采用不同闭环

Search 从长尾实体生成 QA，多种配置的回答 Agent 试答，verification agent 多次检验，保留 ground truth 正确且候选答案均错误的难题。Code 则从 Issue/PR 对构建环境，统一输出 JUnit 测试结果，要求 gold patch 产生有效 F2P 且没有 P2F 回归。

## Olmo 3（含 Olmo 3.1 修订内容）

- **代表技术**：完整开放的 Model Flow；Dolma 数据配方、Dolci 后训练数据；分阶段预训练与 OlmoRL。代表性价值是可追溯、可复现的训练过程。
- **精简特点**：公开数据、代码、阶段检查点与配方；比只开放权重的报告更适合学习数据实验、能力取舍和去污染。本地版本扩展了 3.1 内容。
- **重点读**：**§3.3–3.6 学数据与评测工程**；§4.2–4.4 学 SFT/DPO/RL 分工；附录 A.2–A.5、A.7 查数据与污染处理细节。
- **要带走的问题**：如何用小规模实验选择数据混合？怎么划分预训练、mid-training、长上下文数据？评测集怎样保持独立？

### Model Flow：开放模型发展的完整路径

Model Flow 包含各阶段数据、训练代码、检查点和依赖，而不只包含最终权重。Olmo 3 分出 Base、Think、Instruct、RL-Zero 路线，分别支持基础能力、长思考、直接回答和从 base 出发的 RL 实验；可以在中间阶段研究数据与后训练的关系。

### Stage-wise Data Curriculum：分阶段使用不同语料

Base 训练分为 pretraining、midtraining、long-context extension。midtraining 使用 Dolma 3 Dolmino Mix，集中强化数学、代码、知识与后续后训练所需的能力；long-context 阶段使用 Longmino Mix。数据来源、配比与处理方法随阶段明确区分，避免把所有语料看成一个固定混合池。

### OlmoBaseEval 与 OlmoRL：实验判断和优化相互配合

OlmoBaseEval 按 capability 组织 task clusters，为小规模模型建立 proxy metrics，并增加噪声任务样本量或移除不可靠任务。Think 后训练依次使用 SFT、preference tuning 和 OlmoRL；OlmoRL 基于 GRPO，吸收 DAPO、Dr. GRPO 等改进，混合 verifiable 与 LM-judge rewards。开放配方便于检查各阶段的实际增量。

# 2026.02

## Kimi K2.5

- **代表技术**：原生图文联合训练、Zero-Vision SFT、Agent Swarm、PARL（Parallel-Agent Reinforcement Learning）。
- **精简特点**：在 K2 基础上联合优化文本与视觉；将并行 Agent 的分工与效率放进训练目标，而不只是推理时临时开启多个 Agent。
- **重点读**：§2 图文联合训练；**§3 学并行 Agent 与奖励设计**；§4.4 RL 与细粒度评分；附录 D 统一 Agentic RL 环境。
- **要带走的问题**：任务是否真的值得并行？怎样抑制“多开 Agent 却没有有效分工”？视觉任务为什么需要超出最终答案的评分信号？

### Zero-Vision SFT：用文本示范激活视觉工具使用

在已经完成 text–vision joint pretraining 的模型上，用 text-only SFT 建立视觉 Agent 的 RL 冷启动能力。图像操作由 IPython 中的程序操作代理，之后再用视觉 RL 提高可靠性。“Zero-Vision”描述的是这一 SFT 阶段，不表示模型未用视觉数据预训练；跨模态迁移的解释在原文中属于可能原因。

### PARL：训练 Orchestrator、冻结 Subagents

orchestrator 学习是否、何时和如何分解任务并行执行；subagents 来自固定的中间检查点，训练时冻结，它们的输出被视为 environment observations。这样避免高层调度与低层执行同时变化带来的 credit assignment 和稳定性问题。

#### Reward：鼓励探索并行，也要求子任务完成

$$
r_{\mathrm{PARL}}(x,y)=\lambda_1r_{\mathrm{parallel}}
+\lambda_2r_{\mathrm{finish}}+r_{\mathrm{perf}}(x,y).
$$

instantiation reward 缓解只使用单 Agent 的 serial collapse；sub-agent finish rate 抑制只创建很多子 Agent 的 spurious parallelism；task-level outcome 衡量最终任务质量。训练过程中 $\lambda_1,\lambda_2$ 逐渐降至零，最终优化目标回到任务表现。

## GLM-5

- **代表技术**：Agentic Engineering、异步 Agent RL、slime、DSA。DSA 延续已有路线；最值得关注的是长程训练与工程环境的组织方式。
- **精简特点**：从“生成代码”转向执行完整软件工程任务；扩展 SWE、终端、搜索等环境，并处理长尾、陈旧样本和跨轮缓存。
- **重点读**：**§4.2.1–4.2.2 学环境自动构建**；**§4.1 学异步长程 RL**；§3.6 slime；§6.2.1、§6.2.3 学 Agent-as-a-Judge 和长程任务评测。
- **要带走的问题**：Issue/PR 怎样转成可运行任务？F2P/P2P 怎样抽取？异步采样为何带来 off-policy 问题？公共榜单之外怎样评估真实开发？

### Asynchronous Agent RL：生成与训练解耦

inference engine 持续生成，轨迹达到阈值便送给 training engine；二者运行在不同 GPU 上，周期性同步权重。各任务将 rollout/reward logic 实现成独立服务，由 Multi-Task Rollout Orchestrator 调节采样比率，轨迹统一成 message-list。同步长尾减少后，需要进一步处理不同 policy version 引入的 off-policy 问题。

### SWE Environment Pipeline：Issue/PR 到可验证容器

先用规则与 LLM 筛选真实 Issue/PR，区分 bug fixing、feature、refactoring 等任务；基于 RepoLaunch 自动分析安装与依赖，构建执行环境和测试命令。再生成 language-aware log parser，抽取 F2P 与 P2P 测试，检查修复有效且既有行为未回归。

### Terminal Task Synthesis：实例化与迭代修复

#### Seed-based：Draft → Implementation → Refinement

从真实终端/SWE 种子生成任务草稿；construction agent 转成 Harbor 格式的说明、Docker 环境与测试；refine agent 按 rubrics 检查构建、说明/测试一致性和捷径，再迭代修复。

#### Web-based：构造 Agent 先执行自验证

筛选代码相关高质量网页，按主题与难度分层采样；把网页与 Harbor 规范交给 coding agent，要求生成完整任务并运行 validation script。失败则诊断、修改，只有通过 self-verification 的任务入库。

## Qwen3-Coder-Next

- **代表技术**：可执行任务的大规模 Agentic Training、仓库级 Mid-training、合成 Bug、专项专家与蒸馏；以较小激活参数规模强化 Coding Agent。
- **精简特点**：两条造题路线互补：真实 PR 构建任务；在已有可执行仓库中注入受控 Bug。自然仓库数据与交互轨迹配合，训练跨文件理解和错误恢复。
- **重点读**：**§2.1 学 Coding 造题和环境验证**；§3.1.1–3.1.2 学自然/合成数据分工；§4.2 学专家整合；附录 A.3 看 packing 实践。
- **要带走的问题**：怎样确认合成 Bug 真实触发测试、回退后可修复？怎样清除与 benchmark 重叠的任务？仓库数据如何避免被截断？

### Verifiable Task Synthesis：真实 PR 与受控 Bug 两条路线

真实 PR 拆成 buggy state、fix 和 test patch；构建 Agent 生成 Docker 与 verifier，质量审查移除含糊任务、环境不一致和测试不对齐的问题。另一条路线沿用已有可执行仓库，通过 model rewriting、semantic perturbation、规则变换注入 Bug；只保留确实使测试失败、回退后恢复的实例，再生成 issue 描述，并排除直接触发 Bug 的测试文件以减少捷径。

### Agent-centric Mid-training：仓库结构与交互轨迹共同学习

自然数据以 repo-level code、PR、code review 和 text–code grounding 为重点；使用多种仓库序列化形式学习跨文件关系。合成 QA 和 Agent 轨迹用于贴近工作流，但报告强调以较少的必要合成数据保留通用性与响应多样性。随后训练 web、UX、QA、SWE 专家，并通过 expert distillation 合成一个模型。

# 2026.04

## DeepSeek-V4（Pro / Flash）

- **代表技术**：CSA＋HCA 压缩注意力、mHC、Muon、百万 token 上下文；专项专家 RL 后通过 OPD 合一。
- **精简特点**：相比 V3/V3.2，优先解决百万上下文的计算与 KV 成本，并将推理、代码、Agent 等能力的专项训练与蒸馏系统化。
- **重点读**：**§5.1.1–5.1.2 学专家训练与能力合一**；§5.2.3–5.2.5 学可抢占 rollout、百万上下文 RL 与沙箱；§3.5 看缓存存储。
- **要带走的问题**：专项专家为何可能比一次联合 RL 更易优化？教师调度、轨迹持久化与沙箱服务怎样支撑大规模训练？

### mHC：将残差映射约束为 Doubly Stochastic Matrix

多 residual streams 经 read、residual、write 三种映射更新：

$$
X_{l+1}=B_lX_l+C_lF_l(A_lX_l),\qquad
B_l\mathbf1=\mathbf1,\quad \mathbf1^TB_l=\mathbf1^T,\quad B_l\ge0.
$$

$A_l$ 读取多支流，$C_l$ 写回层输出，$B_l$ 混合残差。mHC 用双随机约束控制 $B_l$ 的传播性质；原文指出其谱范数不超过 1，矩阵集合又对乘法封闭，帮助多层信号与梯度保持稳定。

### CSA＋HCA：压缩序列后再选择全局信息

CSA 将每 $m$ 个 token 的 KV 压成一个 entry，再用 DSA 选择 Top-K compressed entries；HCA 使用远大于 $m$ 的压缩率，形成更少的全局 entries。两种全局分支交错配置，并结合局部 SWA：CSA 保留较细粒度的稀疏检索，HCA 降低超长上下文的全局读取成本。

### Multi-teacher OPD：在学生自己的轨迹上整合专家

先对不同领域做 specialist SFT/RL，再让学生在自己生成的轨迹上学习对应教师的分布。原文写作：

$$
\mathcal L_{\mathrm{OPD}}(\theta)=
\sum_{i=1}^{N}w_iD_{\mathrm{KL}}(\pi_\theta\Vert\pi_{E_i}).
$$

$\pi_{E_i}$ 为领域教师，$w_i$ 为权重。使用 reverse KL 并从 student policy 采样保持 on-policy；V4 采用 full-vocabulary logits distillation，降低仅用采样 token 估计 KL 的梯度方差。

# 2026.05

## MiniMax M2 系列（M2 → M2.7）

- **代表技术**：Terminal-Gym、Forge Agent-native RL、Windowed FIFO、Prefix Tree Merging；M2.7 探索模型参与自身训练与 Harness 改进。
- **精简特点**：从真实 SWE、专家设计 AppDev、自动终端任务三条路线构建 Coding 数据；办公任务按产物与工作流设计奖励，提供不同于其他家的工程对照。
- **重点读**：**§4.1.3 学 Terminal-Gym 造题**；§4.2 学办公任务与产物奖励；**§6.2 学 Forge 与长轨迹调度**；§7.2 看自我改进的具体范围。
- **要带走的问题**：环境和验证器怎样自动生成并验收？不同长度 rollout 怎样排队？共享前缀怎样减少重复计算？

### Terminal-Gym：由真实编程问答合成终端任务

从 Stack Overflow 筛选有 accepted answer、质量合格、可脚本化且适合 Linux/Docker 的线程，标注可验证性、环境要求和复杂度，再改写为结构化 task schema。

#### 三阶段：Environment/Test → Query Evolution → Difficulty Calibration

第一阶段生成 Dockerfile 与测试，执行失败则反馈并修复；第二阶段控制性移除提示、路径等线索，用统一测试检验不同描述变体；第三阶段参考 solver 成功率和环境修复次数校准难度，筛掉过于简单的任务。各描述变体共享对底层行为的检验，减少测试只适配某一种题面的问题。

### Forge / Windowed FIFO：受限乱序缓解长尾

严格 FIFO 易被长轨迹阻塞，完成即取又会使 batch 偏向短而简单的任务。Windowed FIFO 只允许消费队首起长度为 $W$ 的窗口内已完成轨迹，窗口内 greedy、窗口外保持顺序；随着队首任务被消费，窗口推进。$W$ 控制 throughput 与 distributional consistency 的权衡，是 Forge 长程 RL 调度的一部分。

### Prefix Tree Merging：训练共享前缀只算一次

把具有相同前缀的多个 completions 组织成 prefix tree，forward 只计算一次公共部分，再分支计算各响应；之后按元数据还原，并独立计算各样本的 loss。报告将其描述为与 independent-sample training 数学等价的计算重组，用于减少多轮长上下文训练的重复前缀计算。

# 2026.07

## Kimi K3

- **代表技术**：KDA（Kimi Delta Attention）、Attention Residuals、Stable LatentMoE；百万上下文 Agentic RL。
- **精简特点**：从 K2 系列进一步改造序列/层间信息流；任务侧以知识图谱控制知识覆盖和合成分布，系统侧支持多 Harness、长轨迹和沙箱状态持久化。
- **重点读**：**§4.2.2 学知识图谱引导造题**；§4.2.3 看可验证任务；§4.2.1 学统一白盒环境；**§5.3 学百万 token Agent RL 基建**。
- **要带走的问题**：怎样主动覆盖冷门知识而非重复热门题？如何把“素材覆盖”变成“任务覆盖”？执行框架变化时怎样保持模型泛化？

### KDA：Channel-wise Forget Gate 与 Delta-rule 写入

单个 attention head 的 recurrent state 更新为：

$$
S_t=(I-\beta_tk_tk_t^T)\operatorname{Diag}(\alpha_t)S_{t-1}
+\beta_tk_tv_t^T,\qquad \widetilde o_t=S_t^Tq_t.
$$

$\alpha_t$ 为逐 key-channel 的 retention factor，$\beta_t$ 控制写入强度。先衰减旧状态，再做 delta-rule 更新；chunk 内可并行、chunk 间递归。K3 将 KDA 与 Gated MLA 混合使用，同时保留压缩状态处理与全局 attention 两条路径。

### Attention Residuals：沿网络深度做选择性读取

Full AttnRes 用 layer-specific learnable pseudo-query，对前面各层输出经 RMSNorm 后做 softmax 加权，代替均匀累加。K3 的 Block AttnRes 将层划分成 blocks，block 内求和、block 间 attention，减少保留所有层输出带来的内存和流水线通信负担。

### Knowledge-Graph-Guided Synthesis：先组织知识覆盖，再造任务

从粗粒度 seed concepts 出发，Agent 搜索并递归扩展 DAG；添加概念前先查已有节点、复用等价概念，边从粗指向细，足够 atomic 时停止扩展。按领域与粒度采样节点或相关节点组合，利用关键词和祖先上下文检索真实材料，再指定 task type 合成任务。知识图谱用于覆盖与采样，不直接等同于任务验证器。

# 2026.08

## Qwen3.8-Flash-Next

- **代表技术**：Gated DeltaNet＋QSA、Gated Residual、N-gram Embedding、Muon；架构、效率和训练稳定性联合消融。
- **精简特点**：把历史压缩、稀疏全局读取和低计算成本的记忆扩容结合起来；强调 loss、下游表现、硬件成本与稳定性需要一起评估。
- **重点读**：§2 各模块消融；**§3.2–3.3 学超参数缩放和稳定性压测**；§4 评测。适合学习架构实验方法，造题和 Anti-Hack 优先读其他篇。
- **要带走的问题**：loss 改善为什么未必带来下游收益？架构变化为什么需要重新拟合学习率与 batch？怎样设计能暴露不稳定性的压力测试？

### GDN＋QSA：压缩历史与 Micro-block Sparse Attention

Gated DeltaNet 层以 recurrent state 处理历史；部分层保留全局 attention，并在 continued pretraining 时替换成 QSA。QSA 的 indexer 将不重叠 key blocks 做 average pooling，再施加 partial RoPE、按 micro-block 打分。选中的块索引扩展成 sparse mask，核心 attention 读取块内原始 KV，不能把 indexer 的压缩等同于主 KV 压缩。

### Gated Residual：多支流的动态读写

将 residual stream 扩成四支流，并研究 read、write、mixing operators 的表达能力与成本。最终用 elementwise gating 控制支流的读写；重要消融是先区分“只增加支流宽度”的收益，再判断增加动态算子是否值得。报告也检查仅看 pretraining loss 未显现、却在 post-training 暴露的退化。

### N-gram Embedding 与 Hyperparameter Scaling

短 N-grams 作为 lookup keys，经 multi-head hashing 查表，再用 contextual gating 注入 residual stream。确定性寻址支持 host-memory offloading 和异步 prefetch；嵌入表扩大后 loss 仍下降，但下游表现会饱和。新架构与 Muon 改变最优 learning rate/batch，需要重新拟合并验证 scaling law；实验中直接使用目标 batch 可避免无收益的 batch-size warmup。

# 2026.09

## DeepSeek-V4.1-Flash

- **代表技术**：CED、CSA2 跨层 KV/索引复用、FP4 主 KV、SWA Bounded Replay、Single-Pass mHC、Engram、DSpark。
- **精简特点**：相较 V4-Flash，全局 KV 约降至 1/4、持久缓存约降至 1/8，长输入 prefill 计算近乎减半；后训练收益主要来自数据、任务、环境扩展，报告明确没有新增后训练算法。
- **重点读**：**§5.1.1 学自动造题与持续复审**；§5.1.3 DSec 沙箱；§5.2 异步训练；§5.3.4–5.3.5 跨 Harness 与多 Agent。§3.2 看缓存工程。
- **要带走的问题**：任务被新模型反复使用后怎样重新审计？怎样用真实失败案例反哺造题？存储、重算与响应质量怎样权衡？

### CED：Decoder Global KV 由 Encoder 输出产生

前半网络为 causal encoder，后半为 decoder；decoder 的 global KV 与压缩权重由最后 encoder hidden state 投影：

$$
C_l=H_{L/2}W_l^{KV},\qquad Z_l=H_{L/2}W_l^Z,\qquad l>L/2.
$$

长 prompt 不必对全部 token 执行完整 decoder forward，但各层 SWA KV 仍来自本层 hidden state，需要补做局部 replay。结合 bounded replay 后，长输入 prefill 主要计算前半网络。

### CSA2＋FP4：跨层共享与缓存精度共同压缩

#### Full、Reindex、Reuse 三种静态模式

Full 产生 global KV/indexer K 和新 Top-K；Reindex 共享已有 KV/K，使用自己的 indexer Q 重新选择；Reuse 同时共享 KV 与最新 Top-K，跳过 indexing。所有模式仍保留自己的 main Q 和 SWA KV。Decoder 的 hierarchical indexer 让后续 Reindex 只搜索首个索引器建立的候选池。

#### FP4 Main KV Cache

后训练中对 main KV 引入 QAT；量化在 RoPE 后进行，attention 前反量化。FP4 主要节省存储，并非要求以 FP4 完成 attention 矩阵乘法；对精度更敏感的 SWA KV 保留 FP8。

### SWA Bounded Replay：用近似状态替代昂贵的精确恢复

精确恢复 $L$ 层 SWA 理论上需要重放 $L\,n_{\mathrm{win}}$ 个 token；bounded replay 只处理最近 $n_{\mathrm{win}}$ 个，并将 SWA 可见范围截断在重放片段内。Encoder 路径处理缓存命中但局部状态缺失，Decoder 路径补齐 CED 的局部 KV。重建状态不是数学等价的精确恢复；原文在测试中观察到很小的质量影响。

### 高效扩展：Single-Pass mHC、Engram、DSpark

Single-Pass mHC 让本层读取上一 block 产生的 mixing coefficients，消除阻碍单遍融合的数据依赖；Mega-mHC 减半原实现的激活内存流量。Engram 用 N-gram 条件查表补充记忆能力，并移除原设计的短卷积。DSpark 单次 forward 并行起草五个位置，以 Markov head 建模依赖，按 acceptance confidence 与系统吞吐动态选择验证长度。

### Task Synthesis：难度、正确性与全生命周期复审

每个任务定义为 problem/environment/verification system 三元组，difficulty 与 correctness 作为改进造题的反馈。Coding 任务由环境构建、不同 Agent 试做、独立审查与修复组成；任务进入新的 RL run 后，新轨迹继续用于 re-auditing。通用任务还利用真实交互接口、失败案例和 mocked tools 重建工作流。

## MiMo-V2.6（Pro / Flash）

- **代表技术**：You Only RL Once、GRS/GAR 组内 Agentic Grading、多 Harness、异步 Partial Rollout、Router Freezing、MOPD2。
- **精简特点**：扩大 RL 的 batch、任务环境和 grader 计算；把“通过测试”进一步细分为实现与行为质量。对你的学习目标，这是造题、奖励和 Anti-Hack 最集中的一篇。
- **重点读**：**§4.2.1–4.2.2 学造题质检**：规格/测试对齐、四次试做、八次重复测试、误判审计；**§4.2.6 学 Anti-Hack**；**§4.3 学在线/离线质量评分**；§5.5 失败分析；§6 长程混合任务基建。
- **要带走的问题**：是否存在“通过测试的错误解”和“被测试拒绝的正确解”？环境清理、Hack Agent、离线审计与在线奖励置零怎样构成持续闭环？

### Task Quality：Accuracy 与 Robustness of Supervision

Accuracy 检查 task specification 与 tests 是否一致，避免未写入题面的隐藏要求或不足的覆盖。每题收集四次 rollout，审查 Agent 对照说明、测试、参考补丁、提交和轨迹：通过但不正确是潜在 false positive，正确却失败是潜在 false negative。Robustness 要求参考补丁前后 F2P/P2P 行为在八次 rerun 中稳定，排除 flaky tests。

### Reward Hacking Mitigation：环境、探测与训练期审计

#### Environment Preparation 与 Hack Agent

移除参考补丁留下的日志、二进制、bytecode、缓存及较新 Git 历史，限制访问外部修复；Hack Agent 探测已知和新捷径，反馈清理与访问限制，再重新测试。另将早期作弊案例改写为明确反思并修正行为的 mid-training 示例。

#### Offline Auditing 与 Online Reward Correction

训练中持续离线审计轨迹，发现新的环境弱点；在线 groupwise grader 确认使用外部或泄漏答案时，将 effective reward 置零，再重算组内统计和 advantage。这两条流程配合更新环境与限制，而不是一次性命令黑名单。

### GRS：由多条离线轨迹生成可复用 Rubrics

比较同题多条 offline rollouts，生成 solution rubrics 与 behavior rubrics，之后逐条评价新 rollout。将测试、实现质量、行为质量相乘：

$$
R_i=R_i^{\mathrm{test}}\,S_i^{\mathrm{sol}}\,S_i^{\mathrm{beh}}.
$$

测试失败仍为零；通过的解按质量区分。Rubrics 以任务要求为依据，不能把某一成功解的偶然实现当成所有解必须满足的要求。

### GAR：Online Groupwise Grading 与优势重分配

对包含成功与失败的 rollout group，grader 联合检查轨迹、补丁、仓库和测试，沿解法适合性、实现精确性、改动最小性、副作用和代码规范排序。当通过集合 $\mathcal P$ 非空时，未加上限的重分配为：

$$
A_i=R_i-\bar R,\qquad \mathcal P=\{i:R_i=1\},\qquad
\lambda=\frac{\sum_{j\in\mathcal P}A_j}
{\sum_{j\in\mathcal P}f_jA_j},
$$

$$
A_i'=\begin{cases}\lambda f_iA_i,&i\in\mathcal P,\\A_i,&i\notin\mathcal P.\end{cases}
$$

$f_i\in(0,1]$ 先降低低质量通过解的权重，$\lambda$ 恢复通过组的总 positive advantage。实际实现限制缩放上限，并重新中心化全部 advantage；不能将“总量严格保持”的性质直接套到加上限后的更新。
