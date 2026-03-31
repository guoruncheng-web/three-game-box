---
name: llm-game-assets
description: 通过第三方大模型与图像/音频 API 为游戏项目生成素材的工作流。优先使用阿里云百炼（DashScope/通义千问、通义万相）；也可配合 OpenAI、Replicate 等。在用户需要 API 生成游戏 PNG/WebP、图标、背景、提示词批量或脚本时使用。
---

# 第三方大模型游戏素材生成

## 何时使用

- 需要**可编程调用**的 API 生成 2D 资源（图、精灵表、UI 切图）或**生成音效/音乐的提示词与后续流程**
- 需要统一**命名、目录、审核与落盘**规范，避免把密钥写进仓库

本技能**不替代**本仓库已有的 `ui-generator`（本地 Pillow/SVG 脚本）；二者可并存：简单几何 UI 用 `ui-generator`，风格化插画/概念图用 API。

## 核心原则

1. **密钥只放在环境变量**（本项目优先 **`DASHSCOPE_API_KEY`** 对应阿里云百炼；其他如 `OPENAI_API_KEY`），在 `.env.local` 读取；禁止写入代码与 Git。
2. **产出文件进 `public/`** 下合适子目录（如 `public/images/generated/`、`public/sounds/`），并在游戏内用相对路径引用。
3. **先定规格再写提示词**：尺寸、透明背景、风格（像素风/扁平/手绘）、主色与项目 `globals.css` 变量对齐。
4. **遵守各平台服务条款**；生成内容避免商标与未授权 IP；商用前确认许可。

## 推荐工作流

1. **定需求**：资源类型（图标/背景/角色）、数量、格式（PNG/WebP/SVG）、是否循环。
2. **选供应商**（本项目优先 **阿里云百炼**）  
   - **文本 / 结构化输出**：DashScope **OpenAI 兼容接口** + 通义千问（`compatible-mode/v1/chat/completions`）。详见 `references/alibaba-bailian.md`。  
   - **图像**：通义万相（异步任务 API，见官方「文本生成图像」文档）；或千问生成 Prompt 后再走其他图生通道。  
   - 备选：OpenAI Images、Replicate、Stability 等。  
3. **写调用**：优先小脚本 `fetch`/`curl` 或项目内 `scripts/`，见 `references/alibaba-bailian.md` 与 `references/api-patterns.md`。
4. **落盘与校验**：检查分辨率、透明通道、体积；大图走 Next.js `Image` 或压缩。
5. **记录**：在 PR 或提交说明里写清**模型名、分辨率、是否人工改图**（便于复盘与合规）。

## 提示词要点（图像）

- 写明：**游戏类型**（如「休闲三消」）、**视角**（2D 正交/UI）、**背景透明**、**无文字**（若不需要）。
- 英文提示词对多数跨国 API 更稳；可中英混合描述品牌色。
- 需要统一画风时：在同一会话固定 **seed**（若 API 支持）或固定 **reference + strength**。

## 与 Next.js / PWA 项目

- 静态资源放 `public/`，路径以 `/` 开头引用。
- 避免在构建期调用需联网的生成 API（除非 CI 有密钥）；本地生成后再提交资源更常见。

## 捆绑资源

- `references/alibaba-bailian.md` — **阿里云百炼**（DashScope）兼容模式与万相要点。  
- `references/api-patterns.md` — 其他厂商与通用安全约定。
