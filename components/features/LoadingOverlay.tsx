"use client";

import { Zap } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function LoadingOverlay() {
  const { isGenerating, loadingText } = useAppStore();

  if (!isGenerating) return null;

  return (
    <div className="absolute inset-0 z-50 bg-[#121212] flex flex-col items-center justify-center text-white p-8 text-center">
      {/* Neo-Brutal Loading Animation */}
      <div className="relative mb-12">
        {/* Outer Square */}
        <div className="w-24 h-24 border-4 border-neon-orange animate-[spin_2s_linear_infinite]" />
        {/* Inner Square */}
        <div className="absolute inset-3 border-4 border-hot-pink animate-[spin_1.5s_reverse_linear_infinite]" />
        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap
            size={32}
            className="text-electric-blue animate-pulse"
            fill="currentColor"
          />
        </div>
      </div>

      {/* Loading Text */}
      <div className="bg-white border-4 border-black hard-shadow px-8 py-4 mb-4">
        <h3 className="text-2xl font-black uppercase text-black animate-pulse">
          {loadingText}
        </h3>
      </div>

      {/* Subtitle */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-neon-orange animate-pulse" />
        <p className="text-electric-blue text-xs tracking-[0.3em] uppercase font-black">
          AI WORLD BUILDING
        </p>
        <div className="w-2 h-2 bg-hot-pink animate-pulse" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-16 h-16 border-4 border-hot-pink" />
      <div className="absolute bottom-10 right-10 w-20 h-20 border-4 border-electric-blue" />
      <div className="absolute top-1/2 right-10 w-12 h-12 bg-neon-orange border-4 border-black" />
    </div>
  );
}
