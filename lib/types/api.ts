/**
 * API 相关类型定义
 */

// 图片生成请求
export interface GenerateImageRequest {
  prompt: string;
  negativePrompt?: string;
  stylePreset?: string;
  referenceImage?: string; // Base64 or URL
  numImages?: number;
}

// 图片生成响应
export interface GenerateImageResponse {
  success: boolean;
  images: string[]; // URLs
  error?: string;
}

// Channel 创建请求
export interface CreateChannelRequest {
  name: string;
  prompt: string;
  referenceImage?: string;
  theme?: string;
}

// Channel 创建响应
export interface CreateChannelResponse {
  success: boolean;
  channel?: {
    id: string;
    name: string;
    owner: string;
    theme: string;
    contents: Array<{
      id: string;
      src: string;
      prompt: string;
      createdAt: string;
    }>;
  };
  error?: string;
}

// 文件上传响应
export interface UploadFileResponse {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

// API 错误类型
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

