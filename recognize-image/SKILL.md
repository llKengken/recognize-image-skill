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

Per-call overrides (`--api-url`, `--api-key`, `--model`, `--max-output-tokens`) take precedence, then environment variables `VISION_API_URL`, `VISION_API_KEY`, `VISION_API_MODEL`, then `config.json`.

Keep the API key in `config.json`; do not print it into prompts or chat.

## Useful prompts

- General description: `请描述这张图片的内容。`
- Text extraction: `请识别图片中的所有文字，保持原文顺序。`
- Screen analysis: `这是一张界面截图，请说明界面的用途、主要元素和关键信息。`
- Chart or table: `请读取图表/表格中的数据并总结结论。`
