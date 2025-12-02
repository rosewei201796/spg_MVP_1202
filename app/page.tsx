"use client";

import { MobileShell } from "@/components/layout/MobileShell";
import { BottomNav } from "@/components/layout/BottomNav";
import { ExploreView } from "@/components/features/ExploreView";
import { CreateChannel } from "@/components/features/CreateChannel";
import { Profile } from "@/components/features/Profile";
import { ChannelDetailView } from "@/components/features/ChannelDetailView";
import { RemixModal } from "@/components/features/RemixModal";
import { LoadingOverlay } from "@/components/features/LoadingOverlay";
import { AuthScreen } from "@/components/features/AuthScreen";
import { UserSettings } from "@/components/features/UserSettings";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const { 
    currentView, 
    isAuthenticated, 
    authError,
    currentUser,
    handleLogin, 
    handleRegister, 
    handleAutoRegister,
    handleLogout,
    handleUpdateUsername,
    handleUpdatePassword,
    setCurrentView,
  } = useAppStore();

  // 如果未登录，显示登录/注册界面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center sm:p-8 font-sans text-white select-none">
        <div className="w-full h-[100dvh] sm:h-[844px] sm:max-w-[390px] bg-black sm:rounded-[40px] overflow-hidden relative shadow-2xl ring-8 ring-gray-800 sm:border-[8px] sm:border-gray-900">
          <AuthScreen
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAutoRegister={handleAutoRegister}
            error={authError || undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center sm:p-8 font-sans text-white select-none">
      {/* iPhone Device Frame - 模拟手机外壳 */}
      <div className="w-full h-[100dvh] sm:h-[844px] sm:max-w-[390px] bg-black sm:rounded-[40px] overflow-hidden relative shadow-2xl ring-8 ring-gray-800 sm:border-[8px] sm:border-gray-900">
        <MobileShell>
          {currentView === "explore" && <ExploreView />}
          {currentView === "create" && <CreateChannel />}
          {currentView === "myChannels" && <Profile />}
          {currentView === "channelDetail" && <ChannelDetailView />}
          {currentView === "settings" && currentUser && (
            <UserSettings
              currentUsername={currentUser.username}
              onUpdateUsername={handleUpdateUsername}
              onUpdatePassword={handleUpdatePassword}
              onLogout={handleLogout}
              onClose={() => setCurrentView("myChannels")}
            />
          )}

          <BottomNav />
          <RemixModal />
          <LoadingOverlay />
        </MobileShell>
      </div>
    </div>
  );
}
