# 阿里云百炼（DashScope）调用参考

密钥在 **阿里云控制台 → 大模型服务平台百炼 → API-KEY** 创建。环境变量建议使用：

- `DASHSCOPE_API_KEY` — 与官方示例一致，勿提交 Git，放在 `.env.local`（本地）或部署环境变量中。

## 1. OpenAI 兼容模式（聊天 / 文本）

适合：用通义千问生成**英文 Prompt 列表**、关卡文案、音效描述、批量 JSON 配置等。

**中国内地常见 Base URL：**

```text
https://dashscope.aliyuncs.com/compatible-mode/v1
```

**新加坡等国际地域：** 见控制台文档，一般为 `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` 等。

**HTTP 示例（chat completions）：**

```bash
curl -sS "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions" \
  -H "Authorization: Bearer $DASHSCOPE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-plus",
    "messages": [{"role": "user", "content": "用一句话描述休闲三消游戏用的水果图标，英文，无品牌"}]
  }'
```

**Node（OpenAI 官方 SDK）：**

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

const r = await client.chat.completions.create({
  model: "qwen-plus",
  messages: [{ role: "user", content: "你好" }],
});
```

模型名以**百炼控制台当前可用列表**为准（如 `qwen-plus`、`qwen-turbo`、`qwen3-max` 等）。

## 2. 通义万相（图像生成，可选）

文生图等为**异步任务**：创建任务 → 用 `task_id` 轮询结果。端点、请求体与模型 ID 以官方文档为准：

- 帮助中心搜索「文本生成图像 API」「万相」

请求头常含：`Authorization: Bearer <API_KEY>`，异步接口常需 `X-DashScope-Async: enable`（以最新文档为准）。

游戏项目建议：**脚本在本地/CI 调用 → 下载图片写入 `public/images/generated/`**，勿把 Key 打进前端 bundle。

## 3. 与本项目协作方式

| 目标 | 建议 |
|------|------|
| 批量生成提示词 / 策划表 | 百炼聊天 API + 保存为 `scripts/` 或 markdown |
| 出图 | 万相 API 或先用千问写 Prompt 再接入其他图生 API |
| 密钥 | 仅服务端脚本或本地 Node，读取 `process.env.DASHSCOPE_API_KEY` |

## 4. 合规

遵守《阿里云大模型服务协议》与百炼产品条款；生成内容勿含侵权 IP，商用前确认授权。
