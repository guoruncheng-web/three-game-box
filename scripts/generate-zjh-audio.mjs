#!/usr/bin/env node
/**
 * 炸金花游戏音频生成脚本
 * 使用 AceMusic API (ACE-Step v1.5) 生成背景音乐和音效
 *
 * 用法: node scripts/generate-zjh-audio.mjs [--only bgm|sfx-victory|sfx-defeat|sfx-big-win|all]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const AUDIO_DIR = path.join(PROJECT_ROOT, 'public/audio/zjh');

const API_URL = 'https://api.acemusic.ai/v1/chat/completions';
const API_KEY = 'b9d024e25b52477ba19541dcd4a4b19f';

// ---- 音频生成任务定义 ----
const TASKS = [
  // === BGM ===
  {
    id: 'bgm-lobby',
    file: 'bgm/bgm-lobby.mp3',
    prompt: 'Chinese traditional jazz lounge, guzheng and pipa melody, lo-fi hip-hop beats, smooth elegant ambient, cyberpunk neon atmosphere, relaxing casino lobby vibe, warm pad synths, gentle percussion, loopable seamless',
    duration: 90,
    bpm: 90,
    instrumental: true,
    category: 'bgm',
  },
  {
    id: 'bgm-gameplay',
    file: 'bgm/bgm-gameplay.mp3',
    prompt: 'Tense suspense oriental electronic music, erhu and pipa lead melody, deep synth bass, cyberpunk fusion, mid-tempo poker game atmosphere, strategic thinking mood, subtle tension building, Chinese traditional meets electronic, loopable seamless',
    duration: 90,
    bpm: 110,
    instrumental: true,
    category: 'bgm',
  },
  {
    id: 'bgm-settlement',
    file: 'bgm/bgm-settlement.mp3',
    prompt: 'Gentle reflective ambient music, piano and erhu duet, soft ambient pads, slow winding down after poker game, peaceful transition, warm resolution feeling, fade out ending',
    duration: 15,
    bpm: 75,
    instrumental: true,
    category: 'bgm',
  },
  // === 结果音效（较长，适合音乐生成） ===
  {
    id: 'sfx-victory',
    file: 'sfx/result/sfx-victory.mp3',
    prompt: 'Victory celebration fanfare, suona and Chinese gongs, bright triumphant melody, electronic ascending arpeggios, golden reward feeling, exciting and uplifting, short celebratory jingle',
    duration: 5,
    bpm: 140,
    instrumental: true,
    category: 'sfx',
  },
  {
    id: 'sfx-defeat',
    file: 'sfx/result/sfx-defeat.mp3',
    prompt: 'Melancholy solo erhu, minor key descending phrase, sparse piano chords, dignified sadness, gentle loss feeling, short reflective moment, soft fade out',
    duration: 5,
    bpm: 80,
    instrumental: true,
    category: 'sfx',
  },
  {
    id: 'sfx-big-win',
    file: 'sfx/result/sfx-big-win.mp3',
    prompt: 'Epic victory full Chinese orchestra, suona and erhu lead triumphant melody, massive gong crash, electronic bass drop, gold coins celebration, fireworks excitement, maximum hype jackpot winning moment',
    duration: 5,
    bpm: 150,
    instrumental: true,
    category: 'sfx',
  },
  {
    id: 'sfx-game-start',
    file: 'sfx/game/sfx-game-start.mp3',
    prompt: 'Game start fanfare, electronic countdown into energetic Chinese gong hit, exciting beginning, dramatic opening, card game starting moment, short impactful jingle',
    duration: 5,
    bpm: 120,
    instrumental: true,
    category: 'sfx',
  },
  {
    id: 'sfx-hand-triple',
    file: 'sfx/hand/sfx-hand-triple.mp3',
    prompt: 'Epic orchestral hit with massive Chinese gong crash, dragon roar undertone, powerful bass drop, earth-shaking impact, triumphant and shocking reveal, short dramatic sting',
    duration: 5,
    bpm: 130,
    instrumental: true,
    category: 'sfx',
  },
  {
    id: 'sfx-hand-straightflush',
    file: 'sfx/hand/sfx-hand-straightflush.mp3',
    prompt: 'Brilliant ascending harp glissando into golden gong shimmer, luxurious and dazzling card reveal, sparkling magical moment, elegant Chinese instruments, short impressive sting',
    duration: 5,
    bpm: 120,
    instrumental: true,
    category: 'sfx',
  },
  {
    id: 'sfx-hand-235',
    file: 'sfx/hand/sfx-hand-235.mp3',
    prompt: 'Dramatic plot twist sound, reverse cymbal into shocking reveal hit, unexpected underdog victory fanfare, Chinese opera percussion accent, subversive and thrilling reversal moment',
    duration: 5,
    bpm: 130,
    instrumental: true,
    category: 'sfx',
  },
];

async function generateAudio(task) {
  const body = {
    model: 'acemusic/acestep-v15-turbo',
    messages: [{ role: 'user', content: task.prompt }],
    modalities: ['audio'],
    stream: false,
    task_type: 'text2music',
    guidance_scale: 7.0,
    inference_steps: 8,
    thinking: true,
    temperature: 0.85,
    use_cot_caption: true,
    use_cot_language: true,
    audio_config: {
      format: 'mp3',
      vocal_language: 'en',
      instrumental: task.instrumental !== false,
      duration: task.duration || 60,
      ...(task.bpm ? { bpm: task.bpm } : {}),
    },
  };

  console.log(`\n🎵 生成中: ${task.id} (${task.duration}s, ${task.bpm} BPM)...`);

  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`API error ${resp.status}: ${text}`);
  }

  const result = await resp.json();
  const choices = result.choices || [];
  if (!choices.length) {
    throw new Error('No choices in response');
  }

  const message = choices[0].message || {};
  const textContent = message.content || '';
  const audioItems = message.audio || [];

  if (textContent) {
    console.log(`  📝 AI 描述: ${textContent.substring(0, 200)}...`);
  }

  if (!audioItems.length) {
    throw new Error('No audio in response');
  }

  // 提取音频数据
  for (const item of audioItems) {
    let url = '';
    if (typeof item === 'object') {
      url = item?.audio_url?.url || item?.url || '';
    }
    if (!url) continue;

    const b64Data = url.includes(',') ? url.split(',')[1] : url;
    const audioBytes = Buffer.from(b64Data, 'base64');

    const outPath = path.join(AUDIO_DIR, task.file);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, audioBytes);

    const sizeKB = (audioBytes.length / 1024).toFixed(1);
    console.log(`  ✅ 已保存: ${task.file} (${sizeKB} KB)`);
    return outPath;
  }

  throw new Error('Could not extract audio data from response');
}

async function main() {
  const filterArg = process.argv.find(a => a.startsWith('--only='));
  const filter = filterArg ? filterArg.split('=')[1] : 'all';

  let tasks = TASKS;
  if (filter !== 'all') {
    tasks = TASKS.filter(t => t.id === filter || t.category === filter);
  }

  if (!tasks.length) {
    console.error(`No tasks matched filter: ${filter}`);
    console.log('Available: ' + TASKS.map(t => t.id).join(', '));
    process.exit(1);
  }

  console.log(`🎮 炸金花音频生成器`);
  console.log(`📋 待生成: ${tasks.length} 个音频文件`);
  console.log(`🎯 目标目录: ${AUDIO_DIR}`);

  const results = { success: [], failed: [] };

  for (const task of tasks) {
    try {
      await generateAudio(task);
      results.success.push(task.id);
    } catch (err) {
      console.error(`  ❌ 失败: ${task.id} - ${err.message}`);
      results.failed.push({ id: task.id, error: err.message });
    }
  }

  console.log(`\n========== 生成完成 ==========`);
  console.log(`✅ 成功: ${results.success.length}/${tasks.length}`);
  if (results.failed.length) {
    console.log(`❌ 失败: ${results.failed.length}`);
    for (const f of results.failed) {
      console.log(`   - ${f.id}: ${f.error}`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
