/**
 * 确保人机模式下的机器人用户与筹码战绩存在
 */

import { prisma } from '@/lib/prisma';
import { INITIAL_CHIPS } from '@/lib/zjh/constants';
import { ZJH_BOT_USER_ID, ZJH_BOT_USERNAME } from '@/lib/zjh/bot-constants';

export async function ensureZjhBotUser(): Promise<{ userId: string }> {
  await prisma.user.upsert({
    where: { id: ZJH_BOT_USER_ID },
    create: {
      id: ZJH_BOT_USER_ID,
      username: ZJH_BOT_USERNAME,
      isGuest: true,
    },
    update: {
      username: ZJH_BOT_USERNAME,
    },
  });

  await prisma.zjhPlayerStats.upsert({
    where: { userId: ZJH_BOT_USER_ID },
    create: {
      userId: ZJH_BOT_USER_ID,
      currentChips: INITIAL_CHIPS,
    },
    update: {},
  });

  return { userId: ZJH_BOT_USER_ID };
}
