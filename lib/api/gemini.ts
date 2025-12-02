/**
 * Gemini AI 服务 - 用于生成多样化的图片提示词
 */

import { API_CONFIG } from './config';

/**
 * System prompt for Gemini 3 to generate diverse image-generation prompts
 * for a new Channel's cold start.
 */
export const SYSTEM_PROMPT = {
  "role": "system",
  "name": "cold_start_image_prompt_generator",
  "description": "A system prompt that generates diverse yet stylistically consistent image-generation prompts for a new Channel's cold start.",
  "objectives": [
    "Use ONLY user input prompt + uploaded theme images.",
    "Generate the first batch of image-generation prompts for a new Channel.",
    "Establish a coherent but diverse visual identity.",
    "You could reference on pre-defined style libraries. Do not limit to the style from user images.",
    "CRITICAL: If the uploaded image contains a character/person/IP, ALL generated prompts MUST maintain consistency with that character's identity, appearance, or have a realistic connection to them.",
    "CRITICAL: If user prompt mentions specific characters/persons/IPs, ALL generated prompts MUST center around these subjects."
  ],
  "tasks": {
    "1_extract_core_fields": {
      "description": "Automatically extract abstracted fields from user prompt + images.",
      "fields": {
        "X_core_theme": "Identify WHO/WHAT the channel is about. PRIORITY: If image contains a character/person/IP, describe their key visual features (appearance, clothing, distinctive traits). If user prompt mentions specific subjects, prioritize those. (Main subject, IP identity, visual motifs, worldbuilding hints.)",
        "Y_style_baseline": "Infer global style baseline from uploaded images. (Color palette, era, texture, lighting pattern, mood.)",
        "Z_variation_factors": [
          "At least 8 independent factors to create visual diversity.",
          "May include: composition, pose, lighting shifts, scene variation, emotional tone, color extensions, material/texture changes, fashion elements, surreal extensions."
        ]
      }
    },
    "2_weight_model": {
      "description": "Generate weights that guide prompt diversity.",
      "note": "Weights are used internally by the model. Do not show them to user unless asked.",
      "weights": {
        "composition": {
          "close_up": 0.2,
          "half_body": 0.4,
          "full_body": 0.4
        },
        "lighting": {
          "base_palette_extension": 0.4,
          "high_contrast": 0.3,
          "dramatic_spotlight": 0.2,
          "soft_diffuse": 0.1
        },
        "scene": {
          "primary_theme_scene": 0.6,
          "worldview_extension": 0.4
        },
        "emotion": {
          "user_prompt_primary_mood": 0.7,
          "contrastive_mood": 0.3
        },
        "texture_detail": {
          "high_detail_photographic": 0.7,
          "light_illustrative_touch": 0.2,
          "mild_surreal": 0.1
        }
      }
    },
    "3_prompt_template": {
      "description": "Template used to generate each final image prompt.",
      "template_string": "{X main subject}, in {scene derived from weight distribution}, rendered in {Y style baseline}, with variation: {Z_i}, featuring: high detail, defined lighting structure, clear composition, photographic lens language, suitable for high-quality image generation."
    },
    "4_output_requirements": {
      "format": "Model MUST output in the following structured format:",
      "schema": {
        "Cold Start Analysis": {
          "X_core_theme": "string",
          "Y_style_baseline": "string",
          "Z_variation_factors": ["string"]
        },
        "Weight Plan": {
          "composition": {
            "close_up": "float",
            "half_body": "float",
            "full_body": "float"
          },
          "lighting": {
            "base_palette_extension": "float",
            "high_contrast": "float",
            "dramatic_spotlight": "float",
            "soft_diffuse": "float"
          },
          "scene": {
            "primary_theme_scene": "float",
            "worldview_extension": "float"
          },
          "emotion": {
            "user_prompt_primary_mood": "float",
            "contrastive_mood": "float"
          },
          "texture_detail": {
            "high_detail_photographic": "float",
            "light_illustrative_touch": "float",
            "mild_surreal": "float"
          }
        },
        "Image Prompts": ["string"]
      }
    }
  },
  "generation_rules": [
    "All final outputs must be images only.",
    "All prompts must share the same X and Y.",
    "Each prompt must use a different Z_i.",
    "Ensure strong visual consistency across prompts.",
    "Ensure enough variety to fill the Channel's first feed.",
    "Suggested number of prompts: 8–12.",
    "CHARACTER CONSISTENCY RULE: If uploaded image shows a character/person/IP, every generated prompt MUST feature the SAME character with consistent appearance (face, body type, distinctive features, signature clothing/accessories).",
    "CHARACTER CONSISTENCY RULE: If user prompt specifies a character/person/IP name, every generated prompt MUST revolve around that specific subject.",
    "VARIATION SCOPE: Vary only the scene, pose, angle, lighting, emotion, and background - NEVER change the core character identity or their defining visual traits."
  ]
};

export interface GeminiPromptRequest {
  userPrompt: string;
  referenceImage?: string; // Base64 or URL (可选)
  numPrompts?: number; // 生成多少个prompts，默认8-12
}

export interface GeminiPromptResponse {
  success: boolean;
  analysis?: {
    X_core_theme: string;
    Y_style_baseline: string;
    Z_variation_factors: string[];
  };
  weightPlan?: any;
  prompts?: string[];
  error?: string;
}

/**
 * 调用 Gemini API 生成多样化的图片提示词
 * 使用 OpenAI 兼容接口调用 vertex_ai/gemini-3-pro-preview
 */
export async function generateImagePromptsWithGemini(
  request: GeminiPromptRequest
): Promise<GeminiPromptResponse> {
  try {
    const apiKey = API_CONFIG.gemini.apiKey;
    const baseUrl = API_CONFIG.gemini.baseUrl;
    const model = API_CONFIG.gemini.promptModel;
    
    if (!apiKey) {
      console.warn('⚠️ Gemini API key not configured, using fallback');
      return generateFallbackPrompts(request);
    }

    console.log(`🧠 Using model: ${model} for prompt generation`);

    // 简化 system prompt，避免过于复杂导致模型只推理不输出
    const simpleSystemPrompt = `You are an expert at generating diverse image-generation prompts for AI image generation.

Your task: Generate ${request.numPrompts || 8} different image prompts based on the user's input.

Requirements:
- All prompts should share the same core subject/theme
- Each prompt should have different: composition, lighting, angle, mood, or scene
- Output ONLY a JSON array of strings
- Each string should be a detailed, complete image generation prompt

Output format (MUST be valid JSON):
{
  "prompts": [
    "detailed prompt 1...",
    "detailed prompt 2...",
    ...
  ]
}`;
    
    let userMessage = `User's idea: "${request.userPrompt}"`;
    
    if (request.referenceImage) {
      userMessage += `\n\nThe user has uploaded a reference image. Please analyze its style and generate prompts that match this style.`;
    }
    
    userMessage += `\n\nGenerate ${request.numPrompts || 8} diverse image prompts. Output as JSON with "prompts" array.`;

    // 构建消息内容 - 支持图片输入
    const userContent: any = request.referenceImage 
      ? [
          { type: 'text', text: userMessage },
          { 
            type: 'image_url', 
            image_url: { 
              url: request.referenceImage,
              detail: 'high'
            } 
          }
        ]
      : userMessage;
    
    console.log('📤 Sending request with simplified prompt...');

    // 使用 OpenAI 兼容接口调用 vertex_ai Gemini 模型
    const response = await fetch(
      `${baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: simpleSystemPrompt
            },
            {
              role: 'user',
              content: userContent
            }
          ],
          temperature: 0.8,
          max_tokens: 4096,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API returned error:', error);
      throw new Error(error.error?.message || `API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 Full API response:', JSON.stringify(data, null, 2));
    
    const generatedText = data.choices?.[0]?.message?.content || '';
    
    if (!generatedText) {
      console.error('❌ No content in response. Full data:', data);
      throw new Error('API returned empty content. Check model compatibility and request format.');
    }

    console.log('📝 Gemini response received, length:', generatedText.length);

    // 解析 Gemini 的响应
    const parsed = parseGeminiResponse(generatedText);
    
    if (!parsed.prompts || parsed.prompts.length === 0) {
      console.error('❌ Failed to extract prompts from response');
      throw new Error('Could not extract prompts from Gemini response');
    }

    return {
      success: true,
      ...parsed,
    };
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    // 如果失败，使用fallback
    return generateFallbackPrompts(request);
  }
}

/**
 * 解析 Gemini 的 JSON 响应
 */
function parseGeminiResponse(text: string): Partial<GeminiPromptResponse> {
  try {
    console.log('🔍 Raw Gemini response:', text.substring(0, 200) + '...');
    
    // 方法1: 尝试提取 JSON 代码块（使用更宽松的匹配）
    const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                          text.match(/```\s*([\s\S]*?)\s*```/);
    
    if (jsonBlockMatch) {
      const parsed = JSON.parse(jsonBlockMatch[1]);
      return {
        analysis: parsed['Cold Start Analysis'] || parsed['analysis'],
        weightPlan: parsed['Weight Plan'] || parsed['weightPlan'],
        prompts: parsed['Image Prompts'] || parsed['prompts'] || parsed['imagePrompts'],
      };
    }

    // 方法2: 尝试直接解析 JSON（查找最外层的大括号）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      // 清理可能的格式问题
      let jsonStr = jsonMatch[0];
      // 移除注释
      jsonStr = jsonStr.replace(/\/\*[\s\S]*?\*\//g, '');
      jsonStr = jsonStr.replace(/\/\/.*/g, '');
      
      const parsed = JSON.parse(jsonStr);
      return {
        analysis: parsed['Cold Start Analysis'] || parsed['analysis'],
        weightPlan: parsed['Weight Plan'] || parsed['weightPlan'],
        prompts: parsed['Image Prompts'] || parsed['prompts'] || parsed['imagePrompts'],
      };
    }

    // 方法3: 如果以上都失败，尝试提取带引号的长字符串作为 prompts
    const promptMatches = text.match(/"([^"]{30,})"/g);
    if (promptMatches && promptMatches.length > 0) {
      console.log(`📝 Extracted ${promptMatches.length} prompts from plain text`);
      return {
        prompts: promptMatches.map(p => p.replace(/"/g, '').trim()).filter(p => p.length > 20),
      };
    }

    throw new Error('Could not parse Gemini response - no valid JSON or prompts found');
  } catch (error) {
    console.error('❌ Failed to parse Gemini response:', error);
    console.error('Response text:', text);
    return {};
  }
}

/**
 * Fallback: 当 Gemini 不可用时，基于用户prompt生成简单的变化
 */
function generateFallbackPrompts(request: GeminiPromptRequest): GeminiPromptResponse {
  const basePrompt = request.userPrompt;
  const numPrompts = request.numPrompts || 8;

  // 不同的变化因子
  const variations = [
    'close-up portrait, dramatic lighting',
    'full body shot, natural outdoor setting',
    'half body view, studio lighting, professional photography',
    'dynamic action pose, motion blur effect',
    'serene mood, soft diffused lighting',
    'high contrast, cinematic composition',
    'aerial view, wide angle perspective',
    'detailed texture, macro photography style',
    'dramatic shadows, film noir aesthetic',
    'vibrant colors, sunset golden hour',
    'minimalist composition, clean background',
    'environmental portrait, contextual background',
  ];

  const prompts = variations.slice(0, numPrompts).map(variation => {
    return `${basePrompt}, ${variation}, high detail, photographic quality`;
  });

  return {
    success: true,
    analysis: {
      X_core_theme: basePrompt,
      Y_style_baseline: 'Photographic, high detail, professional quality',
      Z_variation_factors: variations.slice(0, numPrompts),
    },
    prompts,
  };
}

/**
 * 生成爆款 Channel 名字
 * 根据用户的 prompt 智能生成一个吸引人的 channel 名字
 */
export async function generateChannelName(
  userPrompt: string,
  referenceImage?: string
): Promise<{ success: boolean; name: string; error?: string }> {
  console.log('🏷️ [Channel Name] Generating from prompt:', userPrompt.substring(0, 60));

  // 使用智能算法生成名字
  const name = generateSmartChannelName(userPrompt);
  
  console.log('✅ [Channel Name] Generated:', name);
  return { success: true, name };
}

/**
 * 智能生成 Channel 名字算法
 * 提取关键词并组合成吸引人的标题
 */
function generateSmartChannelName(prompt: string): string {
  // 常见停用词
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'must', 'can', 'that', 'this', 'these', 'those',
  ]);

  // 分词并清理
  const words = prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // 移除标点
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  // 如果没有有效词，返回默认名字
  if (words.length === 0) {
    return 'My Channel';
  }

  // 选取最重要的3-4个词
  const selectedWords = words.slice(0, Math.min(4, words.length));

  // 转换为 Title Case
  const titleCase = selectedWords
    .map(word => {
      // 特殊缩写保持大写
      if (['ai', 'vr', 'ar', '3d', '2d', 'nft'].includes(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');

  // 确保名字不会太长
  if (titleCase.length > 30) {
    const shorterWords = selectedWords.slice(0, 3);
    return shorterWords
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return titleCase;
}

