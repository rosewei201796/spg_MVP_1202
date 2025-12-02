"use client";

import { useState, useEffect } from "react";
import { X, RefreshCw, Zap, Plus, FolderPlus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { RemixMode } from "@/lib/store";
import { cn } from "@/lib/utils";

export function RemixModal() {
  const {
    isRemixModalOpen,
    setIsRemixModalOpen,
    remixSource,
    newChannelPrompt,
    setNewChannelPrompt,
    remixMode,
    setRemixMode,
    remixTargetChannelId,
    setRemixTargetChannelId,
    handleRemix,
    userChannels,
  } = useAppStore();

  const [dropToFeed, setDropToFeed] = useState(true);

  // 当模态框打开时，重置 dropToFeed 状态
  useEffect(() => {
    if (isRemixModalOpen && remixSource) {
      // 如果选择的是添加到现有，dropToFeed 无需显示
      // 只有创建新 channel 时才需要 dropToFeed
    }
  }, [isRemixModalOpen, remixSource]);

  if (!isRemixModalOpen || !remixSource) return null;

  const { isOwnChannel, currentChannelId } = remixSource;

  // 过滤出用户自己的 channels 用于选择器
  const availableChannels = userChannels.filter(
    (ch) => ch.id !== currentChannelId // 排除当前 channel（如果有）
  );

  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-end animate-in fade-in duration-200">
      <div className="w-full bg-[#121212] border-t-4 border-hot-pink p-6 pb-10 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
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
              alt="Source"
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

        {/* Remix Destination Options */}
        <div className="mb-6">
          <label className="text-xs text-electric-blue font-black uppercase tracking-wider mb-3 block pl-1">
            DESTINATION
          </label>
          
          <div className="space-y-3">
            {/* Option 1: Create New Channel */}
            <button
              onClick={() => setRemixMode("createNew")}
              className={cn(
                "w-full p-4 border-4 border-black hard-shadow-sm flex items-center gap-3 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]",
                remixMode === "createNew"
                  ? "bg-hot-pink"
                  : "bg-gray-800"
              )}
            >
              <div className={cn(
                "w-5 h-5 border-3 border-black flex items-center justify-center",
                remixMode === "createNew" ? "bg-white" : "bg-gray-700"
              )}>
                {remixMode === "createNew" && (
                  <div className="w-3 h-3 bg-black"></div>
                )}
              </div>
              <Plus size={18} className={cn(
                remixMode === "createNew" ? "text-black" : "text-gray-400"
              )} strokeWidth={3} />
              <div className="flex-1 text-left">
                <p className={cn(
                  "text-sm font-black uppercase",
                  remixMode === "createNew" ? "text-black" : "text-gray-400"
                )}>
                  CREATE NEW CHANNEL
                </p>
                <p className={cn(
                  "text-[10px] font-bold uppercase mt-0.5",
                  remixMode === "createNew" ? "text-black/70" : "text-gray-500"
                )}>
                  Start fresh with new visuals
                </p>
              </div>
            </button>

            {/* Option 2: Add to Existing Channel */}
            <button
              onClick={() => {
                setRemixMode("addToExisting");
                // 自动选择第一个可用 channel 或当前 channel
                if (isOwnChannel && currentChannelId) {
                  setRemixTargetChannelId(currentChannelId);
                } else if (availableChannels.length > 0) {
                  setRemixTargetChannelId(availableChannels[0].id);
                }
              }}
              className={cn(
                "w-full p-4 border-4 border-black hard-shadow-sm flex items-center gap-3 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]",
                remixMode === "addToExisting"
                  ? "bg-electric-blue"
                  : "bg-gray-800"
              )}
            >
              <div className={cn(
                "w-5 h-5 border-3 border-black flex items-center justify-center",
                remixMode === "addToExisting" ? "bg-white" : "bg-gray-700"
              )}>
                {remixMode === "addToExisting" && (
                  <div className="w-3 h-3 bg-black"></div>
                )}
              </div>
              <FolderPlus size={18} className={cn(
                remixMode === "addToExisting" ? "text-black" : "text-gray-400"
              )} strokeWidth={3} />
              <div className="flex-1 text-left">
                <p className={cn(
                  "text-sm font-black uppercase",
                  remixMode === "addToExisting" ? "text-black" : "text-gray-400"
                )}>
                  ADD TO MY CHANNEL
                </p>
                <p className={cn(
                  "text-[10px] font-bold uppercase mt-0.5",
                  remixMode === "addToExisting" ? "text-black/70" : "text-gray-500"
                )}>
                  Expand existing collection
                </p>
              </div>
            </button>
          </div>

          {/* Channel Selector (only show when "Add to Existing" is selected) */}
          {remixMode === "addToExisting" && (
            <div className="mt-4">
              <label className="text-xs text-white font-black uppercase tracking-wider mb-2 block pl-1">
                SELECT CHANNEL
              </label>
              <select
                value={remixTargetChannelId || ""}
                onChange={(e) => setRemixTargetChannelId(e.target.value)}
                className="w-full bg-white border-4 border-black p-3 text-sm text-black font-bold uppercase focus:outline-none focus:border-electric-blue"
              >
                {isOwnChannel && currentChannelId && (
                  <option value={currentChannelId}>
                    {remixSource.channelName} (CURRENT)
                  </option>
                )}
                {availableChannels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
                {!isOwnChannel && availableChannels.length === 0 && (
                  <option value="">NO CHANNELS YET</option>
                )}
              </select>
            </div>
          )}
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

        {/* Drop to Feed Toggle (only for Create New) */}
        {remixMode === "createNew" && (
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
                  {dropToFeed ? "VISIBLE IN EXPLORE" : "PRIVATE"}
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
        )}

        {/* Generate Button */}
        <button
          onClick={async () => {
            if (remixMode === "createNew") {
              // 创建新 channel
              await handleRemix();
            } else if (remixMode === "addToExisting") {
              // 添加到现有 channel
              if (!remixTargetChannelId) {
                alert("Please select a channel");
                return;
              }
              await handleRemix();
            }
          }}
          disabled={
            !newChannelPrompt.trim() ||
            (remixMode === "addToExisting" && !remixTargetChannelId)
          }
          className={cn(
            "w-full py-5 font-black text-lg uppercase border-4 border-black hard-shadow transition-all flex items-center justify-center gap-3",
            !newChannelPrompt.trim() ||
            (remixMode === "addToExisting" && !remixTargetChannelId)
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-hot-pink text-black active:translate-x-[4px] active:translate-y-[4px] active:shadow-[4px_4px_0px_#000]"
          )}
        >
          <Zap size={22} fill={
            !newChannelPrompt.trim() ||
            (remixMode === "addToExisting" && !remixTargetChannelId)
              ? "#9CA3AF"
              : "black"
          } />
          GENERATE REMIX
        </button>
      </div>
    </div>
  );
}
