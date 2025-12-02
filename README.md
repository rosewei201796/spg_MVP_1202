# SPG - Social Platform Generator

A production-ready, mobile-first PWA built with Next.js 14 that simulates a TikTok-style mobile app with real swipe gestures and themed channels.

## 🚀 Features

- **True Mobile Layout**: Uses `dvh` (dynamic viewport height) for proper mobile display
- **Real Swipe Gestures**: 
  - Swipe Left/Right to switch between channels
  - Swipe Up/Down to browse content within a channel
- **PWA Support**: Installable on iOS and Android with offline capabilities
- **Themed Channels**: 5 preset themes (Tech, Food, Travel, Fitness, Art)
- **State Management**: Global state with Zustand
- **Smooth Animations**: Framer Motion for native-like transitions

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State**: Zustand
- **TypeScript**: Full type safety

## 📦 Installation

```bash
npm install
```

## 🏃 Running the App

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 📱 Testing on Mobile

### Local Network Testing

1. Start the dev server: `npm run dev`
2. Find your local IP address:
   - macOS/Linux: `ifconfig | grep inet`
   - Windows: `ipconfig`
3. On your mobile device, visit: `http://YOUR_IP:3000`

### PWA Installation

1. Open the app in Chrome (Android) or Safari (iOS)
2. Tap the "Add to Home Screen" option
3. The app will install like a native app

## 🎨 Project Structure

```
/app                      # Next.js App Router
  /layout.tsx            # Root layout with PWA config
  /page.tsx              # Main app page
  /globals.css           # Global styles with mobile utilities
  
/components
  /layout
    /MobileShell.tsx     # Mobile frame with status bar
    /BottomNav.tsx       # Bottom navigation
  /features
    /ExploreView.tsx     # Main feed with swipe gestures
    /CreateChannel.tsx   # Channel creation flow
    /Profile.tsx         # User profile and channels
    
/lib
  /store.ts              # Zustand state management
  /mockData.ts           # Mock data and themes
  /utils.ts              # Utility functions

/public
  /manifest.json         # PWA manifest
  /sw.js                 # Service worker
  /icon-*.svg            # App icons
```

## 🎯 Key Features Explained

### Mobile-First Design

- Uses `100dvh` for proper mobile viewport handling
- `overscroll-behavior: none` prevents bounce scrolling
- `touch-action: pan-x pan-y` disables pinch-zoom
- Status bar mimics native mobile apps

### Swipe Gestures

The app uses Framer Motion's drag functionality:

```tsx
// Vertical swipe for content
<motion.div drag="y" onDragEnd={handleSwipe}>

// Horizontal swipe for channels
<motion.div drag="x" onDragEnd={handleSwipe}>
```

### State Management

Zustand provides a simple, performant global state:

```tsx
const { currentView, setCurrentView } = useAppStore();
```

## 🎨 Customization

### Adding New Themes

Edit `/lib/mockData.ts`:

```tsx
export const THEMES: Theme[] = [
  {
    id: "your-theme",
    name: "Your Theme",
    emoji: "🎯",
    color: "#FF5733",
    gradient: "from-red-500 to-orange-500",
  },
  // ...
];
```

### Modifying Swipe Behavior

Adjust thresholds in `/components/features/ExploreView.tsx`:

```tsx
const SWIPE_THRESHOLD = 50; // pixels
const SWIPE_VELOCITY_THRESHOLD = 500; // pixels/second
```

## 📝 Environment Variables

No environment variables required for basic functionality.

## 🔧 Development Tips

1. **Testing Gestures**: Best tested on actual mobile devices or using Chrome DevTools mobile emulation with touch events enabled
2. **PWA Testing**: Use Lighthouse in Chrome DevTools to audit PWA compliance
3. **Performance**: The app uses React's strict mode and Next.js optimization by default

## 📄 License

MIT

## 🙋 Support

For issues or questions, please check the documentation or create an issue in the repository.

---

Built with ❤️ using Next.js 14

