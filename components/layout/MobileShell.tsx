"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Wifi, Battery, Signal } from "lucide-react";

interface MobileShellProps {
  children: ReactNode;
  showStatusBar?: boolean;
  className?: string;
}

export function MobileShell({
  children,
  showStatusBar = true,
  className,
}: MobileShellProps) {
  return (
    <div
      className={cn(
        "relative w-full h-screen-dynamic bg-[#121212] overflow-hidden",
        "flex flex-col",
        className
      )}
    >
      {showStatusBar && <StatusBar />}
      <main className="flex-1 relative overflow-hidden">{children}</main>
    </div>
  );
}

function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="absolute top-0 left-0 right-0 z-50 safe-area-top border-b-2 border-black bg-[#121212]">
      <div className="flex items-center justify-between px-6 pt-3 pb-2">
        {/* Left side - Time */}
        <div className="bg-electric-blue px-2 py-1 border-2 border-black">
          <span className="text-black text-xs font-black uppercase">
            {time}
          </span>
        </div>

        {/* Right side - Status icons */}
        <div className="flex items-center gap-2">
          {/* Signal */}
          <div className="bg-white px-1.5 py-1 border-2 border-black">
            <Signal size={12} className="text-black" strokeWidth={3} />
          </div>

          {/* WiFi */}
          <div className="bg-white px-1.5 py-1 border-2 border-black">
            <Wifi size={12} className="text-black" strokeWidth={3} />
          </div>

          {/* Battery */}
          <div className="flex items-center bg-white px-1.5 py-1 border-2 border-black">
            <Battery size={12} className="text-black" strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
