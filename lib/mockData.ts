export type ThemeLibrary = {
  id: string;
  name: string;
  images: string[];
};

export type Content = {
  id: string;
  channelId: string;
  type: "image";
  src: string;
  prompt: string;
  createdAt: string;
  likes: number;
};

export type Channel = {
  id: string;
  name: string;
  owner: string;
  theme: string;
  createdAt: string;
  contents: Content[];
  isUserGenerated: boolean;
  dropToFeed: boolean; // 是否显示在首页feed流中，默认为true
};

// 5 distinct theme libraries with real images
export const THEME_LIBRARIES: Record<string, ThemeLibrary> = {
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    images: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1535378437321-292cc4d47804?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop",
    ],
  },
  nature: {
    id: "nature",
    name: "Nature",
    images: [
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop",
    ],
  },
  abstract: {
    id: "abstract",
    name: "Abstract",
    images: [
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579783902614-a3fb39279c15?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1000&auto=format&fit=crop",
    ],
  },
  space: {
    id: "space",
    name: "Space",
    images: [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1000&auto=format&fit=crop",
    ],
  },
  minimal: {
    id: "minimal",
    name: "Minimalist",
    images: [
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486324885351-9887c72f4448?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1494145904049-0dca59b4bbad?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?q=80&w=1000&auto=format&fit=crop",
    ],
  },
};

const generateId = () => Math.random().toString(36).substr(2, 9);
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Create mock content from a specific image URL
export const createMockContent = (
  imgUrl: string,
  styleName: string,
  promptOverride = ""
): Content => {
  return {
    id: generateId(),
    type: "image",
    src: imgUrl,
    prompt:
      promptOverride ||
      `A masterpiece in ${styleName} style, capturing the essence of the theme.`,
    createdAt: new Date().toISOString(),
    likes: Math.floor(Math.random() * 1000) + 100,
    channelId: "",
  };
};

// Create a mock channel with a specific theme
export const createMockChannel = (
  name: string,
  owner: string,
  themeKey: string,
  isUserGenerated = false,
  dropToFeed = true
): Channel => {
  const theme = THEME_LIBRARIES[themeKey] || THEME_LIBRARIES.cyberpunk;

  const contents = theme.images.map((imgUrl) =>
    createMockContent(imgUrl, theme.name)
  );

  return {
    id: generateId(),
    name,
    owner,
    theme: themeKey,
    createdAt: new Date().toISOString(),
    contents,
    isUserGenerated,
    dropToFeed,
  };
};

// Initial 3 channels with distinct themes for explore view
export const INITIAL_CHANNELS: Channel[] = [
  createMockChannel("Cyber Future", "System", "cyberpunk"),
  createMockChannel("Wild Nature", "Alice", "nature"),
  createMockChannel("Deep Space", "Bob", "space"),
];

// Helper to get random theme key
export const getRandomThemeKey = () => getRandomItem(Object.keys(THEME_LIBRARIES));

