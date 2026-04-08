/**
 * 炸金花玩法说明（与本站实现一致的简要规则）
 */

'use client';

import { Button, Popup } from 'antd-mobile';

import { zjhAssets } from '@/lib/zhajinhua/assets';

/** localStorage 键：已读过玩法说明则不再自动弹出 */
export const ZJH_GUIDE_STORAGE_KEY = 'zhajinhua_guide_seen_v1';

export interface ZhajinhuaGuidePopupProps {
  visible: boolean;
  onClose: () => void;
  /** 在对局中时可显示「重播牌桌操作引导」 */
  onReplayPlayingTour?: () => void;
}

/**
 * 底部弹层：滚动阅读规则，适合移动端长文案
 */
export function ZhajinhuaGuidePopup({
  visible,
  onClose,
  onReplayPlayingTour,
}: ZhajinhuaGuidePopupProps) {
  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      destroyOnClose
      bodyClassName="zjh-guide-popup-body"
      bodyStyle={{
        /** 固定高度才能让 flex 子项 flex-1 + overflow 生效，避免底栏盖住正文；底图样式见 globals */
        height: 'min(88vh, 100dvh)',
        maxHeight: 'min(88vh, 100dvh)',
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: `url(${zjhAssets.ruleGuideBg})`,
        /** cover：横向铺满不留缝；100% auto 在窄屏上易与图内黑边叠出两侧「细黑条」观感 */
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        /** 与 rule_bg 内板/侧柱接近，填充素材里透明像素，减轻「上中下宽度不一」导致的缝隙 */
        backgroundColor: '#162a30',
      }}
    >
      <div className="zjh-guide-popup-inner flex h-full min-h-0 min-w-0 flex-1 flex-col text-white">
        <div className="shrink-0 border-b border-amber-400/15 px-4 pb-3 pt-1">
          <h2 className="text-center text-lg font-black tracking-wide text-amber-200">炸金花 · 玩法说明</h2>
          <p className="mt-1 text-center text-[11px] text-white/55">以下为游戏盒内规则摘要，便于快速上手</p>
        </div>

        <div className="zjh-guide-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 text-[13px] leading-relaxed text-white/90">
          <section className="mb-5">
            <h3 className="mb-2 text-sm font-bold text-amber-300/95">游戏目标</h3>
            <p>
              每位玩家发 <strong className="text-amber-100">3 张牌</strong>
              ，通过轮流出牌下注，最终牌型更大者赢得
              <strong className="text-amber-100"> 奖池筹码</strong>。可随时弃牌认输，放弃本局已下筹码。
            </p>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 text-sm font-bold text-amber-300/95">牌型大小（大到小）</h3>
            <ol className="list-decimal space-y-1.5 pl-4 marker:text-amber-400/90">
              <li>
                <strong className="text-amber-100">豹子</strong>：三张点数相同
              </li>
              <li>
                <strong className="text-amber-100">顺金</strong>：同花顺（同花色且点数连续）
              </li>
              <li>
                <strong className="text-amber-100">金花</strong>：三张同花、非顺子
              </li>
              <li>
                <strong className="text-amber-100">顺子</strong>：点数连续、花色不全相同
              </li>
              <li>
                <strong className="text-amber-100">对子</strong>：两张同点
              </li>
              <li>
                <strong className="text-amber-100">散牌</strong>：以上皆非；比单张点数与花色
              </li>
            </ol>
            <p className="mt-2 text-[12px] text-white/60">
              牌型相同时按点数、花色比较（具体以服务器判定为准）。
            </p>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 text-sm font-bold text-amber-300/95">一局怎么进行</h3>
            <ul className="list-disc space-y-1.5 pl-4 marker:text-amber-400/80">
              <li>开局每人先扣 <strong className="text-amber-100">底注</strong>，形成中央奖池。</li>
              <li>
                按提示轮到你的回合时，可选择：<strong className="text-amber-100">跟注</strong>、
                <strong className="text-amber-100">加注</strong>、<strong className="text-amber-100">全押</strong>或
                <strong className="text-amber-100">弃牌</strong>。
              </li>
              <li>
                可先点 <strong className="text-amber-100">看牌</strong> 查看自己的三张牌；看牌后通常需按更高倍数跟注（相对「闷牌」）。
              </li>
              <li>
                看牌后若仍在本局内，可使用 <strong className="text-amber-100">比牌</strong> 与一名未弃牌玩家单挑，输方本局出局（会消耗额外筹码，以当局规则为准）。
              </li>
            </ul>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 text-sm font-bold text-amber-300/95">本页模式说明</h3>
            <ul className="list-disc space-y-1.5 pl-4 marker:text-emerald-400/80">
              <li>
                <strong className="text-emerald-200">人机对战</strong>：与机器人同桌练习，机器人回合会自动出牌。
              </li>
              <li>
                <strong className="text-emerald-200">快速匹配</strong>：与在线玩家匹配同房。
              </li>
              <li>
                <strong className="text-emerald-200">房间号</strong>：输入好友房间号加入；人满后由房主开始游戏。
              </li>
            </ul>
          </section>

          <p className="rounded-xl bg-black/25 px-3 py-2 text-[11px] text-white/55">
            提示：筹码为游戏内数值，请在娱乐时间内适度游戏。若界面与好友口头规则不一致，以本游戏服务器结算为准。
          </p>
        </div>

        <div className="zjh-guide-footer shrink-0 space-y-2 border-t border-amber-400/20 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
          {onReplayPlayingTour ? (
            <Button fill="outline" block size="small" onClick={onReplayPlayingTour}>
              重播牌桌操作引导（点哪里、下一步）
            </Button>
          ) : null}
          <Button color="primary" block size="large" onClick={onClose}>
            我知道了
          </Button>
        </div>
      </div>
    </Popup>
  );
}
