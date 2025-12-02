"use client";

import { Zap, Settings, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function Profile() {
  const { userChannels, currentUser, setDetailChannel, toggleChannelDropToFeed, setCurrentView, deleteChannel } = useAppStore();

  return (
    <div className="w-full h-full bg-[#121212] text-white flex flex-col pt-16 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-1">
        <div className="border-l-4 border-hot-pink pl-3">
          <h2 className="text-3xl font-black uppercase">MY CHANNELS</h2>
          <p className="text-xs text-electric-blue font-black uppercase mt-1">
            {userChannels.length} COLLECTIONS
          </p>
        </div>
        
        {/* Settings Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView("settings")}
            className="w-12 h-12 bg-white border-3 border-black hard-shadow flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] transition-all"
          >
            <Settings size={20} className="text-black" strokeWidth={3} />
          </button>
          <div className="w-14 h-14 bg-neon-orange border-4 border-black hard-shadow flex items-center justify-center text-2xl font-black text-black">
            {currentUser?.username.substring(0, 2).toUpperCase() || "ME"}
          </div>
        </div>
      </div>

      {/* Decorative Stripe */}
      <div className="h-3 w-full deco-stripe mb-6" />

      <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">
        {userChannels.length === 0 ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-gray-600 gap-6">
            <div className="w-24 h-24 bg-white border-4 border-black hard-shadow flex items-center justify-center">
              <Zap size={48} className="text-neon-orange" />
            </div>
            <p className="text-white font-black text-xl uppercase">
              NO CHANNELS YET
            </p>
            <div className="h-2 w-32 bg-hot-pink" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {userChannels.map((channel, index) => (
              <div
                key={channel.id}
                className="group relative aspect-[9/16] bg-white border-4 border-black hard-shadow overflow-hidden"
              >
                <div
                  onClick={() => setDetailChannel(channel.id, 0)}
                  className="cursor-pointer active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#000] transition-all w-full h-full"
                >
                  <img
                    src={channel.contents[0]?.src}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                  {/* Color overlay based on index */}
                  <div
                    className={cn(
                      "absolute inset-0 mix-blend-multiply opacity-20 group-hover:opacity-10 transition-opacity",
                      index % 3 === 0 && "bg-neon-orange",
                      index % 3 === 1 && "bg-hot-pink",
                      index % 3 === 2 && "bg-electric-blue"
                    )}
                  />
                </div>
                
                {/* Delete Channel Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${channel.name}"? All content will be permanently deleted.`)) {
                      deleteChannel(channel.id);
                    }
                  }}
                  className="absolute top-2 left-2 w-8 h-8 bg-red-600 border-2 border-black z-10 flex items-center justify-center transition-all active:scale-95 hover:bg-red-700"
                >
                  <Trash2 size={16} className="text-white" strokeWidth={3} />
                </button>

                {/* Drop to Feed Toggle Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChannelDropToFeed(channel.id);
                  }}
                  className={cn(
                    "absolute top-2 right-2 w-8 h-8 border-2 border-black z-10 flex items-center justify-center transition-all active:scale-95",
                    channel.dropToFeed ? "bg-[#00F0FF]" : "bg-gray-600"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 border-2 border-black transition-all",
                      channel.dropToFeed ? "bg-[#FF00FF]" : "bg-gray-400"
                    )}
                  />
                </button>

                {/* Info Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-black border-t-3 border-white p-2">
                  <h3 className="font-black text-white text-xs uppercase truncate">
                    {channel.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-electric-blue" />
                    <p className="text-[10px] text-white font-bold uppercase">
                      {channel.contents.length} ITEMS
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
