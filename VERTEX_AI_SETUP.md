# Vertex AI Gemini 配置说明

## 当前配置

应用已配置使用 Vertex AI 的 Gemini 模型进行图片生成：

### 1️⃣ Meta Prompt 生成
- **模型**: `vertex_ai/gemini-3-pro-preview`
- **用途**: 根据用户输入生成 8 个多样化的图片提示词
- **调用方式**: 通过 OpenAI 兼容接口

### 2️⃣ 图片生成
- **模型**: `vertex_ai/gemini-3-pro-image-preview`
- **用途**: 为每个生成的提示词生成实际图片
- **调用方式**: 通过 OpenAI 兼容接口

## 环境变量配置

在项目根目录创建 `.env.local` 文件（如果不存在）：

```bash
# API Mode - 使用真实 API
NEXT_PUBLIC_API_MODE=production

# OpenAI 兼容 API 配置
NEXT_PUBLIC_OPENAI_API_KEY=sk-PZwjoX0QGseFOHjVh3SFBQ
NEXT_PUBLIC_OPENAI_BASE_URL=https://llm.jp.one2x.ai

# Gemini 模型配置
NEXT_PUBLIC_GEMINI_PROMPT_MODEL=vertex_ai/gemini-3-pro-preview
NEXT_PUBLIC_GEMINI_IMAGE_MODEL=vertex_ai/gemini-3-pro-image-preview
```

## 工作流程

```
用户创建 Channel
    ↓
1. 调用 vertex_ai/gemini-3-pro-preview
   - 输入: 用户 prompt + (可选) 参考图
   - 输出: 8 个多样化的图片提示词
   - API: POST {baseUrl}/chat/completions
    ↓
2. 选取前 4 个生成的提示词
    ↓
3. 对每个提示词调用 vertex_ai/gemini-3-pro-image-preview
   - 输入: 优化后的提示词
   - 输出: 1 张图片
   - API: POST {baseUrl}/chat/completions
    ↓
4. 生成 4 张风格统一但内容多样的初始图片
```

## API 调用格式

### Meta Prompt 生成

```typescript
POST https://llm.jp.one2x.ai/chat/completions
Headers:
  Authorization: Bearer sk-PZwjoX0QGseFOHjVh3SFBQ
  Content-Type: application/json

Body:
{
  "model": "vertex_ai/gemini-3-pro-preview",
  "messages": [
    {
      "role": "system",
      "content": "System Prompt with instructions..."
    },
    {
      "role": "user",
      "content": "User's creation prompt..."
    }
  ],
  "temperature": 0.9,
  "max_tokens": 2048
}
```

### 图片生成

```typescript
POST https://llm.jp.one2x.ai/chat/completions
Headers:
  Authorization: Bearer sk-PZwjoX0QGseFOHjVh3SFBQ
  Content-Type: application/json

Body:
{
  "model": "vertex_ai/gemini-3-pro-image-preview",
  "messages": [
    {
      "role": "user",
      "content": "Detailed image prompt..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "n": 1
}
```

## 启动应用

1. **确保环境变量配置正确**
   ```bash
   cat .env.local
   ```

2. **重启开发服务器**
   ```bash
   npm run dev
   ```

3. **检查控制台日志**
   - 创建 Channel 时应该看到：
     - `🧠 Using model: vertex_ai/gemini-3-pro-preview for prompt generation`
     - `🎨 Using Gemini model: vertex_ai/gemini-3-pro-image-preview`

## 验证配置

创建一个新 Channel 并在浏览器控制台查看日志：

```javascript
// 应该看到类似的日志：
📝 Creating channel: My Test Channel
🧠 Generating diverse prompts with Gemini AI...
🧠 Using model: vertex_ai/gemini-3-pro-preview for prompt generation
📝 Gemini response received
✅ Generated 8 diverse prompts
🎨 Generating images for each prompt...
🎨 Generating images with gemini service...
🎨 Using Gemini model: vertex_ai/gemini-3-pro-image-preview
  📸 Generating image 1/4...
  📸 Generating image 2/4...
  📸 Generating image 3/4...
  📸 Generating image 4/4...
✅ Channel created successfully with 4 images
```

## 故障排除

### 问题 1: API 调用失败
**检查**:
- API Key 是否正确
- Base URL 是否可访问
- 网络连接是否正常

**解决**:
```bash
# 测试 API 连接
curl -X POST https://llm.jp.one2x.ai/chat/completions \
  -H "Authorization: Bearer sk-PZwjoX0QGseFOHjVh3SFBQ" \
  -H "Content-Type: application/json" \
  -d '{"model":"vertex_ai/gemini-3-pro-preview","messages":[{"role":"user","content":"test"}]}'
```

### 问题 2: 模型不可用
**检查**:
- 模型名称是否正确拼写
- API 服务是否支持该模型

**解决**:
- 查看 API 文档确认支持的模型列表
- 尝试其他 Gemini 模型变体

### 问题 3: 仍在使用 Mock 数据
**检查**:
```bash
# 确认环境变量
echo $NEXT_PUBLIC_API_MODE  # 应该是 'production'
```

**解决**:
- 确保 `.env.local` 文件在项目根目录
- 重启开发服务器
- 清除浏览器缓存

## 成本估算

根据 Vertex AI 的定价：
- Meta Prompt 生成: 每次创建 Channel 调用 1 次
- 图片生成: 每次创建 Channel 调用 4 次

具体费用请参考 Google Cloud 的 Vertex AI 定价页面。

## Fallback 机制

如果 API 调用失败，系统会自动：
1. 尝试重新调用
2. 如果仍然失败，使用预定义的提示词变化模板
3. 最终使用 Mock 图片数据（开发模式）

这确保了应用在任何情况下都能正常运行。

