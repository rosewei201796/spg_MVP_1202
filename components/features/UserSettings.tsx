"use client";

import { useState } from "react";
import { X, User, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserSettingsProps {
  currentUsername: string;
  onUpdateUsername: (newUsername: string) => void;
  onUpdatePassword: (oldPassword: string, newPassword: string) => void;
  onLogout: () => void;
  onClose: () => void;
}

export function UserSettings({
  currentUsername,
  onUpdateUsername,
  onUpdatePassword,
  onLogout,
  onClose,
}: UserSettingsProps) {
  const [newUsername, setNewUsername] = useState(currentUsername);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateUsername = () => {
    if (newUsername.trim() && newUsername !== currentUsername) {
      onUpdateUsername(newUsername);
      alert('Username updated successfully!');
    }
  };

  const handleUpdatePassword = () => {
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      alert('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (newPassword.length < 4) {
      alert('Password must be at least 4 characters');
      return;
    }

    onUpdatePassword(oldPassword, newPassword);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#121212] border-4 border-hot-pink hard-shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-hot-pink p-4 border-b-4 border-black flex justify-between items-center">
          <h3 className="text-xl font-black uppercase text-black flex items-center gap-2">
            <User size={20} />
            SETTINGS
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white border-3 border-black hard-shadow-sm flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] transition-all"
          >
            <X size={20} className="text-black" strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Username Section */}
          <div>
            <label className="text-xs text-electric-blue font-black uppercase tracking-wider mb-3 block">
              USERNAME
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="flex-1 bg-white border-4 border-black p-3 text-sm text-black font-bold uppercase focus:outline-none focus:border-hot-pink"
              />
              <button
                onClick={handleUpdateUsername}
                disabled={!newUsername.trim() || newUsername === currentUsername}
                className={cn(
                  "px-4 py-3 border-4 border-black hard-shadow-sm transition-all flex items-center justify-center",
                  !newUsername.trim() || newUsername === currentUsername
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-neon-orange text-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]"
                )}
              >
                <Check size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-1 bg-white/10"></div>

          {/* Password Section */}
          <div>
            <label className="text-xs text-electric-blue font-black uppercase tracking-wider mb-3 block">
              CHANGE PASSWORD
            </label>
            <div className="space-y-3">
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Current password"
                className="w-full bg-white border-4 border-black p-3 text-sm text-black font-bold placeholder:text-gray-400 focus:outline-none focus:border-hot-pink"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full bg-white border-4 border-black p-3 text-sm text-black font-bold placeholder:text-gray-400 focus:outline-none focus:border-hot-pink"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-white border-4 border-black p-3 text-sm text-black font-bold placeholder:text-gray-400 focus:outline-none focus:border-hot-pink"
              />
              <button
                onClick={handleUpdatePassword}
                disabled={!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
                className={cn(
                  "w-full py-3 border-4 border-black hard-shadow-sm transition-all flex items-center justify-center gap-2 font-black text-sm uppercase",
                  !oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-neon-orange text-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]"
                )}
              >
                <Lock size={18} />
                UPDATE PASSWORD
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-1 bg-white/10"></div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full py-4 bg-gray-800 text-white border-4 border-black hard-shadow transition-all font-black text-base uppercase active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#000]"
          >
            LOGOUT
          </button>
        </div>
      </div>
    </div>
  );
}

