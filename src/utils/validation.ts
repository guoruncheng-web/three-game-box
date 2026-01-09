/**
 * 数据验证工具函数
 */

/**
 * 验证手机号格式（支持中国大陆手机号）
 * @param phone - 手机号
 * @returns 是否合法
 */
export function isValidPhone(phone: string): boolean {
  // 中国大陆手机号：1 开头 + 10 位数字
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证邮箱格式
 * @param email - 邮箱地址
 * @returns 是否合法
 */
export function isValidEmail(email: string): boolean {
  // 标准邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证验证码
 * @param code - 验证码
 * @returns 是否正确
 */
export function verifyCode(code: string): boolean {
  // 写死为 666666
  return code === '666666';
}

/**
 * 判断输入是手机号还是邮箱
 * @param identifier - 用户输入的标识符
 * @returns 'phone' | 'email' | 'unknown'
 */
export function identifyContactType(identifier: string): 'phone' | 'email' | 'unknown' {
  if (isValidPhone(identifier)) {
    return 'phone';
  }
  if (isValidEmail(identifier)) {
    return 'email';
  }
  return 'unknown';
}
