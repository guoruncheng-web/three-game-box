/**
 * 根据 docs/zhajinhua-ai-prompts.md 中的 Positive/Negative 提示词，
 * 使用阿里云百炼通义万相（wanx-v1）异步文生图，保存到 public/images/generated/zhajinhua/
 *
 * 前置：在 .env.local 中配置 DASHSCOPE_API_KEY=sk-xxx（勿提交 Git）
 *
 * 用法：
 *   node scripts/generate-zhajinhua-assets-bailian.mjs
 *   node scripts/generate-zhajinhua-assets-bailian.mjs --id=1
 *   node scripts/generate-zhajinhua-assets-bailian.mjs --from=1 --to=5
 *   node scripts/generate-zhajinhua-assets-bailian.mjs --dry-run
 *   node scripts/generate-zhajinhua-assets-bailian.mjs --preview
 *   node scripts/generate-zhajinhua-assets-bailian.mjs --preview --from=1 --to=5
 *
 * --preview：输出到 public/images/generated/zhajinhua-preview/，不覆盖 zhajinhua/ 下已有文件。
 *
 * 说明：wanx-v1 仅支持尺寸 1024*1024、720*1280、1280*720，脚本按文档「尺寸建议」自动映射；
 * 生成后若需透明底或精确像素，请用修图工具抠图/裁剪（与原文档 Leonardo 流程一致）。
 *
 * 输出文件名为英文 kebab-case，与 docs/zhajinhua-asset-paths.md、manifest.json 一致。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DOC_PATH = path.join(ROOT, 'docs', 'zhajinhua-ai-prompts.md');
const OUT_DIR_DEFAULT = path.join(ROOT, 'public', 'images', 'generated', 'zhajinhua');
const OUT_DIR_PREVIEW = path.join(ROOT, 'public', 'images', 'generated', 'zhajinhua-preview');

const CREATE_URL =
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';

const EXTRA_NEGATIVE = [
  'blurry, low quality, distorted, deformed, ugly, watermark, signature',
  'text overlay, cropped, out of frame, duplicate, mutation',
  'poorly drawn, jpeg artifacts, pixelated, noise, grain',
].join(', ');

/** 与 docs/zhajinhua-asset-paths.md、public/.../manifest.json 对齐 */
const ZHAJINHUA_ENGLISH_BY_ID = {
  '1': { assetKey: 'lobbyBg', file: 'lobby-bg.png' },
  '2': { assetKey: 'tableBg', file: 'table-bg.png' },
  '3': { assetKey: 'cardBack', file: 'card-back.png' },
  '4': { assetKey: 'chip10', file: 'chip-10.png' },
  '5': { assetKey: 'chip100', file: 'chip-100.png' },
  '6': { assetKey: 'chip1000', file: 'chip-1000.png' },
  '7': { assetKey: 'avatarFrame', file: 'avatar-frame.png' },
  '8': { assetKey: 'avatarFrameVip', file: 'avatar-frame-vip.png' },
  '9': { assetKey: 'btnCall', file: 'btn-call.png' },
  '10': { assetKey: 'btnRaise', file: 'btn-raise.png' },
  '11': { assetKey: 'btnFold', file: 'btn-fold.png' },
  '12': { assetKey: 'btnLook', file: 'btn-look.png' },
  '13': { assetKey: 'btnCompare', file: 'btn-compare.png' },
  '14': { assetKey: 'btnAllIn', file: 'btn-all-in.png' },
  '15': { assetKey: 'handBannerTriple', file: 'hand-banner-triple.png' },
  '16': { assetKey: 'handBannerStraightFlush', file: 'hand-banner-straight-flush.png' },
  '17': { assetKey: 'handBannerFlush', file: 'hand-banner-flush.png' },
  '18': { assetKey: 'victoryPopupBg', file: 'victory-popup-bg.png' },
  '19': { assetKey: 'potDisplayFrame', file: 'pot-display-frame.png' },
  '20': { assetKey: 'countdownHintFrame', file: 'countdown-hint-frame.png' },
  '21': { assetKey: 'gameLogoTitle', file: 'game-logo-title.png' },
  '22': { assetKey: 'dealCardMotion', file: 'deal-card-motion.png' },
  '23': { assetKey: 'seatEmptyWaiting', file: 'seat-empty-waiting.png' },
};

function loadEnvLocal() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

function slugify(title) {
  return title
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

/**
 * 将文档建议尺寸映射到万相允许的 size
 * @returns {'1024*1024'|'720*1280'|'1280*720'}
 */
function mapWanxSize(suggestedW, suggestedH) {
  if (!suggestedW || !suggestedH) return '1024*1024';
  if (suggestedH > suggestedW * 1.1) return '720*1280';
  if (suggestedW > suggestedH * 1.1) return '1280*720';
  return '1024*1024';
}

function parseSizeFromBlock(block) {
  const m = block.match(/>\s*尺寸建议[：:]\s*(\d+)\s*x\s*(\d+)/i);
  if (!m) return null;
  return { w: Number(m[1]), h: Number(m[2]) };
}

/**
 * @returns {Array<{ id: string, title: string, slug: string, prompt: string, negative: string, size: string }>}
 */
function parseZhajinhuaMarkdown(md) {
  const headerRe = /^## (\d+)\.\s+(.+)$/gm;
  const items = [];
  const matches = [...md.matchAll(headerRe)];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i][0].length;
    const end = matches[i + 1] ? matches[i + 1].index : md.length;
    const block = md.slice(start, end);
    const id = matches[i][1];
    const title = matches[i][2].trim();

    const posMatch = block.match(/\*\*Positive:\*\*\s*\n?```\s*([\s\S]*?)```/);
    if (!posMatch) continue;
    const negMatch = block.match(/\*\*Negative:\*\*\s*\n?```\s*([\s\S]*?)```/);

    const prompt = posMatch[1].trim();
    const negativeBase = negMatch ? negMatch[1].trim() : '';
    const negative = [negativeBase, EXTRA_NEGATIVE].filter(Boolean).join(', ');

    const dim = parseSizeFromBlock(block);
    const size = dim ? mapWanxSize(dim.w, dim.h) : '1024*1024';

    const en = ZHAJINHUA_ENGLISH_BY_ID[id];
    const outFile = en?.file ?? `${slugify(`${id}-${title}`)}.png`;
    const assetKey = en?.assetKey ?? null;

    items.push({
      id,
      title,
      assetKey,
      outFile,
      prompt,
      negative,
      size,
    });
  }
  return items;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs(argv) {
  const o = { dryRun: false, preview: false, id: null, from: null, to: null, delayMs: 2500 };
  for (const a of argv) {
    if (a === '--dry-run') o.dryRun = true;
    else if (a === '--preview') o.preview = true;
    else if (a.startsWith('--id=')) o.id = a.slice(5);
    else if (a.startsWith('--from=')) o.from = Number(a.slice(7));
    else if (a.startsWith('--to=')) o.to = Number(a.slice(5));
    else if (a.startsWith('--delay=')) o.delayMs = Number(a.slice(8)) || 2500;
  }
  return o;
}

async function createTask(prompt, negativePrompt, size) {
  const res = await fetch(CREATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: 'wanx-v1',
      input: {
        prompt,
        negative_prompt: negativePrompt,
      },
      parameters: {
        style: '<auto>',
        size,
        n: 1,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.msg || JSON.stringify(data));
  }
  const taskId = data.output?.task_id;
  if (!taskId) throw new Error(`创建任务失败: ${JSON.stringify(data)}`);
  return taskId;
}

async function pollTask(taskId) {
  const url = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
  for (let i = 0; i < 120; i++) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const data = await res.json();
    const output = data.output;
    const status = output?.task_status;
    if (status === 'SUCCEEDED') {
      const imgUrl = output?.results?.[0]?.url;
      if (!imgUrl) throw new Error(`无图片 URL: ${JSON.stringify(output)}`);
      return imgUrl;
    }
    if (status === 'FAILED') {
      throw new Error(output?.message || output?.code || JSON.stringify(output));
    }
    await sleep(2000);
  }
  throw new Error('任务超时');
}

async function downloadFile(imageUrl, destPath) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`下载失败 ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
}

const API_KEY = process.env.DASHSCOPE_API_KEY;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = args.preview ? OUT_DIR_PREVIEW : OUT_DIR_DEFAULT;
  const basePathUrl = args.preview ? '/images/generated/zhajinhua-preview' : '/images/generated/zhajinhua';

  if (!fs.existsSync(DOC_PATH)) {
    console.error('找不到文档:', DOC_PATH);
    process.exit(1);
  }

  const md = fs.readFileSync(DOC_PATH, 'utf8');
  let items = parseZhajinhuaMarkdown(md);

  if (args.id) {
    items = items.filter((x) => x.id === args.id);
  } else if (args.from != null || args.to != null) {
    const lo = args.from ?? 1;
    const hi = args.to ?? items.length;
    items = items.filter((x) => {
      const n = Number(x.id);
      return n >= lo && n <= hi;
    });
  }

  if (items.length === 0) {
    console.error('没有匹配的条目（检查 --id / --from / --to）');
    process.exit(1);
  }

  if (args.preview) {
    console.log('【预览模式】输出到 zhajinhua-preview/，不覆盖 zhajinhua/ 原文件\n');
  }
  console.log(`共 ${items.length} 条资源将生成 → ${outDir}\n`);

  if (args.dryRun) {
    for (const it of items) {
      console.log(`[${it.id}] ${it.title} | size=${it.size} | ${it.outFile}`);
    }
    return;
  }

  if (!API_KEY) {
    console.error('请设置 DASHSCOPE_API_KEY（可在 .env.local 中配置）');
    process.exit(1);
  }

  const manifest = [];

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const dest = path.join(outDir, it.outFile);

    console.log(`[${i + 1}/${items.length}] ${it.id}. ${it.title} (${it.size}) …`);

    try {
      const taskId = await createTask(it.prompt, it.negative, it.size);
      const imageUrl = await pollTask(taskId);
      await downloadFile(imageUrl, dest);
      console.log('  →', dest);
      const entry = {
        id: it.id,
        title: it.title,
        file: it.outFile,
        wanxSize: it.size,
      };
      if (it.assetKey) entry.assetKey = it.assetKey;
      manifest.push(entry);
    } catch (e) {
      console.error('  失败:', e.message || e);
      manifest.push({ id: it.id, title: it.title, error: String(e.message || e) });
    }

    if (i < items.length - 1) await sleep(args.delayMs);
  }

  const manifestPath = path.join(outDir, 'manifest.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        preview: args.preview,
        basePath: basePathUrl,
        items: manifest,
      },
      null,
      2
    ),
    'utf8'
  );
  console.log('\n清单已写入:', manifestPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
