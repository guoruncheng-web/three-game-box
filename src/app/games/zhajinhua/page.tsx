/**
 * 炸金花游戏页面：大厅 / 房间 / 牌桌 / 结算
 */

'use client';

import { ZhajinhuaApp } from '@/components/zhajinhua/zhajinhua-app';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ZhajinhuaGamePage() {
  return (
    <AuthGuard>
      <ZhajinhuaApp />
    </AuthGuard>
  );
}
