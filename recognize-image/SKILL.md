---
name: recognize-image
description: Recognize, describe, or extract text from image files by calling a configured external vision-capable model API. Use when Codex needs to see or understand the visual content of an image (screenshots, photos, scanned documents, charts, game UI) but native image input is unavailable or insufficient, or when the user supplies an image file path and asks what is in it.
---

# Recognize Image via External Vision API

## Workflow

1. Locate the image file. Clipboard images pasted into Codex are normally saved under `C:\Users\<user>\AppData\Local\Temp\codex-clipboard-*.png`; otherwise resolve the path the user provided.
2. Verify the file exists and has a supported extension: `.png`, `.jpg`/`.jpeg`, `.webp`, `.gif`, `.bmp`, `.tiff`.
3. Run the bundled caller from this skill directory:

```bash
node scripts/recognize.js "<image-path>" --prompt "请描述这张图片的内容，并尽量识别图中所有文字。"
```

Use Node 18+. If `node` is not on PATH, use the bundled Node path from `load_workspace_dependencies`.
4. Use the returned text as the answer. On failure, read the error, fix the configuration if needed, and retry.

## Configuration

The skill reads `config.json` in this directory. Fields:

- `apiUrl`: full chat-completions endpoint
- `apiKey`: Bearer token for authentication
- `model`: vision-capable model id
- `maxOutputTokens`: optional, default 2000
- `requestTimeoutMs`: optional, default 120000
- `maxRetries`: optional, default 2 (retries on 429/5xx and network errors)

Any OpenAI-compatible vision API can be used; this skill is not tied to a specific provider. DeepSeek v4 flash and GPT-5.6 are kept only as experimental/recommended examples of model IDs, not as required defaults.

Per-call overrides (`--api-url`, `--api-key`, `--model`, `--max-output-tokens`) take precedence, then environment variables `VISION_API_URL`, `VISION_API_KEY`, `VISION_API_MODEL`, then `config.json`.

Keep the API key in `config.json`; do not print it into prompts or chat.

## Focus Principle

The vision model is a perception and transcription layer, not a reasoning layer.

- Always include a focus hint: the current task, which details matter, what to ignore, and the expected output format.
- Describe or transcribe only what is visible in the image.
- Do not answer the task itself, draw conclusions, infer causes, debug, or propose fixes.
- Report uncertainty instead of guessing.
- The main agent owns reasoning, decisions, and follow-up questions.

## Scenario Prompts

Use the template that matches the task. Replace `{...}` with the concrete details, and keep the focus and output requirements.

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

## Useful prompts

- General description: `请描述这张图片的内容。`
- Text extraction: `请识别图片中的所有文字，保持原文顺序。`
- Screen analysis: `这是一张界面截图，请说明界面的用途、主要元素和关键信息。`
- Chart or table: `请读取图表/表格中的数据并总结结论。`
