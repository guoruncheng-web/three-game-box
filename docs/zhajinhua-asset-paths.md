# 炸金花素材：游戏内引用路径对照表

## 首页/列表封面（与水果消消乐同级）

| 说明 | 文件名 | **游戏内引用路径** |
|------|--------|---------------------|
| 炸金花游戏卡片封面（方形 1024，万相生成） | `zhajinhua-cover.png` | **`/images/games/zhajinhua-cover.png`** |

生成命令：`pnpm run generate:zhajinhua-cover`（需 `DASHSCOPE_API_KEY`），脚本见 `scripts/generate-zhajinhua-cover-bailian.mjs`。

**不覆盖原图、先看效果：** `pnpm run generate:zhajinhua-cover:preview` → 生成 `zhajinhua-cover-preview.png`。全套素材预览：`pnpm run generate:zhajinhua-assets:preview`（输出到 `generated/zhajinhua-preview/`，与 `zhajinhua/` 并存）。

---

静态资源目录：`public/images/generated/zhajinhua/`（Next.js 内以 **`/` 开头** 的 URL 引用）。

| 文档序号 | 中文说明 | `assetKey`（代码常量建议） | 英文文件名 | **游戏内引用路径** |
|---------|---------|---------------------------|------------|---------------------|
| 1 | 游戏大厅背景 | `lobbyBg` | `lobby-bg.png` | `/images/generated/zhajinhua/lobby-bg.png` |
| 2 | 游戏桌面背景 | `tableBg` | `table-bg.png` | `/images/generated/zhajinhua/table-bg.png` |
| 3 | 扑克牌背面 | `cardBack` | `card-back.png` | `/images/generated/zhajinhua/card-back.png` |
| 4 | 筹码 - 小额 (10) | `chip10` | `chip-10.png` | `/images/generated/zhajinhua/chip-10.png` |
| 5 | 筹码 - 中额 (100) | `chip100` | `chip-100.png` | `/images/generated/zhajinhua/chip-100.png` |
| 6 | 筹码 - 大额 (1000) | `chip1000` | `chip-1000.png` | `/images/generated/zhajinhua/chip-1000.png` |
| 7 | 玩家头像框 | `avatarFrame` | `avatar-frame.png` | `/images/generated/zhajinhua/avatar-frame.png` |
| 8 | VIP 玩家头像框 | `avatarFrameVip` | `avatar-frame-vip.png` | `/images/generated/zhajinhua/avatar-frame-vip.png` |
| 9 | 操作按钮 - 跟注 (CALL) | `btnCall` | `btn-call.png` | `/images/generated/zhajinhua/btn-call.png` |
| 10 | 操作按钮 - 加注 (RAISE) | `btnRaise` | `btn-raise.png` | `/images/generated/zhajinhua/btn-raise.png` |
| 11 | 操作按钮 - 弃牌 (FOLD) | `btnFold` | `btn-fold.png` | `/images/generated/zhajinhua/btn-fold.png` |
| 12 | 操作按钮 - 看牌 (LOOK) | `btnLook` | `btn-look.png` | `/images/generated/zhajinhua/btn-look.png` |
| 13 | 操作按钮 - 比牌 (COMPARE) | `btnCompare` | `btn-compare.png` | `/images/generated/zhajinhua/btn-compare.png` |
| 14 | 操作按钮 - 全押 (ALL IN) | `btnAllIn` | `btn-all-in.png` | `/images/generated/zhajinhua/btn-all-in.png` |
| 15 | 牌型展示 - 豹子 | `handBannerTriple` | `hand-banner-triple.png` | `/images/generated/zhajinhua/hand-banner-triple.png` |
| 16 | 牌型展示 - 顺金 | `handBannerStraightFlush` | `hand-banner-straight-flush.png` | `/images/generated/zhajinhua/hand-banner-straight-flush.png` |
| 17 | 牌型展示 - 金花 | `handBannerFlush` | `hand-banner-flush.png` | `/images/generated/zhajinhua/hand-banner-flush.png` |
| 18 | 胜利特效弹窗背景 | `victoryPopupBg` | `victory-popup-bg.png` | `/images/generated/zhajinhua/victory-popup-bg.png` |
| 19 | 筹码堆/奖池显示框 | `potDisplayFrame` | `pot-display-frame.png` | `/images/generated/zhajinhua/pot-display-frame.png` |
| 20 | 倒计时/操作提示框 | `countdownHintFrame` | `countdown-hint-frame.png` | `/images/generated/zhajinhua/countdown-hint-frame.png` |
| 21 | 游戏 Logo / 标题 | `gameLogoTitle` | `game-logo-title.png` | `/images/generated/zhajinhua/game-logo-title.png` |
| 22 | 发牌动效帧 - 牌飞出效果 | `dealCardMotion` | `deal-card-motion.png` | `/images/generated/zhajinhua/deal-card-motion.png` |
| 23 | 座位标记 - 空座/等待中 | `seatEmptyWaiting` | `seat-empty-waiting.png` | `/images/generated/zhajinhua/seat-empty-waiting.png` |

## 机器可读清单

同目录下的 `manifest.json` 已同步为英文文件名，并包含 `assetKey` 字段，便于在代码中集中引用。

## 示例（React / Next.js）

```tsx
const ZHAJINHUA_ASSETS = {
  lobbyBg: '/images/generated/zhajinhua/lobby-bg.png',
  tableBg: '/images/generated/zhajinhua/table-bg.png',
  cardBack: '/images/generated/zhajinhua/card-back.png',
  // …其余见 manifest.json
} as const;

<img src={ZHAJINHUA_ASSETS.lobbyBg} alt="" />
```
