/**
 * 使用阿里云百炼通义万相（wanx-v1）生成「水果消消乐」列表封面图，
 * 保存到 public/images/games/fruit-match-cover.png
 *
 * 用法：
 *   在 .env.local 中配置 DASHSCOPE_API_KEY=sk-xxx
 *   pnpm run generate:fruit-cover
 *
 * 计费与限流见阿里云百炼文档。
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
  '休闲三消手机游戏封面图，方形构图，',
  '多种可爱水果草莓葡萄柠檬西瓜橙子，晶莹剔透，糖果色系，',
  '扁平插画风格，柔和光晕，无文字无水印无商标，',
  '明亮欢快背景，适合作为游戏图标展示',
].join('');

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
      input: { prompt: PROMPT },
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
  if (!API_KEY) {
    console.error('请设置环境变量 DASHSCOPE_API_KEY（可在 .env.local 中配置）');
    process.exit(1);
  }
  console.log('创建万相文生图任务…');
  const taskId = await createTask();
  console.log('task_id:', taskId);
  console.log('等待生成（异步队列，请稍候）…');
  const imageUrl = await pollTask(taskId);
  console.log('图片 URL:', imageUrl);
  const out = path.join(ROOT, 'public', 'images', 'games', 'fruit-match-cover.png');
  await downloadFile(imageUrl, out);
  console.log('已保存:', out);
  console.log('首页已配置 coverImage 为 /images/games/fruit-match-cover.png');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
