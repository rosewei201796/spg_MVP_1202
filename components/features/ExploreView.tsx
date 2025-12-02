"use client";

import { useState } from "react";
import { motion, PanInfo, AnimatePresence } from "framer-motion";
import { Heart, RefreshCw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { WorldChat } from "./WorldChat";

const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 500;

// 3D 效果参数
const ROTATION_DEGREES = 45;
const Z_OFFSET = -200;

export function ExploreView() {
  const {
    channels,
    activeChannelIdx,
    activeContentIdx,
    setActiveChannelIdx,
    setActiveContentIdx,
    getCurrentChannel,
    getCurrentContent,
    openRemix,
  } = useAppStore();

  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  const currentChannel = getCurrentChannel();
  const currentContent = getCurrentContent();

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const isHorizontal = Math.abs(offset.x) > Math.abs(offset.y);

    if (isHorizontal) {
      // 左右滑动 - 切换频道（带翻转效果）
      if (
        Math.abs(offset.x) > SWIPE_THRESHOLD ||
        Math.abs(velocity.x) > SWIPE_VELOCITY_THRESHOLD
      ) {
        if (offset.x < 0) {
          // 向左滑 - 卡片向左飞出
          setSwipeDirection("left");
          setTimeout(() => {
            const nextIdx = (activeChannelIdx + 1) % channels.length;
            setActiveChannelIdx(nextIdx);
            setSwipeDirection(null);
          }, 400);
        } else if (offset.x > 0) {
          // 向右滑 - 卡片向右飞出
          setSwipeDirection("right");
          setTimeout(() => {
            const prevIdx = (activeChannelIdx - 1 + channels.length) % channels.length;
            setActiveChannelIdx(prevIdx);
            setSwipeDirection(null);
          }, 400);
        }
      }
    } else {
      // 上下滑动 - 切换内容（循环）
      if (
        Math.abs(offset.y) > SWIPE_THRESHOLD ||
        Math.abs(velocity.y) > SWIPE_VELOCITY_THRESHOLD
      ) {
        if (offset.y < 0 && currentChannel) {
          const nextIdx = (activeContentIdx + 1) % currentChannel.contents.length;
          setActiveContentIdx(nextIdx);
        } else if (offset.y > 0 && currentChannel) {
          const prevIdx = (activeContentIdx - 1 + currentChannel.contents.length) % currentChannel.contents.length;
          setActiveContentIdx(prevIdx);
        }
      }
    }
  };

  if (!currentChannel || !currentContent) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p className="text-2xl uppercase font-black">NO CONTENT</p>
      </div>
    );
  }

  // 计算退出/进入动画
  const getExitAnimation = () => {
    if (swipeDirection === "left") {
      return {
        x: -window.innerWidth,
        rotateY: -ROTATION_DEGREES,
        translateZ: Z_OFFSET,
        scale: 0.8,
        opacity: 0,
      };
    } else if (swipeDirection === "right") {
      return {
        x: window.innerWidth,
        rotateY: ROTATION_DEGREES,
        translateZ: Z_OFFSET,
        scale: 0.8,
        opacity: 0,
      };
    }
    return { opacity: 0 };
  };

  const getEnterAnimation = () => {
    if (swipeDirection === "left") {
      // 从右侧滑入
      return {
        x: window.innerWidth,
        rotateY: ROTATION_DEGREES,
        translateZ: Z_OFFSET,
        scale: 0.8,
        opacity: 0,
      };
    } else if (swipeDirection === "right") {
      // 从左侧滑入
      return {
        x: -window.innerWidth,
        rotateY: -ROTATION_DEGREES,
        translateZ: Z_OFFSET,
        scale: 0.8,
        opacity: 0,
      };
    }
    return { x: 0, rotateY: 0, translateZ: 0, scale: 1, opacity: 1 };
  };

  return (
    <div 
      className="relative w-full h-full bg-[#121212] overflow-hidden select-none" 
      style={{ 
        perspective: '1200px',
        perspectiveOrigin: 'center center',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentChannel.id}-${currentContent.id}`}
          drag
          dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          initial={getEnterAnimation()}
          animate={{
            x: 0,
            rotateY: 0,
            translateZ: 0,
            scale: 1,
            opacity: 1,
          }}
          exit={getExitAnimation()}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 25,
            duration: 0.4,
          }}
          className="absolute inset-0"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          <ContentCard
            content={currentContent}
            channelName={currentChannel.name}
            owner={currentChannel.owner}
            onRemix={() => openRemix(
              currentContent, 
              currentChannel.name,
              currentChannel.isUserGenerated, // isOwnChannel
              currentChannel.id // currentChannelId
            )}
          />
        </motion.div>
      </AnimatePresence>

      {/* Top Info Bar - Neo-Brutal */}
      <div className="absolute top-12 left-0 right-0 z-30 px-4 pointer-events-none">
        <div className="flex items-center justify-between">
          <div className="px-4 py-2 border-4 border-black hard-shadow-sm pointer-events-auto" style={{ backgroundColor: '#00F0FF' }}>
            <span className="text-black font-black text-xs uppercase tracking-wider">
              EXPLORE {activeChannelIdx + 1}/{channels.length}
            </span>
          </div>
          <div className="px-3 py-1 border-3 border-black hard-shadow-sm pointer-events-auto" style={{ backgroundColor: '#FF5F1F' }}>
            <span className="text-black font-black text-[10px] uppercase">
              FOLLOWING
            </span>
          </div>
        </div>
      </div>

      {/* Worldchat - 仅在公共 channel 显示 */}
      {!currentChannel.isUserGenerated && (
        <WorldChat 
          channelId={currentChannel.id}
          channelName={currentChannel.name}
        />
      )}
    </div>
  );
}

function ContentCard({
  content,
  channelName,
  owner,
  onRemix,
}: {
  content: any;
  channelName: string;
  owner: string;
  onRemix: () => void;
}) {
  const { toggleLike, isContentLiked } = useAppStore();
  const isLiked = isContentLiked(content.id);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(content.id);
  };

  return (
    <div className="relative w-full h-full bg-[#121212] overflow-hidden select-none">
      {/* Background Image with Neo-Brutal Border */}
      <div className="absolute inset-4 border-4 border-white">
        <img
          src={content.src}
          alt={content.prompt}
          className="w-full h-full object-cover"
        />
        {/* Hard color overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#121212]" />
      </div>

      {/* Right Action Bar - Neo-Brutal Style */}
      <div className="absolute right-6 bottom-32 flex flex-col gap-4 items-center text-white z-30 pointer-events-auto">
        {/* Avatar */}
        <div className="w-12 h-12 border-3 border-black flex items-center justify-center font-black text-black text-lg hard-shadow-sm" style={{ backgroundColor: '#FF00FF' }}>
          {owner[0]}
        </div>

        {/* Like Button */}
        <button 
          onClick={handleLike}
          className="flex flex-col items-center gap-1 bg-white border-3 border-black px-3 py-2 hard-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] transition-all"
        >
          <Heart 
            size={24} 
            className="text-black" 
            fill={isLiked ? "#FF00FF" : "none"}
            strokeWidth={2.5}
          />
          <span className="text-[10px] font-black text-black">
            {content.likes}
          </span>
        </button>
      </div>

      {/* Bottom Info Area - Neo-Brutal */}
      <div className="absolute left-4 bottom-32 right-24 text-white z-30 pointer-events-auto">
        <div className="flex items-center gap-2 mb-3">
          <div className="px-3 py-1 border-3 border-black" style={{ backgroundColor: '#FF00FF' }}>
            <span className="text-black font-black text-xs uppercase tracking-wider">
              {channelName}
            </span>
          </div>
          <span className="text-white font-black text-sm uppercase">
            @{owner}
          </span>
        </div>
        <p className="text-sm line-clamp-2 font-bold bg-[#121212] pl-3 py-2 uppercase tracking-wide" style={{ borderLeft: '4px solid #00F0FF' }}>
          {content.prompt}
        </p>

        {/* Remix Button - Neo-Brutal */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemix();
          }}
          className="mt-4 flex items-center gap-3 px-6 py-3 font-black text-black uppercase text-sm border-4 border-black hard-shadow active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#000] transition-all"
          style={{ backgroundColor: '#FF5F1F' }}
        >
          <RefreshCw size={18} />
          <span>REMIX</span>
        </button>
      </div>
    </div>
  );
}
