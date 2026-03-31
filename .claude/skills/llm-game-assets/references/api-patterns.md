# API 调用模式（参考）

以下仅为**结构示例**；具体 URL、模型名、字段以各服务商文档为准。

## 环境变量（示例）

- **`DASHSCOPE_API_KEY`** — **阿里云百炼（DashScope）**，推荐用于本项目；见 `alibaba-bailian.md`
- `OPENAI_API_KEY` — OpenAI 图像/聊天 API
- `REPLICATE_API_TOKEN` — Replicate
- `STABILITY_API_KEY` — Stability AI  
以上均**勿提交仓库**，本地用 `.env.local`。

## OpenAI Images（示例思路）

- 使用 HTTP POST 到官方 Images 端点，`Authorization: Bearer $OPENAI_API_KEY`
- Body 含 `model`、`prompt`、`size`、`response_format`（如 `b64_json` 或 `url`）
- 若返回 URL：再 `fetch` 下载二进制写入 `public/images/generated/xxx.png`

## Replicate（示例思路）

- 创建 prediction，轮询 `status` 直到 `succeeded`，从 `output` 取 URL 或文件
- 适合 Flux、SDXL 等托管模型

## 安全

- CI/CD 用密钥库或托管平台 Secret，不要写在 `next.config.js` 或前端 bundle。
- 前端页面**不要**直接调用需密钥的 API；生成步骤放在服务端脚本、本地或 CI。

## 输出命名

- `gameId-assetName-variant.png`，例如 `fruit-match-icon-happy-v2.webp`
