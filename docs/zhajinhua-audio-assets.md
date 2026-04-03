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

### AI 生成提示词（用于 ElevenLabs / Stable Audio）

**大厅 BGM：**
```
Chinese traditional instruments lo-fi beat, guzheng melody with soft electronic drums,
relaxed chill vibe, cyberpunk ambient undertone, loopable, 90 BPM
```

**游戏中 BGM：**
```
Tense Chinese poker game music, erhu and pipa with electronic synth bass,
suspenseful atmosphere, moderate tempo building tension, cyberpunk fusion,
loopable, 110 BPM
```

**洗牌音效：**
```
Card shuffling sound effect, crisp paper cards being riffled and bridged,
casino atmosphere, clear and satisfying, 2 seconds
```

**筹码推入：**
```
Casino poker chips being pushed forward on felt table,
multiple chips clinking together, satisfying ceramic click sound, 0.5 seconds
```

**全押音效：**
```
Large stack of casino chips pushed all-in on poker table,
dramatic heavy impact with deep bass rumble, cinematic tension hit,
chips cascading and settling, 2 seconds
```

**豹子牌型展示：**
```
Epic reveal sound effect, dramatic orchestral hit with Chinese gong crash,
dragon roar undertone, powerful bass drop, triumphant and shocking, 2 seconds
```

**235 通杀：**
```
Dramatic plot twist sound effect, reverse cymbal into shocking reveal hit,
unexpected victory fanfare, Chinese opera percussion accent, 2 seconds
```

**胜利音效：**
```
Victory celebration jingle, Chinese style gong and drum with electronic flourish,
golden coins dropping sound, cheerful and triumphant, short celebratory, 3 seconds
```

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
