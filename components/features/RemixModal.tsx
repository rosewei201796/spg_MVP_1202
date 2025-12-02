"use client";

import { useState } from "react";
import { X, RefreshCw, Zap } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function RemixModal() {
  const {
    isRemixModalOpen,
    setIsRemixModalOpen,
    remixSource,
    newChannelPrompt,
    setNewChannelPrompt,
    handleCreateChannel,
  } = useAppStore();

  const [dropToFeed, setDropToFeed] = useState(true);

  if (!isRemixModalOpen || !remixSource) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-end animate-in fade-in duration-200">
      <div className="w-full bg-[#121212] border-t-4 border-hot-pink p-6 pb-10 animate-in slide-in-from-bottom duration-300">
        {/* Decorative Top Bar */}
        <div className="h-2 w-20 bg-neon-orange mx-auto mb-6" />

        {/* Header */}
        <div className="flex justify-between items-center mb-6 text-white">
          <h3 className="text-xl font-black uppercase flex items-center gap-2">
            <RefreshCw size={20} className="text-hot-pink" />
            REMIX
          </h3>
          <button
            onClick={() => setIsRemixModalOpen(false)}
            className="w-10 h-10 bg-white border-3 border-black hard-shadow-sm flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] transition-all"
          >
            <X size={20} className="text-black" strokeWidth={3} />
          </button>
        </div>

        {/* Source Preview */}
        <div className="flex gap-4 mb-6 bg-white border-4 border-black hard-shadow p-3">
          <div className="w-16 h-16 border-3 border-black overflow-hidden">
            <img
              src={remixSource.content.src}
              className="w-full h-full object-cover"
              alt=""
            />
          </div>
          <div className="flex-1 py-1">
            <p className="text-[10px] text-neon-orange font-black uppercase tracking-wider mb-1">
              SOURCE: {remixSource.channelName}
            </p>
            <p className="text-xs text-black font-bold line-clamp-2 uppercase">
              &ldquo;{remixSource.content.prompt}&rdquo;
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="mb-4">
          <label className="text-xs text-electric-blue font-black uppercase tracking-wider mb-3 block pl-1">
            YOUR TWIST
          </label>
          <textarea
            value={newChannelPrompt}
            onChange={(e) => setNewChannelPrompt(e.target.value)}
            className="w-full bg-white border-4 border-black p-4 text-sm text-black font-bold uppercase focus:outline-none focus:border-hot-pink h-28 resize-none placeholder:text-gray-500"
            placeholder="ADD YOUR SPIN..."
          />
        </div>

        {/* Drop to Feed Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setDropToFeed(!dropToFeed)}
            className={cn(
              "w-full p-3 border-4 border-black hard-shadow flex items-center justify-between transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#000]",
              dropToFeed ? "bg-[#00F0FF]" : "bg-gray-700"
            )}
          >
            <div className="flex flex-col items-start">
              <span className="text-black font-black text-xs uppercase">
                DROP TO FEED
              </span>
              <span className="text-black/70 text-[10px] font-bold uppercase mt-0.5">
                {dropToFeed ? "VISIBLE IN HOME" : "PRIVATE"}
              </span>
            </div>
            <div
              className={cn(
                "w-10 h-5 border-2 border-black relative transition-all",
                dropToFeed ? "bg-[#FF00FF]" : "bg-white"
              )}
            >
              <div
                className={cn(
                  "absolute top-0 w-4 h-4 border-2 border-black transition-all",
                  dropToFeed ? "right-0 bg-[#FF5F1F]" : "left-0 bg-gray-400"
                )}
              />
            </div>
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={() =>
            handleCreateChannel(
              newChannelPrompt,
              true,
              remixSource.channelName,
              dropToFeed
            )
          }
          className="w-full bg-hot-pink text-black py-5 font-black text-lg uppercase border-4 border-black hard-shadow active:translate-x-[4px] active:translate-y-[4px] active:shadow-[4px_4px_0px_#000] transition-all flex items-center justify-center gap-3"
        >
          <Zap size={22} fill="black" />
          GENERATE REMIX
        </button>
      </div>
    </div>
  );
}
