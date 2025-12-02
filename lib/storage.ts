/**
 * 用户数据持久化服务
 * 保存和加载用户的 channels 和内容
 */

import type { Channel } from './mockData';
import { getUserDataKey } from './auth';

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

    const key = getUserDataKey(userId);
    localStorage.setItem(key, JSON.stringify(userData));
    
    console.log(`💾 Saved ${channels.length} channels for user ${userId}`);
  } catch (error) {
    console.error('Failed to save user data:', error);
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

