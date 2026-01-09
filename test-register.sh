#!/bin/bash

# 测试注册接口

# 服务器地址
BASE_URL="http://localhost:3000"

echo "=== 测试 1: 邮箱注册 ==="
curl -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "contact": "test@example.com",
    "password": "Test1234!",
    "code": "666666",
    "nickname": "测试用户"
  }' | jq .

echo -e "\n=== 测试 2: 手机号注册 ==="
curl -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "contact": "13800138000",
    "password": "Test1234!",
    "code": "666666"
  }' | jq .

echo -e "\n=== 测试 3: 错误验证码 ==="
curl -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser3",
    "contact": "test3@example.com",
    "password": "Test1234!",
    "code": "123456"
  }' | jq .

echo -e "\n=== 测试 4: 缺少字段 ==="
curl -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser4",
    "password": "Test1234!"
  }' | jq .

echo -e "\n测试完成！"
