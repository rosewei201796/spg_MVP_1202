import { create } from "zustand";
import {
  Channel,
  Content,
  getRandomThemeKey,
  THEME_LIBRARIES,
  createMockContent,
} from "./mockData";
import { API } from "./api";

export type View = "explore" | "create" | "myChannels" | "channelDetail";

interface RemixSource {
  content: Content;
  channelName: string;
}

interface AppState {
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

  openRemix: (content: Content, channelName: string) => void;
  handleCreateChannel: (prompt: string, isRemix?: boolean, sourceChannelName?: string, dropToFeed?: boolean) => Promise<void>;
  handleUploadToChannel: (channelId: string) => void;
  toggleChannelDropToFeed: (channelId: string) => void;

  // Helpers
  getCurrentChannel: () => Channel | null;
  getCurrentContent: () => Content | null;
  getDetailChannel: () => Channel | null;
  getDetailContent: () => Content | null;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentView: "explore",
  channels: [], // 初始为空，用户创建 channel 后才会有数据
  userChannels: [],

  activeChannelIdx: 0,
  activeContentIdx: 0,

  detailChannelId: null,
  detailContentIdx: 0,

  remixSource: null,
  isRemixModalOpen: false,
  newChannelPrompt: "",
  isGenerating: false,
  loadingText: "",
  referenceImage: null,
  uploadProgress: 0,
  likedContents: new Set<string>(),

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

      return {
        likedContents: newLikedContents,
        channels: updatedChannels,
      };
    }),

  isContentLiked: (contentId) => get().likedContents.has(contentId),

  openRemix: (content, channelName) => {
    set({
      remixSource: { content, channelName },
      newChannelPrompt: content.prompt,
      isRemixModalOpen: true,
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

      set((state) => ({
        // 只有当 dropToFeed 为 true 时才添加到首页 feed 流
        channels: dropToFeed ? [newChannel, ...state.channels] : state.channels,
        userChannels: [newChannel, ...state.userChannels],
        isGenerating: false,
        newChannelPrompt: "",
        isRemixModalOpen: false,
        currentView: "myChannels",
        referenceImage: null, // 清除上传的图片
        uploadProgress: 0,
      }));
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

  handleUploadToChannel: (channelId) => {
    const state = get();
    const channelIndex = state.channels.findIndex((c) => c.id === channelId);
    if (channelIndex === -1) return;

    const channel = state.channels[channelIndex];
    const theme = THEME_LIBRARIES[channel.theme] || THEME_LIBRARIES.cyberpunk;
    const randomThemeImg =
      theme.images[Math.floor(Math.random() * theme.images.length)];

    const newContent = createMockContent(
      randomThemeImg,
      theme.name,
      "Uploaded user content"
    );

    const updatedChannels = [...state.channels];
    updatedChannels[channelIndex].contents.unshift(newContent);

    set({ channels: updatedChannels });
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
}));
