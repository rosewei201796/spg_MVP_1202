/**
 * 图片压缩工具
 * 用于减少 Base64 图片的存储大小
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0
  maxSizeKB?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  maxSizeKB: 800, // 目标最大 800KB
};

/**
 * 压缩图片文件
 */
export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const compressed = compressImage(img, opts);
          resolve(compressed);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 压缩 Image 对象
 */
function compressImage(img: HTMLImageElement, options: CompressionOptions): string {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.85 } = options;

  // 计算目标尺寸
  let width = img.width;
  let height = img.height;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
  }

  // 创建 canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // 设置高质量缩放
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 绘制图片
  ctx.drawImage(img, 0, 0, width, height);

  // 转换为 Base64
  // 尝试使用 WebP 格式（更小），如果不支持则使用 JPEG
  let dataUrl = canvas.toDataURL('image/webp', quality);
  
  // 如果浏览器不支持 WebP，回退到 JPEG
  if (!dataUrl.startsWith('data:image/webp')) {
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  // 如果还是太大，进一步降低质量
  if (options.maxSizeKB) {
    const sizeKB = estimateBase64SizeKB(dataUrl);
    if (sizeKB > options.maxSizeKB && quality > 0.5) {
      console.log(`📉 Image too large (${sizeKB.toFixed(0)}KB), compressing further...`);
      return compressImage(img, { ...options, quality: quality - 0.1 });
    }
  }

  const finalSizeKB = estimateBase64SizeKB(dataUrl);
  console.log(
    `✅ Compressed: ${img.width}x${img.height} → ${width}x${height}, ` +
    `${finalSizeKB.toFixed(0)}KB, quality: ${(quality * 100).toFixed(0)}%`
  );

  return dataUrl;
}

/**
 * 压缩 Base64 图片
 */
export async function compressBase64Image(
  base64: string,
  options: CompressionOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        const compressed = compressImage(img, { ...DEFAULT_OPTIONS, ...options });
        resolve(compressed);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load base64 image'));
    };

    img.src = base64;
  });
}

/**
 * 估算 Base64 字符串的大小（KB）
 */
export function estimateBase64SizeKB(base64: string): number {
  // Base64 编码后的大小约为原始大小的 4/3
  // data:image/jpeg;base64, 这部分前缀不计入实际数据
  const base64Data = base64.split(',')[1] || base64;
  const sizeBytes = (base64Data.length * 3) / 4;
  return sizeBytes / 1024;
}

/**
 * 获取图片信息
 */
export async function getImageInfo(file: File): Promise<{
  width: number;
  height: number;
  sizeKB: number;
  type: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          sizeKB: file.size / 1024,
          type: file.type,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

