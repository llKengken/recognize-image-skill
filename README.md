# recognize-image

A Codex skill that recognizes images through an external vision-capable model API.
一个通过外部视觉模型 API 识别图片内容的 Codex 技能。

## Introduction / 简介

When Codex cannot view an image natively, this skill calls a configured OpenAI-compatible vision endpoint to describe the image, extract text, and analyze screenshots, charts, and tables.
当 Codex 原生无法查看图片时，该技能会调用配置好的 OpenAI 兼容视觉接口，描述图片内容、提取文字，并分析截图、图表和表格。

## Installation / 安装

Copy the `recognize-image/` folder into your Codex personal skills directory:
将 `recognize-image/` 文件夹复制到 Codex 个人技能目录：

```powershell
Copy-Item -LiteralPath .\recognize-image -Destination "$env:USERPROFILE\.codex\skills" -Recurse
```

Start a new Codex task so the skill is discovered automatically.
新开一个 Codex 任务，技能会被自动发现。

## Configuration / 配置

Copy the template and fill in your API key:
复制配置模板并填入自己的 API Key：

```powershell
Copy-Item .\recognize-image\config.example.json .\recognize-image\config.json
```

Edit `recognize-image/config.json`:
编辑 `recognize-image/config.json`：

```json
{
  "apiUrl": "https://api.daseinai.xyz/v1/chat/completions",
  "apiKey": "YOUR_API_KEY",
  "model": "gpt-5.6",
  "maxOutputTokens": 2000,
  "requestTimeoutMs": 120000,
  "maxRetries": 2
}
```

`config.json` is ignored by `.gitignore`; never commit real keys.
`config.json` 已被 `.gitignore` 忽略，请勿提交真实密钥。

## Manual Usage / 手动调用

```powershell
node recognize-image/scripts/recognize.js "path/to/image.png" --prompt "请描述这张图片的内容，并尽量识别图中所有文字。"
```

Requires Node.js 18 or newer.
需要 Node.js 18 或更高版本。

Supported formats: PNG, JPG/JPEG, WebP, GIF, BMP, TIFF.
支持格式：PNG、JPG/JPEG、WebP、GIF、BMP、TIFF。

## File Structure / 文件结构

```text
recognize-image/
├── SKILL.md                 # Skill instructions / 技能说明
├── config.example.json      # Configuration template / 配置模板
├── agents/
│   └── openai.yaml          # UI metadata / 界面元数据
└── scripts/
    └── recognize.js         # Vision API caller / 视觉 API 调用脚本
```

## Security / 安全说明

This repository never contains the real API key or GitHub token. Add your credentials locally only.
本仓库不会包含真实 API Key 或 GitHub Token，请仅在本地添加自己的凭据。
