# 炸金花游戏音效素材清单

> 格式建议：MP3 / OGG（兼容移动端浏览器）
> 采样率：44100Hz
> 比特率：128kbps+
> 风格：中国风 + 赛博朋克电子音效融合

---

## 一、背景音乐 (BGM)

| # | 名称 | 文件名 | 时长 | 说明 |
|---|------|--------|------|------|
| 1 | 大厅 BGM | `bgm-lobby.mp3` | 60-120s 循环 | 轻松的中国风电子乐，古筝/琵琶 + Lo-fi beats，低调不抢注意力 |
| 2 | 游戏中 BGM | `bgm-gameplay.mp3` | 60-120s 循环 | 紧张感的中国风电子乐，节奏稍快，鼓点 + 合成器，营造博弈氛围 |
| 3 | 结算 BGM | `bgm-settlement.mp3` | 10-15s | 短暂的结算过渡音乐，舒缓收尾 |

---

## 二、游戏流程音效

| # | 名称 | 文件名 | 时长 | 触发时机 |
|---|------|--------|------|----------|
| 4 | 进入房间 | `sfx-enter-room.mp3` | 1-2s | 玩家加入房间 |
| 5 | 玩家准备 | `sfx-ready.mp3` | 0.5-1s | 点击准备按钮 |
| 6 | 游戏开始 | `sfx-game-start.mp3` | 2-3s | 所有人准备完毕，开局 |
| 7 | 洗牌 | `sfx-shuffle.mp3` | 1.5-2s | 发牌前洗牌动画 |
| 8 | 发牌（单张） | `sfx-deal-card.mp3` | 0.3-0.5s | 每张牌发出时，需要连续快速播放 |
| 9 | 回合开始提示 | `sfx-your-turn.mp3` | 0.5-1s | 轮到玩家操作时提醒 |
| 10 | 倒计时警告 | `sfx-countdown-tick.mp3` | 0.2s | 最后 5 秒每秒一次 |
| 11 | 操作超时 | `sfx-timeout.mp3` | 1s | 超时自动弃牌 |

---

## 三、玩家操作音效

| # | 名称 | 文件名 | 时长 | 触发时机 |
|---|------|--------|------|----------|
| 12 | 看牌（翻牌） | `sfx-look-card.mp3` | 0.5-1s | 翻开自己的牌，纸牌翻转声 |
| 13 | 跟注 | `sfx-call.mp3` | 0.5s | 筹码推入声 |
| 14 | 加注 | `sfx-raise.mp3` | 0.8s | 比跟注更重的筹码声，带力度感 |
| 15 | 全押 | `sfx-all-in.mp3` | 1.5-2s | 大量筹码推入 + 震撼低频冲击音效 |
| 16 | 弃牌 | `sfx-fold.mp3` | 0.5s | 牌扔出/滑落声，带遗憾感 |
| 17 | 比牌发起 | `sfx-compare-start.mp3` | 1-1.5s | 对决紧张音效，剑拔弩张感 |
| 18 | 比牌翻牌 | `sfx-compare-reveal.mp3` | 1s | 双方亮牌瞬间，鼓点 |

---

## 四、结果反馈音效

| # | 名称 | 文件名 | 时长 | 触发时机 |
|---|------|--------|------|----------|
| 19 | 比牌胜利 | `sfx-compare-win.mp3` | 1-1.5s | 比牌赢了，短促胜利音 |
| 20 | 比牌失败 | `sfx-compare-lose.mp3` | 1s | 比牌输了，低沉失败音 |
| 21 | 本局胜利 | `sfx-victory.mp3` | 2-3s | 整局获胜，庆祝音效（锣鼓 + 电子音） |
| 22 | 本局失败 | `sfx-defeat.mp3` | 1.5-2s | 整局失败，低调失落音 |
| 23 | 筹码收入 | `sfx-chips-collect.mp3` | 1-1.5s | 赢取筹码归入，硬币叮当声 |
| 24 | 大赢家 | `sfx-big-win.mp3` | 3-4s | 赢取大量筹码时的特殊庆祝音效 |

---

## 五、牌型展示音效

| # | 名称 | 文件名 | 时长 | 触发时机 |
|---|------|--------|------|----------|
| 25 | 散牌 | `sfx-hand-highcard.mp3` | 0.5s | 亮牌展示散牌，普通音效 |
| 26 | 对子 | `sfx-hand-pair.mp3` | 0.8s | 亮牌展示对子，轻微惊喜 |
| 27 | 顺子 | `sfx-hand-straight.mp3` | 1s | 亮牌展示顺子，上升音阶 |
| 28 | 金花 | `sfx-hand-flush.mp3` | 1s | 亮牌展示金花，清脆铃声 |
| 29 | 顺金 | `sfx-hand-straightflush.mp3` | 1.5s | 亮牌展示顺金，华丽音效 |
| 30 | 豹子 | `sfx-hand-triple.mp3` | 2s | 亮牌展示豹子，震撼爆炸音效 + 龙吟 |
| 31 | 235 通杀 | `sfx-hand-235.mp3` | 2s | 235 通杀豹子，特殊逆转音效 |

---

## 六、UI 交互音效

| # | 名称 | 文件名 | 时长 | 触发时机 |
|---|------|--------|------|----------|
| 32 | 按钮点击 | `sfx-btn-click.mp3` | 0.1-0.2s | 通用按钮点击 |
| 33 | 按钮悬停 | `sfx-btn-hover.mp3` | 0.1s | 按钮悬停/触摸反馈 |
| 34 | 弹窗打开 | `sfx-popup-open.mp3` | 0.3-0.5s | 弹窗/面板弹出 |
| 35 | 弹窗关闭 | `sfx-popup-close.mp3` | 0.2-0.3s | 弹窗/面板关闭 |
| 36 | 每日领取筹码 | `sfx-daily-bonus.mp3` | 1.5-2s | 领取每日筹码奖励 |
| 37 | 错误提示 | `sfx-error.mp3` | 0.5s | 操作失败/筹码不足等 |
| 38 | 玩家加入 | `sfx-player-join.mp3` | 0.5-1s | 其他玩家进入房间 |
| 39 | 玩家离开 | `sfx-player-leave.mp3` | 0.5s | 其他玩家离开房间 |

---

## 七、文件目录结构

```
public/
└── audio/
    └── zjh/
        ├── bgm/
        │   ├── bgm-lobby.mp3           # 大厅背景音乐
        │   ├── bgm-gameplay.mp3        # 游戏中背景音乐
        │   └── bgm-settlement.mp3      # 结算音乐
        │
        ├── sfx/
        │   ├── game/                    # 游戏流程
        │   │   ├── sfx-enter-room.mp3
        │   │   ├── sfx-ready.mp3
        │   │   ├── sfx-game-start.mp3
        │   │   ├── sfx-shuffle.mp3
        │   │   ├── sfx-deal-card.mp3
        │   │   ├── sfx-your-turn.mp3
        │   │   ├── sfx-countdown-tick.mp3
        │   │   └── sfx-timeout.mp3
        │   │
        │   ├── action/                  # 玩家操作
        │   │   ├── sfx-look-card.mp3
        │   │   ├── sfx-call.mp3
        │   │   ├── sfx-raise.mp3
        │   │   ├── sfx-all-in.mp3
        │   │   ├── sfx-fold.mp3
        │   │   ├── sfx-compare-start.mp3
        │   │   └── sfx-compare-reveal.mp3
        │   │
        │   ├── result/                  # 结果反馈
        │   │   ├── sfx-compare-win.mp3
        │   │   ├── sfx-compare-lose.mp3
        │   │   ├── sfx-victory.mp3
        │   │   ├── sfx-defeat.mp3
        │   │   ├── sfx-chips-collect.mp3
        │   │   └── sfx-big-win.mp3
        │   │
        │   ├── hand/                    # 牌型展示
        │   │   ├── sfx-hand-highcard.mp3
        │   │   ├── sfx-hand-pair.mp3
        │   │   ├── sfx-hand-straight.mp3
        │   │   ├── sfx-hand-flush.mp3
        │   │   ├── sfx-hand-straightflush.mp3
        │   │   ├── sfx-hand-triple.mp3
        │   │   └── sfx-hand-235.mp3
        │   │
        │   └── ui/                      # UI 交互
        │       ├── sfx-btn-click.mp3
        │       ├── sfx-btn-hover.mp3
        │       ├── sfx-popup-open.mp3
        │       ├── sfx-popup-close.mp3
        │       ├── sfx-daily-bonus.mp3
        │       ├── sfx-error.mp3
        │       ├── sfx-player-join.mp3
        │       └── sfx-player-leave.mp3
        │
        └── README.md                   # 音效素材说明
```

---

## 八、获取途径建议

### 免费音效资源
| 平台 | 网址 | 说明 |
|------|------|------|
| Freesound | freesound.org | 大量免费音效，CC 协议 |
| Mixkit | mixkit.co | 免费音效和音乐，无需归属 |
| Pixabay Audio | pixabay.com/sound-effects | 免费商用音效 |
| OpenGameArt | opengameart.org | 游戏音效专区 |

### AI 音效生成
| 平台 | 说明 |
|------|------|
| ElevenLabs Sound Effects | AI 生成音效，文字描述即可生成 |
| Stable Audio | Stability AI 的音频生成工具 |
| Suno AI | AI 生成背景音乐 |

### AI 生成提示词

#### A. ACE-Step 1.5 提示词（背景音乐 BGM）

> 平台地址：https://modelscope.cn/studios/ACE-Step/ACE-Step
> ACE-Step 擅长生成完整音乐段落，适合 BGM。每条提示词包含 tags（风格标签）和 prompt（描述）两个字段。
> 建议参数：duration 60-120s（BGM），num_inference_steps 150+，guidance_scale 5-7

**1. 大厅 BGM（bgm-lobby.mp3）**
```
tags: chinese traditional, jazz lounge, lo-fi, smooth, elegant, relaxing, guzheng, cyberpunk ambient
lyrics:
[instrumental]

prompt: Sophisticated Chinese-style jazz lounge music for a card game lobby. Gentle guzheng arpeggios and soft pipa plucks over lo-fi hip-hop drum pattern, warm upright bass, subtle synthesizer pads adding cyberpunk ambient texture. Relaxed yet classy casino atmosphere. Seamless loop-friendly structure with no strong intro or outro. 90 BPM.
```

**2. 游戏中 BGM（bgm-gameplay.mp3）**
```
tags: tension, suspense, electronic, oriental, erhu, pipa, synth bass, cyberpunk fusion, mid-tempo
lyrics:
[instrumental]

prompt: Tense oriental electronic music for an active poker game round. Haunting erhu melody layered with pipa rhythmic plucks and deep analog synth bass. Light electronic percussion building steady anticipation, subtle hi-hat patterns. Mysterious cyberpunk fusion atmosphere, focused and strategic mood. Seamless loop-friendly. 110 BPM.
```

**3. 紧张对决 BGM（比牌/All-in 时切换，bgm-showdown.mp3）**
```
tags: dramatic, cinematic, orchestral, intense, chinese, taiko drums, brass, rising tension
lyrics:
[instrumental]

prompt: Dramatic cinematic music for a high-stakes poker showdown moment. Powerful taiko drum rolls building from pianissimo to fortissimo, rising orchestral string tremolo, intense brass stabs, Chinese war horn accent. Heart-pounding climax atmosphere, adrenaline rush. 130 BPM, 15-30 seconds with clear dramatic arc.
```

**4. 结算 BGM（bgm-settlement.mp3）**
```
tags: gentle, reflective, chinese, piano, erhu, ambient, soft ending
lyrics:
[instrumental]

prompt: Gentle reflective music for poker game settlement screen. Soft piano chords with distant erhu melody, light ambient pads, slow tempo winding down. Peaceful transition moment, neither too happy nor sad. Graceful fade-out ending. 75 BPM, 10-15 seconds.
```

**5. 胜利音乐（sfx-victory.mp3）**
```
tags: victory, celebration, chinese, bright, triumphant, gong, suona, electronic flourish
lyrics:
[instrumental]

prompt: Triumphant victory fanfare with Chinese traditional instruments. Bright suona melody leading a celebratory phrase, big gong crash on downbeat, rapid Chinese drum fills, shimmering electronic arpeggios ascending. Golden and rewarding climax. 140 BPM, 3-5 seconds sharp ending.
```

**6. 大赢家音乐（sfx-big-win.mp3）**
```
tags: epic victory, chinese orchestra, electronic drop, celebration, fireworks, gold coins
lyrics:
[instrumental]

prompt: Epic grand victory celebration music. Full Chinese orchestral fanfare with suona and erhu leading, massive taiko hit into electronic bass drop, cascading golden coin sound texture, firework-like sparkle synths ascending. Maximum hype and reward feeling. 150 BPM, 4-5 seconds.
```

**7. 失败音乐（sfx-defeat.mp3）**
```
tags: sad, melancholy, soft, gentle, erhu solo, minor key, fading
lyrics:
[instrumental]

prompt: Brief melancholy melody for a poker loss. Solo erhu playing a descending minor phrase over sparse piano chords, gentle and not depressing, dignified sadness. Notes trail off and fade naturally. 80 BPM, 3-5 seconds with soft fade-out.
```

---

#### B. AudioLDM / ElevenLabs / Stable Audio 提示词（短音效 SFX）

> 短音效（< 3s）不适合 ACE-Step，建议用 AudioLDM 2、ElevenLabs Sound Effects 或 Stable Audio 生成。
> 每条提供英文提示词和中文说明。

**游戏流程音效：**

| # | 文件名 | 提示词 | 说明 |
|---|--------|--------|------|
| 4 | sfx-enter-room.mp3 | `Futuristic door sliding open with electronic chime, sci-fi room entry, clean and welcoming, 1.5 seconds` | 进入房间 |
| 5 | sfx-ready.mp3 | `Short confirmation beep, positive UI feedback, bright digital chirp, 0.5 seconds` | 玩家准备 |
| 6 | sfx-game-start.mp3 | `Game start fanfare, short electronic countdown beep into energetic gong hit, exciting beginning, 2 seconds` | 游戏开始 |
| 7 | sfx-shuffle.mp3 | `Playing cards being shuffled by hand, crisp riffling and bridging, casino table atmosphere, satisfying paper sounds, 2 seconds` | 洗牌 |
| 8 | sfx-deal-card.mp3 | `Single playing card dealt and sliding on green felt table, quick crisp snap, 0.3 seconds` | 发牌（单张） |
| 9 | sfx-your-turn.mp3 | `Gentle attention chime, two-note ascending bell tone, subtle reminder, 0.5 seconds` | 轮到你操作 |
| 10 | sfx-countdown-tick.mp3 | `Single clock tick, clean mechanical click, urgent but not harsh, 0.2 seconds` | 倒计时滴答 |
| 11 | sfx-timeout.mp3 | `Buzzer timeout sound, low-pitched error horn, time expired, 1 second` | 操作超时 |

**玩家操作音效：**

| # | 文件名 | 提示词 | 说明 |
|---|--------|--------|------|
| 12 | sfx-look-card.mp3 | `Playing card flipping over on felt table, single card reveal with paper friction, satisfying flick sound, 0.5 seconds` | 看牌（翻牌） |
| 13 | sfx-call.mp3 | `Single poker chip tossed onto felt table, clean ceramic clink, casual bet, 0.5 seconds` | 跟注 |
| 14 | sfx-raise.mp3 | `Multiple poker chips stacked and pushed forward on table, heavier ceramic clinking with confidence, 0.8 seconds` | 加注 |
| 15 | sfx-all-in.mp3 | `Large pile of casino chips dramatically pushed all-in across felt table, heavy sliding impact with deep bass rumble, chips cascading and settling, dramatic cinematic tension hit, 2 seconds` | 全押 |
| 16 | sfx-fold.mp3 | `Playing cards tossed face-down onto table, giving up hand, soft paper thud on felt with slight disappointment, 0.5 seconds` | 弃牌 |
| 17 | sfx-compare-start.mp3 | `Dramatic sword unsheathing sound mixed with rising tension strings, confrontation moment, 1.5 seconds` | 比牌发起 |
| 18 | sfx-compare-reveal.mp3 | `Dramatic card reveal whoosh with orchestral hit and sparkle chime, magical unveil moment, 1 second` | 比牌翻牌 |

**结果反馈音效：**

| # | 文件名 | 提示词 | 说明 |
|---|--------|--------|------|
| 19 | sfx-compare-win.mp3 | `Short victory sting, bright ascending chime with small gong tap, satisfying win, 1 second` | 比牌胜利 |
| 20 | sfx-compare-lose.mp3 | `Short defeat sting, descending low tone with muted thud, brief disappointment, 1 second` | 比牌失败 |
| 23 | sfx-chips-collect.mp3 | `Pile of casino chips being gathered and stacked, multiple coins clinking together, collecting winnings, satisfying, 1.5 seconds` | 筹码收入 |

**牌型展示音效：**

| # | 文件名 | 提示词 | 说明 |
|---|--------|--------|------|
| 25 | sfx-hand-highcard.mp3 | `Plain card reveal, simple paper flip with neutral tone, nothing special, 0.5 seconds` | 散牌 |
| 26 | sfx-hand-pair.mp3 | `Mild positive chime, gentle two-note bell ascending, slight surprise, 0.8 seconds` | 对子 |
| 27 | sfx-hand-straight.mp3 | `Ascending musical scale run on xylophone, smooth upward progression, pleasant reveal, 1 second` | 顺子 |
| 28 | sfx-hand-flush.mp3 | `Crystal clear bell cascade, sparkling water-like chime melody, beautiful and elegant, 1 second` | 金花 |
| 29 | sfx-hand-straightflush.mp3 | `Brilliant ascending harp glissando into golden gong shimmer, luxurious and dazzling reveal, 1.5 seconds` | 顺金 |
| 30 | sfx-hand-triple.mp3 | `Epic orchestral hit with massive Chinese gong crash, dragon roar undertone, powerful bass drop, earth-shaking impact, triumphant and shocking, 2 seconds` | 豹子 |
| 31 | sfx-hand-235.mp3 | `Dramatic plot twist sound, reverse cymbal into shocking reveal hit, unexpected underdog victory fanfare, Chinese opera percussion accent, subversive and thrilling, 2 seconds` | 235 通杀 |

**UI 交互音效：**

| # | 文件名 | 提示词 | 说明 |
|---|--------|--------|------|
| 32 | sfx-btn-click.mp3 | `Soft digital button tap, clean subtle click, mobile UI interaction, 0.15 seconds` | 按钮点击 |
| 33 | sfx-btn-hover.mp3 | `Very soft hover feedback, tiny subtle whoosh, barely perceptible, 0.1 seconds` | 按钮悬停 |
| 34 | sfx-popup-open.mp3 | `Smooth popup appearing, gentle whoosh with soft chime, UI panel sliding in, 0.4 seconds` | 弹窗打开 |
| 35 | sfx-popup-close.mp3 | `Quick popup dismiss, soft reverse whoosh, UI panel sliding out, 0.3 seconds` | 弹窗关闭 |
| 36 | sfx-daily-bonus.mp3 | `Reward claim jingle, cheerful ascending coins dropping into pile with sparkle effects, gift received, 2 seconds` | 每日领取筹码 |
| 37 | sfx-error.mp3 | `Short error buzz, low-pitched negative feedback tone, blocked action, 0.5 seconds` | 错误提示 |
| 38 | sfx-player-join.mp3 | `Player joining notification, gentle ascending two-tone chime, someone arrived, 0.5 seconds` | 玩家加入 |
| 39 | sfx-player-leave.mp3 | `Player leaving notification, soft descending two-tone chime, someone departed, 0.5 seconds` | 玩家离开 |

---

## 九、技术实现建议

### 音频管理 Hook

建议创建 `src/hooks/useAudio.ts`：

```typescript
// 功能要点：
// 1. 预加载常用音效
// 2. 音量控制（BGM / SFX 分开）
// 3. BGM 循环播放和淡入淡出
// 4. 音效池（同一音效可重叠播放，如连续发牌）
// 5. 静音开关（存储到 localStorage）
// 6. 移动端自动播放限制处理（首次交互后解锁）
```

### 注意事项
- 移动端浏览器需要用户交互后才能播放音频
- BGM 文件建议压缩到 500KB 以内
- SFX 文件建议压缩到 50KB 以内
- 使用 Web Audio API 而非 HTML5 Audio 以获得更低延迟
- 考虑使用 Howler.js 库简化音频管理
