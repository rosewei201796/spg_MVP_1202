/**
 * AI 图片生成服务
 * 支持 OpenAI DALL-E 和 Replicate
 */

import { API_CONFIG, getImageGenerationService } from './config';
import { THEME_LIBRARIES, getRandomThemeKey } from '../mockData';
import type { GenerateImageRequest, GenerateImageResponse } from '../types/api';

/**
 * 使用 Gemini Image 模型生成图片
 * 通过 OpenAI 兼容接口调用 vertex_ai/gemini-3-pro-image-preview
 */
/**
 * 使用 Gemini Image 模型生成图片
 * 参考文档: API_COMPLETE_GUIDE.md 第378-408行
 * 
 * 备用机制：如果生成失败，返回 Picsum 占位图
 */
async function generateWithGemini(
  request: GenerateImageRequest
): Promise<GenerateImageResponse> {
  const apiKey = API_CONFIG.gemini.apiKey;
  const baseUrl = API_CONFIG.gemini.baseUrl;
  const model = API_CONFIG.gemini.imageModel;

  console.log(`🎨 Generating image with ${model}`);
  console.log(`📝 Prompt: ${request.prompt.substring(0, 100)}...`);

  try {
    // 尝试调用 Gemini Image API (OpenAI-compatible endpoint)
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json', // 关键：要求返回 JSON 格式而不是二进制
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: request.prompt,
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 [Gemini Image] Response structure:', {
      hasChoices: !!data.choices,
      hasMessage: !!data.choices?.[0]?.message,
      hasImages: !!data.choices?.[0]?.message?.images,
      imageCount: data.choices?.[0]?.message?.images?.length || 0,
    });
    
    // 提取图像 - 正确的响应结构是 choices[0].message.images[0].image_url.url
    let imageUrl: string | null = null;

    // 标准 Gemini Image 响应格式（添加 Accept: application/json 后）
    if (data.choices?.[0]?.message?.images?.[0]?.image_url?.url) {
      imageUrl = data.choices[0].message.images[0].image_url.url;
      console.log('✅ Extracted image from Gemini response (data URL format)');
      console.log('📸 Image preview:', imageUrl.substring(0, 80) + '...');
    }
    // 备用方法：检查 content 字段
    else if (data.choices?.[0]?.message?.content) {
      const content = data.choices[0].message.content;
      
      if (typeof content === 'string' && content.startsWith('data:image/')) {
        imageUrl = content;
        console.log('✅ Extracted image from content field (data URL)');
      }
      else if (typeof content === 'string' && content.startsWith('http')) {
        imageUrl = content;
        console.log('✅ Extracted image URL from content');
      }
    }

    if (imageUrl && imageUrl.startsWith('data:image/')) {
      return {
        success: true,
        images: [imageUrl],
      };
    }

    // 如果无法提取图像，打印响应用于调试
    console.error('⚠️ Unexpected response structure:', JSON.stringify(data).substring(0, 500));
    throw new Error('Could not extract image from API response');

  } catch (error) {
    // 备用机制：使用 Picsum 占位图
    console.warn('⚠️ Gemini image generation failed, using placeholder');
    console.error('Error details:', error instanceof Error ? error.message : error);
    
    // 生成随机种子以确保不同的占位图
    const seed = Math.random().toString(36).substring(7);
    const placeholderUrl = `https://picsum.photos/seed/${seed}/800/600`;
    
    console.log(`📷 Using placeholder: ${placeholderUrl}`);

    return {
      success: true, // 返回 success:true 因为我们有备用方案
      images: [placeholderUrl],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 使用 OpenAI DALL-E 生成图片
 */
async function generateWithOpenAI(
  request: GenerateImageRequest
): Promise<GenerateImageResponse> {
  try {
    const response = await fetch(`${API_CONFIG.openai.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: API_CONFIG.openai.model,
        prompt: request.prompt,
        n: request.numImages || 4,
        size: '1024x1024',
        quality: 'standard', // or 'hd' for DALL-E 3
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Image generation failed');
    }

    const data = await response.json();
    const images = data.data.map((img: any) => img.url);

    return {
      success: true,
      images,
    };
  } catch (error) {
    return {
      success: false,
      images: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 使用 Replicate 生成图片 (Stable Diffusion)
 */
async function generateWithReplicate(
  request: GenerateImageRequest
): Promise<GenerateImageResponse> {
  try {
    // Step 1: 创建预测
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_CONFIG.replicate.apiToken}`,
      },
      body: JSON.stringify({
        version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        input: {
          prompt: request.prompt,
          negative_prompt: request.negativePrompt || '',
          num_outputs: request.numImages || 4,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create prediction');
    }

    const prediction = await response.json();

    // Step 2: 轮询结果
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        {
          headers: {
            'Authorization': `Token ${API_CONFIG.replicate.apiToken}`,
          },
        }
      );
      
      result = await statusResponse.json();
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Generation failed');
    }

    return {
      success: true,
      images: result.output || [],
    };
  } catch (error) {
    return {
      success: false,
      images: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Mock 生成（开发模式）
 */
async function mockGenerate(
  request: GenerateImageRequest
): Promise<GenerateImageResponse> {
  // 模拟 API 延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 随机选择一个主题库
  const themeKey = getRandomThemeKey();
  const theme = THEME_LIBRARIES[themeKey];

  return {
    success: true,
    images: theme.images,
  };
}

/**
 * 统一生成接口
 */
export async function generateImages(
  request: GenerateImageRequest
): Promise<GenerateImageResponse> {
  const service = getImageGenerationService();

  console.log(`🎨 Generating images with ${service} service...`);

  switch (service) {
    case 'gemini':
      return await generateWithGemini(request);

    case 'openai':
      return await generateWithOpenAI(request);

    case 'replicate':
      return await generateWithReplicate(request);

    case 'mock':
    default:
      return await mockGenerate(request);
  }
}

/**
 * 增强提示词（添加风格描述）
 */
export function enhancePrompt(prompt: string, stylePreset?: string): string {
  const styleEnhancements: Record<string, string> = {
    cyberpunk: ', cyberpunk aesthetic, neon lights, futuristic city, high contrast, digital art',
    nature: ', natural landscape, organic, vibrant colors, outdoor scene, realistic photography',
    abstract: ', abstract art, geometric shapes, vibrant colors, modern art style',
    space: ', space scene, cosmic, stars and galaxies, deep space, astronomical',
    minimal: ', minimalist design, clean lines, simple composition, elegant',
  };

  const enhancement = stylePreset ? styleEnhancements[stylePreset] || '' : '';
  return prompt + enhancement;
}

