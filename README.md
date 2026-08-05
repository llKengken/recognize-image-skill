<div align="center">

![中文](https://img.shields.io/badge/%E4%B8%AD%E6%96%87-%E7%AE%80%E4%BD%93-2ea44f?style=for-the-badge)
[![English](https://img.shields.io/badge/English-English-0078d7?style=for-the-badge)](README_EN.md)

</div>

<p align="center">
  <img src="assets/logo.png" alt="识别图片技能" width="128">
</p>

<h1 align="center">识别图片技能</h1>

<p align="center">
  支持任意 OpenAI-compatible 视觉 API 的 Codex 识图技能：识别图片、提取文字，并分析截图、图表与表格。
</p>

<p align="center">
  <a href="https://github.com/llKengken/recognize-image-skill/stargazers">
    <img src="https://img.shields.io/github/stars/llKengken/recognize-image-skill?style=for-the-badge&color=2ea44f" alt="GitHub stars">
  </a>
  <img src="https://img.shields.io/badge/OpenAI%20Compatible-Vision-4d6bfe?style=for-the-badge" alt="OpenAI Compatible">
  <img src="https://img.shields.io/badge/Codex-Skill-00e5ff?style=for-the-badge" alt="Codex Skill">
  <img src="https://img.shields.io/badge/Vision-Image%20Recognition-4d6bfe?style=for-the-badge" alt="Vision">
</p>

<p align="center">
  <img src="assets/banner.png" alt="识别图片技能横幅">
</p>

## 功能特性

- 通过 OpenAI 兼容的视觉接口识别图片内容并生成描述。
- 从图片中提取文字，支持截图、扫描件、图表和表格分析。
- 安装后即可被 Codex 自动发现，无需额外安装依赖。
- 支持命令行手动调用，便于测试和自动化流程。
- 支持 PNG、JPG/JPEG、WebP、GIF、BMP、TIFF 图片格式。
- 密钥仅保存在本地 `config.json`，不会进入仓库。

## 快速开始

将 `recognize-image/` 目录复制到 Codex 个人技能目录：

```powershell
Copy-Item -LiteralPath .\recognize-image -Destination "$env:USERPROFILE\.codex\skills" -Recurse
```

然后新开一个 Codex 任务，技能会被自动发现。

要求 Node.js 18 或更高版本。如果 `node` 不在 PATH 中，可以使用 Codex 运行时自带的 Node（可通过 `load_workspace_dependencies` 获取路径）。

### 一键安装提示词

在 Codex 中发送以下提示词，即可自动安装、配置并测试该技能：

```text
请用 skill-installer 从 https://github.com/llKengken/recognize-image-skill 安装 recognize-image 技能到 ~/.codex/skills；读取 recognize-image/config.example.json 创建 recognize-image/config.json 并配置 apiUrl/apiKey；最后用一张图片测试识别。
```

### 文件结构

```text
recognize-image/
├── SKILL.md                 # 技能说明
├── config.example.json      # 配置模板
├── agents/
│   └── openai.yaml          # 界面元数据
└── scripts/
    └── recognize.js         # 视觉 API 调用脚本
```

## 配置

复制配置模板：

```powershell
Copy-Item .\recognize-image\config.example.json .\recognize-image\config.json
```

编辑 `recognize-image/config.json`，在 `apiKey` 字段填入你自己的密钥：

```json
{
  "_comment": "任意 OpenAI-compatible 视觉 API 都可使用。",
  "apiUrl": "https://api.example.com/v1/chat/completions",
  "apiKey": "",
  "model": "your-vision-model",
  "maxOutputTokens": 2000,
  "requestTimeoutMs": 120000,
  "maxRetries": 2
}
```

| 字段 | 说明 | 默认值 |
| --- | --- | --- |
| `apiUrl` | 完整的 chat-completions 接口地址 | `https://api.example.com/v1/chat/completions` |
| `apiKey` | 用于 Bearer 认证的 API 密钥 | 空字符串 |
| `model` | 视觉模型 ID | `your-vision-model` |
| `maxOutputTokens` | 单次请求最大输出 token 数 | `2000` |
| `requestTimeoutMs` | 请求超时时间（毫秒） | `120000` |
| `maxRetries` | 失败重试次数（429/5xx 与网络错误） | `2` |

任意 OpenAI-compatible 视觉 API 都可使用；DeepSeek v4 flash 与 GPT-5.6 仅作为实验/推荐组合示例保留，不是唯一选择。

`config.json` 已被 `.gitignore` 忽略，请勿提交真实密钥。

优先级从高到低：命令行参数（`--api-url`、`--api-key`、`--model`）> 环境变量（`VISION_API_URL`、`VISION_API_KEY`、`VISION_API_MODEL`）> `config.json`。

## Focus 原则

视觉模型是感知与转写层，不是推理层。

- 每次调用都应附带 focus hint：当前任务、需要关注的细节、需要忽略的内容、期望输出格式。
- 只描述或转写图片中可见的内容。
- 不回答任务本身、不推断原因、不下结论、不调试、不提供修复方案。
- 不确定时直接说明不确定，不要猜测。
- 推理、决策与追问由主模型负责。

## 场景提示词模板

使用时替换 `{...}` 为具体内容，并保留 focus 与输出格式要求。

### 截图分析
- 场景：应用、终端、网页或弹窗截图。
- 任务：描述可见界面并转写可见文字。
- Focus：只报告图中可见内容，不推断原因，不提供修复方案。
- 输出：界面用途、主要元素、可见文字、明显状态。
- 提示词：

```text
这是一张截图。请围绕当前任务 {任务} 描述图片。只转写和描述图中可见的内容，不要推断原因、不要下结论、不要提供修复建议。输出格式：界面用途；主要元素；可见文字；明显状态。
```

### OCR 文字提取
- 场景：扫描件、照片、字幕或表单中的文字。
- 任务：按原始阅读顺序逐字转写所有可见文字。
- Focus：只做逐字转写，不翻译、不纠错、不总结。
- 输出：按阅读顺序输出原文；无法确认的字符标注为 `[无法辨认]`。
- 提示词：

```text
请识别这张图片中的所有文字。按原始阅读顺序和换行逐字转写，不翻译、不纠错、不总结。输出格式：按阅读顺序输出原文；无法确认的字符标注为 [无法辨认]。
```

### 图表数据读取
- 场景：图表、图形、表格或仪表盘。
- 任务：读取标签、数值、单位、图例与可见趋势。
- Focus：只报告图中可见的数据，不解释业务含义，不预测未来。
- 输出：每项数据一行 label/value/unit，最后用一句中性描述说明可见趋势。
- 提示词：

```text
请读取这张图表或表格中的数据。列出标签、数值、单位、图例与可见趋势。只转写图中可见的内容，不要解释业务含义，不要预测未来值。输出格式：逐项 label/value/unit，最后用一句中性描述说明可见趋势。
```

### UI 调试
- 场景：UI 截图、报错弹窗或设计与实现对比。
- 任务：枚举可见元素、文字、对齐、颜色、间距与状态。
- Focus：只提供客观视觉事实，不诊断根因，不提供修复方案。
- 输出：元素清单（名称/文字/位置/颜色/状态）与观察到的差异。
- 提示词：

```text
这是 UI 调试截图。请围绕问题 {问题} 枚举可见元素、文字、对齐、颜色、间距与状态。只描述图中可观察到的事实，不要推断根因，不要提供修复方案。输出格式：元素清单（名称/文字/位置/颜色/状态）以及与预期的可见差异。
```

### 文档扫描
- 场景：扫描文档、票据、表单或多段落页面。
- 任务：转写内容并描述结构，包括标题、字段与数值。
- Focus：逐字转写加结构描述，不解释、不补全、不判断真伪。
- 输出：文档类型、章节/标题、字段与值、逐字文本。
- 提示词：

```text
这是扫描文档。请转写内容并描述结构：标题/章节、字段与值、阅读顺序。只转写可见内容，不要解释、不要补全缺失信息、不要判断真伪。输出格式：文档类型；章节/标题；字段与值；逐字文本。
```

### 多步图像推理
- 场景：多图或多区域工作流，主模型需要逐步推理。
- 任务：每次调用只完成一个聚焦的视觉步骤。
- Focus：带上一步观察作为上下文，只返回观察结果，推理链由主模型完成。
- 输出：按步骤返回带区域/对象引用的观察，便于衔接下一步。
- 提示词：

```text
这是多步图像推理的第 {n} 步。上一步上下文：{上一步观察}。请只完成当前视觉步骤：{当前聚焦内容}。不要推断结论、不要跳过步骤、不要回答最终问题。输出格式：观察项（区域/对象/可见事实），并说明与下一步的衔接。
```

## Token/成本对比实验

固定测试图：GitHub 桌面截图，SHA-256 `F46B236364EEC51D164AB2490847106EBF4D70C7E95D6EBCE24DAAC0D84AA29E`。

任务：`提取图中所有可见文字/数据，并回答：图中展示的仓库名和主要技术是什么？`

方案 A（direct）：`gpt-5.6` 直接看图并完成任务。

方案 B（hybrid）：先用 `gpt-5.6` 按 focus hint 只做视觉转写，不推理；再把转写结果与原始任务交给 `deepseek-v4-flash` 完成。

| 轮次 | Direct P/C/T | Hybrid 转写 P/C/T | Hybrid 推理 P/C/T | Hybrid 总 T | 差值 |
| --- | --- | --- | --- | --- | --- |
| 1 | 26122/1792/27914 | 26194/1573/27767 | 1191/128/1319 | 29086 | +1172 |
| 2 | 26122/1358/27480 | 26194/1513/27707 | 1102/92/1194 | 28901 | +1421 |
| 3 | 26122/1109/27231 | 26194/1595/27789 | 1195/57/1252 | 29041 | +1810 |

平均：direct `27541.67` T；hybrid `29009.33` T；hybrid 平均多 `1467.67` T，即 **+5.33%**，本实验未节省 token。

定价来源与假设：

- DeepSeek 官方定价（https://api-docs.deepseek.com/quick_start/pricing）：`deepseek-v4-flash` 输入 `$0.14/1M`（缓存未命中）、`$0.0028/1M`（缓存命中）、输出 `$0.28/1M`。
- 三轮回合中 hybrid 推理侧 DeepSeek 成本合计约 `$0.00057`。
- 视觉服务商未查到公开价格，成本结论按“无法核实价格，仅报告 token 差值”处理。

结论：单图任务下 hybrid 总 token 反而增加约 5.3%，因为视觉输入 token 占绝对大头，额外文本推理又追加了 token；若文本模型单价显著低于视觉模型，hybrid 仍可能降低总成本，但需要真实单价验证。适用边界：适合视觉模型昂贵、文本模型便宜且需要复用转写结果的场景；不适合追求最小 token 的单图问答。

## 使用示例

手动调用：

```powershell
node recognize-image/scripts/recognize.js "path/to/image.png" --prompt "请描述这张图片的内容，并尽量识别图中所有文字。"
```

常用提示词示例：

| 场景 | 提示词 |
| --- | --- |
| 通用描述 | `请描述这张图片的内容。` |
| 文字提取 | `请识别图片中的所有文字，保持原文顺序。` |
| 截图分析 | `这是一张界面截图，请说明界面的用途、主要元素和关键信息。` |
| 图表或表格 | `请读取图表/表格中的数据并总结结论。` |

脚本支持以下参数：

| 参数 | 说明 |
| --- | --- |
| `--prompt` | 自定义识别提示词 |
| `--config` | 指定 `config.json` 路径 |
| `--api-url` | 临时覆盖接口地址 |
| `--api-key` | 临时覆盖 API 密钥，不推荐在命令行直接使用 |
| `--model` | 临时覆盖模型 ID |
| `--max-output-tokens` | 覆盖最大输出 token 数 |
| `--max-size-mb` | 图片大小上限，默认 `10` MB |

## 安全说明

- 本仓库不包含真实 API 密钥或 GitHub Token。
- `recognize-image/config.json` 已被 `.gitignore` 忽略，请勿提交。
- API 密钥只应保存在本地配置或环境变量中，不要写入命令历史、日志或聊天内容。
- 如需临时覆盖密钥，优先使用环境变量，而不是命令行参数。

## 参考启发

- [agent-vision-toolkit](https://github.com/Anionex/agent-vision-toolkit)：focus hint 与“视觉模型只负责看，不替你推理”原则
- [claude-vision-skill](https://github.com/asuojun/claude-vision-skill)：按场景组织识图提示词的方法

## 许可证

本项目采用 MIT License，详见 LICENSE
