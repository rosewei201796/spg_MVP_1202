/**
 * 存储空间监控工具
 * 监控 localStorage 使用情况并提供清理建议
 */

export interface StorageInfo {
  usedKB: number;
  estimatedLimitKB: number;
  usagePercent: number;
  itemCount: number;
  items: Array<{ key: string; sizeKB: number }>;
}

/**
 * 获取 localStorage 使用情况
 */
export function getStorageInfo(): StorageInfo {
  if (typeof window === 'undefined') {
    return {
      usedKB: 0,
      estimatedLimitKB: 5120, // 默认 5MB
      usagePercent: 0,
      itemCount: 0,
      items: [],
    };
  }

  let totalSize = 0;
  const items: Array<{ key: string; sizeKB: number }> = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    const value = localStorage.getItem(key) || '';
    const sizeBytes = new Blob([key, value]).size;
    const sizeKB = sizeBytes / 1024;

    totalSize += sizeBytes;
    items.push({ key, sizeKB });
  }

  // localStorage 限制通常为 5-10MB，这里保守估计 5MB
  const estimatedLimitKB = 5120;
  const usedKB = totalSize / 1024;
  const usagePercent = (usedKB / estimatedLimitKB) * 100;

  return {
    usedKB,
    estimatedLimitKB,
    usagePercent,
    itemCount: localStorage.length,
    items: items.sort((a, b) => b.sizeKB - a.sizeKB), // 按大小降序排列
  };
}

/**
 * 检查存储空间是否即将用完
 */
export function isStorageAlmostFull(threshold: number = 80): boolean {
  const info = getStorageInfo();
  return info.usagePercent >= threshold;
}

/**
 * 获取存储空间警告信息
 */
export function getStorageWarning(): string | null {
  const info = getStorageInfo();
  
  if (info.usagePercent >= 90) {
    return `⚠️ Storage is ${info.usagePercent.toFixed(0)}% full (${info.usedKB.toFixed(0)}KB / ${info.estimatedLimitKB}KB). Please delete some old channels to free up space.`;
  }
  
  if (info.usagePercent >= 80) {
    return `⚠️ Storage is ${info.usagePercent.toFixed(0)}% full (${info.usedKB.toFixed(0)}KB / ${info.estimatedLimitKB}KB). Consider deleting unused content.`;
  }
  
  return null;
}

/**
 * 显示存储空间使用详情
 */
export function logStorageInfo(): void {
  const info = getStorageInfo();
  
  console.group('📊 Storage Information');
  console.log(`Used: ${info.usedKB.toFixed(2)} KB`);
  console.log(`Estimated Limit: ${info.estimatedLimitKB} KB`);
  console.log(`Usage: ${info.usagePercent.toFixed(1)}%`);
  console.log(`Items: ${info.itemCount}`);
  
  if (info.items.length > 0) {
    console.log('\nLargest items:');
    info.items.slice(0, 5).forEach(item => {
      console.log(`  ${item.key}: ${item.sizeKB.toFixed(2)} KB`);
    });
  }
  
  console.groupEnd();
}

/**
 * 尝试清理存储空间
 * 删除最旧的数据
 */
export function tryCleanupStorage(targetFreeSizeKB: number = 1024): boolean {
  if (typeof window === 'undefined') return false;

  const info = getStorageInfo();
  const needToFreeKB = (info.usedKB + targetFreeSizeKB) - info.estimatedLimitKB;

  if (needToFreeKB <= 0) {
    return false; // 不需要清理
  }

  console.log(`🧹 Attempting to free up ${needToFreeKB.toFixed(0)}KB of storage...`);

  // 找出非关键的大文件（排除用户和系统设置）
  const deletableItems = info.items.filter(item => {
    return !item.key.includes('spg_users') && 
           !item.key.includes('spg_current_user') &&
           item.key.includes('spg_user_data');
  });

  let freedKB = 0;
  const deletedKeys: string[] = [];

  for (const item of deletableItems) {
    if (freedKB >= needToFreeKB) break;
    
    localStorage.removeItem(item.key);
    freedKB += item.sizeKB;
    deletedKeys.push(item.key);
  }

  if (deletedKeys.length > 0) {
    console.log(`✅ Freed ${freedKB.toFixed(0)}KB by removing ${deletedKeys.length} items`);
    return true;
  }

  return false;
}

/**
 * 估算数据大小（不保存到 localStorage）
 */
export function estimateDataSize(data: any): number {
  const jsonString = JSON.stringify(data);
  const sizeBytes = new Blob([jsonString]).size;
  return sizeBytes / 1024; // 返回 KB
}

/**
 * 检查是否有足够空间保存数据
 */
export function canSaveData(data: any): { canSave: boolean; reason?: string } {
  const info = getStorageInfo();
  const dataSizeKB = estimateDataSize(data);
  const requiredSpace = info.usedKB + dataSizeKB;

  if (requiredSpace > info.estimatedLimitKB) {
    return {
      canSave: false,
      reason: `Not enough storage space. Need ${dataSizeKB.toFixed(0)}KB, but only ${(info.estimatedLimitKB - info.usedKB).toFixed(0)}KB available.`,
    };
  }

  // 警告阈值：如果保存后会超过 90%
  if ((requiredSpace / info.estimatedLimitKB) > 0.9) {
    return {
      canSave: true,
      reason: `Warning: Storage will be ${((requiredSpace / info.estimatedLimitKB) * 100).toFixed(0)}% full after saving.`,
    };
  }

  return { canSave: true };
}

