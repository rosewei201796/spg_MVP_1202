/**
 * API 服务统一入口
 */

export * from './config';
export * from './fileUpload';
export * from './imageGeneration';
export * from './gemini';
export * from '../types/api';

import { generateImages, enhancePrompt } from './imageGeneration';
import { uploadFile, validateImageFile } from './fileUpload';
import { generateImagePromptsWithGemini, generateChannelName } from './gemini';
import type {
  CreateChannelRequest,
  CreateChannelResponse,
} from '../types/api';
import { getRandomThemeKey } from '../mockData';

/**
 * 创建新 Channel（完整流程）
 * 使用 Gemini AI 生成多样化的初始图片和爆款名字
 */
export async function createChannel(
  request: CreateChannelRequest
): Promise<CreateChannelResponse> {
  try {
    console.log('📝 Creating channel with prompt:', request.prompt);

    // Step 1: 生成爆款 Channel 名字
    console.log('🏷️ Generating catchy channel name...');
    const nameResult = await generateChannelName(request.prompt, request.referenceImage);
    const channelName = nameResult.name;
    console.log(`✅ Channel name: "${channelName}"`);

    // Step 2: 使用 Gemini 生成多样化的图片提示词
    console.log('🧠 Generating diverse prompts with Gemini AI...');
    const geminiResult = await generateImagePromptsWithGemini({
      userPrompt: request.prompt,
      referenceImage: request.referenceImage,
      numPrompts: 8, // 生成8个不同的prompts
    });

    if (!geminiResult.success || !geminiResult.prompts || geminiResult.prompts.length === 0) {
      throw new Error('Failed to generate prompts with Gemini');
    }

    console.log(`✅ Generated ${geminiResult.prompts.length} diverse prompts`);

    // Step 3: 为每个生成的prompt生成图片
    console.log('🎨 Generating images for each prompt...');
    const allContents = [];
    const channelId = `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 选取前4个prompts生成图片（或根据需要调整数量）
    const selectedPrompts = geminiResult.prompts.slice(0, 4);

    for (let i = 0; i < selectedPrompts.length; i++) {
      const promptText = selectedPrompts[i];
      console.log(`  📸 Generating image ${i + 1}/${selectedPrompts.length}...`);

      // 为每个prompt生成1张图片
      const result = await generateImages({
        prompt: promptText,
        referenceImage: request.referenceImage,
        numImages: 1,
      });

      if (result.success && result.images.length > 0) {
        allContents.push({
          id: `content_${channelId}_${i}`,
          src: result.images[0],
          prompt: promptText, // 使用生成的具体prompt
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 如果没有成功生成任何图片，抛出错误
    if (allContents.length === 0) {
      throw new Error('Failed to generate any images');
    }

    console.log(`✅ Channel "${channelName}" created successfully with ${allContents.length} images`);

    return {
      success: true,
      channel: {
        id: channelId,
        name: channelName, // 使用 AI 生成的爆款名字
        owner: 'Me',
        theme: request.theme || getRandomThemeKey(),
        contents: allContents,
      },
    };
  } catch (error) {
    console.error('❌ Failed to create channel:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 导出所有 API 方法
 */
export const API = {
  // 图片生成
  generateImages,
  enhancePrompt,

  // Gemini AI
  generateImagePromptsWithGemini,

  // 文件上传
  uploadFile,
  validateImageFile,

  // Channel 管理
  createChannel,
};

export default API;

