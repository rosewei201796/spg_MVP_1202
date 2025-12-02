/**
 * 用户数据持久化服务
 * 保存和加载用户的 channels 和内容
 */

import type { Channel } from './mockData';
import { getUserDataKey } from './auth';
import { getStorageInfo, getStorageWarning, canSaveData } from './storageMonitor';

export interface UserData {
  userId: string;
  channels: Channel[];
  likedContents: string[];
  lastUpdated: string;
}

/**
 * 保存用户数据
 */
export function saveUserData(userId: string, channels: Channel[], likedContents: string[]): void {
  if (typeof window === 'undefined') return;

  try {
    const userData: UserData = {
      userId,
      channels,
      likedContents,
      lastUpdated: new Date().toISOString(),
    };

    // 检查是否有足够空间
    const spaceCheck = canSaveData(userData);
    if (!spaceCheck.canSave) {
      console.error('❌ Cannot save:', spaceCheck.reason);
      throw new Error(spaceCheck.reason);
    }
    
    if (spaceCheck.reason) {
      console.warn('⚠️', spaceCheck.reason);
    }

    const key = getUserDataKey(userId);
    const dataString = JSON.stringify(userData);
    
    // 检查数据大小
    const dataSizeKB = new Blob([dataString]).size / 1024;
    const storageInfo = getStorageInfo();
    console.log(
      `💾 Saving ${dataSizeKB.toFixed(2)} KB for user ${userId} ` +
      `(Storage: ${storageInfo.usagePercent.toFixed(1)}% used)`
    );
    
    localStorage.setItem(key, dataString);
    
    console.log(`✅ Saved ${channels.length} channels for user ${userId}`);
    
    // 检查存储警告
    const warning = getStorageWarning();
    if (warning) {
      console.warn(warning);
    }
  } catch (error) {
    console.error('❌ Failed to save user data:', error);
    
    // 处理存储配额超出错误
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      const channelCount = channels.length;
      const totalContents = channels.reduce((sum, ch) => sum + ch.contents.length, 0);
      const storageInfo = getStorageInfo();
      
      alert(
        `⚠️ STORAGE FULL!\n\n` +
        `Storage Usage: ${storageInfo.usedKB.toFixed(0)}KB / ${storageInfo.estimatedLimitKB}KB (${storageInfo.usagePercent.toFixed(0)}%)\n\n` +
        `You have ${channelCount} channels with ${totalContents} images.\n\n` +
        `To continue using the app, please:\n` +
        `• Delete some old channels\n` +
        `• Delete unused images\n\n` +
        `Your recent changes could not be saved.`
      );
      
      throw error; // 重新抛出，让调用者知道保存失败
    }
    
    throw error;
  }
}

/**
 * 加载用户数据
 */
export function loadUserData(userId: string): UserData | null {
  if (typeof window === 'undefined') return null;

  try {
    const key = getUserDataKey(userId);
    const dataJson = localStorage.getItem(key);
    
    if (!dataJson) {
      console.log('📭 No saved data for user', userId);
      return null;
    }

    const userData: UserData = JSON.parse(dataJson);
    console.log(`📦 Loaded ${userData.channels.length} channels for user ${userId}`);
    
    return userData;
  } catch (error) {
    console.error('Failed to load user data:', error);
    return null;
  }
}

/**
 * 清除用户数据
 */
export function clearUserData(userId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getUserDataKey(userId);
    localStorage.removeItem(key);
    console.log('🗑️ Cleared data for user', userId);
  } catch (error) {
    console.error('Failed to clear user data:', error);
  }
}

/**
 * 自动保存（防抖）
 */
let saveTimeout: NodeJS.Timeout | null = null;

export function autoSaveUserData(userId: string, channels: Channel[], likedContents: string[]): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    saveUserData(userId, channels, likedContents);
  }, 1000); // 1秒后保存
}

