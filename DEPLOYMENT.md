# 🚀 Vercel 部署指南

本文档介绍如何将 SPG 应用部署到 Vercel，让任何人都能通过手机访问。

## 📋 前置要求

1. **GitHub 账号**（用于托管代码）
2. **Vercel 账号**（免费）- [https://vercel.com](https://vercel.com)
3. **API 密钥** - OpenAI 兼容的 API Key

---

## 🎯 部署步骤

### 步骤 1: 准备 Git 仓库

```bash
# 1. 初始化 Git 仓库（如果还没有）
cd "/Users/rosewei/SPG/SPG MVP1126"
git init

# 2. 添加所有文件
git add .

# 3. 创建首次提交
git commit -m "Initial commit: SPG MVP ready for deployment"
```

### 步骤 2: 推送到 GitHub

```bash
# 1. 在 GitHub 上创建新仓库
# 访问: https://github.com/new
# 仓库名建议: spg-mvp 或 spg-mobile-app

# 2. 连接远程仓库（替换成你的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 3. 推送代码
git branch -M main
git push -u origin main
```

### 步骤 3: 在 Vercel 上部署

#### 方法 A: 通过 Vercel 网站（推荐）

1. **登录 Vercel**
   - 访问 [https://vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New" → "Project"
   - 选择你刚刚创建的 GitHub 仓库
   - 点击 "Import"

3. **配置项目**
   - **Framework Preset**: Next.js（自动检测）
   - **Root Directory**: `./`（默认）
   - **Build Command**: `npm run build`（默认）
   - **Output Directory**: `.next`（默认）

4. **设置环境变量**（重要！）
   
   在 "Environment Variables" 部分添加以下变量：
   
   ```
   NEXT_PUBLIC_API_MODE=production
   NEXT_PUBLIC_OPENAI_API_KEY=sk-PZwjoX0QGseFOHjVh3SFBQ
   NEXT_PUBLIC_OPENAI_BASE_URL=https://llm.jp.one2x.ai
   NEXT_PUBLIC_GEMINI_PROMPT_MODEL=vertex_ai/gemini-3-pro-preview
   NEXT_PUBLIC_GEMINI_IMAGE_MODEL=vertex_ai/gemini-3-pro-image-preview
   ```

5. **点击 Deploy**
   - Vercel 会自动构建和部署你的应用
   - 等待 2-3 分钟完成部署

#### 方法 B: 通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 按照提示操作
# - Set up and deploy? Yes
# - Which scope? 选择你的账号
# - Link to existing project? No
# - What's your project's name? spg-mvp
# - In which directory is your code located? ./
```

---

## 🔧 环境变量配置

部署后，你可以在 Vercel 项目设置中管理环境变量：

1. 进入你的项目
2. 点击 "Settings"
3. 点击 "Environment Variables"
4. 添加或修改变量

### 必需的环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_API_MODE` | API 模式 | `production` |
| `NEXT_PUBLIC_OPENAI_API_KEY` | API 密钥 | `sk-xxx...` |
| `NEXT_PUBLIC_OPENAI_BASE_URL` | API 基础 URL | `https://llm.jp.one2x.ai` |
| `NEXT_PUBLIC_GEMINI_PROMPT_MODEL` | Prompt 生成模型 | `vertex_ai/gemini-3-pro-preview` |
| `NEXT_PUBLIC_GEMINI_IMAGE_MODEL` | 图片生成模型 | `vertex_ai/gemini-3-pro-image-preview` |

---

## 📱 访问你的应用

部署成功后，Vercel 会提供三个 URL：

1. **生产环境 URL**: `https://your-project.vercel.app`
   - 稳定版本，用于分享给用户
   
2. **预览 URL**: `https://your-project-git-branch.vercel.app`
   - 每次 push 新代码时自动生成
   - 用于测试新功能

3. **自定义域名**（可选）
   - 在 Vercel 项目设置中添加
   - 例如: `spg.yourdomain.com`

### 手机访问

- 直接在手机浏览器中打开生产环境 URL
- iOS Safari / Android Chrome 会提示"添加到主屏幕"
- 添加后即可像原生 App 一样使用（PWA）

---

## 🔄 自动部署

配置完成后，每次你 push 代码到 GitHub，Vercel 会自动：

1. 检测到新提交
2. 自动构建应用
3. 运行测试（如果有）
4. 部署到生产环境

```bash
# 更新应用只需要
git add .
git commit -m "Update features"
git push

# Vercel 会自动部署！
```

---

## 🐛 故障排查

### 问题 1: 构建失败

**检查**:
- 本地能否成功运行 `npm run build`
- 检查 Vercel 构建日志中的错误信息

**解决**:
```bash
# 本地测试构建
npm run build

# 如果成功，再次部署
git add .
git commit -m "Fix build issues"
git push
```

### 问题 2: 环境变量未生效

**检查**:
- 环境变量名是否正确（大小写敏感）
- 是否以 `NEXT_PUBLIC_` 开头（客户端变量）
- 修改后是否重新部署

**解决**:
1. 在 Vercel 项目设置中确认环境变量
2. 点击 "Redeploy" 重新部署

### 问题 3: API 调用失败

**检查**:
- 浏览器控制台是否有 CORS 错误
- API 密钥是否有效
- API 基础 URL 是否正确

**解决**:
1. 检查 `NEXT_PUBLIC_OPENAI_API_KEY` 是否正确
2. 测试 API 密钥是否有效：
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://llm.jp.one2x.ai/v1/models
```

### 问题 4: PWA 不工作

**检查**:
- Service Worker 是否正确注册
- 检查浏览器控制台 → Application → Service Workers

**解决**:
- 清除浏览器缓存
- 卸载 PWA 后重新添加到主屏幕

---

## 📊 性能优化

### 1. 图片优化

Vercel 自动优化图片，无需额外配置。

### 2. 缓存配置

已在 `vercel.json` 中配置 Service Worker 和静态资源缓存。

### 3. 边缘函数

Vercel 会自动将你的 API 路由部署到全球边缘节点，确保低延迟。

---

## 🔒 安全建议

1. **不要在代码中硬编码 API 密钥**
   - 始终使用环境变量
   - `.env.local` 已被 `.gitignore` 忽略

2. **定期更换 API 密钥**
   - 在 Vercel 设置中更新
   - 点击 "Redeploy" 应用更改

3. **监控 API 使用**
   - 检查 API 提供商的使用统计
   - 设置使用限额和警报

---

## 📈 监控和分析

### Vercel Analytics（可选）

1. 进入项目设置
2. 点击 "Analytics"
3. 启用免费版本

可以看到：
- 访问量统计
- 页面性能指标
- 用户地理分布
- 设备类型

### 自定义域名（可选）

1. 进入项目设置 → "Domains"
2. 添加你的域名
3. 按照指示配置 DNS

---

## ✅ 部署检查清单

部署前确认：

- [ ] 本地运行 `npm run build` 成功
- [ ] `.env.local` 已添加到 `.gitignore`
- [ ] 环境变量已在 Vercel 中配置
- [ ] API 密钥有效
- [ ] 代码已提交到 GitHub

部署后验证：

- [ ] 应用可以正常打开
- [ ] 可以创建新 Channel
- [ ] 图片可以正常生成
- [ ] 手机端可以访问
- [ ] PWA 可以添加到主屏幕
- [ ] 所有功能正常工作

---

## 🎉 成功！

你的 SPG 应用现在已经部署到 Vercel，全球任何人都可以通过手机访问！

**下一步**:
- 分享你的应用 URL
- 收集用户反馈
- 持续迭代和改进

如有问题，查看 [Vercel 文档](https://vercel.com/docs) 或提交 Issue。

