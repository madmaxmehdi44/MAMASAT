import React, { useRef, useEffect } from 'react';
import { Maximize2, X, Play, Pause, Tv, Volume2, VolumeX } from 'lucide-react';
import type { Channel } from '../types';

interface MiniPlayerProps {
  channel: Channel;
  onMaximize: () => void;
  onClose: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  channel,
  onMaximize,
  onClose,
}) => {
  return (
    <aside 
      className="fixed bottom-4 left-4 z-50 w-72 sm:w-80 bg-[#181818] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden text-right select-none animate-in fade-in slide-in-from-bottom-5 duration-300"
      aria-label="پلیر شناور تصویر در تصویر"
    >
      {/* Video Container / Poster */}
      <div 
        className="relative aspect-video bg-black flex items-center justify-center cursor-pointer group"
        onClick={onMaximize}
      >
        <div className="w-full h-full bg-gradient-to-tr from-neutral-900 via-neutral-800 to-red-950 flex flex-col items-center justify-center text-center p-3">
          <Tv size={28} className="text-red-500 drop-shadow" />
          <span className="font-bold text-sm text-white mt-1 truncate max-w-[200px]">
            {channel.name}
          </span>
          <span className="text-[10px] text-[#aaaaaa] mt-0.5">
            در حال پخش زنده
          </span>
        </div>

        {/* Hover overlay with expand hint */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <div className="flex items-center gap-1.5 bg-black/80 px-3 py-1.5 rounded-full text-xs font-bold text-white">
            <Maximize2 size={14} />
            <span>بزرگ‌نمایی</span>
          </div>
        </div>

        {/* Top-Right Close & Maximize buttons */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full bg-black/70 hover:bg-red-600 text-white transition-colors"
            title="بستن پلیر"
          >
            <X size={14} />
          </button>
        </div>

        {/* Live Badge */}
        <div className="absolute bottom-2 right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
          زنده
        </div>
      </div>

      {/* Mini Controls Bar */}
      <div className="p-2.5 flex items-center justify-between bg-[#212121] border-t border-[#2e2e2e]">
        <div className="flex-1 min-w-0 ml-2">
          <div className="font-bold text-xs text-white truncate">
            {channel.name}
          </div>
          <div className="text-[10px] text-[#888888] truncate">
            {channel.category}
          </div>
        </div>

        <button
          type="button"
          onClick={onMaximize}
          className="p-1.5 rounded-lg bg-[#2e2e2e] hover:bg-[#3d3d3d] text-[#e1e1e1] hover:text-white transition-colors"
          title="بازگشت به صفحه تماشا"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </aside>
  );
};
