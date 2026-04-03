/**
 * 确保 User 记录存在（用于 localStorage 中 userId 与 DB 不一致时的自愈）
 */

import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * 若不存在则按给定 id 补一条游客用户（与 POST /api/users/guest 行为一致，但保留客户端 id）
 * 使用 upsert，避免并发重复创建
 */
export async function ensureUserById(userId: string): Promise<void> {
  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      isGuest: true,
      guestToken: randomUUID(),
    },
    update: {},
  });
}
