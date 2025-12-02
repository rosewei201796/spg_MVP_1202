# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Test on Your Phone

#### Option A: Using Your Local Network

1. Find your computer's IP address:
   ```bash
   # On macOS/Linux
   ifconfig | grep "inet "
   
   # On Windows
   ipconfig
   ```

2. Make sure your phone is on the same WiFi network

3. Open `http://YOUR_IP_ADDRESS:3000` on your phone's browser

#### Option B: Install as PWA

1. Open the app in Chrome (Android) or Safari (iOS)
2. Look for "Add to Home Screen" or tap the share button
3. Install the app - it will work like a native app!

## 🎯 Features to Try

### 1. **Swipe Gestures**
- **Swipe Up/Down**: Navigate through content in the current channel
- **Swipe Left/Right**: Switch between different themed channels

### 2. **Explore Channels**
5 pre-loaded themed channels:
- 🚀 Tech & Innovation
- 🍜 Food & Cooking
- ✈️ Travel & Adventure
- 💪 Fitness & Health
- 🎨 Art & Design

### 3. **Create Your Own Channel**
1. Tap the "+" icon in the bottom navigation
2. Select a theme
3. Give your channel a name and description
4. Start creating!

### 4. **Check Your Profile**
- View all your created channels
- See your stats (followers, channels, views)

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Run production build locally |
| `npm run lint` | Run ESLint |

## 📱 Mobile-First Features

- **Dynamic Viewport**: Uses `100dvh` to handle mobile browser address bars
- **No Bounce Scrolling**: Disabled iOS bounce effect
- **No Pinch Zoom**: Prevents accidental zooming
- **Status Bar**: Mimics native iOS/Android status bar
- **Smooth Animations**: Framer Motion for 60fps transitions

## 🎨 Customization

### Add a New Theme

Edit `lib/mockData.ts`:

```typescript
export const THEMES: Theme[] = [
  // ... existing themes
  {
    id: "music",
    name: "Music & Audio",
    emoji: "🎵",
    color: "#EC4899",
    gradient: "from-pink-500 to-purple-500",
  },
];
```

### Adjust Swipe Sensitivity

Edit `components/features/ExploreView.tsx`:

```typescript
const SWIPE_THRESHOLD = 50; // Lower = more sensitive
const SWIPE_VELOCITY_THRESHOLD = 500; // Lower = more sensitive
```

## 📦 Project Structure

```
/app
  layout.tsx          ← Root layout + PWA config
  page.tsx            ← Main app page
  globals.css         ← Global styles

/components
  /layout
    MobileShell.tsx   ← Phone frame + status bar
    BottomNav.tsx     ← Navigation bar
  /features
    ExploreView.tsx   ← Swipeable feed
    CreateChannel.tsx ← Channel creation
    Profile.tsx       ← User profile

/lib
  store.ts            ← Zustand state management
  mockData.ts         ← Themes and mock content
  utils.ts            ← Utility functions

/public
  manifest.json       ← PWA configuration
  sw.js               ← Service worker
```

## 🐛 Troubleshooting

### Gestures Not Working?
- Make sure you're testing on a touch device or have touch emulation enabled in Chrome DevTools
- Try adjusting the swipe thresholds in `ExploreView.tsx`

### PWA Not Installing?
- Ensure you're using HTTPS (or localhost)
- Check that `manifest.json` is accessible at `/manifest.json`
- Open Chrome DevTools > Application > Manifest to debug

### Build Errors?
```bash
# Clean install
rm -rf node_modules .next
npm install
npm run build
```

## 🎉 What's Next?

1. **Connect to a Real Backend**: Replace mock data with API calls
2. **Add Authentication**: Implement user login/signup
3. **Upload Content**: Add video/image upload functionality
4. **Social Features**: Implement comments, likes, shares
5. **Push Notifications**: Add engagement notifications
6. **Analytics**: Track user behavior and content performance

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Framer Motion Gestures](https://www.framer.com/motion/gestures/)
- [Zustand Guide](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [PWA Best Practices](https://web.dev/pwa/)

---

**Need help?** Check the main README.md or open an issue.

