/**
 * 文件上传服务
 * 支持 Cloudinary 和 AWS S3
 */

import { API_CONFIG, getFileUploadService } from './config';
import type { UploadFileResponse } from '../types/api';

/**
 * 压缩图片
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // 计算缩放比例
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * 生成图片预览 URL
 */
export function createPreviewURL(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * 释放预览 URL
 */
export function revokePreviewURL(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * 上传到 Cloudinary
 */
async function uploadToCloudinary(file: Blob): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', API_CONFIG.cloudinary.uploadPreset);
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${API_CONFIG.cloudinary.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * 上传到 AWS S3
 * 注意：需要配置服务端 API 路由来签名上传
 */
async function uploadToS3(file: Blob): Promise<UploadFileResponse> {
  try {
    // Step 1: 获取预签名 URL
    const signResponse = await fetch('/api/upload/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: `upload-${Date.now()}.jpg`,
        contentType: 'image/jpeg',
      }),
    });
    
    if (!signResponse.ok) {
      throw new Error('Failed to get signed URL');
    }
    
    const { signedUrl, fileUrl } = await signResponse.json();
    
    // Step 2: 上传文件到 S3
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to S3');
    }
    
    return {
      success: true,
      url: fileUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Mock 上传（没有配置云端上传时使用）
 * 将图片转为 base64，以便可以发送给远程 API
 */
async function mockUpload(file: Blob): Promise<UploadFileResponse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    // 将图片转换为 base64，这样可以被远程 API 访问
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result); // 返回 data:image/jpeg;base64,... 格式
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    return {
      success: true,
      url: base64, // base64 数据 URL，可以被任何地方访问
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to convert image',
    };
  }
}

/**
 * 统一上传接口
 */
export async function uploadFile(file: File): Promise<UploadFileResponse> {
  try {
    // 压缩图片
    const compressedBlob = await compressImage(file);
    
    // 根据配置选择上传服务
    const service = getFileUploadService();
    
    switch (service) {
      case 'cloudinary':
        return await uploadToCloudinary(compressedBlob);
      
      case 'aws':
        return await uploadToS3(compressedBlob);
      
      case 'mock':
      default:
        return await mockUpload(compressedBlob);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * 验证文件类型
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: '仅支持 JPG, PNG, WebP, GIF 格式',
    };
  }
  
  // 限制文件大小为 10MB
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '文件大小不能超过 10MB',
    };
  }
  
  return { valid: true };
}

