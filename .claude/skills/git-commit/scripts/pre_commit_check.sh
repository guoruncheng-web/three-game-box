#!/bin/bash
# Git 提交前检查脚本
# 检查 TypeScript 错误、ESLint 错误和代码漏洞

set -e

echo "🔍 开始提交前检查..."
echo ""

# 1. TypeScript 检查
echo "📘 检查 TypeScript 错误..."
if ! npx tsc --noEmit; then
    echo "❌ TypeScript 检查失败！请修复类型错误后再提交。"
    exit 1
fi
echo "✅ TypeScript 检查通过"
echo ""

# 2. ESLint 检查
echo "🔧 检查 ESLint 错误..."
if ! npm run lint; then
    echo "❌ ESLint 检查失败！请修复代码规范问题后再提交。"
    exit 1
fi
echo "✅ ESLint 检查通过"
echo ""

# 3. npm audit 检查（代码漏洞）
echo "🔒 检查代码漏洞..."
AUDIT_OUTPUT=$(npm audit --audit-level=high 2>&1 || true)
if echo "$AUDIT_OUTPUT" | grep -q "high"; then
    echo "⚠️  发现高危漏洞："
    npm audit --audit-level=high
    echo ""
    echo "建议运行: npm audit fix"
    echo "如果确认要继续提交，请手动提交。"
    exit 1
fi
echo "✅ 漏洞检查通过"
echo ""

echo "🎉 所有检查通过！可以安全提交。"
exit 0
