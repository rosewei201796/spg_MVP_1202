"use client";

import { Compass, Plus, User } from "lucide-react";
import { useAppStore, View } from "@/lib/store";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { currentView, setCurrentView } = useAppStore();

  const isActive = (view: View) => {
    if (view === "myChannels") {
      return currentView === "myChannels" || currentView === "channelDetail";
    }
    return currentView === view;
  };

  return (
    <>
      {/* Neo-Brutal Bottom Navigation */}
      <div className="absolute bottom-4 left-4 right-4 h-[80px] bg-white border-4 border-black hard-shadow z-40 flex items-center justify-around">
        {/* Explore Button */}
        <button
          onClick={() => setCurrentView("explore")}
          className={cn(
            "flex flex-col items-center gap-1 w-16 transition-all px-4 py-2 border-3 border-black",
            isActive("explore")
              ? "bg-hot-pink"
              : "bg-transparent active:bg-gray-200"
          )}
        >
          <Compass
            size={28}
            strokeWidth={3}
            className={isActive("explore") ? "text-black" : "text-black"}
          />
          <span className="text-[8px] font-black uppercase tracking-wider text-black">
            EXPLORE
          </span>
        </button>

        {/* Create Button - Elevated */}
        <div className="relative -top-6">
          <button
            onClick={() => setCurrentView("create")}
            className="w-16 h-16 bg-neon-orange border-4 border-black flex items-center justify-center hard-shadow-lg active:translate-x-[4px] active:translate-y-[4px] active:shadow-[4px_4px_0px_#000] transition-all"
          >
            <Plus size={36} strokeWidth={4} className="text-black" />
          </button>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black px-2 py-0.5">
            <span className="text-neon-orange text-[8px] font-black uppercase">
              NEW
            </span>
          </div>
        </div>

        {/* Profile Button */}
        <button
          onClick={() => setCurrentView("myChannels")}
          className={cn(
            "flex flex-col items-center gap-1 w-16 transition-all px-4 py-2 border-3 border-black",
            isActive("myChannels")
              ? "bg-electric-blue"
              : "bg-transparent active:bg-gray-200"
          )}
        >
          <User
            size={28}
            strokeWidth={3}
            className={isActive("myChannels") ? "text-black" : "text-black"}
          />
          <span className="text-[8px] font-black uppercase tracking-wider text-black">
            ME
          </span>
        </button>
      </div>

      {/* Decorative stripe at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 deco-stripe z-50 pointer-events-none" />
    </>
  );
}
