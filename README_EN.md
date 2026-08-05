<div align="center">

[![中文](https://img.shields.io/badge/%E4%B8%AD%E6%96%87-%E7%AE%80%E4%BD%93-2ea44f?style=for-the-badge)](README.md)
![English](https://img.shields.io/badge/English-English-0078d7?style=for-the-badge)

</div>

<p align="center">
  <img src="assets/logo.png" alt="Image Recognition Skill" width="128">
</p>

<h1 align="center">OpenAI-Compatible Image Recognition Skill</h1>

<p align="center">
  An image recognition skill for Codex that works with any OpenAI-compatible vision API: describe images, extract text, and analyze screenshots, charts, and tables.
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
  <img src="assets/banner.png" alt="Image Recognition Skill banner">
</p>

## Features

- Recognizes and describes images through an OpenAI-compatible vision endpoint.
- Extracts text from images and analyzes screenshots, scanned documents, charts, and tables.
- Auto-discovered by Codex after installation, with no extra package setup.
- Supports direct command-line invocation for testing and automation.
- Supports PNG, JPG/JPEG, WebP, GIF, BMP, and TIFF image formats.
- Keeps credentials only in the local `config.json`, never in the repository.

## Quick Start

Copy the `recognize-image/` folder into your Codex personal skills directory:

```powershell
Copy-Item -LiteralPath .\recognize-image -Destination "$env:USERPROFILE\.codex\skills" -Recurse
```

Start a new Codex task; the skill is discovered automatically.

Requires Node.js 18 or newer. If `node` is not on PATH, use the Node bundled with the Codex runtime (its path can be resolved through `load_workspace_dependencies`).

### One-prompt Install

Send the following prompt to Codex to install, configure, and test the skill automatically:

```text
Use skill-installer to install the recognize-image skill from https://github.com/llKengken/recognize-image-skill into ~/.codex/skills; create recognize-image/config.json from config.example.json with your apiUrl/apiKey; test with an image.
```

### File Structure

```text
recognize-image/
├── SKILL.md                 # Skill instructions
├── config.example.json      # Configuration template
├── agents/
│   └── openai.yaml          # UI metadata
└── scripts/
    └── recognize.js         # Vision API caller
```

## Configuration

Copy the configuration template:

```powershell
Copy-Item .\recognize-image\config.example.json .\recognize-image\config.json
```

Edit `recognize-image/config.json` and put your own key in the `apiKey` field:

```json
{
  "_comment": "Any OpenAI-compatible vision API can be used.",
  "apiUrl": "https://api.example.com/v1/chat/completions",
  "apiKey": "",
  "model": "your-vision-model",
  "maxOutputTokens": 2000,
  "requestTimeoutMs": 120000,
  "maxRetries": 2
}
```

| Field | Description | Default |
| --- | --- | --- |
| `apiUrl` | Full chat-completions endpoint | `https://api.example.com/v1/chat/completions` |
| `apiKey` | API key for Bearer authentication | Empty string |
| `model` | Vision-capable model ID | `your-vision-model` |
| `maxOutputTokens` | Maximum output tokens per request | `2000` |
| `requestTimeoutMs` | Request timeout in milliseconds | `120000` |
| `maxRetries` | Retry count for 429/5xx and network errors | `2` |

Any OpenAI-compatible vision API can be used. DeepSeek v4 flash and GPT-5.6 are kept only as experimental/recommended example combinations, not required defaults.

`config.json` is ignored by `.gitignore`; never commit real credentials.

Precedence from highest to lowest: CLI flags (`--api-url`, `--api-key`, `--model`) > environment variables (`VISION_API_URL`, `VISION_API_KEY`, `VISION_API_MODEL`) > `config.json`.

## Focus Principle

The vision model is a perception and transcription layer, not a reasoning layer.

- Always include a focus hint: the current task, which details matter, what to ignore, and the expected output format.
- Describe or transcribe only what is visible in the image.
- Do not answer the task itself, draw conclusions, infer causes, debug, or propose fixes.
- Report uncertainty instead of guessing.
- The main agent owns reasoning, decisions, and follow-up questions.

## Scenario Prompt Templates

Replace `{...}` with the concrete details and keep the focus and output requirements.

### Screenshot Analysis
- Scenario: screenshot of an app, terminal, webpage, or dialog.
- Task: describe the visible interface and transcribe visible text.
- Focus: report only what is visible; do not infer causes or propose fixes.
- Output: interface purpose; main elements; visible text; notable state.
- Prompt:

```text
This is a screenshot. Focus on this task: {task}. Transcribe and describe only what is visible in the image. Do not infer causes, draw conclusions, or suggest fixes. Output format: interface purpose; main elements; visible text; notable state.
```

### OCR Text Extraction
- Scenario: image contains text such as a scan, photo, caption, or form.
- Task: transcribe every visible character in original reading order.
- Focus: verbatim transcription only; no translation, correction, or summary.
- Output: text blocks in original order; mark uncertain characters as `[unclear]`.
- Prompt:

```text
Extract all text in this image. Transcribe every visible character verbatim, preserving the original reading order and line breaks. Do not translate, correct, or summarize. Output format: original text blocks in reading order; mark uncertain characters as [unclear].
```

### Chart Data Reading
- Scenario: chart, graph, table, or dashboard.
- Task: read labels, values, units, legend entries, and visible trends.
- Focus: report only data visible in the image; do not interpret business meaning or predict the future.
- Output: one row per data item with label/value/unit, then one neutral sentence about the visible trend.
- Prompt:

```text
Read the data in this chart or table. List labels, values, units, legend entries, and any visible trend. Transcribe only what is visible in the image. Do not interpret business meaning or predict future values. Output format: label/value/unit rows, followed by one neutral sentence describing the visible trend.
```

### UI Debugging
- Scenario: UI screenshot, error dialog, or design-vs-implementation comparison.
- Task: enumerate visible elements, text, alignment, colors, spacing, and states.
- Focus: provide objective visual facts only; do not diagnose root cause or propose fixes.
- Output: element inventory with visible text/position/color/state, plus observed differences.
- Prompt:

```text
This is a UI debugging screenshot. Focus on this issue: {issue}. Enumerate visible elements, text, alignment, colors, spacing, and states. Describe only observable facts. Do not infer the root cause or propose a fix. Output format: element inventory (name/text/position/color/state) and observed differences from the expectation.
```

### Document Scanning
- Scenario: scanned document, receipt, form, or multi-section page.
- Task: transcribe content and describe structure such as headings, fields, and values.
- Focus: verbatim transcription plus structural description; no interpretation, completion, or authenticity judgment.
- Output: document type; sections/headings; fields and values; verbatim text blocks.
- Prompt:

```text
This is a scanned document. Transcribe its content and describe its structure: headings/sections, fields and values, and reading order. Transcribe only visible content. Do not interpret, fill in missing information, or judge authenticity. Output format: document type; sections/headings; fields and values; verbatim text blocks.
```

### Multi-Step Image Reasoning
- Scenario: a multi-image or multi-region workflow where the main agent reasons step by step.
- Task: complete exactly one focused perception step per call.
- Focus: include the previous observation as context; return observations only; let the main agent build the reasoning chain.
- Output: per-step observations with region/object references, ready to chain with the next step.
- Prompt:

```text
This is step {n} of multi-step image reasoning. Context from previous step: {previous_observation}. Complete only this visual step: {current_focus}. Do not draw conclusions, skip steps, or answer the final question. Output format: observations with region/object references and visible facts that connect to the next step.
```

## Token / Cost Comparison Experiment

Fixed test image: GitHub desktop screenshot, SHA-256 `F46B236364EEC51D164AB2490847106EBF4D70C7E95D6EBCE24DAAC0D84AA29E`.

Task: `Extract all visible text/data in the image and answer: what repository names and main technologies are shown in the image?`

Method A (direct): `gpt-5.6` sees the image and completes the task in one call.

Method B (hybrid): `gpt-5.6` first transcribes/describes the image with a focus hint without reasoning; then the transcription and the original task are sent to `deepseek-v4-flash` to complete.

| Round | Direct P/C/T | Hybrid describe P/C/T | Hybrid reason P/C/T | Hybrid total T | Delta |
| --- | --- | --- | --- | --- | --- |
| 1 | 26122/1792/27914 | 26194/1573/27767 | 1191/128/1319 | 29086 | +1172 |
| 2 | 26122/1358/27480 | 26194/1513/27707 | 1102/92/1194 | 28901 | +1421 |
| 3 | 26122/1109/27231 | 26194/1595/27789 | 1195/57/1252 | 29041 | +1810 |

Averages: direct `27541.67` T; hybrid `29009.33` T; hybrid uses `1467.67` more tokens on average, i.e. **+5.33%**. This experiment did not save tokens.

Pricing source and assumptions:

- DeepSeek official pricing (https://api-docs.deepseek.com/quick_start/pricing): `deepseek-v4-flash` input `$0.14/1M` (cache miss), `$0.0028/1M` (cache hit), output `$0.28/1M`.
- The hybrid reasoning side across three rounds costs about `$0.00057` on DeepSeek.
- The vision provider has no public pricing found; cost conclusions therefore report token deltas only.

Conclusion: for a single-image task, the hybrid flow increases total tokens by about 5.3% because image input tokens dominate and the extra text-reasoning call adds tokens. If the text model is significantly cheaper per token than the vision model, hybrid may still reduce total cost, but that requires verified pricing. Best fit: workflows where the vision model is expensive, the text model is cheap, and the transcription can be reused; not a fit for minimizing tokens in single-image Q&A.

## Usage Examples

Direct invocation:

```powershell
node recognize-image/scripts/recognize.js "path/to/image.png" --prompt "Describe this image and extract all visible text."
```

Useful prompts:

| Scenario | Prompt |
| --- | --- |
| General description | `Describe this image.` |
| Text extraction | `Extract all text in this image, preserving the original order.` |
| Screen analysis | `This is a screenshot. Explain its purpose, main elements, and key information.` |
| Chart or table | `Read the data in this chart/table and summarize the conclusions.` |

Script options:

| Option | Description |
| --- | --- |
| `--prompt` | Custom recognition prompt |
| `--config` | Path to a custom `config.json` |
| `--api-url` | Override the endpoint for one call |
| `--api-key` | Override the API key for one call; not recommended on the command line |
| `--model` | Override the model ID for one call |
| `--max-output-tokens` | Override the maximum output token count |
| `--max-size-mb` | Maximum image size, default `10` MB |

## Security

- This repository never contains a real API key or GitHub token.
- `recognize-image/config.json` is ignored by `.gitignore`; do not commit it.
- Keep API keys only in local configuration or environment variables, not in shell history, logs, or chat.
- Prefer environment variables over command-line flags when overriding credentials.

## Inspiration

- [agent-vision-toolkit](https://github.com/Anionex/agent-vision-toolkit): focus hint and the principle that the vision model only sees and transcribes while the main model reasons
- [claude-vision-skill](https://github.com/asuojun/claude-vision-skill): organizing image recognition prompts by scenario

## License

This project is licensed under the MIT License, see LICENSE
