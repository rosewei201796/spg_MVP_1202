"use client";

import { useRef, useState } from "react";
import { Zap, Image as ImageIcon, X, Upload } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { API } from "@/lib/api";
import { cn } from "@/lib/utils";

export function CreateChannel() {
  const {
    newChannelPrompt,
    setNewChannelPrompt,
    handleCreateChannel,
    referenceImage,
    setReferenceImage,
    uploadProgress,
    setUploadProgress,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dropToFeed, setDropToFeed] = useState(true); // Drop to feed 开关，默认开启

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件
    const validation = API.validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid file");
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(0);

    // 创建预览
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // 上传文件
      const result = await API.uploadFile(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.url) {
        setReferenceImage(result.url);
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
      setPreviewUrl(null);
      setReferenceImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  // 移除图片
  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setReferenceImage(null);
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 触发文件选择
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full h-full bg-[#121212] text-white flex flex-col pt-16 px-6">
      {/* Header with decorative stripe */}
      <div className="h-4 w-full deco-stripe mb-6" />

      <div className="pl-4 mb-8" style={{ borderLeft: "4px solid #FF5F1F" }}>
        <h2
          className="text-4xl font-black uppercase mb-2"
          style={{ textShadow: "3px 3px 0px #FF5F1F" }}
        >
          NEW CHANNEL
        </h2>
        <p className="text-white/80 text-xs uppercase font-bold tracking-wider">
          DESIGN YOUR WORLD
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pb-6 no-scrollbar">
        {/* Prompt Input */}
        <div className="space-y-3">
          <label
            className="text-xs font-black uppercase tracking-widest block pl-1"
            style={{ color: "#00F0FF" }}
          >
            PROMPT
          </label>
          <div className="bg-white border-4 border-black hard-shadow p-4">
            <textarea
              value={newChannelPrompt}
              onChange={(e) => setNewChannelPrompt(e.target.value)}
              placeholder="DESCRIBE YOUR VISION..."
              className="w-full bg-transparent text-lg text-black placeholder:text-gray-500 focus:outline-none h-32 resize-none font-bold uppercase"
            />
          </div>
        </div>

        {/* Drop to Feed Toggle */}
        <div className="space-y-3">
          <label
            className="text-xs font-black uppercase tracking-widest block pl-1"
            style={{ color: "#FF00FF" }}
          >
            VISIBILITY
          </label>
          <button
            onClick={() => setDropToFeed(!dropToFeed)}
            className={cn(
              "w-full p-4 border-4 border-black hard-shadow flex items-center justify-between transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#000]",
              dropToFeed ? "bg-[#00F0FF]" : "bg-gray-700"
            )}
          >
            <div className="flex flex-col items-start">
              <span className="text-black font-black text-sm uppercase">
                DROP TO FEED
              </span>
              <span className="text-black/70 text-xs font-bold uppercase mt-1">
                {dropToFeed ? "VISIBLE IN HOME FEED" : "PRIVATE (MY CHANNELS ONLY)"}
              </span>
            </div>
            <div
              className={cn(
                "w-12 h-6 border-3 border-black relative transition-all",
                dropToFeed ? "bg-[#FF00FF]" : "bg-white"
              )}
            >
              <div
                className={cn(
                  "absolute top-0 w-5 h-5 border-2 border-black transition-all",
                  dropToFeed ? "right-0 bg-[#FF5F1F]" : "left-0 bg-gray-400"
                )}
              />
            </div>
          </button>
        </div>

        {/* Reference Upload */}
        <div className="space-y-3">
          <label
            className="text-xs font-black uppercase tracking-widest block pl-1"
            style={{ color: "#FF00FF" }}
          >
            REFERENCE IMAGE (OPTIONAL)
          </label>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Preview or Upload Area */}
          {previewUrl || referenceImage ? (
            <div className="relative bg-[#121212] border-4 border-white overflow-hidden">
              <img
                src={previewUrl || referenceImage || ""}
                alt="Reference"
                className="w-full h-48 object-cover"
              />

              {/* Upload Progress Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3">
                  <div className="w-3/4 h-2 bg-white/20 border-2 border-white overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${uploadProgress}%`,
                        backgroundColor: "#00F0FF",
                      }}
                    />
                  </div>
                  <span className="text-white font-black text-sm uppercase">
                    Uploading {uploadProgress}%
                  </span>
                </div>
              )}

              {/* Remove Button */}
              {!isUploading && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center border-3 border-black hard-shadow-sm active:translate-x-[2px] active:translate-y-[2px] transition-all"
                  style={{ backgroundColor: "#FF5F1F" }}
                >
                  <X size={20} className="text-black" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="w-full bg-[#121212] border-4 border-dashed border-white hover:border-[#00F0FF] active:border-[#FF00FF] transition-colors h-32 flex flex-col items-center justify-center gap-3"
            >
              <div
                className="w-14 h-14 border-3 border-black flex items-center justify-center"
                style={{ backgroundColor: "#FF5F1F" }}
              >
                <Upload size={28} className="text-black" />
              </div>
              <span className="text-sm text-white font-black uppercase">
                UPLOAD IMAGE
              </span>
              <span className="text-xs text-white/60 font-bold">
                JPG, PNG, WebP (MAX 10MB)
              </span>
            </button>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div
              className="px-4 py-2 border-3 border-black font-black text-xs uppercase"
              style={{ backgroundColor: "#FF5F1F", color: "#000" }}
            >
              ⚠️ {uploadError}
            </div>
          )}
        </div>

        {/* Tip */}
        <div
          className="px-4 py-3 border-l-4"
          style={{
            backgroundColor: "#1A1A1A",
            borderColor: "#00F0FF",
          }}
        >
          <p className="text-xs text-white/70 font-bold uppercase leading-relaxed">
            💡 Upload a reference image to guide the AI generation style
          </p>
        </div>
      </div>

      {/* Generate Button */}
      <div className="pb-32 mt-4">
        <button
          disabled={!newChannelPrompt || isUploading}
          onClick={() => handleCreateChannel(newChannelPrompt, false, "", dropToFeed)}
          className={cn(
            "w-full py-5 font-black text-xl uppercase border-4 border-black flex items-center justify-center gap-4 transition-all",
            newChannelPrompt && !isUploading
              ? "text-black hard-shadow active:translate-x-[4px] active:translate-y-[4px] active:shadow-[4px_4px_0px_#000]"
              : "bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700"
          )}
          style={
            newChannelPrompt && !isUploading
              ? { backgroundColor: "#00F0FF" }
              : {}
          }
        >
          <Zap
            size={24}
            style={
              newChannelPrompt && !isUploading ? { fill: "#FF00FF" } : {}
            }
          />
          {isUploading ? "UPLOADING..." : "GENERATE"}
        </button>
      </div>
    </div>
  );
}
