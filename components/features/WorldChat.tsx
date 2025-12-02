"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { 
  sendMessage, 
  getRecentMessages, 
  initBroadcastChannel,
  closeBroadcastChannel,
  canSendMessage,
  cleanupExpiredMessages,
  type ChatMessage 
} from "@/lib/chat";
import { motion, AnimatePresence } from "framer-motion";

interface WorldChatProps {
  channelId: string;
  channelName: string;
}

export function WorldChat({ channelId, channelName }: WorldChatProps) {
  const { currentUser, visibleChatMessages, addChatMessage, removeExpiredChatMessages } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoadedTimestampRef = useRef<number>(Date.now());

  // 初始化：加载历史消息
  useEffect(() => {
    // 加载最近的消息
    const recentMessages = getRecentMessages(channelId, 5);
    recentMessages.forEach(msg => {
      // 只加载当前时间窗口内的消息
      const now = Date.now();
      if (now - msg.timestamp < 5000) {
        addChatMessage(msg);
      }
    });

    lastLoadedTimestampRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  // 轮询检查新消息
  useEffect(() => {
    const checkNewMessages = () => {
      const messages = getRecentMessages(channelId, 10);
      const newMessages = messages.filter(
        msg => msg.timestamp > lastLoadedTimestampRef.current
      );

      newMessages.forEach(msg => {
        addChatMessage(msg);
      });

      if (newMessages.length > 0) {
        lastLoadedTimestampRef.current = Date.now();
      }
    };

    // 每 2 秒轮询一次
    pollIntervalRef.current = setInterval(checkNewMessages, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [channelId, addChatMessage]);

  // 定期清理过期消息
  useEffect(() => {
    const cleanup = () => {
      removeExpiredChatMessages();
      cleanupExpiredMessages(channelId);
    };

    // 每 1 秒清理一次
    cleanupIntervalRef.current = setInterval(cleanup, 1000);

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [channelId, removeExpiredChatMessages]);

  // 初始化跨标签页同步
  useEffect(() => {
    initBroadcastChannel((message) => {
      // 只接收当前 channel 的消息
      if (message.channelId === channelId) {
        addChatMessage(message);
      }
    });

    return () => {
      closeBroadcastChannel();
    };
  }, [channelId, addChatMessage]);

  // 发送消息
  const handleSend = () => {
    if (!currentUser) {
      alert('Please login to send messages');
      return;
    }

    if (isComposing) {
      return; // 正在输入中文，不发送
    }

    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      return;
    }

    // 检查是否可以发送（防刷屏）
    const check = canSendMessage(currentUser.id);
    if (!check.canSend) {
      alert(check.reason);
      return;
    }

    // 发送消息
    const message = sendMessage(channelId, currentUser.id, currentUser.username, trimmedValue);
    
    if (message) {
      // 立即添加到可见列表
      addChatMessage(message);
      
      // 清空输入框
      setInputValue('');
      
      // 更新最后加载时间
      lastLoadedTimestampRef.current = Date.now();
    }
  };

  // 处理回车发送
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  // 过滤当前 channel 的消息
  const currentChannelMessages = visibleChatMessages.filter(
    msg => msg.channelId === channelId
  );

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col">
      {/* 消息浮层 - 从底部往上推 */}
      <div className="flex-1 flex flex-col justify-end px-4 pb-32">
        <AnimatePresence mode="popLayout">
          {currentChannelMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-2"
            >
              <div className="inline-block bg-black/70 backdrop-blur-sm border-2 border-white/30 px-3 py-2 max-w-[80%]">
                <div className="flex items-start gap-2">
                  <span className="text-electric-blue font-black text-xs uppercase flex-shrink-0">
                    {message.username}:
                  </span>
                  <span className="text-white font-bold text-sm break-words">
                    {message.content}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 输入区 - 固定在底部 */}
      <div className="px-4 pb-24 pointer-events-auto">
        <div className="bg-[#121212]/95 backdrop-blur-md border-4 border-white/30 hard-shadow-sm flex items-center gap-2 p-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={currentUser ? "Join the buzz…" : "Login to chat"}
            disabled={!currentUser}
            maxLength={200}
            className="flex-1 bg-white/10 border-2 border-white/20 px-3 py-2 text-white text-sm font-bold placeholder:text-gray-500 focus:outline-none focus:border-electric-blue disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!currentUser || !inputValue.trim() || isComposing}
            className="w-12 h-12 bg-hot-pink border-3 border-black hard-shadow-sm flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]"
          >
            <Send size={20} className="text-black" strokeWidth={3} />
          </button>
        </div>

        {/* Channel 名称提示 */}
        <div className="mt-2 text-center">
          <span className="text-xs text-electric-blue font-black uppercase">
            💬 {channelName}
          </span>
        </div>
      </div>
    </div>
  );
}

