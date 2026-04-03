/**
 * 炸金花静态素材 URL（与 public/images/generated/zhajinhua/manifest.json 一致）
 */

import type { HandType } from '@/types/zjh';

const BASE = '/images/generated/zhajinhua';

export const zjhAssets = {
  lobbyBg: `${BASE}/lobby-bg.png`,
  tableBg: `${BASE}/table-bg.png`,
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
  /** 荷官欢迎弹层立绘（透明底 PNG，由项目生成或替换） */
  dealerIntro: `${BASE}/dealer-intro.png`,
  /** 旧版奖池整图（多为黑底）；牌桌中央奖池已改用 CSS 透明磨砂框，此路径保留供换透明装饰图或文档引用 */
  potDisplayFrame: `${BASE}/pot-display-frame.png`,
  countdownHintFrame: `${BASE}/countdown-hint-frame.png`,
  gameLogoTitle: `${BASE}/game-logo-title.png`,
  dealCardMotion: `${BASE}/deal-card-motion.png`,
  seatEmptyWaiting: `${BASE}/seat-empty-waiting.png`,
} as const;

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
