/**
 * 炸金花静态素材 URL（与 public/images/generated/zhajinhua/manifest.json 一致）
 */

import type { HandType } from '@/types/zjh';

const BASE = '/images/generated/zhajinhua';

export const zjhAssets = {
  lobbyBg: `${BASE}/lobby-bg.png`,
  tableBg: `${BASE}/table.png`,
  cardBack: `${BASE}/card-back.png`,
  chip10: `${BASE}/chip-10.png`,
  chip100: `${BASE}/chip-100.png`,
  chip1000: `${BASE}/chip-1000.png`,
  avatarFrame: `${BASE}/avatar-frame.png`,
  avatarFrameVip: `${BASE}/avatar-frame-vip.png`,
  btnCall: `${BASE}/btn-call.png`,
  btnRaise: `${BASE}/btn-raise.png`,
  btnFold: `${BASE}/btn-fold.png`,
  btnLook: `${BASE}/btn-look.png`,
  btnCompare: `${BASE}/btn-compare.png`,
  btnAllIn: `${BASE}/btn-all-in.png`,
  handBannerTriple: `${BASE}/hand-banner-triple.png`,
  handBannerStraightFlush: `${BASE}/hand-banner-straight-flush.png`,
  handBannerFlush: `${BASE}/hand-banner-flush.png`,
  victoryPopupBg: `${BASE}/victory-popup-bg.png`,
  /** 荷官欢迎弹层立绘（与 `gril3.png` 同源，备用） */
  dealerIntro: `${BASE}/dealer-intro.png`,
  /** 荷官欢迎弹层 3D 模型（优先于 dealerIntro 展示） */
  dealerModelGlb: `${BASE}/model/gril/three.glb`,
  /** 旧版奖池整图（多为黑底）；牌桌中央奖池已改用 CSS 透明磨砂框，此路径保留供换透明装饰图或文档引用 */
  potDisplayFrame: `${BASE}/pot-display-frame.png`,
  countdownHintFrame: `${BASE}/countdown-hint-frame.png`,
  gameLogoTitle: `${BASE}/game-logo-title.png`,
  dealCardMotion: `${BASE}/deal-card-motion.png`,
  seatEmptyWaiting: `${BASE}/seat-empty-waiting.png`,
  /** 左上角返回按钮（public/zhajinhua） */
  backButton: '/zhajinhua/back.png',
  /** antd-mobile Dialog 弹窗底图（public/zhajinhua） */
  dialogBg: '/zhajinhua/dialog_bg.png',
  /** 玩法说明 Popup 底图（public/zhajinhua，768×1344） */
  ruleGuideBg: '/zhajinhua/rule_bg.png',
} as const;

/* ---- 音频素材 ---- */

const AUDIO_BASE = '/audio/zjh';

export const zjhAudioAssets = {
  // BGM
  bgmLobby: `${AUDIO_BASE}/bgm/bgm-lobby.mp3`,
  bgmGameplay: `${AUDIO_BASE}/bgm/bgm-gameplay.mp3`,
  bgmSettlement: `${AUDIO_BASE}/bgm/bgm-settlement.mp3`,
  // SFX - 游戏流程
  sfxGameStart: `${AUDIO_BASE}/sfx/game/sfx-game-start.mp3`,
  // SFX - 结果
  sfxVictory: `${AUDIO_BASE}/sfx/result/sfx-victory.mp3`,
  sfxDefeat: `${AUDIO_BASE}/sfx/result/sfx-defeat.mp3`,
  sfxBigWin: `${AUDIO_BASE}/sfx/result/sfx-big-win.mp3`,
  // SFX - 牌型
  sfxHandTriple: `${AUDIO_BASE}/sfx/hand/sfx-hand-triple.mp3`,
  sfxHandStraightFlush: `${AUDIO_BASE}/sfx/hand/sfx-hand-straightflush.mp3`,
  sfxHand235: `${AUDIO_BASE}/sfx/hand/sfx-hand-235.mp3`,
} as const;

/** 所有音频 URL 列表（用于预加载） */
export const zjhAudioUrls: string[] = Object.values(zjhAudioAssets);

/** manifest 中只有豹子 / 顺金 / 金花 三张牌型条图，其余牌型仅展示文字 */
export function zjhHandBannerUrl(handType: HandType | null | undefined): string | null {
  if (!handType) return null;
  switch (handType) {
    case 'TRIPLE':
      return zjhAssets.handBannerTriple;
    case 'STRAIGHT_FLUSH':
      return zjhAssets.handBannerStraightFlush;
    case 'FLUSH':
      return zjhAssets.handBannerFlush;
    default:
      return null;
  }
}
