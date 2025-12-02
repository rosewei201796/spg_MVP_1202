# 前端样式参考指南 - SPG Mobile App (Neo-Brutalism Style)

> 这个文件包含了所有前端样式的完整参考，采用 **Neo-Brutalism** 设计风格 - 高对比度、硬边框、霓虹色强调的大胆设计。

---

## 📐 Neo-Brutal 设计系统

### 核心理念
1. **高对比度**: 黑白为主，霓虹色点缀
2. **硬边框**: 粗边框（3-4px），零圆角
3. **Hard Shadow**: 硬阴影效果（6px offset）
4. **粗体字**: 全部使用粗体，大写字母
5. **几何形状**: 方形、矩形，拒绝圆角
6. **大胆配色**: 霓虹橙、热粉、电蓝

---

## 🎨 色彩方案

### CSS 变量定义
```css
:root {
  /* 主色调 */
  --color-bg-main: #121212;        /* 深黑背景 */
  --color-text-main: #ffffff;      /* 纯白文字 */
  --color-text-inverse: #000000;   /* 纯黑（边框、阴影） */
  
  /* 霓虹强调色 */
  --color-neon-orange: #FF5F1F;    /* 霓虹橙 */
  --color-hot-pink: #FF00FF;       /* 热粉色 */
  --color-electric-blue: #00F0FF;  /* 电蓝色 */
  
  /* 结构参数 */
  --border-thickness: 3px;
  --shadow-offset: 6px;
}
```

### Tailwind 类名

| 用途 | 类名 | 颜色值 |
|------|------|--------|
| 背景主色 | `bg-[#121212]` | 深黑 |
| 文字主色 | `text-white` | 纯白 |
| 边框/阴影 | `border-black` | 纯黑 |
| 强调橙 | `bg-neon-orange` `text-neon-orange` | #FF5F1F |
| 强调粉 | `bg-hot-pink` `text-hot-pink` | #FF00FF |
| 强调蓝 | `bg-electric-blue` `text-electric-blue` | #00F0FF |

---

## 🔲 核心样式元素

### 1. Hard Shadow（硬阴影）

```tsx
// 标准硬阴影
className="hard-shadow"
// CSS: box-shadow: 6px 6px 0px #000000; border: 3px solid #000000;

// 小号硬阴影
className="hard-shadow-sm"
// CSS: box-shadow: 3px 3px 0px #000000; border: 2px solid #000000;

// 大号硬阴影
className="hard-shadow-lg"
// CSS: box-shadow: 8px 8px 0px #000000; border: 4px solid #000000;

// 点击时的交互效果
className="hard-shadow active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#000]"
```

**完整按钮示例**:
```tsx
<button className="bg-neon-orange px-6 py-3 
                   font-black text-black uppercase 
                   border-4 border-black hard-shadow 
                   active:translate-x-[3px] active:translate-y-[3px] 
                   active:shadow-[3px_3px_0px_#000] 
                   transition-all">
  CLICK ME
</button>
```

---

### 2. 粗边框

```tsx
// 标准边框
border-3 border-black     // 3px 黑色边框
border-4 border-black     // 4px 黑色边框

// 彩色边框
border-4 border-neon-orange
border-4 border-hot-pink
border-4 border-electric-blue
border-4 border-white

// 虚线边框
border-4 border-dashed border-white
```

---

### 3. 零圆角规则

**所有元素都使用直角**，完全不使用 `rounded-*` 类。

```tsx
// ❌ 错误 - 不要使用圆角
className="rounded-lg"
className="rounded-full"

// ✅ 正确 - 保持尖角
className=""  // 默认就是直角
```

---

### 4. 文字样式

```tsx
// 字体
font-family: 'Archivo Black', 'Arial Black', sans-serif
font-weight: 900

// 大小写
text-transform: uppercase

// 间距
letter-spacing: 0.05em  (tracking-wider)

// 字号
text-xs      // 12px (标签)
text-sm      // 14px (正文)
text-lg      // 18px (按钮)
text-xl      // 20px (小标题)
text-2xl     // 24px (标题)
text-3xl     // 30px (大标题)
text-4xl     // 36px (超大标题)

// 文字阴影
text-shadow-brutal   // 橙色阴影
text-shadow-pink     // 粉色阴影
text-shadow-blue     // 蓝色阴影
```

**示例**:
```tsx
<h1 className="text-4xl font-black uppercase text-shadow-brutal">
  LOUD & REBELLIOUS
</h1>
```

---

## 🎨 组件样式模式

### 1. 按钮样式

#### 主按钮（霓虹橙）
```tsx
<button className="bg-neon-orange px-6 py-3 
                   font-black text-black uppercase text-sm 
                   border-4 border-black hard-shadow 
                   active:translate-x-[3px] active:translate-y-[3px] 
                   active:shadow-[3px_3px_0px_#000] 
                   transition-all">
  PRIMARY ACTION
</button>
```

#### 次按钮（粉色）
```tsx
<button className="bg-hot-pink px-6 py-3 
                   font-black text-black uppercase text-sm 
                   border-4 border-black hard-shadow 
                   active:translate-x-[3px] active:translate-y-[3px] 
                   active:shadow-[3px_3px_0px_#000] 
                   transition-all">
  SECONDARY
</button>
```

#### 强调按钮（电蓝）
```tsx
<button className="bg-electric-blue px-6 py-3 
                   font-black text-black uppercase text-sm 
                   border-4 border-black hard-shadow 
                   active:translate-x-[3px] active:translate-y-[3px] 
                   active:shadow-[3px_3px_0px_#000] 
                   transition-all">
  ACCENT
</button>
```

#### 禁用状态
```tsx
<button disabled 
        className="bg-gray-800 text-gray-500 
                   border-4 border-gray-700 
                   cursor-not-allowed
                   font-black uppercase text-sm px-6 py-3">
  DISABLED
</button>
```

---

### 2. 卡片样式

```tsx
<div className="bg-white border-4 border-black hard-shadow p-6">
  {/* 卡片头部 */}
  <div className="bg-black px-3 py-1 inline-block mb-4">
    <h3 className="text-white font-black text-sm uppercase">
      CARD TITLE
    </h3>
  </div>
  
  {/* 卡片内容 */}
  <p className="text-black font-bold uppercase text-xs mb-4">
    Card content goes here with bold text.
  </p>
  
  {/* 卡片按钮 */}
  <button className="bg-neon-orange px-4 py-2 
                     font-black text-black uppercase text-xs 
                     border-3 border-black hard-shadow-sm">
    MORE
  </button>
</div>
```

#### 彩色边框卡片
```tsx
<div className="bg-[#121212] border-4 border-hot-pink hard-shadow p-6">
  {/* 内容 */}
</div>

<div className="bg-[#121212] border-4 border-electric-blue hard-shadow p-6">
  {/* 内容 */}
</div>
```

---

### 3. 输入框样式

```tsx
<div className="space-y-3">
  {/* 标签 */}
  <label className="text-xs font-black text-electric-blue 
                    uppercase tracking-widest block pl-1">
    INPUT LABEL
  </label>
  
  {/* 输入框 */}
  <input 
    type="text"
    placeholder="ENTER TEXT..."
    className="w-full bg-white border-4 border-black 
               px-4 py-3 text-lg text-black font-bold uppercase 
               placeholder:text-gray-500 
               focus:outline-none focus:border-hot-pink 
               transition-colors"
  />
</div>
```

#### 文本域
```tsx
<textarea 
  placeholder="ENTER YOUR MESSAGE..."
  className="w-full bg-white border-4 border-black 
             px-4 py-3 text-black font-bold uppercase 
             placeholder:text-gray-500 
             focus:outline-none focus:border-hot-pink 
             h-32 resize-none"
/>
```

---

### 4. 标签徽章

```tsx
// 小标签（橙色）
<div className="bg-neon-orange px-3 py-1 border-3 border-black inline-block">
  <span className="text-black font-black text-xs uppercase">
    BADGE
  </span>
</div>

// 小标签（粉色）
<div className="bg-hot-pink px-3 py-1 border-3 border-black inline-block">
  <span className="text-black font-black text-xs uppercase">
    NEW
  </span>
</div>

// 小标签（电蓝）
<div className="bg-electric-blue px-3 py-1 border-3 border-black inline-block">
  <span className="text-black font-black text-xs uppercase">
    LIVE
  </span>
</div>

// 空心标签
<div className="bg-transparent border-3 border-white px-3 py-1 inline-block">
  <span className="text-white font-black text-xs uppercase">
    OUTLINE
  </span>
</div>
```

---

### 5. 图标按钮

```tsx
// 方形图标按钮
<button className="w-12 h-12 bg-white border-3 border-black hard-shadow-sm 
                   flex items-center justify-center
                   active:translate-x-[2px] active:translate-y-[2px] 
                   active:shadow-[2px_2px_0px_#000] 
                   transition-all">
  <Heart size={24} className="text-black" />
</button>

// 带颜色的图标按钮
<button className="w-12 h-12 bg-hot-pink border-3 border-black hard-shadow-sm 
                   flex items-center justify-center
                   active:translate-x-[2px] active:translate-y-[2px] 
                   active:shadow-[2px_2px_0px_#000] 
                   transition-all">
  <Heart size={24} className="text-black" fill="#000" />
</button>
```

---

### 6. 装饰条纹

```tsx
// 对角条纹
<div className="deco-stripe h-4 w-full"></div>

// CSS 定义:
.deco-stripe {
  background: repeating-linear-gradient(
    45deg,
    #FF5F1F,
    #FF5F1F 10px,
    #121212 10px,
    #121212 20px
  );
  border-top: 3px solid #000000;
  border-bottom: 3px solid #000000;
}

// 简单色块装饰
<div className="w-2 h-2 bg-neon-orange"></div>
<div className="w-4 h-4 bg-hot-pink border-2 border-black"></div>
```

---

## 📱 布局模式

### 1. 全屏内容卡片

```tsx
<div className="relative w-full h-full bg-[#121212]">
  {/* 内容区域有边框 */}
  <div className="absolute inset-4 border-4 border-white">
    <img src={image} className="w-full h-full object-cover" />
    {/* 渐变遮罩 */}
    <div className="absolute inset-0 bg-gradient-to-b 
                    from-transparent to-[#121212]" />
  </div>
  
  {/* 浮动内容 */}
  <div className="absolute bottom-8 left-4 right-20 z-30">
    {/* UI 元素 */}
  </div>
</div>
```

---

### 2. 导航栏

```tsx
<div className="absolute bottom-4 left-4 right-4 h-[80px] 
                bg-white border-4 border-black hard-shadow 
                flex items-center justify-around z-40">
  
  {/* 导航按钮 */}
  <button className="flex flex-col items-center gap-1 w-16 
                     px-4 py-2 border-3 border-black bg-hot-pink">
    <Home size={28} strokeWidth={3} className="text-black" />
    <span className="text-[8px] font-black uppercase text-black">
      HOME
    </span>
  </button>
  
  {/* 凸起的创建按钮 */}
  <div className="relative -top-6">
    <button className="w-16 h-16 bg-neon-orange 
                       border-4 border-black hard-shadow-lg 
                       flex items-center justify-center
                       active:translate-x-[4px] active:translate-y-[4px] 
                       active:shadow-[4px_4px_0px_#000]">
      <Plus size={36} strokeWidth={4} className="text-black" />
    </button>
  </div>
</div>
```

---

### 3. 状态栏

```tsx
<div className="absolute top-0 left-0 right-0 z-50 
                border-b-2 border-black bg-[#121212]">
  <div className="flex items-center justify-between px-6 pt-3 pb-2">
    {/* 时间 */}
    <div className="bg-electric-blue px-2 py-1 border-2 border-black">
      <span className="text-black text-xs font-black uppercase">
        9:41
      </span>
    </div>
    
    {/* 状态图标 */}
    <div className="flex items-center gap-2">
      <div className="bg-white px-1.5 py-1 border-2 border-black">
        <Signal size={12} className="text-black" strokeWidth={3} />
      </div>
      <div className="bg-white px-1.5 py-1 border-2 border-black">
        <Wifi size={12} className="text-black" strokeWidth={3} />
      </div>
      <div className="bg-white px-1.5 py-1 border-2 border-black">
        <Battery size={12} className="text-black" strokeWidth={3} />
      </div>
    </div>
  </div>
</div>
```

---

### 4. 弹出层（Bottom Sheet）

```tsx
<div className="absolute inset-0 z-50 
                bg-black/80 
                flex items-end">
  <div className="w-full bg-[#121212] 
                  border-t-4 border-hot-pink 
                  p-6 pb-10">
    
    {/* 装饰顶条 */}
    <div className="h-2 w-20 bg-neon-orange mx-auto mb-6" />
    
    {/* 头部 */}
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-black uppercase text-white">
        MODAL TITLE
      </h3>
      <button className="w-10 h-10 bg-white 
                         border-3 border-black hard-shadow-sm">
        <X size={20} className="text-black" strokeWidth={3} />
      </button>
    </div>
    
    {/* 内容 */}
  </div>
</div>
```

---

### 5. 网格布局

```tsx
<div className="grid grid-cols-2 gap-4">
  {items.map((item) => (
    <div key={item.id}
         className="aspect-[9/16] bg-white 
                    border-4 border-black hard-shadow 
                    cursor-pointer overflow-hidden
                    active:translate-x-[3px] active:translate-y-[3px] 
                    active:shadow-[3px_3px_0px_#000] 
                    transition-all">
      
      <img src={item.image} className="w-full h-full object-cover" />
      
      {/* 底部信息栏 */}
      <div className="absolute bottom-0 left-0 right-0 
                      bg-black border-t-3 border-white p-2">
        <h3 className="font-black text-white text-xs uppercase">
          {item.title}
        </h3>
      </div>
    </div>
  ))}
</div>
```

---

## 🎭 动画效果

### 点击动画
```tsx
// 标准点击效果（硬阴影收缩）
active:translate-x-[3px] active:translate-y-[3px] 
active:shadow-[3px_3px_0px_#000]

// 小按钮点击效果
active:translate-x-[2px] active:translate-y-[2px] 
active:shadow-[2px_2px_0px_#000]

// 大按钮点击效果
active:translate-x-[4px] active:translate-y-[4px] 
active:shadow-[4px_4px_0px_#000]
```

### 加载动画
```tsx
<div className="relative">
  {/* 外方框 */}
  <div className="w-24 h-24 border-4 border-neon-orange 
                  animate-[spin_2s_linear_infinite]" />
  
  {/* 内方框（反向旋转） */}
  <div className="absolute inset-3 border-4 border-hot-pink 
                  animate-[spin_1.5s_reverse_linear_infinite]" />
  
  {/* 中心图标 */}
  <div className="absolute inset-0 flex items-center justify-center">
    <Zap className="text-electric-blue animate-pulse" />
  </div>
</div>
```

### 淡入动画
```tsx
className="animate-in fade-in duration-200"
```

### 滑入动画
```tsx
className="animate-in slide-in-from-bottom duration-300"
```

---

## 🎯 完整组件示例

### 示例 1: 内容卡片
```tsx
<div className="relative w-full h-full bg-[#121212]">
  {/* 背景图片区域 */}
  <div className="absolute inset-4 border-4 border-white">
    <img src={content.src} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-b 
                    from-transparent to-[#121212]" />
  </div>
  
  {/* 右侧操作按钮 */}
  <div className="absolute right-6 bottom-32 
                  flex flex-col gap-4 z-30">
    {/* 头像 */}
    <div className="w-12 h-12 bg-hot-pink border-3 border-black 
                    hard-shadow-sm flex items-center justify-center 
                    font-black text-black text-lg">
      A
    </div>
    
    {/* 点赞按钮 */}
    <button className="bg-white border-3 border-black px-3 py-2 
                       hard-shadow-sm flex flex-col items-center gap-1
                       active:translate-x-[2px] active:translate-y-[2px] 
                       active:shadow-[2px_2px_0px_#000]">
      <Heart size={24} className="text-black" fill="#FF00FF" />
      <span className="text-[10px] font-black text-black">1.2K</span>
    </button>
  </div>
  
  {/* 底部信息 */}
  <div className="absolute left-4 bottom-32 right-24 z-30">
    {/* 频道标签 */}
    <div className="bg-hot-pink px-3 py-1 border-3 border-black 
                    inline-block mb-3">
      <span className="text-black font-black text-xs uppercase">
        CHANNEL NAME
      </span>
    </div>
    
    {/* 描述 */}
    <p className="text-sm font-bold bg-[#121212] 
                  border-l-4 border-electric-blue 
                  pl-3 py-2 uppercase text-white">
      Content description here
    </p>
    
    {/* Remix 按钮 */}
    <button className="mt-4 bg-neon-orange px-6 py-3 
                       font-black text-black uppercase text-sm 
                       border-4 border-black hard-shadow
                       flex items-center gap-3
                       active:translate-x-[3px] active:translate-y-[3px] 
                       active:shadow-[3px_3px_0px_#000]">
      <RefreshCw size={18} />
      <span>REMIX</span>
    </button>
  </div>
</div>
```

### 示例 2: 创建表单
```tsx
<div className="w-full bg-[#121212] p-6">
  {/* 装饰条纹 */}
  <div className="h-4 w-full deco-stripe mb-6" />
  
  {/* 标题 */}
  <div className="border-l-4 border-neon-orange pl-4 mb-8">
    <h2 className="text-4xl font-black uppercase text-shadow-brutal">
      CREATE NEW
    </h2>
  </div>
  
  {/* 输入组 */}
  <div className="space-y-6">
    <div>
      <label className="text-xs font-black text-electric-blue 
                        uppercase tracking-widest block mb-3">
        PROMPT
      </label>
      <div className="bg-white border-4 border-black hard-shadow p-4">
        <textarea 
          placeholder="DESCRIBE YOUR VISION..."
          className="w-full bg-transparent text-black font-bold 
                     uppercase placeholder:text-gray-500 
                     focus:outline-none h-40 resize-none"
        />
      </div>
    </div>
  </div>
  
  {/* 提交按钮 */}
  <button className="w-full mt-8 bg-electric-blue py-5 
                     font-black text-xl uppercase text-black 
                     border-4 border-black hard-shadow
                     flex items-center justify-center gap-4
                     active:translate-x-[4px] active:translate-y-[4px] 
                     active:shadow-[4px_4px_0px_#000]">
    <Zap size={24} fill="black" />
    GENERATE
  </button>
</div>
```

---

## 📝 样式编写规范

### 类名组织顺序
```tsx
className="
  // 1. 布局定位
  relative flex flex-col
  
  // 2. 尺寸
  w-full h-12
  
  // 3. 间距
  px-6 py-3 gap-2
  
  // 4. 背景和边框
  bg-neon-orange border-4 border-black
  
  // 5. 文字
  text-black font-black uppercase text-sm
  
  // 6. 阴影效果
  hard-shadow
  
  // 7. 层级
  z-30
  
  // 8. 交互动画
  active:translate-x-[3px] active:translate-y-[3px] 
  active:shadow-[3px_3px_0px_#000] transition-all
"
```

---

## 🎯 快速参考表

| 需求 | 类名组合 |
|------|---------|
| 硬阴影按钮 | `border-4 border-black hard-shadow active:translate-x-[3px] active:translate-y-[3px]` |
| 主按钮 | `bg-neon-orange text-black font-black uppercase border-4 border-black hard-shadow` |
| 卡片 | `bg-white border-4 border-black hard-shadow p-6` |
| 标签 | `bg-hot-pink px-3 py-1 border-3 border-black inline-block` |
| 输入框 | `bg-white border-4 border-black px-4 py-3 text-black font-bold uppercase` |
| 装饰条纹 | `deco-stripe h-4` |
| 方形图标按钮 | `w-12 h-12 bg-white border-3 border-black hard-shadow-sm` |
| 状态栏元素 | `bg-electric-blue px-2 py-1 border-2 border-black` |

---

## 💡 设计原则

1. **绝对高对比**: 黑白为主，霓虹色点缀
2. **零圆角**: 所有元素都是直角
3. **粗边框**: 最小 3px，常用 4px
4. **硬阴影**: 6px offset，纯黑色
5. **粗体字**: font-weight: 900，全部大写
6. **几何形状**: 方形、矩形为主
7. **大胆配色**: 霓虹橙、热粉、电蓝
8. **强烈反馈**: 点击时阴影收缩，位移 3-4px

---

## 🚫 禁止使用

1. ❌ 圆角 (`rounded-*`)
2. ❌ 柔和阴影 (`shadow-sm`, `shadow-lg`)
3. ❌ 模糊效果 (`backdrop-blur-*`, `blur-*`)
4. ❌ 渐变背景（除了遮罩层）
5. ❌ 细字体 (`font-light`, `font-normal`)
6. ❌ 小写字母（标题和按钮必须大写）
7. ❌ 灰色系（使用纯黑或纯白）
8. ❌ 过渡效果太慢（使用 fast transitions）

---

## ✅ 推荐使用

1. ✅ 硬阴影 (`hard-shadow`)
2. ✅ 粗边框 (`border-3`, `border-4`)
3. ✅ 霓虹色 (`bg-neon-orange`, `bg-hot-pink`, `bg-electric-blue`)
4. ✅ 粗体字 (`font-black`, `font-bold`)
5. ✅ 大写字母 (`uppercase`)
6. ✅ 直角元素（默认，不加 rounded）
7. ✅ 纯黑纯白 (`bg-black`, `bg-white`, `text-black`, `text-white`)
8. ✅ 快速过渡 (`transition-all` with default duration)

---

**文件创建时间**: 2025-11-28  
**适用框架**: Next.js 14 + Tailwind CSS 3.4  
**设计风格**: Neo-Brutalism  
**灵感来源**: 反叛、朋克、高对比度设计运动

---

**REMEMBER**: NO MASTERS. NO RULES. ONLY BRUTAL DESIGN.
