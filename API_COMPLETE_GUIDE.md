# Auto Feed API 完整使用和配置指南

> **版本**: 1.0.0  
> **更新时间**: 2025-12-02  
> **项目**: Channel Cold Start Image Generator

---

## 📋 目录

1. [项目概述](#项目概述)
2. [使用的模型详细信息](#使用的模型详细信息)
3. [环境配置](#环境配置)
4. [API 端点详细说明](#api-端点详细说明)
5. [代码架构](#代码架构)
6. [完整配置参数](#完整配置参数)
7. [使用示例](#使用示例)
8. [开发指南](#开发指南)
9. [部署指南](#部署指南)
10. [故障排除](#故障排除)
11. [最佳实践](#最佳实践)
12. [API 调用流程](#api-调用流程)

---

## 项目概述

本项目是一个基于 AI 的频道冷启动图像生成系统，通过 OpenAI 兼容的 API 端点调用 Google Gemini 模型，实现：

1. **智能提示词生成**：根据用户输入和主题图像，生成 8-12 个多样化的图像生成提示词
2. **批量图像生成**：为每个提示词生成对应的高质量图像
3. **风格一致性**：确保生成的图像在视觉风格上保持一致性

### 技术栈

- **后端**: Node.js + Express + TypeScript
- **前端**: React + Vite + TailwindCSS
- **AI 模型**: Google Gemini (通过 OpenAI SDK)
- **API 兼容层**: OpenAI-compatible API endpoint

---

## 使用的模型详细信息

### 模型 1: 提示词生成模型

**模型名称**: `vertex_ai/gemini-3-pro-preview`

**用途**: 生成多样化且风格一致的图像生成提示词

**功能特点**:
- 支持多模态输入（文本 + 图像）
- 理解图像中的人物、风格、主题
- 生成 8-12 个多样化的提示词
- 支持风格一致性控制

**配置参数**:
```typescript
{
  model: "vertex_ai/gemini-3-pro-preview",
  temperature: 0.7,      // 控制创意度
  max_tokens: 8192,      // 最大输出长度
}
```

**输入格式**:
- System Prompt: 结构化的提示词生成规范
- User Prompt: 频道主题描述（文本）
- Image Data: Base64 编码的主题图像

**输出格式**:
```json
{
  "Image Prompts": [
    "prompt 1...",
    "prompt 2...",
    // ... 8-12 个提示词
  ]
}
```

---

### 模型 2: 图像生成模型

**模型名称**: `vertex_ai/gemini-3-pro-image-preview`

**用途**: 根据文本提示词生成图像

**功能特点**:
- 文本到图像生成
- 高质量图像输出
- 支持多种艺术风格
- 快速生成（Flash 版本）

**配置参数**:
```typescript
{
  model: "vertex_ai/gemini-3-pro-image-preview"
}
```

**输入格式**:
- Text Prompt: 图像描述文本

**输出格式**:
- 图像 Data URL (base64)
- 或占位图 URL（失败时）

**备用机制**:
- 如果生成失败，自动返回 `https://picsum.photos/seed/{random}/800/600`
- 确保服务的稳定性

---

## 环境配置

### 前置要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **API Key**: 有效的 OpenAI 兼容 API 密钥

### 步骤 1: 克隆项目

```bash
git clone <repository-url>
cd "auto feed"
```

### 步骤 2: 安装依赖

```bash
npm install
```

### 步骤 3: 配置环境变量

创建 `.env` 文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置以下变量：

```env
# 服务器端口
PORT=3001

# OpenAI 兼容 API 配置
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_BASE_URL=https://llm.jp.one2x.ai

# 备选变量名（可选）
# API_KEY=sk-your-api-key-here
# BASE_URL=https://llm.jp.one2x.ai
```

### 步骤 4: 验证配置

```bash
# 检查环境变量
cat .env

# 运行 TypeScript 类型检查
npx tsc --noEmit
```

---

## API 端点详细说明

### 1. 健康检查端点

**端点**: `GET /api/health`

**描述**: 检查服务器运行状态

**请求示例**:
```bash
curl http://localhost:3001/api/health
```

**响应示例**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

**状态码**:
- `200`: 服务正常运行

---

### 2. 图像生成端点（主端点）

**端点**: `POST /api/generate`

**描述**: 完整的图像生成流程，包括提示词生成和图像生成

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "userPrompt": "频道主题描述，例如：赛博朋克风格的猫咪角色",
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**请求参数说明**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `userPrompt` | string | 是 | 频道主题描述，不能为空字符串 |
| `imageData` | string | 是 | Base64 编码的图像 Data URL |

**响应示例（成功）**:
```json
{
  "results": [
    {
      "prompt": "A cyberpunk cat character with neon fur...",
      "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANS..."
    },
    {
      "prompt": "A futuristic feline in a neon-lit cityscape...",
      "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANS..."
    }
    // ... 8-12 个结果
  ]
}
```

**响应示例（失败）**:
```json
{
  "error": "Failed to generate images",
  "message": "Gemini 3 API error: No valid image prompts returned"
}
```

**状态码**:
- `200`: 成功生成
- `400`: 请求参数错误
- `500`: 服务器内部错误

**请求限制**:
- 最大请求体大小: 50MB（用于支持大图像）
- 超时时间: 取决于生成的图像数量（约 30-120 秒）

**完整请求示例**:
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userPrompt": "一个可爱的赛博朋克风格猫咪角色",
    "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }'
```

---

## 代码架构

### 项目结构

```
auto feed/
├── src/
│   ├── api/
│   │   ├── client.ts          # 统一的 OpenAI 客户端配置
│   │   ├── gemini.ts          # Gemini 3 Pro Preview API
│   │   └── nanoBanana.ts      # Gemini 3 Pro Image Preview API
│   ├── frontend/
│   │   ├── App.tsx            # React 主应用
│   │   ├── main.tsx           # React 入口
│   │   ├── index.html         # HTML 模板
│   │   └── styles/
│   │       └── index.css      # 全局样式
│   ├── server.ts              # Express 服务器
│   └── systemPrompt.ts        # 系统提示词配置
├── dist/                      # 编译后的后端代码
├── dist-frontend/             # 编译后的前端代码
├── .env                       # 环境变量（不提交到 Git）
├── env.example               # 环境变量示例
├── package.json              # 依赖配置
├── tsconfig.json             # TypeScript 配置
├── vite.config.ts            # Vite 配置
└── tailwind.config.js        # TailwindCSS 配置
```

### 核心模块说明

#### 1. `src/api/client.ts` - 统一客户端配置

**职责**: 
- 加载环境变量
- 创建 OpenAI 客户端实例
- 提供统一的 API 配置

**核心代码**:
```typescript
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY || process.env.API_KEY;
const BASE_URL = process.env.OPENAI_BASE_URL || process.env.BASE_URL || 'https://llm.jp.one2x.ai';

export const openaiClient = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

export const API_CONFIG = {
  apiKey: API_KEY ? '***' + API_KEY.slice(-4) : 'NOT_SET',
  baseURL: BASE_URL,
};
```

**特性**:
- ✅ 支持多种环境变量名称
- ✅ 自动回退到默认 URL
- ✅ API Key 安全遮蔽
- ✅ 配置验证和警告

---

#### 2. `src/api/gemini.ts` - 提示词生成

**职责**: 
- 调用 Gemini 3 Pro Preview 生成提示词
- 解析 JSON 响应
- 错误处理和日志

**接口定义**:
```typescript
export interface GeneratePromptsArgs {
  systemPrompt: Record<string, unknown>;
  userPrompt: string;
  imageData: string; // base64 data URL
}

export async function generatePromptsWithGemini3(
  args: GeneratePromptsArgs
): Promise<string[]>
```

**调用示例**:
```typescript
import { generatePromptsWithGemini3 } from './api/gemini.js';
import { SYSTEM_PROMPT } from './systemPrompt.js';

const prompts = await generatePromptsWithGemini3({
  systemPrompt: SYSTEM_PROMPT,
  userPrompt: "赛博朋克猫咪",
  imageData: "data:image/jpeg;base64,..."
});

console.log(`生成了 ${prompts.length} 个提示词`);
```

**错误处理**:
- JSON 解析失败时尝试从 markdown 代码块提取
- 支持多种 JSON 字段名称（`Image Prompts`, `imagePrompts`, `image_prompts`）
- 详细的错误日志

---

#### 3. `src/api/nanoBanana.ts` - 图像生成

**职责**: 
- 调用 Gemini 3 Pro Image Preview 生成图像
- 提取图像 URL
- 失败时提供占位图

**接口定义**:
```typescript
export async function generateImageWithNanoBanana(
  prompt: string
): Promise<string>
```

**调用示例**:
```typescript
import { generateImageWithNanoBanana } from './api/nanoBanana.js';

const imageUrl = await generateImageWithNanoBanana(
  "A cyberpunk cat with neon fur in a futuristic city"
);

console.log('图像 URL:', imageUrl);
```

**备用机制**:
```typescript
// 如果生成失败，返回占位图
const seed = Math.random().toString(36).substring(7);
return `https://picsum.photos/seed/${seed}/800/600`;
```

---

#### 4. `src/systemPrompt.ts` - 系统提示词

**职责**: 
- 定义提示词生成规范
- 设置风格权重模型
- 控制多样性参数

**结构**:
```typescript
export const SYSTEM_PROMPT = {
  role: "system",
  name: "cold_start_image_prompt_generator",
  description: "...",
  objectives: [...],
  tasks: {
    "1_extract_core_fields": {...},
    "2_weight_model": {...},
    "3_prompt_template": {...},
    // ...
  }
};
```

**可调参数**:
- 构图权重（close_up, half_body, full_body）
- 光照权重（base_palette, high_contrast, dramatic_spotlight）
- 场景权重（primary_theme, worldview_extension）
- 情绪权重（primary_mood, contrastive_mood）

---

#### 5. `src/server.ts` - Express 服务器

**职责**: 
- 提供 HTTP API 端点
- 处理请求验证
- 编排生成流程
- 错误处理

**中间件配置**:
```typescript
app.use(cors());                        // 跨域支持
app.use(express.json({ limit: '50mb' })); // 支持大文件
```

**生成流程**:
```typescript
// Step 1: 生成提示词
const imagePrompts = await generatePromptsWithGemini3({
  systemPrompt: SYSTEM_PROMPT,
  userPrompt,
  imageData,
});

// Step 2: 并行生成图像
const results = await Promise.all(
  imagePrompts.map(async (prompt) => {
    const imageUrl = await generateImageWithNanoBanana(prompt);
    return { prompt, imageUrl };
  })
);
```

---

## 完整配置参数

### 环境变量

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `PORT` | 否 | `3001` | 服务器端口 |
| `OPENAI_API_KEY` | 是 | - | OpenAI 兼容 API 密钥 |
| `OPENAI_BASE_URL` | 否 | `https://llm.jp.one2x.ai` | API 端点 URL |
| `API_KEY` | 否 | - | 备选 API 密钥变量名 |
| `BASE_URL` | 否 | - | 备选 URL 变量名 |
| `NODE_ENV` | 否 | `development` | 运行环境 |

### Gemini 3 Pro Preview 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `model` | string | `vertex_ai/gemini-3-pro-preview` | 模型名称 |
| `temperature` | number | `0.7` | 创意度（0.0-1.0） |
| `max_tokens` | number | `8192` | 最大输出长度 |

### Gemini 3 Pro Image Preview 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `model` | string | `vertex_ai/gemini-3-pro-image-preview` | 模型名称 |

### 服务器配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `requestSizeLimit` | string | `50mb` | 请求体大小限制 |
| `cors` | boolean | `true` | 是否启用 CORS |

---

## 使用示例

### 示例 1: 基础使用（命令行）

```bash
# 1. 准备图像（转换为 base64）
IMAGE_BASE64=$(base64 -i theme-image.jpg | tr -d '\n')
IMAGE_DATA="data:image/jpeg;base64,${IMAGE_BASE64}"

# 2. 调用 API
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"userPrompt\": \"一个神秘的科幻角色\",
    \"imageData\": \"${IMAGE_DATA}\"
  }" > response.json

# 3. 查看结果
cat response.json | jq '.results[0].prompt'
```

### 示例 2: JavaScript/TypeScript 调用

```typescript
async function generateChannelImages(
  prompt: string,
  imageFile: File
): Promise<Array<{ prompt: string; imageUrl: string }>> {
  
  // 1. 将图像转换为 base64
  const imageData = await fileToBase64(imageFile);
  
  // 2. 调用 API
  const response = await fetch('http://localhost:3001/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userPrompt: prompt,
      imageData: imageData,
    }),
  });
  
  // 3. 处理响应
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '生成失败');
  }
  
  const data = await response.json();
  return data.results;
}

// 辅助函数：File 转 base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 使用示例
const imageFile = document.querySelector<HTMLInputElement>('#image-input')!.files![0];
const results = await generateChannelImages('赛博朋克猫咪', imageFile);

console.log(`生成了 ${results.length} 张图像`);
results.forEach((result, i) => {
  console.log(`${i + 1}. ${result.prompt}`);
});
```

### 示例 3: React 组件集成

```typescript
import { useState } from 'react';

function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [results, setResults] = useState<Array<{prompt: string; imageUrl: string}>>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt || !image) {
      alert('请输入提示词并上传图像');
      return;
    }

    setLoading(true);
    try {
      const imageData = await fileToBase64(image);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: prompt, imageData }),
      });

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="输入频道主题..."
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? '生成中...' : '生成图像'}
      </button>

      <div className="results">
        {results.map((result, i) => (
          <div key={i}>
            <p>{result.prompt}</p>
            <img src={result.imageUrl} alt={result.prompt} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 示例 4: Python 调用

```python
import requests
import base64
import json

def generate_channel_images(prompt: str, image_path: str):
    """调用 Auto Feed API 生成图像"""
    
    # 1. 读取并编码图像
    with open(image_path, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode('utf-8')
    
    # 2. 根据文件扩展名确定 MIME 类型
    mime_type = 'image/jpeg'
    if image_path.endswith('.png'):
        mime_type = 'image/png'
    
    data_url = f'data:{mime_type};base64,{image_data}'
    
    # 3. 调用 API
    response = requests.post(
        'http://localhost:3001/api/generate',
        json={
            'userPrompt': prompt,
            'imageData': data_url
        },
        timeout=120  # 2 分钟超时
    )
    
    # 4. 处理响应
    if response.status_code == 200:
        results = response.json()['results']
        print(f'成功生成 {len(results)} 张图像')
        return results
    else:
        error = response.json()
        raise Exception(f"生成失败: {error.get('message', '未知错误')}")

# 使用示例
if __name__ == '__main__':
    results = generate_channel_images(
        prompt='一个神秘的魔法师角色',
        image_path='theme.jpg'
    )
    
    for i, result in enumerate(results):
        print(f"{i+1}. {result['prompt']}")
```

---

## 开发指南

### 本地开发

#### 1. 安装依赖

```bash
npm install
```

#### 2. 启动开发服务器

```bash
# 同时启动前端和后端（推荐）
npm run dev

# 仅启动后端
npm run dev:server

# 仅启动前端
npm run dev:client
```

#### 3. 访问应用

- **前端**: http://localhost:5173
- **后端 API**: http://localhost:3001/api
- **健康检查**: http://localhost:3001/api/health

### 开发模式特性

- ✅ 热重载（前端和后端）
- ✅ TypeScript 类型检查
- ✅ 详细的控制台日志
- ✅ Vite 代理（自动转发 API 请求）

### 构建生产版本

```bash
# 构建前端和后端
npm run build

# 构建后的文件
# - dist/           后端 JavaScript 文件
# - dist-frontend/  前端静态文件
```

### 运行生产版本

```bash
# 启动生产服务器
npm start

# 或直接运行
node dist/server.js
```

### 开发工具

#### TypeScript 类型检查

```bash
npx tsc --noEmit
```

#### 代码格式化（如果配置了）

```bash
npm run format  # 如果有配置
```

### 调试技巧

#### 1. 启用详细日志

服务器已经包含详细的日志输出：

```
[Server] Starting generation for prompt: 赛博朋克猫咪...
[Server] Step 1: Generating prompts with Gemini 3...
[Gemini 3] Calling vertex_ai/gemini-3-pro-preview via OpenAI API...
[Gemini 3] Received response, parsing...
[Gemini 3] Successfully generated 10 prompts
[Server] Generated 10 prompts
[Server] Step 2: Generating images with Nano Banana...
[Gemini Image] Generating image with vertex_ai/gemini-3-pro-image-preview...
[Gemini Image] Successfully generated image
...
[Server] Successfully generated 10 images
```

#### 2. 使用 curl 测试

```bash
# 健康检查
curl http://localhost:3001/api/health

# 测试生成（需要准备 base64 图像）
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d @test-request.json
```

#### 3. 浏览器开发工具

- 打开 Network 面板查看 API 请求
- 查看 Console 面板查看前端日志
- 使用 React DevTools 调试组件

---

## 部署指南

### 部署到 Railway

#### 1. 准备 `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 2. 设置环境变量

在 Railway 控制台设置：
- `OPENAI_API_KEY`: 你的 API 密钥
- `OPENAI_BASE_URL`: https://llm.jp.one2x.ai
- `PORT`: 自动设置（不需要手动配置）

#### 3. 部署

```bash
# 使用 Railway CLI
railway login
railway init
railway up
```

或通过 GitHub 集成自动部署。

---

### 部署到 Render

#### 1. 准备 `render.yaml`

```yaml
services:
  - type: web
    name: auto-feed
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: OPENAI_API_KEY
        sync: false
      - key: OPENAI_BASE_URL
        value: https://llm.jp.one2x.ai
```

#### 2. 连接 GitHub 仓库

1. 登录 Render
2. 选择 "New Web Service"
3. 连接你的 GitHub 仓库
4. 配置环境变量
5. 部署

---

### 部署到 Docker

#### 1. 准备 `Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建
RUN npm run build

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["npm", "start"]
```

#### 2. 构建镜像

```bash
docker build -t auto-feed:latest .
```

#### 3. 运行容器

```bash
docker run -d \
  -p 3001:3001 \
  -e OPENAI_API_KEY=your-api-key \
  -e OPENAI_BASE_URL=https://llm.jp.one2x.ai \
  --name auto-feed \
  auto-feed:latest
```

#### 4. 使用 Docker Compose

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  auto-feed:
    build: .
    ports:
      - "3001:3001"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_BASE_URL=https://llm.jp.one2x.ai
      - NODE_ENV=production
    restart: unless-stopped
```

运行：
```bash
docker-compose up -d
```

---

### 部署到 VPS (Ubuntu)

#### 1. 安装 Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. 克隆代码

```bash
git clone <repository-url>
cd auto-feed
```

#### 3. 配置环境

```bash
cp env.example .env
nano .env  # 编辑环境变量
```

#### 4. 安装和构建

```bash
npm install
npm run build
```

#### 5. 使用 PM2 管理进程

```bash
# 安装 PM2
sudo npm install -g pm2

# 启动应用
pm2 start dist/server.js --name auto-feed

# 设置开机自启
pm2 startup
pm2 save
```

#### 6. 配置 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 7. 启用 HTTPS (可选)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 故障排除

### 常见问题

#### 1. API Key 未找到

**症状**:
```
[API Client] Warning: No API key found. Please set OPENAI_API_KEY or API_KEY environment variable.
```

**解决方案**:
1. 确认 `.env` 文件存在
2. 确认 `OPENAI_API_KEY` 已设置且格式正确
3. 重启服务器：`Ctrl+C` 然后 `npm run dev`
4. 检查环境变量是否被正确加载：
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.OPENAI_API_KEY)"
   ```

---

#### 2. 模型调用失败

**症状**:
```
Gemini 3 API error: Invalid model name
```

**可能原因**:
- 模型名称错误
- API 端点不可达
- API Key 无效或过期

**解决方案**:
1. 验证模型名称是否正确：
   - 提示词生成: `vertex_ai/gemini-3-pro-preview`
   - 图像生成: `vertex_ai/gemini-3-pro-image-preview`

2. 测试 API 连接：
   ```bash
   curl -X POST https://llm.jp.one2x.ai/v1/chat/completions \
     -H "Authorization: Bearer $OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"vertex_ai/gemini-3-pro-preview","messages":[{"role":"user","content":"test"}]}'
   ```

3. 检查 API Key 是否有效
4. 联系 API 提供商确认服务状态

---

#### 3. CORS 错误

**症状**:
```
Access to fetch at 'http://localhost:3001/api/generate' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**解决方案**:
1. 确认后端已启动并运行在 3001 端口
2. 检查 `server.ts` 中是否已启用 CORS：
   ```typescript
   app.use(cors());
   ```
3. 检查 Vite 代理配置（`vite.config.ts`）
4. 清除浏览器缓存并重新加载

---

#### 4. 请求体过大

**症状**:
```
PayloadTooLargeError: request entity too large
```

**解决方案**:
1. 检查 `server.ts` 中的限制设置：
   ```typescript
   app.use(express.json({ limit: '50mb' }));
   ```
2. 压缩图像后再上传
3. 如果需要支持更大的文件，增加限制：
   ```typescript
   app.use(express.json({ limit: '100mb' }));
   ```

---

#### 5. 图像解析失败

**症状**:
```
[Gemini Image] No images found in response
[Gemini Image] Falling back to placeholder image
```

**原因**: 图像生成 API 未返回预期格式

**解决方案**:
1. 这是正常的回退机制，会返回占位图
2. 检查 API 文档确认响应格式
3. 更新 `nanoBanana.ts` 中的响应解析逻辑

---

#### 6. JSON 解析错误

**症状**:
```
[Gemini 3] Could not parse JSON from response
Failed to parse JSON response from Gemini 3
```

**原因**: Gemini 3 返回的不是纯 JSON 格式

**解决方案**:
1. 代码已包含多种解析策略：
   - 纯 JSON
   - Markdown 代码块中的 JSON
   - 文本中的 JSON 对象
2. 如果仍然失败，检查 system prompt 是否明确要求返回 JSON
3. 调整 `temperature` 参数（降低可能提高格式一致性）

---

#### 7. 端口被占用

**症状**:
```
Error: listen EADDRINUSE: address already in use :::3001
```

**解决方案**:
1. 查找占用端口的进程：
   ```bash
   lsof -i :3001  # macOS/Linux
   netstat -ano | findstr :3001  # Windows
   ```
2. 终止进程：
   ```bash
   kill -9 <PID>  # macOS/Linux
   ```
3. 或更改端口：
   ```env
   PORT=3002
   ```

---

#### 8. TypeScript 编译错误

**症状**:
```
error TS2307: Cannot find module './api/client.js'
```

**解决方案**:
1. 确认导入路径使用 `.js` 扩展名（即使源文件是 `.ts`）：
   ```typescript
   import { openaiClient } from './api/client.js';
   ```
2. 检查 `tsconfig.json` 配置：
   ```json
   {
     "compilerOptions": {
       "module": "ESNext",
       "moduleResolution": "node"
     }
   }
   ```
3. 运行类型检查：
   ```bash
   npx tsc --noEmit
   ```

---

#### 9. 内存不足

**症状**:
```
JavaScript heap out of memory
```

**解决方案**:
1. 增加 Node.js 内存限制：
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run dev
   ```
2. 优化图像大小（压缩后再处理）
3. 减少并发生成的图像数量

---

#### 10. 超时错误

**症状**:
```
Error: Request timeout
```

**解决方案**:
1. 增加客户端超时时间：
   ```typescript
   const response = await fetch('/api/generate', {
     // ...
     signal: AbortSignal.timeout(120000) // 120 秒
   });
   ```
2. 生成图像可能需要较长时间（特别是生成多张图像时）
3. 考虑实现进度反馈机制

---

### 调试工具

#### 1. 检查 API 配置

创建测试脚本 `test-config.ts`:

```typescript
import { API_CONFIG } from './src/api/client.js';

console.log('API Configuration:');
console.log('  API Key:', API_CONFIG.apiKey);
console.log('  Base URL:', API_CONFIG.baseURL);
```

运行：
```bash
tsx test-config.ts
```

#### 2. 测试模型连接

创建测试脚本 `test-model.ts`:

```typescript
import { openaiClient } from './src/api/client.js';

async function testConnection() {
  try {
    const response = await openaiClient.chat.completions.create({
      model: 'vertex_ai/gemini-3-pro-preview',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10,
    });
    console.log('✅ Connection successful');
    console.log('Response:', response.choices[0]?.message?.content);
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();
```

运行：
```bash
tsx test-model.ts
```

---

## 最佳实践

### 安全性

#### 1. 环境变量管理

✅ **正确做法**:
```typescript
// 使用环境变量
const API_KEY = process.env.OPENAI_API_KEY;
```

❌ **错误做法**:
```typescript
// 硬编码 API Key
const API_KEY = 'sk-PZwjoX0QGseFOHjVh3SFBQ';
```

#### 2. Git 安全

确保 `.gitignore` 包含：
```
.env
.env.local
.env.production
*.key
```

#### 3. API Key 轮换

- 定期更换 API Key（建议每 30-90 天）
- 在生产环境使用不同的 API Key
- 监控 API 使用量

#### 4. 访问控制（生产环境）

```typescript
// 添加身份验证中间件
app.use('/api', authenticateRequest);

function authenticateRequest(req, res, next) {
  const token = req.headers.authorization;
  if (!validateToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
```

---

### 性能优化

#### 1. 图像压缩

```typescript
// 在上传前压缩图像
async function compressImage(file: File): Promise<string> {
  const MAX_WIDTH = 1024;
  const MAX_HEIGHT = 1024;
  
  // 使用 canvas 压缩图像
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const img = await loadImage(file);
  
  let { width, height } = img;
  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
    width *= ratio;
    height *= ratio;
  }
  
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.8);
}
```

#### 2. 请求缓存

```typescript
// 缓存生成结果
const cache = new Map<string, any>();

app.post('/api/generate', async (req, res) => {
  const cacheKey = `${req.body.userPrompt}-${hashImage(req.body.imageData)}`;
  
  if (cache.has(cacheKey)) {
    console.log('[Cache] Returning cached result');
    return res.json(cache.get(cacheKey));
  }
  
  // ... 生成逻辑 ...
  
  cache.set(cacheKey, result);
  res.json(result);
});
```

#### 3. 并行处理

已实现：
```typescript
// 并行生成所有图像
const results = await Promise.all(
  imagePrompts.map(async (prompt) => {
    const imageUrl = await generateImageWithNanoBanana(prompt);
    return { prompt, imageUrl };
  })
);
```

#### 4. 错误重试

```typescript
// 添加重试机制
async function generateImageWithRetry(
  prompt: string,
  maxRetries = 3
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateImageWithNanoBanana(prompt);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`[Retry] Attempt ${i + 1} failed, retrying...`);
      await sleep(1000 * (i + 1)); // 指数退避
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

### 代码质量

#### 1. 类型安全

```typescript
// 定义清晰的接口
interface GenerateRequest {
  userPrompt: string;
  imageData: string;
}

interface GenerateResponse {
  results: Array<{
    prompt: string;
    imageUrl: string;
  }>;
}

// 使用类型守卫
function isValidGenerateRequest(body: any): body is GenerateRequest {
  return (
    typeof body.userPrompt === 'string' &&
    body.userPrompt.trim().length > 0 &&
    typeof body.imageData === 'string' &&
    body.imageData.startsWith('data:image/')
  );
}
```

#### 2. 错误处理

```typescript
// 统一的错误处理
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details,
    });
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});
```

#### 3. 日志记录

```typescript
// 结构化日志
function log(level: string, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    level,
    message,
    ...meta,
  }));
}

log('info', 'Generation started', { prompt: userPrompt });
log('error', 'Generation failed', { error: error.message });
```

---

### 监控和维护

#### 1. 健康检查

已实现：
```typescript
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});
```

增强版本：
```typescript
app.get('/api/health', async (_req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      gemini3: 'unknown',
      geminiImage: 'unknown',
    }
  };

  // 测试模型连接
  try {
    await testGemini3Connection();
    health.services.gemini3 = 'ok';
  } catch {
    health.services.gemini3 = 'error';
    health.status = 'degraded';
  }

  res.json(health);
});
```

#### 2. 使用量监控

```typescript
// 跟踪 API 调用
let requestCount = 0;
let errorCount = 0;

app.use('/api', (req, res, next) => {
  requestCount++;
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode >= 400) {
      errorCount++;
    }
    return originalSend.call(this, data);
  };
  
  next();
});

app.get('/api/metrics', (req, res) => {
  res.json({
    requests: requestCount,
    errors: errorCount,
    errorRate: errorCount / requestCount,
  });
});
```

#### 3. 成本控制

```typescript
// 限流
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 10, // 最多 10 次请求
  message: 'Too many requests, please try again later',
});

app.use('/api/generate', limiter);
```

---

## API 调用流程

### 完整流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户请求                                 │
│  POST /api/generate                                              │
│  {                                                               │
│    userPrompt: "频道主题",                                       │
│    imageData: "data:image/jpeg;base64,..."                      │
│  }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Express 服务器接收请求                         │
│  1. 验证请求参数                                                 │
│  2. 检查 userPrompt 和 imageData                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Step 1: 生成提示词                                  │
│  调用: generatePromptsWithGemini3()                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 模型: vertex_ai/gemini-3-pro-preview                     │  │
│  │ 输入:                                                     │  │
│  │   - System Prompt (SYSTEM_PROMPT)                        │  │
│  │   - User Prompt (文本)                                   │  │
│  │   - Image Data (base64)                                  │  │
│  │ 参数:                                                     │  │
│  │   - temperature: 0.7                                     │  │
│  │   - max_tokens: 8192                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Gemini 3 处理并返回 JSON                           │
│  {                                                               │
│    "Image Prompts": [                                            │
│      "Prompt 1: A cyberpunk cat...",                            │
│      "Prompt 2: A futuristic feline...",                        │
│      ...                                                         │
│      "Prompt 10: A neon-lit cat..."                             │
│    ]                                                             │
│  }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              解析 JSON 提取提示词数组                            │
│  imagePrompts = [                                                │
│    "Prompt 1...",                                                │
│    "Prompt 2...",                                                │
│    ...                                                           │
│  ]                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         Step 2: 并行生成图像 (Promise.all)                      │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │  Prompt 1    │  Prompt 2    │  Prompt 3    │   ...        │ │
│  │      ▼       │      ▼       │      ▼       │      ▼       │ │
│  │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ │
│  │ │Gemini    │ │ │Gemini    │ │ │Gemini    │ │ │Gemini    │ │ │
│  │ │Image API │ │ │Image API │ │ │Image API │ │ │Image API │ │ │
│  │ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────┘ │ │
│  │      ▼       │      ▼       │      ▼       │      ▼       │ │
│  │  Image 1     │  Image 2     │  Image 3     │   ...        │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
│  模型: vertex_ai/gemini-3-pro-image-preview                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                组合结果                                          │
│  results = [                                                     │
│    { prompt: "Prompt 1", imageUrl: "data:image/..." },         │
│    { prompt: "Prompt 2", imageUrl: "data:image/..." },         │
│    ...                                                           │
│  ]                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                返回给客户端                                      │
│  Response 200 OK                                                 │
│  {                                                               │
│    "results": [                                                  │
│      {                                                           │
│        "prompt": "A cyberpunk cat with neon fur...",            │
│        "imageUrl": "data:image/png;base64,iVBORw0KGg..."        │
│      },                                                          │
│      ...                                                         │
│    ]                                                             │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 时间线

典型的请求处理时间（10 个图像）：

```
00:00  接收请求
00:01  Step 1 开始 - 调用 Gemini 3 Pro Preview
00:15  Step 1 完成 - 获得 10 个提示词 (~14 秒)
00:16  Step 2 开始 - 并行生成 10 张图像
01:30  Step 2 完成 - 所有图像生成完成 (~74 秒)
01:31  返回结果

总耗时: ~90 秒
```

### 错误处理流程

```
API 调用
   │
   ├─ 参数验证失败 → 400 Bad Request
   │
   ├─ Gemini 3 调用失败
   │   │
   │   ├─ 网络错误 → 500 Internal Server Error
   │   ├─ JSON 解析失败 → 500 Internal Server Error
   │   └─ API Key 无效 → 500 Internal Server Error
   │
   ├─ Gemini Image 调用失败
   │   │
   │   └─ 单张失败 → 返回占位图（不影响其他图像）
   │
   └─ 成功 → 200 OK
```

---

## 附录

### A. 依赖包说明

| 包名 | 版本 | 用途 |
|------|------|------|
| `openai` | ^4.20.1 | OpenAI SDK，用于调用兼容 API |
| `express` | ^4.18.2 | Web 服务器框架 |
| `cors` | ^2.8.5 | 跨域资源共享 |
| `dotenv` | ^17.2.3 | 环境变量管理 |
| `react` | ^18.2.0 | 前端框架 |
| `react-dom` | ^18.2.0 | React DOM 渲染 |
| `vite` | ^5.0.11 | 前端构建工具 |
| `typescript` | ^5.3.3 | TypeScript 编译器 |
| `tailwindcss` | ^3.4.1 | CSS 框架 |

### B. 可用模型列表

根据 API 端点，以下是可用的 Gemini 相关模型：

#### 当前使用 ✅
- `vertex_ai/gemini-3-pro-preview` - 提示词生成
- `vertex_ai/gemini-3-pro-image-preview` - 图像生成

#### 备选模型 📋
- `gemini-2.5-pro` - 通用文本生成
- `gemini-2.5-flash` - 快速文本生成
- `vertex_ai/gemini-2.5-pro` - Vertex AI 版本
- `openrouter/google/gemini-2.5-flash` - OpenRouter 路由
- `openrouter/google/gemini-2.5-pro` - OpenRouter 路由

### C. API 限制和配额

根据使用的 API 端点，可能存在以下限制：

- **请求频率限制**: 取决于 API 提供商
- **并发请求限制**: 建议不超过 10 个并发请求
- **单次请求大小**: 最大 50MB
- **超时时间**: 建议设置 120 秒

### D. 术语表

- **Cold Start**: 冷启动，指新频道初始化阶段，需要生成第一批内容
- **System Prompt**: 系统提示词，定义 AI 行为的规范
- **Data URL**: 数据 URL，将文件内容编码为 base64 字符串
- **Vision Model**: 视觉模型，支持图像输入的 AI 模型
- **Temperature**: 温度参数，控制生成内容的随机性（0.0-1.0）
- **Max Tokens**: 最大令牌数，限制生成内容的长度

### E. 相关资源

- **OpenAI SDK 文档**: https://github.com/openai/openai-node
- **Express 文档**: https://expressjs.com
- **React 文档**: https://react.dev
- **Vite 文档**: https://vitejs.dev
- **TypeScript 文档**: https://www.typescriptlang.org

---

## 版本历史

### v1.0.0 (2025-12-02)
- ✅ 初始版本
- ✅ 完整的提示词和图像生成流程
- ✅ 统一的 API 客户端配置
- ✅ 环境变量管理
- ✅ TypeScript 支持
- ✅ React 前端界面
- ✅ 详细的文档

---

## 联系和支持

如有问题或建议，请通过以下方式联系：

- **Issues**: 在 GitHub 仓库创建 Issue
- **Email**: [your-email@example.com]
- **文档**: 本文档以及项目中的其他 Markdown 文件

---

**最后更新**: 2025-12-02  
**文档版本**: 1.0.0  
**项目版本**: 1.0.0

