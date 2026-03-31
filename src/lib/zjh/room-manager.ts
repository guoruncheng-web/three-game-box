/**
 * 房间管理逻辑
 * 生成房间号、座位分配等工具函数
 */

/**
 * 生成唯一的 6 位房间号
 * @returns 6 位数字字符串
 */
export function generateRoomCode(): string {
  // 生成 100000-999999 之间的随机数
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}

/**
 * 为新玩家分配座位号
 * 找到第一个空闲座位
 * @param occupiedSeats 已占用的座位号数组
 * @param maxPlayers 最大玩家数
 * @returns 分配的座位号，如果没有空位返回 -1
 */
export function assignSeat(occupiedSeats: number[], maxPlayers: number): number {
  for (let i = 0; i < maxPlayers; i++) {
    if (!occupiedSeats.includes(i)) {
      return i;
    }
  }
  return -1;
}

/**
 * 确定庄家座位索引
 * 第一局随机，之后顺延
 * @param gameIndex 第几局（从 1 开始）
 * @param playerCount 玩家数
 * @param previousDealerIndex 上一局庄家索引
 * @returns 庄家在座位中的索引
 */
export function determineDealerIndex(
  gameIndex: number,
  playerCount: number,
  previousDealerIndex?: number
): number {
  if (gameIndex === 1 || previousDealerIndex === undefined) {
    // 第一局随机确定庄家
    return Math.floor(Math.random() * playerCount);
  }
  // 之后轮转
  return (previousDealerIndex + 1) % playerCount;
}

/**
 * 选择新房主
 * 当房主离开时，选择加入时间最早的玩家作为新房主
 * @param playerUserIds 剩余玩家 ID 列表
 * @param currentOwnerId 当前房主 ID
 * @returns 新房主 ID，如果没有其他玩家返回 null
 */
export function selectNewOwner(
  playerUserIds: string[],
  currentOwnerId: string
): string | null {
  const remaining = playerUserIds.filter(id => id !== currentOwnerId);
  return remaining.length > 0 ? remaining[0] : null;
}
