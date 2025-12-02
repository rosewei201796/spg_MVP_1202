/**
 * Worldchat - 实时聊天系统（本地存储版本）
 * 用于公共 channel 的实时聊天
 */

export interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  createdAt: string;
}

const CHAT_STORAGE_PREFIX = 'spg_chat_';
const MAX_MESSAGES_PER_CHANNEL = 50;
const MESSAGE_EXPIRY_HOURS = 24;
const MESSAGE_DISPLAY_DURATION = 5000; // 5 秒

/**
 * 获取 channel 的聊天记录存储 key
 */
function getChatStorageKey(channelId: string): string {
  return `${CHAT_STORAGE_PREFIX}${channelId}`;
}

/**
 * 获取 channel 的所有消息
 */
export function getChannelMessages(channelId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];

  try {
    const key = getChatStorageKey(channelId);
    const data = localStorage.getItem(key);
    
    if (!data) return [];

    const messages: ChatMessage[] = JSON.parse(data);
    
    // 过滤掉过期的消息（超过 24 小时）
    const now = Date.now();
    const expiryTime = MESSAGE_EXPIRY_HOURS * 60 * 60 * 1000;
    const validMessages = messages.filter(
      msg => now - msg.timestamp < expiryTime
    );

    // 如果有消息被过滤掉，更新存储
    if (validMessages.length < messages.length) {
      saveChannelMessages(channelId, validMessages);
    }

    return validMessages;
  } catch (error) {
    console.error('Failed to load chat messages:', error);
    return [];
  }
}

/**
 * 保存 channel 的消息
 */
function saveChannelMessages(channelId: string, messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getChatStorageKey(channelId);
    
    // 只保留最新的 N 条消息
    const limitedMessages = messages.slice(-MAX_MESSAGES_PER_CHANNEL);
    
    localStorage.setItem(key, JSON.stringify(limitedMessages));
  } catch (error) {
    console.error('Failed to save chat messages:', error);
    
    // 如果存储失败（配额满），尝试只保留最近 20 条
    try {
      const key = getChatStorageKey(channelId);
      const reducedMessages = messages.slice(-20);
      localStorage.setItem(key, JSON.stringify(reducedMessages));
    } catch (retryError) {
      console.error('Failed to save even reduced messages:', retryError);
    }
  }
}

/**
 * 发送消息
 */
export function sendMessage(
  channelId: string,
  userId: string,
  username: string,
  content: string
): ChatMessage | null {
  if (typeof window === 'undefined') return null;

  // 验证消息内容
  const trimmedContent = content.trim();
  if (!trimmedContent || trimmedContent.length === 0) {
    return null;
  }

  if (trimmedContent.length > 200) {
    alert('Message too long (max 200 characters)');
    return null;
  }

  try {
    // 创建消息
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      channelId,
      userId,
      username,
      content: trimmedContent,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
    };

    // 获取现有消息
    const messages = getChannelMessages(channelId);

    // 添加新消息
    messages.push(message);

    // 保存
    saveChannelMessages(channelId, messages);

    // 通知其他标签页
    broadcastMessage(message);

    console.log(`💬 Message sent to channel ${channelId}:`, message.content);

    return message;
  } catch (error) {
    console.error('Failed to send message:', error);
    return null;
  }
}

/**
 * 获取最近的消息（用于显示）
 */
export function getRecentMessages(channelId: string, limit: number = 10): ChatMessage[] {
  const messages = getChannelMessages(channelId);
  return messages.slice(-limit);
}

/**
 * 清理过期消息
 */
export function cleanupExpiredMessages(channelId: string): void {
  const messages = getChannelMessages(channelId);
  const now = Date.now();
  const expiryTime = MESSAGE_EXPIRY_HOURS * 60 * 60 * 1000;
  
  const validMessages = messages.filter(
    msg => now - msg.timestamp < expiryTime
  );

  if (validMessages.length < messages.length) {
    saveChannelMessages(channelId, validMessages);
    console.log(`🧹 Cleaned up ${messages.length - validMessages.length} expired messages from channel ${channelId}`);
  }
}

/**
 * 清理所有 channel 的过期消息
 */
export function cleanupAllExpiredMessages(): void {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(CHAT_STORAGE_PREFIX)
    );

    keys.forEach(key => {
      const channelId = key.replace(CHAT_STORAGE_PREFIX, '');
      cleanupExpiredMessages(channelId);
    });
  } catch (error) {
    console.error('Failed to cleanup expired messages:', error);
  }
}

// ============================================
// 跨标签页实时同步（使用 BroadcastChannel API）
// ============================================

let broadcastChannel: BroadcastChannel | null = null;

/**
 * 初始化广播频道
 */
export function initBroadcastChannel(onMessage: (message: ChatMessage) => void): void {
  if (typeof window === 'undefined') return;

  try {
    if ('BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('spg_worldchat');
      
      broadcastChannel.onmessage = (event) => {
        const message = event.data as ChatMessage;
        onMessage(message);
      };

      console.log('📡 Broadcast channel initialized');
    } else {
      console.warn('BroadcastChannel API not supported');
    }
  } catch (error) {
    console.error('Failed to initialize broadcast channel:', error);
  }
}

/**
 * 广播消息到其他标签页
 */
function broadcastMessage(message: ChatMessage): void {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(message);
    } catch (error) {
      console.error('Failed to broadcast message:', error);
    }
  }
}

/**
 * 关闭广播频道
 */
export function closeBroadcastChannel(): void {
  if (broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
    console.log('📡 Broadcast channel closed');
  }
}

// ============================================
// 防刷屏机制
// ============================================

const lastMessageTime = new Map<string, number>();
const MIN_MESSAGE_INTERVAL = 1000; // 1 秒

/**
 * 检查用户是否可以发送消息（防刷屏）
 */
export function canSendMessage(userId: string): { canSend: boolean; reason?: string } {
  const now = Date.now();
  const lastTime = lastMessageTime.get(userId) || 0;
  const timeSinceLastMessage = now - lastTime;

  if (timeSinceLastMessage < MIN_MESSAGE_INTERVAL) {
    const waitTime = Math.ceil((MIN_MESSAGE_INTERVAL - timeSinceLastMessage) / 1000);
    return {
      canSend: false,
      reason: `Please wait ${waitTime}s before sending another message`,
    };
  }

  lastMessageTime.set(userId, now);
  return { canSend: true };
}

/**
 * 获取消息显示时长
 */
export function getMessageDisplayDuration(): number {
  return MESSAGE_DISPLAY_DURATION;
}

