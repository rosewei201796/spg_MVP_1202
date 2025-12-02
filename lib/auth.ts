/**
 * 用户认证服务
 * 基于 localStorage 的简单认证系统
 */

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
}

const STORAGE_KEY_USERS = 'spg_users';
const STORAGE_KEY_CURRENT_USER = 'spg_current_user';

/**
 * 简单的密码哈希（仅用于前端演示，生产环境应使用后端）
 */
function hashPassword(password: string): string {
  // 简单的哈希算法（实际生产应使用 bcrypt 等）
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * 生成随机用户名
 */
function generateUsername(): string {
  const adjectives = [
    'Cool', 'Cyber', 'Neon', 'Wild', 'Dream', 'Cosmic', 'Electric',
    'Radical', 'Epic', 'Super', 'Mega', 'Ultra', 'Hyper', 'Neo',
  ];
  const nouns = [
    'Artist', 'Creator', 'Dreamer', 'Builder', 'Maker', 'Visionary',
    'Explorer', 'Designer', 'Innovator', 'Pioneer', 'Rebel', 'Master',
  ];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  
  return `${adj}${noun}${num}`;
}

/**
 * 获取所有用户
 */
function getAllUsers(): User[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const usersJson = localStorage.getItem(STORAGE_KEY_USERS);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (error) {
    console.error('Failed to load users:', error);
    return [];
  }
}

/**
 * 保存用户列表
 */
function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users:', error);
  }
}

/**
 * 获取当前登录用户
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userJson = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Failed to load current user:', error);
    return null;
  }
}

/**
 * 保存当前登录用户
 */
function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  } catch (error) {
    console.error('Failed to save current user:', error);
  }
}

/**
 * 注册新用户
 */
export function register(username: string, password: string): { success: boolean; user?: User; error?: string } {
  if (!username.trim() || !password.trim()) {
    return { success: false, error: 'Username and password are required' };
  }

  if (password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters' };
  }

  const users = getAllUsers();
  
  // 检查用户名是否已存在
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, error: 'Username already exists' };
  }

  // 创建新用户
  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    username: username.trim(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  console.log('✅ User registered:', newUser.username);
  return { success: true, user: newUser };
}

/**
 * 自动注册（分配随机用户名）
 */
export function autoRegister(): { success: boolean; user?: User; username?: string; error?: string } {
  const username = generateUsername();
  const tempPassword = Math.random().toString(36).substr(2, 8); // 临时密码
  
  const result = register(username, tempPassword);
  
  if (result.success) {
    return { 
      success: true, 
      user: result.user,
      username: username 
    };
  }
  
  return result;
}

/**
 * 登录
 */
export function login(username: string, password: string): { success: boolean; user?: User; error?: string } {
  if (!username.trim() || !password.trim()) {
    return { success: false, error: 'Username and password are required' };
  }

  const users = getAllUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const passwordHash = hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return { success: false, error: 'Incorrect password' };
  }

  setCurrentUser(user);
  console.log('✅ User logged in:', user.username);
  return { success: true, user };
}

/**
 * 登出
 */
export function logout(): void {
  setCurrentUser(null);
  console.log('✅ User logged out');
}

/**
 * 更新用户名
 */
export function updateUsername(userId: string, newUsername: string): { success: boolean; error?: string } {
  if (!newUsername.trim()) {
    return { success: false, error: 'Username cannot be empty' };
  }

  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  // 检查新用户名是否已被其他人使用
  if (users.some(u => u.id !== userId && u.username.toLowerCase() === newUsername.toLowerCase())) {
    return { success: false, error: 'Username already taken' };
  }

  users[userIndex].username = newUsername.trim();
  saveUsers(users);

  // 更新当前用户
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    setCurrentUser(users[userIndex]);
  }

  console.log('✅ Username updated:', newUsername);
  return { success: true };
}

/**
 * 更新密码
 */
export function updatePassword(userId: string, oldPassword: string, newPassword: string): { success: boolean; error?: string } {
  if (!oldPassword.trim() || !newPassword.trim()) {
    return { success: false, error: 'Passwords cannot be empty' };
  }

  if (newPassword.length < 4) {
    return { success: false, error: 'New password must be at least 4 characters' };
  }

  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  const oldPasswordHash = hashPassword(oldPassword);
  if (users[userIndex].passwordHash !== oldPasswordHash) {
    return { success: false, error: 'Incorrect current password' };
  }

  users[userIndex].passwordHash = hashPassword(newPassword);
  saveUsers(users);

  console.log('✅ Password updated');
  return { success: true };
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * 获取用户数据存储 key
 */
export function getUserDataKey(userId: string): string {
  return `spg_user_data_${userId}`;
}

