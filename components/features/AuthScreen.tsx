"use client";

import { useState } from "react";
import { Zap, User, Lock, RefreshCw, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthScreenProps {
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, password: string) => void;
  onAutoRegister: () => void;
  error?: string;
}

export function AuthScreen({ onLogin, onRegister, onAutoRegister, error }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    if (mode === 'login') {
      onLogin(username, password);
    } else {
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      onRegister(username, password);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#121212] flex flex-col items-center justify-center p-6 overflow-y-auto">
      {/* Logo */}
      <div className="mb-10 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-hot-pink border-4 border-black hard-shadow flex items-center justify-center">
            <Zap size={32} className="text-black" fill="black" strokeWidth={2} />
          </div>
        </div>
        
        {/* Poetic Title */}
        <div className="max-w-sm mx-auto">
          <h1 className="text-white text-2xl font-bold italic leading-relaxed tracking-wide">
            A universe in a grain of sand.
          </h1>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-white border-4 border-black hard-shadow-lg p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('login')}
            className={cn(
              "flex-1 py-3 font-black text-sm uppercase border-3 border-black transition-all",
              mode === 'login'
                ? "bg-hot-pink text-black hard-shadow-sm"
                : "bg-gray-300 text-gray-600"
            )}
          >
            <LogIn size={16} className="inline mr-2" />
            LOGIN
          </button>
          <button
            onClick={() => setMode('register')}
            className={cn(
              "flex-1 py-3 font-black text-sm uppercase border-3 border-black transition-all",
              mode === 'register'
                ? "bg-electric-blue text-black hard-shadow-sm"
                : "bg-gray-300 text-gray-600"
            )}
          >
            <User size={16} className="inline mr-2" />
            REGISTER
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500 border-3 border-black text-white font-bold text-sm uppercase">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-xs text-black font-black uppercase tracking-wider mb-2 block">
              USERNAME
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-gray-100 border-4 border-black p-3 pl-10 text-sm text-black font-bold uppercase focus:outline-none focus:border-hot-pink"
              />
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-black font-black uppercase tracking-wider mb-2 block">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-gray-100 border-4 border-black p-3 pl-10 text-sm text-black font-bold uppercase focus:outline-none focus:border-hot-pink"
              />
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="text-xs text-black font-black uppercase tracking-wider mb-2 block">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full bg-gray-100 border-4 border-black p-3 pl-10 text-sm text-black font-bold uppercase focus:outline-none focus:border-hot-pink"
                />
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!username.trim() || !password.trim() || (mode === 'register' && !confirmPassword.trim())}
            className={cn(
              "w-full py-4 font-black text-base uppercase border-4 border-black hard-shadow transition-all flex items-center justify-center gap-2",
              !username.trim() || !password.trim() || (mode === 'register' && !confirmPassword.trim())
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-hot-pink text-black active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#000]"
            )}
          >
            {mode === 'login' ? <LogIn size={20} /> : <User size={20} />}
            {mode === 'login' ? 'LOGIN' : 'REGISTER'}
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-1 bg-black"></div>
          <span className="text-xs text-black font-black uppercase">OR</span>
          <div className="flex-1 h-1 bg-black"></div>
        </div>

        {/* Quick Start */}
        <button
          onClick={onAutoRegister}
          className="w-full py-4 bg-neon-orange text-black font-black text-base uppercase border-4 border-black hard-shadow transition-all flex items-center justify-center gap-2 active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#000]"
        >
          <RefreshCw size={20} />
          QUICK START
        </button>
        <p className="text-center text-xs text-gray-600 font-bold uppercase mt-2">
          Auto-generate username
        </p>
      </div>

      {/* Bottom Info */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-xs font-bold uppercase mb-1">
          Your creations are saved locally
        </p>
        <p className="text-electric-blue text-[10px] italic">
          To see a world in a grain of sand…
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-16 h-16 border-4 border-hot-pink opacity-50" />
      <div className="absolute bottom-10 right-10 w-20 h-20 border-4 border-electric-blue opacity-50" />
    </div>
  );
}

