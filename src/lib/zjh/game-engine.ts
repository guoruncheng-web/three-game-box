/**
 * 炸金花游戏引擎
 * 状态管理、下注逻辑、回合轮转
 */

import type { Card, ActionType, PlayerStatus } from '@/types/zjh';
import { createShuffledDeck, dealCards } from './deck';
import { evaluateHand, compareHands } from './hand-evaluator';
import { BET_MULTIPLIER, HAND_TYPE_DISPLAY } from './constants';

/** 游戏中玩家的内部状态 */
export interface GamePlayerState {
  userId: string;
  seatIndex: number;
  status: PlayerStatus;
  hand: Card[];
  hasLooked: boolean;
  totalBet: number;
  chips: number;
  chipsBeforeGame: number;
}

/** 游戏内部状态 */
export interface GameState {
  players: GamePlayerState[];
  pot: number;
  currentAnte: number;
  currentRound: number;
  currentTurnIndex: number; // 当前行动玩家在 players 数组中的索引
  dealerIndex: number;
  maxRounds: number;
  deck: Card[];
}

/**
 * 初始化一局游戏
 * 洗牌、发牌、扣除底注
 */
export function initializeGame(
  playerInfos: { userId: string; seatIndex: number; chips: number }[],
  baseAnte: number,
  maxRounds: number,
  dealerIndex: number
): GameState {
  const deck = createShuffledDeck();
  const hands = dealCards([...deck], playerInfos.length);

  // 创建玩家状态，扣除底注
  const players: GamePlayerState[] = playerInfos.map((info, i) => ({
    userId: info.userId,
    seatIndex: info.seatIndex,
    status: 'PLAYING' as PlayerStatus,
    hand: hands[i],
    hasLooked: false,
    totalBet: baseAnte,
    chips: info.chips - baseAnte,
    chipsBeforeGame: info.chips,
  }));

  const pot = baseAnte * players.length;

  // 首个行动玩家：庄家下一位
  const firstTurnIndex = (dealerIndex + 1) % players.length;

  return {
    players,
    pot,
    currentAnte: baseAnte,
    currentRound: 1,
    currentTurnIndex: firstTurnIndex,
    dealerIndex,
    maxRounds,
    deck: deck.slice(playerInfos.length * 3), // 剩余牌（虽然不需要再发牌）
  };
}

/**
 * 获取当前行动的玩家
 */
export function getCurrentPlayer(state: GameState): GamePlayerState | null {
  const activePlayers = getActivePlayers(state);
  if (activePlayers.length <= 1) return null;

  return state.players[state.currentTurnIndex] ?? null;
}

/**
 * 获取仍在游戏中的玩家（未弃牌、未出局）
 */
export function getActivePlayers(state: GameState): GamePlayerState[] {
  return state.players.filter(
    p => p.status !== 'FOLDED' && p.status !== 'OUT'
  );
}

/**
 * 推进到下一个玩家的回合
 */
export function advanceTurn(state: GameState): void {
  const totalPlayers = state.players.length;
  let nextIndex = (state.currentTurnIndex + 1) % totalPlayers;
  let loopCount = 0;

  // 跳过已弃牌、已出局、已全押的玩家
  while (loopCount < totalPlayers) {
    const player = state.players[nextIndex];
    if (
      player.status !== 'FOLDED' &&
      player.status !== 'OUT' &&
      player.status !== 'ALL_IN'
    ) {
      break;
    }
    nextIndex = (nextIndex + 1) % totalPlayers;
    loopCount++;
  }

  // 检查是否完成一轮（回到起点或超过一圈）
  if (nextIndex <= state.currentTurnIndex || loopCount >= totalPlayers) {
    state.currentRound++;
  }

  state.currentTurnIndex = nextIndex;
}

/**
 * 计算玩家当前应下注的金额
 * @param isLooked 是否已看牌
 * @param currentAnte 当前底注
 * @param multiplier 下注倍数
 */
export function calculateBetAmount(isLooked: boolean, currentAnte: number, multiplier: number): number {
  if (isLooked) {
    // 看牌后下注为底注的 2 倍或 4 倍
    return currentAnte * multiplier;
  }
  // 闷牌下注为底注的 1 倍或 2 倍
  return currentAnte * multiplier;
}

/**
 * 验证下注金额是否合法
 */
export function validateBetAmount(
  amount: number,
  isLooked: boolean,
  currentAnte: number
): { valid: boolean; error?: string } {
  const minBet = isLooked ? currentAnte * 2 : currentAnte;
  const maxBet = currentAnte * BET_MULTIPLIER.MAX_RAISE;

  if (amount < minBet) {
    return { valid: false, error: `下注金额不能低于 ${minBet}` };
  }
  if (amount > maxBet) {
    return { valid: false, error: `下注金额不能超过 ${maxBet}` };
  }

  return { valid: true };
}

/**
 * 执行玩家操作
 * @returns 操作结果和更新后的状态
 */
export function executeAction(
  state: GameState,
  userId: string,
  actionType: ActionType,
  amount?: number,
  targetUserId?: string
): {
  success: boolean;
  error?: string;
  betAmount: number;
  gameOver: boolean;
  winnerId?: string;
} {
  const playerIndex = state.players.findIndex(p => p.userId === userId);
  if (playerIndex === -1) {
    return { success: false, error: '玩家不在游戏中', betAmount: 0, gameOver: false };
  }

  const player = state.players[playerIndex];

  // 验证是否是当前玩家的回合
  if (state.currentTurnIndex !== playerIndex) {
    return { success: false, error: '不是你的回合', betAmount: 0, gameOver: false };
  }

  // 验证玩家状态
  if (player.status === 'FOLDED' || player.status === 'OUT') {
    return { success: false, error: '你已经退出本局', betAmount: 0, gameOver: false };
  }

  let betAmount = 0;

  switch (actionType) {
    case 'LOOK': {
      // 看牌操作
      if (player.hasLooked) {
        return { success: false, error: '你已经看过牌了', betAmount: 0, gameOver: false };
      }
      player.hasLooked = true;
      player.status = 'LOOKED';
      // 看牌不消耗回合，不推进 turn
      return { success: true, betAmount: 0, gameOver: false };
    }

    case 'CALL': {
      // 跟注
      const callAmount = player.hasLooked ? state.currentAnte * 2 : state.currentAnte;
      if (player.chips < callAmount) {
        return { success: false, error: '筹码不足', betAmount: 0, gameOver: false };
      }
      betAmount = callAmount;
      player.chips -= betAmount;
      player.totalBet += betAmount;
      state.pot += betAmount;
      break;
    }

    case 'RAISE': {
      // 加注
      if (amount === undefined) {
        return { success: false, error: '加注必须指定金额', betAmount: 0, gameOver: false };
      }
      const validation = validateBetAmount(amount, player.hasLooked, state.currentAnte);
      if (!validation.valid) {
        return { success: false, error: validation.error, betAmount: 0, gameOver: false };
      }
      if (player.chips < amount) {
        return { success: false, error: '筹码不足', betAmount: 0, gameOver: false };
      }
      betAmount = amount;
      player.chips -= betAmount;
      player.totalBet += betAmount;
      state.pot += betAmount;
      // 加注会更新当前底注
      state.currentAnte = amount;
      break;
    }

    case 'ALL_IN': {
      // 全押
      betAmount = player.chips;
      player.chips = 0;
      player.totalBet += betAmount;
      state.pot += betAmount;
      player.status = 'ALL_IN';
      break;
    }

    case 'FOLD': {
      // 弃牌
      player.status = 'FOLDED';
      break;
    }

    case 'COMPARE': {
      // 比牌逻辑在 executeCompare 中单独处理
      return { success: false, error: '比牌请使用专用接口', betAmount: 0, gameOver: false };
    }

    default:
      return { success: false, error: '无效操作', betAmount: 0, gameOver: false };
  }

  // 检查游戏是否结束（只剩一人）
  const activePlayers = getActivePlayers(state);
  if (activePlayers.length === 1) {
    return {
      success: true,
      betAmount,
      gameOver: true,
      winnerId: activePlayers[0].userId,
    };
  }

  // 检查是否达到封顶轮次
  if (state.currentRound >= state.maxRounds) {
    // 强制比牌（找出最大牌的玩家）
    const winner = forceShowdown(state);
    return {
      success: true,
      betAmount,
      gameOver: true,
      winnerId: winner?.userId,
    };
  }

  // 推进回合
  advanceTurn(state);

  return { success: true, betAmount, gameOver: false };
}

/**
 * 执行比牌操作
 */
export function executeCompare(
  state: GameState,
  initiatorId: string,
  targetId: string
): {
  success: boolean;
  error?: string;
  winnerId?: string;
  loserId?: string;
  cost: number;
  gameOver: boolean;
  initiatorHand?: { handType: string; handTypeDisplay: string };
  targetHand?: { handType: string; handTypeDisplay: string };
} {
  const initiatorIndex = state.players.findIndex(p => p.userId === initiatorId);
  const targetIndex = state.players.findIndex(p => p.userId === targetId);

  if (initiatorIndex === -1 || targetIndex === -1) {
    return { success: false, error: '玩家不在游戏中', cost: 0, gameOver: false };
  }

  const initiator = state.players[initiatorIndex];
  const target = state.players[targetIndex];

  // 验证是否是当前玩家的回合
  if (state.currentTurnIndex !== initiatorIndex) {
    return { success: false, error: '不是你的回合', cost: 0, gameOver: false };
  }

  // 验证发起者已看牌
  if (!initiator.hasLooked) {
    return { success: false, error: '未看牌不能主动发起比牌', cost: 0, gameOver: false };
  }

  // 验证目标玩家状态
  if (target.status === 'FOLDED' || target.status === 'OUT') {
    return { success: false, error: '目标玩家已退出', cost: 0, gameOver: false };
  }

  // 比牌费用：当前底注 * 2
  const cost = state.currentAnte * BET_MULTIPLIER.COMPARE_COST;
  if (initiator.chips < cost) {
    return { success: false, error: '筹码不足以发起比牌', cost: 0, gameOver: false };
  }

  // 扣除比牌费用
  initiator.chips -= cost;
  initiator.totalBet += cost;
  state.pot += cost;

  // 比较手牌
  const result = compareHands(initiator.hand, target.hand);

  const initiatorEval = evaluateHand(initiator.hand);
  const targetEval = evaluateHand(target.hand);

  let winnerId: string;
  let loserId: string;

  if (result > 0) {
    // 发起者赢
    winnerId = initiatorId;
    loserId = targetId;
    target.status = 'OUT';
  } else {
    // 目标赢（平局时发起者输）
    winnerId = targetId;
    loserId = initiatorId;
    initiator.status = 'OUT';
  }

  // 检查游戏是否结束
  const activePlayers = getActivePlayers(state);
  const gameOver = activePlayers.length <= 1;

  if (!gameOver) {
    advanceTurn(state);
  }

  return {
    success: true,
    winnerId,
    loserId,
    cost,
    gameOver,
    initiatorHand: {
      handType: initiatorEval.handType,
      handTypeDisplay: HAND_TYPE_DISPLAY[initiatorEval.handType],
    },
    targetHand: {
      handType: targetEval.handType,
      handTypeDisplay: HAND_TYPE_DISPLAY[targetEval.handType],
    },
  };
}

/**
 * 强制亮牌比牌（封顶轮次或最终对决）
 * 返回获胜玩家
 */
export function forceShowdown(state: GameState): GamePlayerState | null {
  const activePlayers = getActivePlayers(state);
  if (activePlayers.length === 0) return null;
  if (activePlayers.length === 1) return activePlayers[0];

  let winner = activePlayers[0];
  for (let i = 1; i < activePlayers.length; i++) {
    const result = compareHands(winner.hand, activePlayers[i].hand);
    if (result < 0) {
      winner = activePlayers[i];
    }
  }

  return winner;
}

/**
 * 结算游戏
 * 给获胜者分配奖池筹码
 */
export function settleGame(
  state: GameState,
  winnerId: string
): {
  players: {
    userId: string;
    chipsChange: number;
    finalChips: number;
    handType: string;
    handTypeDisplay: string;
    isWinner: boolean;
  }[];
} {
  const results = state.players.map(player => {
    const evaluation = evaluateHand(player.hand);
    const isWinner = player.userId === winnerId;
    const chipsChange = isWinner
      ? state.pot - player.totalBet // 净赢取 = 奖池 - 自己的下注
      : -player.totalBet; // 损失 = 自己的下注

    return {
      userId: player.userId,
      chipsChange,
      finalChips: player.chipsBeforeGame + chipsChange,
      handType: evaluation.handType,
      handTypeDisplay: HAND_TYPE_DISPLAY[evaluation.handType],
      isWinner,
    };
  });

  return { players: results };
}
