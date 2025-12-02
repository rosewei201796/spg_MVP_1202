# API 集成文档

## 📚 目录

1. [快速开始](#快速开始)
2. [架构概览](#架构概览)
3. [API 服务详解](#api-服务详解)
4. [文件上传](#文件上传)
5. [图片生成](#图片生成)
6. [自定义 API](#自定义-api)
7. [错误处理](#错误处理)
8. [最佳实践](#最佳实践)

---

## 🚀 快速开始

### 1. 安装依赖（已完成）

```bash
npm install zustand framer-motion
```

### 2. 配置环境变量

参考 [`ENV_SETUP.md`](./ENV_SETUP.md) 配置你的 API 密钥。

**最简单的方式（Mock 模式）**：
```env
NEXT_PUBLIC_API_MODE=development
```

### 3. 使用 API

```typescript
import { API } from '@/lib/api';

// 生成图片
const result = await API.generateImages({
  prompt: "A cyberpunk city at night",
  numImages: 4,
});

// 上传文件
const uploadResult = await API.uploadFile(file);
```

---

## 🏗️ 架构概览

### 目录结构

```
lib/
├── api/
│   ├── index.ts              # API 统一入口
│   ├── config.ts             # 配置管理
│   ├── imageGeneration.ts    # 图片生成服务
│   └── fileUpload.ts         # 文件上传服务
├── types/
│   └── api.ts                # TypeScript 类型定义
├── store.ts                  # Zustand 状态管理
└── mockData.ts               # Mock 数据
```

### 数据流

```
用户交互 (CreateChannel)
    ↓
Store Action (handleCreateChannel)
    ↓
API Service (API.createChannel)
    ↓
├─ API.generateImages (OpenAI/Replicate/Mock)
└─ API.uploadFile (Cloudinary/S3/Mock)
    ↓
State Update
    ↓
UI 更新
```

---

## 🎨 API 服务详解

### 1. 图片生成 API

#### 基础用法

```typescript
import { API } from '@/lib/api';

const result = await API.generateImages({
  prompt: "A beautiful sunset over mountains",
  numImages: 4,
  stylePreset: "nature", // 可选：cyberpunk, nature, abstract, space, minimal
});

if (result.success) {
  console.log('Generated images:', result.images);
} else {
  console.error('Error:', result.error);
}
```

#### 增强提示词

```typescript
import { enhancePrompt } from '@/lib/api';

const enhanced = enhancePrompt(
  "A city skyline",
  "cyberpunk"
);
// 输出: "A city skyline, cyberpunk aesthetic, neon lights, futuristic city, high contrast, digital art"
```

#### 支持的服务

| 服务 | 环境变量 | 成本 | 质量 |
|------|----------|------|------|
| **OpenAI DALL-E 3** | `NEXT_PUBLIC_OPENAI_API_KEY` | $0.04/图 | ⭐⭐⭐⭐⭐ |
| **Replicate SD** | `NEXT_PUBLIC_REPLICATE_API_TOKEN` | $0.0025/秒 | ⭐⭐⭐⭐ |
| **Mock (Dev)** | 无需配置 | 免费 | ⭐⭐⭐ |

---

### 2. 文件上传 API

#### 基础用法

```typescript
import { API } from '@/lib/api';

// 验证文件
const validation = API.validateImageFile(file);
if (!validation.valid) {
  console.error(validation.error);
  return;
}

// 上传文件（自动压缩）
const result = await API.uploadFile(file);

if (result.success) {
  console.log('Uploaded URL:', result.url);
} else {
  console.error('Error:', result.error);
}
```

#### 图片压缩

```typescript
import { compressImage } from '@/lib/api/fileUpload';

const compressedBlob = await compressImage(
  file,
  1920,  // maxWidth
  1920,  // maxHeight
  0.8    // quality (0-1)
);
```

#### 支持的服务

| 服务 | 环境变量 | 免费额度 | 推荐 |
|------|----------|---------|------|
| **Cloudinary** | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | 25GB/月 | ✅ |
| **AWS S3** | `AWS_S3_BUCKET` | 5GB | ⚠️ 需配置 API 路由 |
| **Mock (Dev)** | 无需配置 | 无限 | 🧪 |

---

### 3. Channel 创建 API

#### 完整流程

```typescript
import { API } from '@/lib/api';

const result = await API.createChannel({
  name: "Cyberpunk Dreams",
  prompt: "Futuristic city with neon lights",
  theme: "cyberpunk",
  referenceImage: "https://...", // 可选
});

if (result.success) {
  const channel = result.channel;
  // channel.id, channel.name, channel.contents
}
```

#### Store 集成

```typescript
// 在 store 中使用
const { handleCreateChannel } = useAppStore();

// 自动调用 API.createChannel
await handleCreateChannel("A beautiful landscape");
```

---

## 📤 文件上传详解

### 完整示例（React 组件）

```tsx
import { useRef, useState } from 'react';
import { API } from '@/lib/api';

export function ImageUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. 验证文件
    const validation = API.validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // 2. 创建预览
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // 3. 上传
    setUploading(true);
    const result = await API.uploadFile(file);
    setUploading(false);

    if (result.success) {
      console.log('Uploaded:', result.url);
    } else {
      alert(result.error);
      URL.revokeObjectURL(previewUrl);
      setPreview(null);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        hidden
      />
      <button onClick={() => inputRef.current?.click()}>
        Upload Image
      </button>
      {preview && <img src={preview} alt="Preview" />}
      {uploading && <div>Uploading... {progress}%</div>}
    </div>
  );
}
```

### Cloudinary 配置步骤

1. **注册账户**
   - 访问 https://cloudinary.com/users/register/free
   - 使用 Google 账户快速注册

2. **获取 Cloud Name**
   - 登录后在 Dashboard 顶部看到
   - 例如：`dc123abc`

3. **创建 Upload Preset**
   - Settings → Upload → Upload presets
   - 点击 "Add upload preset"
   - **Mode**: Unsigned（重要！）
   - **Preset name**: 例如 `spg_upload`
   - **Folder**: 可选，例如 `spg-uploads`
   - 保存

4. **配置环境变量**
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dc123abc
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=spg_upload
   ```

---

## 🤖 图片生成详解

### OpenAI DALL-E 配置

#### 获取 API 密钥

1. 访问 https://platform.openai.com/api-keys
2. 创建账户并添加支付方式（需要 $5 最低充值）
3. 点击 "Create new secret key"
4. 复制密钥（只显示一次！）

#### 配置

```env
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-xxx...
```

#### 定价

- **DALL-E 2**:
  - 1024×1024: $0.020/图
  - 512×512: $0.018/图
  - 256×256: $0.016/图

- **DALL-E 3**:
  - Standard 1024×1024: $0.040/图
  - HD 1024×1024: $0.080/图

#### 使用示例

```typescript
import { API_CONFIG } from '@/lib/api/config';

// 使用 DALL-E 3
API_CONFIG.openai.model = 'dall-e-3';

const result = await API.generateImages({
  prompt: "A surreal landscape",
  numImages: 1, // DALL-E 3 一次只能生成 1 张
});
```

---

### Replicate 配置（备选）

#### 获取 Token

1. 访问 https://replicate.com/account/api-tokens
2. 注册账户
3. 点击 "Create token"
4. 复制 token

#### 配置

```env
NEXT_PUBLIC_REPLICATE_API_TOKEN=r8_xxx...
```

#### 优势

- 成本更低（约 $0.0025/秒）
- 支持更多模型（Stable Diffusion, Midjourney 风格等）
- 可控性更强

---

## 🔧 自定义 API

### 添加自定义图片生成服务

在 `lib/api/imageGeneration.ts` 中：

```typescript
async function generateWithCustomAPI(
  request: GenerateImageRequest
): Promise<GenerateImageResponse> {
  try {
    const response = await fetch('https://your-api.com/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YOUR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        num_images: request.numImages,
      }),
    });

    const data = await response.json();

    return {
      success: true,
      images: data.images,
    };
  } catch (error) {
    return {
      success: false,
      images: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 在 generateImages 函数中添加
export async function generateImages(request: GenerateImageRequest) {
  const service = getImageGenerationService();
  
  switch (service) {
    case 'custom':
      return await generateWithCustomAPI(request);
    // ...
  }
}
```

### 添加自定义上传服务

在 `lib/api/fileUpload.ts` 中：

```typescript
async function uploadToCustomService(file: Blob): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('https://your-upload-api.com/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YOUR_TOKEN}`,
      },
      body: formData,
    });

    const data = await response.json();

    return {
      success: true,
      url: data.url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}
```

---

## ⚠️ 错误处理

### API 错误类型

```typescript
import { APIError } from '@/lib/types/api';

try {
  const result = await API.generateImages({ prompt: "test" });
  if (!result.success) {
    throw new APIError(result.error || 'Failed', 500, 'GENERATION_ERROR');
  }
} catch (error) {
  if (error instanceof APIError) {
    console.error('API Error:', error.message, error.statusCode, error.code);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `401 Unauthorized` | API 密钥无效 | 检查环境变量是否正确 |
| `429 Too Many Requests` | 超出频率限制 | 添加重试逻辑或降低请求频率 |
| `Upload failed` | 文件过大或格式不支持 | 检查文件大小（<10MB）和格式 |
| `CORS error` | 跨域问题 | 使用 Next.js API 路由代理请求 |

### 重试逻辑示例

```typescript
async function retryAPI<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
}

// 使用
const result = await retryAPI(() => 
  API.generateImages({ prompt: "test" })
);
```

---

## 💡 最佳实践

### 1. 安全性

#### ✅ 推荐：使用 Next.js API 路由

```typescript
// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 服务端密钥，不暴露
});

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    return NextResponse.json({
      success: true,
      images: [response.data[0].url],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Generation failed' },
      { status: 500 }
    );
  }
}
```

```typescript
// 客户端调用
const result = await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ prompt: "test" }),
});
```

#### ❌ 避免：直接在客户端使用敏感密钥

```typescript
// 不要这样做！
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY; // 会暴露给浏览器
```

---

### 2. 性能优化

#### 图片压缩

```typescript
// 上传前自动压缩
const result = await API.uploadFile(file);
// 内部会自动调用 compressImage(file, 1920, 1920, 0.8)
```

#### 批量生成优化

```typescript
// 使用 Promise.allSettled 避免一个失败影响全部
const results = await Promise.allSettled([
  API.generateImages({ prompt: "landscape", numImages: 2 }),
  API.generateImages({ prompt: "portrait", numImages: 2 }),
]);
```

---

### 3. 用户体验

#### 加载状态

```typescript
const { isGenerating, loadingText } = useAppStore();

{isGenerating && (
  <div>
    <Spinner />
    <p>{loadingText}</p>
  </div>
)}
```

#### 进度反馈

```typescript
// 上传进度
const [progress, setProgress] = useState(0);

const progressInterval = setInterval(() => {
  setProgress(prev => Math.min(prev + 10, 90));
}, 200);

await API.uploadFile(file);
clearInterval(progressInterval);
setProgress(100);
```

---

### 4. 成本控制

#### 设置使用限制

```typescript
// lib/api/config.ts
export const USAGE_LIMITS = {
  maxGenerationsPerDay: 50,
  maxUploadSizeBytes: 10 * 1024 * 1024, // 10MB
  maxImagesPerGeneration: 4,
};

// 实施限制
let dailyGenerations = 0;

if (dailyGenerations >= USAGE_LIMITS.maxGenerationsPerDay) {
  throw new Error('Daily limit reached');
}
```

#### Mock 模式用于开发

```env
# 开发时使用 mock
NEXT_PUBLIC_API_MODE=development

# 生产环境使用真实 API
NEXT_PUBLIC_API_MODE=production
```

---

## 📊 监控和日志

### 添加日志

```typescript
// lib/api/index.ts
export async function createChannel(request: CreateChannelRequest) {
  console.log('📝 [API] Creating channel:', {
    name: request.name,
    prompt: request.prompt.substring(0, 50),
    hasReference: !!request.referenceImage,
  });

  const startTime = Date.now();
  const result = await API.generateImages({ ... });
  const duration = Date.now() - startTime;

  console.log(`✅ [API] Channel created in ${duration}ms`);
  
  return result;
}
```

### Sentry 集成（可选）

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  const result = await API.generateImages({ prompt });
} catch (error) {
  Sentry.captureException(error, {
    tags: { api: 'image-generation' },
    contexts: { prompt: { text: prompt } },
  });
  throw error;
}
```

---

## 🧪 测试

### 单元测试示例

```typescript
// lib/api/__tests__/fileUpload.test.ts
import { validateImageFile } from '../fileUpload';

describe('validateImageFile', () => {
  it('should accept valid JPEG file', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('should reject file over 10MB', () => {
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });
    const result = validateImageFile(largeFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('10MB');
  });
});
```

---

## 🔗 相关资源

- [OpenAI API 文档](https://platform.openai.com/docs/guides/images)
- [Cloudinary 上传指南](https://cloudinary.com/documentation/upload_images)
- [Replicate API 文档](https://replicate.com/docs)
- [Next.js 环境变量](https://nextjs.org/docs/basic-features/environment-variables)
- [Zustand 文档](https://docs.pmnd.rs/zustand/getting-started/introduction)

---

## ❓ FAQ

### Q: 我需要配置 API 才能运行吗？
**A**: 不需要！默认使用 Mock 模式，无需任何配置即可运行和演示。

### Q: 如何切换到生产环境？
**A**: 设置 `NEXT_PUBLIC_API_MODE=production` 并配置至少一个图片生成服务和一个上传服务。

### Q: Cloudinary 的免费额度够用吗？
**A**: 非常够用！25GB 存储 + 25GB 带宽/月，对于大多数项目完全足够。

### Q: 如何降低 OpenAI 成本？
**A**: 
1. 使用 DALL-E 2 而不是 DALL-E 3（便宜 50%）
2. 减少生成图片数量
3. 使用 Replicate 作为备选（成本更低）

### Q: 上传的文件存在哪里？
**A**: 
- **Mock 模式**: 浏览器内存（刷新后消失）
- **Cloudinary**: Cloudinary 服务器
- **S3**: 你的 AWS S3 bucket

### Q: 如何添加自己的 API？
**A**: 参考 [自定义 API](#自定义-api) 章节。

---

**最后更新**: 2025-12-01  
**版本**: 1.0.0

