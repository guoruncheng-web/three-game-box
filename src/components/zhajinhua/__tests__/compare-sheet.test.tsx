import { describe, it, expect } from 'vitest';

/**
 * 比牌弹层候选人过滤逻辑单元测试
 * 验证：需求 5.4（属性 6）
 */
describe('比牌弹层候选人过滤逻辑', () => {
  // 模拟玩家数据类型
  type PlayerStatus = 'ACTIVE' | 'FOLDED' | 'OUT' | 'ALL_IN';
  interface Player {
    userId: string;
    status: PlayerStatus;
    username: string | null;
  }

  function getCandidates(players: Player[], currentUserId: string): Player[] {
    return players.filter(
      (p) => p.userId !== currentUserId && p.status !== 'FOLDED' && p.status !== 'OUT'
    );
  }

  it('属性 6：候选列表为空时应返回空数组', () => {
    const players: Player[] = [
      { userId: 'me', status: 'ACTIVE', username: '我' },
      { userId: 'u1', status: 'FOLDED', username: '玩家1' },
      { userId: 'u2', status: 'OUT', username: '玩家2' },
    ];
    const candidates = getCandidates(players, 'me');
    expect(candidates).toHaveLength(0);
  });

  it('已弃牌（FOLDED）玩家不出现在候选列表', () => {
    const players: Player[] = [
      { userId: 'me', status: 'ACTIVE', username: '我' },
      { userId: 'u1', status: 'FOLDED', username: '玩家1' },
      { userId: 'u2', status: 'ACTIVE', username: '玩家2' },
    ];
    const candidates = getCandidates(players, 'me');
    expect(candidates).toHaveLength(1);
    expect(candidates[0].userId).toBe('u2');
  });

  it('已出局（OUT）玩家不出现在候选列表', () => {
    const players: Player[] = [
      { userId: 'me', status: 'ACTIVE', username: '我' },
      { userId: 'u1', status: 'OUT', username: '玩家1' },
      { userId: 'u2', status: 'ACTIVE', username: '玩家2' },
    ];
    const candidates = getCandidates(players, 'me');
    expect(candidates).toHaveLength(1);
    expect(candidates[0].userId).toBe('u2');
  });

  it('当前用户自己不出现在候选列表', () => {
    const players: Player[] = [
      { userId: 'me', status: 'ACTIVE', username: '我' },
      { userId: 'u1', status: 'ACTIVE', username: '玩家1' },
    ];
    const candidates = getCandidates(players, 'me');
    expect(candidates).toHaveLength(1);
    expect(candidates[0].userId).toBe('u1');
  });

  it('ALL_IN 状态的玩家应出现在候选列表', () => {
    const players: Player[] = [
      { userId: 'me', status: 'ACTIVE', username: '我' },
      { userId: 'u1', status: 'ALL_IN', username: '玩家1' },
    ];
    const candidates = getCandidates(players, 'me');
    expect(candidates).toHaveLength(1);
    expect(candidates[0].userId).toBe('u1');
  });
});
