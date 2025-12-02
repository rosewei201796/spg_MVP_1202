"use client";

import { motion, PanInfo } from "framer-motion";
import { useRef } from "react";
import {
  ArrowLeft,
  Upload,
  Heart,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 500;

export function ChannelDetailView() {
  const {
    detailContentIdx,
    setDetailContentIdx,
    setCurrentView,
    getDetailChannel,
    getDetailContent,
    addUploadedImageToChannel,
    openRemix,
    toggleChannelDropToFeed,
    deleteContent,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const channel = getDetailChannel();
  const currentContent = getDetailContent();

  if (!channel || !currentContent) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p className="text-2xl font-black uppercase">CHANNEL NOT FOUND</p>
      </div>
    );
  }

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const { offset, velocity } = info;

    if (
      Math.abs(offset.y) > SWIPE_THRESHOLD ||
      Math.abs(velocity.y) > SWIPE_VELOCITY_THRESHOLD
    ) {
      if (offset.y < 0) {
        // 向上滑 - 下一个内容（循环到第一个）
        const nextIdx = (detailContentIdx + 1) % channel.contents.length;
        setDetailContentIdx(nextIdx);
      } else if (offset.y > 0) {
        // 向下滑 - 上一个内容（循环到最后一个）
        const prevIdx = (detailContentIdx - 1 + channel.contents.length) % channel.contents.length;
        setDetailContentIdx(prevIdx);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // 验证文件大小 (最大 10MB 原始文件)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Image size should be less than 10MB');
      return;
    }

    try {
      // 动态导入压缩工具
      const { compressImageFile, getImageInfo } = await import('@/lib/imageCompression');
      
      // 显示加载提示
      console.log('📤 Uploading and compressing image...');
      
      // 获取图片信息
      const info = await getImageInfo(file);
      console.log(`📸 Original: ${info.width}x${info.height}, ${info.sizeKB.toFixed(0)}KB`);
      
      // 压缩图片
      const compressedImageUrl = await compressImageFile(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        maxSizeKB: 800, // 目标最大 800KB
      });
      
      // 添加到 channel
      addUploadedImageToChannel(channel.id, compressedImageUrl, file.name);
      
      // 清空 input，以便可以重复选择同一个文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // 切换到新上传的图片（现在是第一个）
      setDetailContentIdx(0);
      
      console.log('✅ Image uploaded successfully');
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      alert('Failed to upload image. Please try a smaller image.');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative w-full h-full bg-[#121212]">
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="absolute inset-0"
      >
        <ContentCard
          content={currentContent}
          channelName={channel.name}
          owner={channel.owner}
          isUserGenerated={channel.isUserGenerated}
          channelId={channel.id}
          onRemix={() => openRemix(
            currentContent, 
            channel.name, 
            channel.isUserGenerated, // isOwnChannel
            channel.id // currentChannelId
          )}
          onDelete={() => {
            if (confirm('Delete this content? This action cannot be undone.')) {
              deleteContent(channel.id, currentContent.id);
            }
          }}
        />
      </motion.div>

      {/* Header Actions - Neo-Brutal */}
      <div className="absolute top-0 left-0 w-full pt-12 px-4 flex justify-between items-start pointer-events-none z-30">
        <button
          onClick={() => setCurrentView("myChannels")}
          className="w-12 h-12 flex items-center justify-center bg-white border-4 border-black hard-shadow pointer-events-auto active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#000] transition-all"
        >
          <ArrowLeft size={24} className="text-black" strokeWidth={3} />
        </button>

        <div className="flex gap-2">
          {channel.isUserGenerated && (
            <>
              {/* Drop to Feed Toggle */}
              <button
                onClick={() => toggleChannelDropToFeed(channel.id)}
                className="px-3 h-12 flex items-center gap-2 bg-white border-4 border-black hard-shadow pointer-events-auto active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#000] transition-all"
              >
                <div
                  className={`w-10 h-5 border-2 border-black relative transition-all ${
                    channel.dropToFeed ? "bg-[#00F0FF]" : "bg-gray-400"
                  }`}
                >
                  <div
                    className={`absolute top-0 w-4 h-4 border-2 border-black transition-all ${
                      channel.dropToFeed
                        ? "right-0 bg-[#FF00FF]"
                        : "left-0 bg-gray-600"
                    }`}
                  />
                </div>
                <span className="text-[10px] font-black uppercase text-black">
                  FEED
                </span>
              </button>

              {/* Add Button */}
              <button
                onClick={handleUploadClick}
                className="px-4 h-12 flex items-center gap-2 bg-neon-orange border-4 border-black hard-shadow pointer-events-auto active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#000] transition-all"
              >
                <Upload size={18} className="text-black" strokeWidth={3} />
                <span className="text-xs font-black uppercase text-black">
                  ADD
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Scroll Indicator - Neo-Brutal */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-none z-10">
        {channel.contents.map((_, idx) => (
          <div
            key={idx}
            className={`transition-all duration-300 border-2 border-black ${
              idx === detailContentIdx
                ? "w-2 h-8 bg-hot-pink"
                : "w-2 h-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function ContentCard({
  content,
  channelName,
  owner,
  isUserGenerated,
  channelId,
  onRemix,
  onDelete,
}: {
  content: any;
  channelName: string;
  owner: string;
  isUserGenerated: boolean;
  channelId: string;
  onRemix: () => void;
  onDelete: () => void;
}) {
  const { toggleLike, isContentLiked } = useAppStore();
  const isLiked = isContentLiked(content.id);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(content.id);
  };

  return (
    <div className="relative w-full h-full bg-[#121212] overflow-hidden select-none">
      <div className="absolute inset-4 border-4 border-white">
        <img
          src={content.src}
          alt={content.prompt}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#121212]" />
      </div>

      {/* Right Action Bar */}
      <div className="absolute right-6 bottom-32 flex flex-col gap-4 items-center text-white z-30 pointer-events-auto">
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

      {/* Bottom Info Area */}
      <div className="absolute left-4 bottom-32 right-24 text-white z-30 pointer-events-auto">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-hot-pink px-3 py-1 border-3 border-black">
            <span className="text-black font-black text-xs uppercase tracking-wider">
              {channelName}
            </span>
          </div>
          <span className="text-white font-black text-sm uppercase">
            @{owner}
          </span>
        </div>
        <p className="text-sm line-clamp-2 font-bold bg-[#121212] border-l-4 border-electric-blue pl-3 py-2 uppercase tracking-wide">
          {content.prompt}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemix();
            }}
            className="flex items-center gap-3 bg-neon-orange px-6 py-3 font-black text-black uppercase text-sm border-4 border-black hard-shadow active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#000] transition-all"
          >
            <RefreshCw size={18} />
            <span>REMIX</span>
          </button>

          {/* Delete button - only for user's own content */}
          {isUserGenerated && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center gap-2 bg-gray-800 px-4 py-3 font-black text-white uppercase text-sm border-4 border-black hard-shadow active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#000] transition-all"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
