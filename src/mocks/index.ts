/**
 * Mock 数据入口
 * 在开发环境下启用
 */

if (process.env.NODE_ENV === 'development') {
  require('./games.mock');
}

export {};
