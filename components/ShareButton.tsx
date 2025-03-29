import React from 'react';
import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  onClick: () => void;
  className?: string;
  isLoading?: boolean;
  text?: string;
}

export function ShareButton({ onClick, className, isLoading = false, text = "LEADERBOARD" }: ShareButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "px-8 py-3 bg-[#33FFB8] text-black font-bold rounded-full",
        "transition-all duration-300 ease-out",
        "hover:bg-[#33FFB8]/90 hover:shadow-[0_0_15px_rgba(51,255,184,0.5)]",
        "active:scale-95",
        "flex items-center justify-center gap-2",
        "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-[#33FFB8] disabled:active:scale-100",
        className
      )}
    >
      <span>{isLoading ? "GENERATING..." : text}</span>
      <Share2 className="w-4 h-4" />
    </button>
  );
} 