/**
 * API 配置管理
 */

export const API_CONFIG = {
  // API 模式
  mode: process.env.NEXT_PUBLIC_API_MODE || 'development',
  
  // Gemini 配置 (用于生成多样化的提示词和图片)
  gemini: {
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    baseUrl: process.env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1',
    promptModel: process.env.NEXT_PUBLIC_GEMINI_PROMPT_MODEL || 'vertex_ai/gemini-3-pro-preview',
    imageModel: process.env.NEXT_PUBLIC_GEMINI_IMAGE_MODEL || 'vertex_ai/gemini-3-pro-image-preview',
  },
  
  // OpenAI 配置 (备用)
  openai: {
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    baseUrl: process.env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: 'dall-e-3', // dall-e-2 or dall-e-3
  },
  
  // Replicate 配置
  replicate: {
    apiToken: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || '',
  },
  
  // Cloudinary 配置
  cloudinary: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  
  // AWS S3 配置
  aws: {
    bucket: process.env.AWS_S3_BUCKET || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
  },
} as const;

// 检查 API 是否配置
export function isAPIConfigured(): boolean {
  if (API_CONFIG.mode === 'development') {
    return true; // 开发模式总是返回 true
  }
  
  // 检查至少配置了一个图片生成服务
  const hasImageAPI = 
    !!API_CONFIG.openai.apiKey || 
    !!API_CONFIG.replicate.apiToken;
  
  // 检查至少配置了一个文件上传服务
  const hasUploadAPI = 
    !!API_CONFIG.cloudinary.cloudName || 
    !!API_CONFIG.aws.bucket;
  
  return hasImageAPI && hasUploadAPI;
}

// 获取当前使用的图片生成服务
export function getImageGenerationService(): 'gemini' | 'openai' | 'replicate' | 'mock' {
  if (API_CONFIG.mode === 'development') {
    return 'mock';
  }
  
  // 优先使用 Gemini (通过 OpenAI 兼容接口)
  if (API_CONFIG.gemini.apiKey && API_CONFIG.gemini.imageModel) {
    return 'gemini';
  }
  
  if (API_CONFIG.openai.apiKey) {
    return 'openai';
  }
  
  if (API_CONFIG.replicate.apiToken) {
    return 'replicate';
  }
  
  return 'mock';
}

// 获取当前使用的文件上传服务
export function getFileUploadService(): 'cloudinary' | 'aws' | 'mock' {
  if (API_CONFIG.mode === 'development') {
    return 'mock';
  }
  
  if (API_CONFIG.cloudinary.cloudName) {
    return 'cloudinary';
  }
  
  if (API_CONFIG.aws.bucket) {
    return 'aws';
  }
  
  return 'mock';
}

