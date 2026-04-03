/**
 * 使用阿里云百炼通义万相（wanx-v1）生成「炸金花」首页/列表封面图（方形），
 * 保存到 public/images/games/zhajinhua-cover.png
 *
 * 风格与 docs/zhajinhua-ai-prompts.md 一致：中国风 + 赛博朋克暗色、扑克与筹码元素。
 *
 * 用法：
 *   在 .env.local 中配置 DASHSCOPE_API_KEY=sk-xxx
 *   pnpm run generate:zhajinhua-cover
 *
 * 预览（不覆盖正式封面，输出 zhajinhua-cover-preview.png）：
 *   pnpm run generate:zhajinhua-cover -- --preview
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

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

const API_KEY = process.env.DASHSCOPE_API_KEY;
const CREATE_URL =
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';

const PROMPT = [
  'Mobile game app icon and cover art, square composition 1:1,',
  'Chinese poker Zha Jin Hua theme, three playing cards and golden poker chips,',
  'Chinese cyberpunk dark style, deep navy and black, neon red and gold accents,',
  'dragon and lantern motifs with subtle holographic glow,',
  'premium illustration, rich atmosphere, no text, no watermark, no logo, no letters',
].join(' ');

const NEGATIVE_PROMPT = [
  'blurry, low quality, distorted, bright white background, cartoon cute childish',
  'watermark, text, signature, letters, realistic photo, cluttered, western casino only',
].join(', ');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function createTask() {
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
        prompt: PROMPT,
        negative_prompt: NEGATIVE_PROMPT,
      },
      parameters: {
        style: '<auto>',
        size: '1024*1024',
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
  for (let i = 0; i < 90; i++) {
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

async function main() {
  const preview = process.argv.includes('--preview');
  if (!API_KEY) {
    console.error('请设置环境变量 DASHSCOPE_API_KEY（可在 .env.local 中配置）');
    process.exit(1);
  }
  console.log(preview ? '【预览模式】不覆盖 zhajinhua-cover.png' : '正式写入 zhajinhua-cover.png');
  console.log('创建炸金花封面图万相任务…');
  const taskId = await createTask();
  console.log('task_id:', taskId);
  console.log('等待生成（异步队列，请稍候）…');
  const imageUrl = await pollTask(taskId);
  console.log('图片 URL:', imageUrl);
  const fileName = preview ? 'zhajinhua-cover-preview.png' : 'zhajinhua-cover.png';
  const out = path.join(ROOT, 'public', 'images', 'games', fileName);
  await downloadFile(imageUrl, out);
  console.log('已保存:', out);
  console.log('引用路径:', `/images/games/${fileName}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
