#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DEFAULT_PROMPT = '请描述这张图片的内容，并尽量识别图中所有文字。';
const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
};

function parseArgs(argv) {
  const args = { prompt: DEFAULT_PROMPT, maxTokens: 2000, maxSizeMb: 10 };
  const positionals = [];

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    switch (token) {
      case '--prompt':
        args.prompt = argv[++i];
        break;
      case '--config':
        args.config = argv[++i];
        break;
      case '--api-url':
        args.apiUrl = argv[++i];
        break;
      case '--api-key':
        args.apiKey = argv[++i];
        break;
      case '--model':
        args.model = argv[++i];
        break;
      case '--max-output-tokens':
        args.maxTokens = Number(argv[++i]);
        break;
      case '--max-size-mb':
        args.maxSizeMb = Number(argv[++i]);
        break;
      default:
        if (token.startsWith('-')) {
          throw new Error(`Unknown option: ${token}`);
        }
        positionals.push(token);
    }
  }

  if (positionals.length !== 1) {
    throw new Error(
      'Usage: node recognize.js <image-path> [--prompt "text"] [--api-url url] [--api-key key] [--model model]'
    );
  }
  args.image = positionals[0];
  return args;
}

function loadConfig(configPath) {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {
    return {};
  }
}

function fail(message, code = 1) {
  process.stderr.write(`[recognize-image] ${message}\n`);
  process.exit(code);
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    fail(err.message, 2);
    return;
  }

  const imagePath = path.resolve(args.image);
  if (!fs.existsSync(imagePath)) {
    fail(`Image not found: ${imagePath}`);
  }

  const ext = path.extname(imagePath).toLowerCase();
  const mime = MIME_TYPES[ext];
  if (!mime) {
    fail(`Unsupported image type '${ext}'. Supported: ${Object.keys(MIME_TYPES).join(', ')}`);
  }

  const stat = fs.statSync(imagePath);
  if (stat.size > args.maxSizeMb * 1024 * 1024) {
    fail(`Image is ${(stat.size / 1024 / 1024).toFixed(1)} MB, exceeding --max-size-mb ${args.maxSizeMb}`);
  }

  const configPath = args.config || path.join(__dirname, '..', 'config.json');
  const fileConfig = loadConfig(configPath);

  const apiUrl = args.apiUrl || process.env.VISION_API_URL || fileConfig.apiUrl;
  const apiKey = args.apiKey || process.env.VISION_API_KEY || fileConfig.apiKey || '';
  const model = args.model || process.env.VISION_API_MODEL || fileConfig.model;
  const maxTokens = args.maxTokens || fileConfig.maxOutputTokens || 2000;
  const timeoutMs = fileConfig.requestTimeoutMs || 120000;
  const maxRetries = fileConfig.maxRetries ?? 2;

  if (!apiUrl) {
    fail('Missing apiUrl. Set config.json, VISION_API_URL, or --api-url.');
  }
  if (!model) {
    fail('Missing model. Set config.json, VISION_API_MODEL, or --model.');
  }

  const base64 = fs.readFileSync(imagePath).toString('base64');
  const body = {
    model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: args.prompt },
          { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } },
        ],
      },
    ],
    max_tokens: maxTokens,
  };

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  let response;
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt * attempt));
    }
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.status === 429 || response.status >= 500) {
        lastError = `API returned HTTP ${response.status}`;
        continue;
      }
      lastError = null;
      break;
    } catch (err) {
      lastError = `API request failed: ${err.message}`;
    }
  }
  if (!response) {
    fail(lastError);
  }

  const text = await response.text();
  if (!response.ok) {
    fail(`API returned HTTP ${response.status}: ${text.slice(0, 2000)}`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    fail(`API returned non-JSON response: ${text.slice(0, 500)}`);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (content === undefined || content === null) {
    fail(`No content in response: ${text.slice(0, 2000)}`);
  }

  if (typeof content === 'string') {
    process.stdout.write(`${content.trimEnd()}\n`);
  } else if (Array.isArray(content)) {
    const joined = content
      .map((part) => (typeof part === 'string' ? part : part?.text ?? ''))
      .join('');
    process.stdout.write(`${joined.trimEnd()}\n`);
  } else {
    fail(`Unexpected content type: ${typeof content}`);
  }
}

main();
