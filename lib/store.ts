import { create } from "zustand";
import {
  Channel,
  Content,
  getRandomThemeKey,
  THEME_LIBRARIES,
  createMockContent,
  INITIAL_CHANNELS,
} from "./mockData";
import { API } from "./api";
import { 
  getCurrentUser, 
  login, 
  register, 
  logout, 
  autoRegister,
  updateUsername as authUpdateUsername,
  updatePassword as authUpdatePassword,
  type User 
} from "./auth";
import { loadUserData, saveUserData, autoSaveUserData } from "./storage";

export type View = "explore" | "create" | "myChannels" | "channelDetail" | "settings";

// 每个 channel 最多保留的内容数量
const MAX_CONTENTS_PER_CHANNEL = 30;

export type RemixMode = "createNew" | "addToExisting";

interface RemixSource {
  content: Content;
  channelName: string;
  isOwnChannel: boolean; // 是否是自己的 channel
  currentChannelId?: string; // 如果是自己的 channel，记录当前 channel ID
}

interface AppState {
  // Authentication
  currentUser: User | null;
  isAuthenticated: boolean;
  authError: string | null;
  handleLogin: (username: string, password: string) => void;
  handleRegister: (username: string, password: string) => void;
  handleAutoRegister: () => void;
  handleLogout: () => void;
  handleUpdateUsername: (newUsername: string) => void;
  handleUpdatePassword: (oldPassword: string, newPassword: string) => void;

  // Navigation
  currentView: View;
  setCurrentView: (view: View) => void;

  // Channels
  channels: Channel[];
  userChannels: Channel[];

  // Explore navigation
  activeChannelIdx: number;
  activeContentIdx: number;
  setActiveChannelIdx: (index: number) => void;
  setActiveContentIdx: (index: number) => void;

  // Detail view navigation
  detailChannelId: string | null;
  detailContentIdx: number;
  setDetailChannel: (channelId: string, contentIdx?: number) => void;
  setDetailContentIdx: (index: number) => void;

  // Remix & Create
  remixSource: RemixSource | null;
  isRemixModalOpen: boolean;
  newChannelPrompt: string;
  isGenerating: boolean;
  loadingText: string;
  remixMode: RemixMode; // 'createNew' or 'addToExisting'
  remixTargetChannelId: string | null; // 当 mode 为 addToExisting 时的目标 channel
  setRemixMode: (mode: RemixMode) => void;
  setRemixTargetChannelId: (channelId: string | null) => void;
  
  // File upload
  referenceImage: string | null;
  uploadProgress: number;
  setReferenceImage: (imageUrl: string | null) => void;
  setUploadProgress: (progress: number | ((prev: number) => number)) => void;

  // Likes
  likedContents: Set<string>; // 存储已点赞的 content IDs
  toggleLike: (contentId: string) => void;
  isContentLiked: (contentId: string) => boolean;

  setRemixSource: (source: RemixSource | null) => void;
  setIsRemixModalOpen: (isOpen: boolean) => void;
  setNewChannelPrompt: (prompt: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setLoadingText: (text: string) => void;

  openRemix: (content: Content, channelName: string, isOwnChannel: boolean, currentChannelId?: string) => void;
  handleCreateChannel: (prompt: string, isRemix?: boolean, sourceChannelName?: string, dropToFeed?: boolean) => Promise<void>;
  handleRemix: () => Promise<void>; // 统一的 remix 处理函数
  handleUploadToChannel: (channelId: string) => void; // 废弃，仅保留兼容性
  addUploadedImageToChannel: (channelId: string, imageUrl: string, prompt?: string) => void; // 新的上传函数
  toggleChannelDropToFeed: (channelId: string) => void;
  
  // Delete actions
  deleteContent: (channelId: string, contentId: string) => void;
  deleteChannel: (channelId: string) => void;

  // Helpers
  getCurrentChannel: () => Channel | null;
  getCurrentContent: () => Content | null;
  getDetailChannel: () => Channel | null;
  getDetailContent: () => Content | null;
}

export const useAppStore = create<AppState>((set, get) => {
  // 初始化时加载用户数据
  const currentUser = getCurrentUser();
  const userData = currentUser ? loadUserData(currentUser.id) : null;
  
  return {
    // Authentication state
    currentUser: currentUser,
    isAuthenticated: !!currentUser,
    authError: null,

    // Initial state
    currentView: "explore",
    channels: INITIAL_CHANNELS, // 预置的公共 channels
    userChannels: userData?.channels || [], // 用户自己的 channels

    activeChannelIdx: 0,
    activeContentIdx: 0,

    detailChannelId: null,
    detailContentIdx: 0,

    remixSource: null,
    isRemixModalOpen: false,
    newChannelPrompt: "",
    isGenerating: false,
    loadingText: "",
    remixMode: "createNew", // 默认创建新 channel
    remixTargetChannelId: null,
    referenceImage: null,
    uploadProgress: 0,
    likedContents: new Set<string>(userData?.likedContents || []),

  // Authentication Actions
  handleLogin: (username, password) => {
    const result = login(username, password);
    if (result.success && result.user) {
      const userData = loadUserData(result.user.id);
      set({
        currentUser: result.user,
        isAuthenticated: true,
        authError: null,
        userChannels: userData?.channels || [],
        likedContents: new Set(userData?.likedContents || []),
      });
    } else {
      set({ authError: result.error || 'Login failed' });
    }
  },

  handleRegister: (username, password) => {
    const result = register(username, password);
    if (result.success && result.user) {
      set({
        currentUser: result.user,
        isAuthenticated: true,
        authError: null,
        userChannels: [],
        likedContents: new Set(),
      });
    } else {
      set({ authError: result.error || 'Registration failed' });
    }
  },

  handleAutoRegister: () => {
    const result = autoRegister();
    if (result.success && result.user) {
      set({
        currentUser: result.user,
        isAuthenticated: true,
        authError: null,
        userChannels: [],
        likedContents: new Set(),
      });
      alert(`Welcome! Your username is: ${result.username}\n\nYou can change it in Settings.`);
    } else {
      set({ authError: result.error || 'Auto registration failed' });
    }
  },

  handleLogout: () => {
    const state = get();
    // 保存用户数据
    if (state.currentUser) {
      autoSaveUserData(
        state.currentUser.id,
        state.userChannels,
        Array.from(state.likedContents)
      );
    }
    
    logout();
    set({
      currentUser: null,
      isAuthenticated: false,
      userChannels: [],
      likedContents: new Set(),
      currentView: 'explore',
    });
  },

  handleUpdateUsername: (newUsername) => {
    const state = get();
    if (!state.currentUser) return;

    const result = authUpdateUsername(state.currentUser.id, newUsername);
    if (result.success) {
      set({
        currentUser: { ...state.currentUser, username: newUsername },
      });
    } else {
      alert(result.error || 'Failed to update username');
    }
  },

  handleUpdatePassword: (oldPassword, newPassword) => {
    const state = get();
    if (!state.currentUser) return;

    const result = authUpdatePassword(state.currentUser.id, oldPassword, newPassword);
    if (result.success) {
      alert('Password updated successfully!');
    } else {
      alert(result.error || 'Failed to update password');
    }
  },

  // Actions
  setCurrentView: (view) => set({ currentView: view }),

  setActiveChannelIdx: (index) =>
    set({ activeChannelIdx: index, activeContentIdx: 0 }),

  setActiveContentIdx: (index) => set({ activeContentIdx: index }),

  setDetailChannel: (channelId, contentIdx = 0) =>
    set({
      detailChannelId: channelId,
      detailContentIdx: contentIdx,
      currentView: "channelDetail",
    }),

  setDetailContentIdx: (index) => set({ detailContentIdx: index }),

  setRemixSource: (source) => set({ remixSource: source }),
  setIsRemixModalOpen: (isOpen) => set({ isRemixModalOpen: isOpen }),
  setNewChannelPrompt: (prompt) => set({ newChannelPrompt: prompt }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setLoadingText: (text) => set({ loadingText: text }),
  setReferenceImage: (imageUrl) => set({ referenceImage: imageUrl }),
  setUploadProgress: (progress) =>
    set((state) => ({
      uploadProgress: typeof progress === "function" ? progress(state.uploadProgress) : progress,
    })),

  // Like actions
  toggleLike: (contentId) =>
    set((state) => {
      const newLikedContents = new Set(state.likedContents);
      const isLiked = newLikedContents.has(contentId);
      
      if (isLiked) {
        newLikedContents.delete(contentId);
      } else {
        newLikedContents.add(contentId);
      }

      // 更新 content 的 likes 数量
      const updatedChannels = state.channels.map((channel) => ({
        ...channel,
        contents: channel.contents.map((content) => {
          if (content.id === contentId) {
            return {
              ...content,
              likes: isLiked ? content.likes - 1 : content.likes + 1,
            };
          }
          return content;
        }),
      }));

      // 自动保存用户数据
      if (state.currentUser) {
        autoSaveUserData(
          state.currentUser.id,
          state.userChannels,
          Array.from(newLikedContents)
        );
      }

      return {
        likedContents: newLikedContents,
        channels: updatedChannels,
      };
    }),

  isContentLiked: (contentId) => get().likedContents.has(contentId),

  setRemixMode: (mode) => set({ remixMode: mode }),
  
  setRemixTargetChannelId: (channelId) => set({ remixTargetChannelId: channelId }),

  openRemix: (content, channelName, isOwnChannel, currentChannelId) => {
    // 根据上下文设置默认的 remix 模式
    const defaultMode: RemixMode = isOwnChannel ? "addToExisting" : "createNew";
    const defaultTargetId = isOwnChannel ? currentChannelId || null : null;
    
    set({
      remixSource: { 
        content, 
        channelName, 
        isOwnChannel,
        currentChannelId 
      },
      newChannelPrompt: content.prompt,
      isRemixModalOpen: true,
      remixMode: defaultMode,
      remixTargetChannelId: defaultTargetId,
      referenceImage: content.src, // 使用原图作为参考
    });
  },

  handleCreateChannel: async (prompt, isRemix = false, sourceChannelName = "", dropToFeed = true) => {
    set({
      isGenerating: true,
      loadingText: isRemix ? "Remixing Concept..." : "Dreaming up a new world...",
    });

    try {
      // 使用 API 生成（会自动根据配置使用真实 API 或 mock）
      await new Promise((resolve) => setTimeout(resolve, 500));
      set({ loadingText: "Generating Images..." });

      const channelName = isRemix
        ? `${sourceChannelName} (Remix)`
        : prompt.split(" ").slice(0, 3).join(" ") || "Untitled World";

      const randomThemeKey = getRandomThemeKey();

      // 调用 API 创建 Channel
      const state = get();
      const result = await API.createChannel({
        name: channelName,
        prompt,
        theme: randomThemeKey,
        referenceImage: state.referenceImage || undefined,
      });

      if (!result.success || !result.channel) {
        throw new Error(result.error || "Failed to create channel");
      }

      // 转换 API 响应为 Channel 格式
      const newChannel: Channel = {
        id: result.channel.id,
        name: result.channel.name,
        owner: result.channel.owner,
        theme: result.channel.theme,
        createdAt: new Date().toISOString(),
        contents: result.channel.contents.map((c) => ({
          ...c,
          channelId: result.channel!.id,
          type: "image" as const,
          likes: Math.floor(Math.random() * 1000) + 100,
        })),
        isUserGenerated: true,
        dropToFeed: dropToFeed,
      };

      set((state) => {
        const updatedUserChannels = [newChannel, ...state.userChannels];
        
        // 自动保存用户数据
        if (state.currentUser) {
          autoSaveUserData(
            state.currentUser.id,
            updatedUserChannels,
            Array.from(state.likedContents)
          );
        }
        
        return {
          // 只有当 dropToFeed 为 true 时才添加到首页 feed 流
          channels: dropToFeed ? [newChannel, ...state.channels] : state.channels,
          userChannels: updatedUserChannels,
          isGenerating: false,
          newChannelPrompt: "",
          isRemixModalOpen: false,
          currentView: "myChannels",
          referenceImage: null, // 清除上传的图片
          uploadProgress: 0,
        };
      });
    } catch (error) {
      console.error("Failed to create channel:", error);
      
      // 显示错误并重置状态
      set({
        isGenerating: false,
        loadingText: "",
        newChannelPrompt: "",
        isRemixModalOpen: false,
      });
      
      // 向用户显示错误信息
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to create channel: ${errorMessage}\n\nPlease check:\n1. API keys are configured correctly\n2. Network connection is stable\n3. API service is available`);
    }
  },

  handleRemix: async () => {
    const state = get();
    const { remixMode, remixTargetChannelId, newChannelPrompt, referenceImage, remixSource } = state;

    if (!remixSource) return;

    if (remixMode === "createNew") {
      // 创建新 channel（生成 6-8 张冷启图）
      await get().handleCreateChannel(
        newChannelPrompt,
        true, // isRemix
        remixSource.channelName,
        true // dropToFeed
      );
    } else if (remixMode === "addToExisting" && remixTargetChannelId) {
      // 添加到现有 channel（生成 3 张 remix 图）
      set({
        isGenerating: true,
        loadingText: "Creating remix...",
      });

      try {
        // 生成 3 张 remix 图
        const geminiResult = await API.generateImagePromptsWithGemini({
          userPrompt: newChannelPrompt,
          referenceImage: referenceImage || undefined,
          numPrompts: 3, // 生成 3 个 prompts
        });

        if (!geminiResult.success || !geminiResult.prompts || geminiResult.prompts.length === 0) {
          throw new Error('Failed to generate prompts');
        }

        const newContents: Content[] = [];
        
        // 为每个 prompt 生成图片
        for (let i = 0; i < geminiResult.prompts.length; i++) {
          const promptText = geminiResult.prompts[i];
          
          const result = await API.generateImages({
            prompt: promptText,
            referenceImage: referenceImage || undefined,
            numImages: 1,
          });

          if (result.success && result.images.length > 0) {
            newContents.push({
              id: `content_${remixTargetChannelId}_${Date.now()}_${i}`,
              channelId: remixTargetChannelId,
              type: "image",
              src: result.images[0],
              prompt: promptText,
              createdAt: new Date().toISOString(),
              likes: Math.floor(Math.random() * 100) + 10,
            });
          }
        }

        if (newContents.length === 0) {
          throw new Error('Failed to generate any images');
        }

        // 将新内容添加到目标 channel，限制总数量
        set((state) => {
          const updatedChannels = state.channels.map((channel) => {
            if (channel.id === remixTargetChannelId) {
              const allContents = [...newContents, ...channel.contents];
              
              // 如果超过最大数量，删除最旧的内容
              if (allContents.length > MAX_CONTENTS_PER_CHANNEL) {
                const removed = allContents.length - MAX_CONTENTS_PER_CHANNEL;
                console.log(`🧹 Channel "${channel.name}": Removed ${removed} old images to stay within limit (${MAX_CONTENTS_PER_CHANNEL})`);
                return {
                  ...channel,
                  contents: allContents.slice(0, MAX_CONTENTS_PER_CHANNEL),
                };
              }
              
              return {
                ...channel,
                contents: allContents,
              };
            }
            return channel;
          });

          const updatedUserChannels = state.userChannels.map((channel) => {
            if (channel.id === remixTargetChannelId) {
              const allContents = [...newContents, ...channel.contents];
              
              // 如果超过最大数量，删除最旧的内容
              if (allContents.length > MAX_CONTENTS_PER_CHANNEL) {
                return {
                  ...channel,
                  contents: allContents.slice(0, MAX_CONTENTS_PER_CHANNEL),
                };
              }
              
              return {
                ...channel,
                contents: allContents,
              };
            }
            return channel;
          });

          // 自动保存用户数据
          if (state.currentUser) {
            autoSaveUserData(
              state.currentUser.id,
              updatedUserChannels,
              Array.from(state.likedContents)
            );
          }

          return {
            channels: updatedChannels,
            userChannels: updatedUserChannels,
            isGenerating: false,
            newChannelPrompt: "",
            isRemixModalOpen: false,
            referenceImage: null,
            uploadProgress: 0,
          };
        });

        console.log(`✅ Added ${newContents.length} remix images to channel`);
      } catch (error) {
        console.error("Failed to add remix content:", error);
        
        set({
          isGenerating: false,
          loadingText: "",
        });
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to create remix: ${errorMessage}`);
      }
    }
  },

  handleUploadToChannel: (channelId) => {
    // 废弃函数，保留仅为兼容性
    console.log('handleUploadToChannel is deprecated, use addUploadedImageToChannel instead');
  },

  addUploadedImageToChannel: (channelId, imageUrl, prompt = "Uploaded Image") => {
    set((state) => {
      // 创建新的 content
      const newContent: Content = {
        id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channelId: channelId,
        type: "image",
        src: imageUrl,
        prompt: prompt,
        createdAt: new Date().toISOString(),
        likes: 0,
      };

      // 更新 userChannels，限制内容数量
      const updatedUserChannels = state.userChannels.map((channel) => {
        if (channel.id === channelId) {
          const newContents = [newContent, ...channel.contents];
          
          // 如果超过最大数量，删除最旧的内容
          if (newContents.length > MAX_CONTENTS_PER_CHANNEL) {
            const removed = newContents.length - MAX_CONTENTS_PER_CHANNEL;
            console.log(`🧹 Channel "${channel.name}": Removed ${removed} old images to stay within limit (${MAX_CONTENTS_PER_CHANNEL})`);
            return {
              ...channel,
              contents: newContents.slice(0, MAX_CONTENTS_PER_CHANNEL),
            };
          }
          
          return {
            ...channel,
            contents: newContents,
          };
        }
        return channel;
      });

      // 更新 channels (feed流)
      const updatedChannels = state.channels.map((channel) => {
        if (channel.id === channelId) {
          const newContents = [newContent, ...channel.contents];
          
          // 如果超过最大数量，删除最旧的内容
          if (newContents.length > MAX_CONTENTS_PER_CHANNEL) {
            return {
              ...channel,
              contents: newContents.slice(0, MAX_CONTENTS_PER_CHANNEL),
            };
          }
          
          return {
            ...channel,
            contents: newContents,
          };
        }
        return channel;
      });

      // 自动保存用户数据
      if (state.currentUser) {
        autoSaveUserData(
          state.currentUser.id,
          updatedUserChannels,
          Array.from(state.likedContents)
        );
      }

      return {
        channels: updatedChannels,
        userChannels: updatedUserChannels,
      };
    });
  },

  toggleChannelDropToFeed: (channelId) => {
    set((state) => {
      const channel = state.userChannels.find((c) => c.id === channelId);
      if (!channel) return state;

      const newDropToFeed = !channel.dropToFeed;

      // 更新 userChannels 中的 channel
      const updatedUserChannels = state.userChannels.map((c) =>
        c.id === channelId ? { ...c, dropToFeed: newDropToFeed } : c
      );

      // 更新 channels (feed流)
      let updatedChannels = [...state.channels];
      
      if (newDropToFeed) {
        // 如果切换为开启，检查是否已在 feed 中，如果不在则添加
        const isInFeed = updatedChannels.some((c) => c.id === channelId);
        if (!isInFeed) {
          const updatedChannel = updatedUserChannels.find((c) => c.id === channelId);
          if (updatedChannel) {
            updatedChannels = [updatedChannel, ...updatedChannels];
          }
        } else {
          // 如果已在 feed 中，更新其 dropToFeed 状态
          updatedChannels = updatedChannels.map((c) =>
            c.id === channelId ? { ...c, dropToFeed: newDropToFeed } : c
          );
        }
      } else {
        // 如果切换为关闭，从 feed 中移除
        updatedChannels = updatedChannels.filter((c) => c.id !== channelId);
      }

      return {
        channels: updatedChannels,
        userChannels: updatedUserChannels,
      };
    });
  },

  // Delete actions
  deleteContent: (channelId, contentId) => {
    set((state) => {
      // 从 userChannels 中删除 content
      const updatedUserChannels = state.userChannels.map((channel) => {
        if (channel.id === channelId) {
          return {
            ...channel,
            contents: channel.contents.filter((content) => content.id !== contentId),
          };
        }
        return channel;
      });

      // 从 channels (feed流) 中删除 content
      const updatedChannels = state.channels.map((channel) => {
        if (channel.id === channelId) {
          return {
            ...channel,
            contents: channel.contents.filter((content) => content.id !== contentId),
          };
        }
        return channel;
      });

      // 自动保存用户数据
      if (state.currentUser) {
        autoSaveUserData(
          state.currentUser.id,
          updatedUserChannels,
          Array.from(state.likedContents)
        );
      }

      // 如果删除的是当前正在查看的 content，返回到该 channel 的第一个 content
      const newState: Partial<AppState> = {
        channels: updatedChannels,
        userChannels: updatedUserChannels,
      };

      if (state.detailChannelId === channelId) {
        const updatedChannel = updatedUserChannels.find((c) => c.id === channelId);
        if (updatedChannel && updatedChannel.contents.length === 0) {
          // 如果 channel 没有内容了，返回到 profile 页面
          newState.currentView = 'myChannels';
          newState.detailChannelId = null;
        } else if (state.getDetailContent()?.id === contentId) {
          // 如果删除的是当前查看的内容，切换到第一个内容
          newState.detailContentIdx = 0;
        }
      }

      return newState;
    });
  },

  deleteChannel: (channelId) => {
    set((state) => {
      // 只能删除用户自己创建的 channel
      const channel = state.userChannels.find((c) => c.id === channelId);
      if (!channel) return state;

      // 从 userChannels 中删除
      const updatedUserChannels = state.userChannels.filter((c) => c.id !== channelId);

      // 从 channels (feed流) 中删除
      const updatedChannels = state.channels.filter((c) => c.id !== channelId);

      // 自动保存用户数据
      if (state.currentUser) {
        autoSaveUserData(
          state.currentUser.id,
          updatedUserChannels,
          Array.from(state.likedContents)
        );
      }

      // 如果删除的是当前正在查看的 channel，返回到 profile 页面
      const newState: Partial<AppState> = {
        channels: updatedChannels,
        userChannels: updatedUserChannels,
      };

      if (state.detailChannelId === channelId) {
        newState.currentView = 'myChannels';
        newState.detailChannelId = null;
        newState.detailContentIdx = 0;
      }

      return newState;
    });
  },

  // Helpers
  getCurrentChannel: () => {
    const state = get();
    return state.channels[state.activeChannelIdx] || null;
  },

  getCurrentContent: () => {
    const state = get();
    const channel = state.getCurrentChannel();
    if (!channel) return null;
    return channel.contents[state.activeContentIdx] || null;
  },

  getDetailChannel: () => {
    const state = get();
    if (!state.detailChannelId) return null;
    // 优先从 userChannels 中查找，以确保获取最新的 dropToFeed 状态
    const userChannel = state.userChannels.find((c) => c.id === state.detailChannelId);
    if (userChannel) return userChannel;
    return state.channels.find((c) => c.id === state.detailChannelId) || null;
  },

  getDetailContent: () => {
    const state = get();
    const channel = state.getDetailChannel();
    if (!channel) return null;
    return channel.contents[state.detailContentIdx] || null;
  },
};
});
