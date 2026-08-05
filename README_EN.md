<div align="center">

[![中文](https://img.shields.io/badge/%E4%B8%AD%E6%96%87-%E7%AE%80%E4%BD%93-2ea44f?style=for-the-badge)](README.md)
![English](https://img.shields.io/badge/English-English-0078d7?style=for-the-badge)

</div>

<p align="center">
  <img src="assets/logo.png" alt="DeepSeek Image Recognition Skill" width="128">
</p>

<h1 align="center">DeepSeek Image Recognition Skill</h1>

<p align="center">
  An image recognition skill for DeepSeek: let Codex describe images, extract text, and analyze screenshots, charts, and tables through a vision API.
</p>

<p align="center">
  <a href="https://github.com/llKengken/recognize-image-skill/stargazers">
    <img src="https://img.shields.io/github/stars/llKengken/recognize-image-skill?style=for-the-badge&color=2ea44f" alt="GitHub stars">
  </a>
  <img src="https://img.shields.io/badge/DeepSeek-DeepSeek-3f7bff?style=for-the-badge" alt="DeepSeek">
  <img src="https://img.shields.io/badge/Codex-Skill-00e5ff?style=for-the-badge" alt="Codex Skill">
  <img src="https://img.shields.io/badge/Vision-Image%20Recognition-4d6bfe?style=for-the-badge" alt="Vision">
</p>

<p align="center">
  <img src="assets/banner.png" alt="DeepSeek Image Recognition Skill banner">
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
Use skill-installer to install the recognize-image skill from https://github.com/llKengken/recognize-image-skill into ~/.codex/skills; create recognize-image/config.json from config.example.json and set apiUrl and apiKey; then test image recognition with an image.
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
  "apiUrl": "https://api.daseinai.xyz/v1/chat/completions",
  "apiKey": "",
  "model": "gpt-5.6",
  "maxOutputTokens": 2000,
  "requestTimeoutMs": 120000,
  "maxRetries": 2
}
```

| Field | Description | Default |
| --- | --- | --- |
| `apiUrl` | Full chat-completions endpoint | The endpoint in the template |
| `apiKey` | API key for Bearer authentication | Empty string |
| `model` | Vision-capable model ID | `gpt-5.6` |
| `maxOutputTokens` | Maximum output tokens per request | `2000` |
| `requestTimeoutMs` | Request timeout in milliseconds | `120000` |
| `maxRetries` | Retry count for 429/5xx and network errors | `2` |

`config.json` is ignored by `.gitignore`; never commit real credentials.

Precedence from highest to lowest: CLI flags (`--api-url`, `--api-key`, `--model`) > environment variables (`VISION_API_URL`, `VISION_API_KEY`, `VISION_API_MODEL`) > `config.json`.

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

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
