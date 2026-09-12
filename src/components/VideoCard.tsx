import React, { useState } from 'react';
import { 
  CheckCircle2, MoreVertical, Heart, Share2, Copy, 
  Tv, Radio, Satellite, Play, Eye, Sparkles, Camera 
} from 'lucide-react';
import type { Channel } from '../types';
import { useSingleChannelThumbnail } from '../utils/useThumbnails';
import { getTodayDateString } from '../utils/thumbnailStorage';

interface VideoCardProps {
  channel: Channel;
  isFavorite: boolean;
  onToggleFavorite: (channelId: number) => void;
  onSelectChannel: (channel: Channel) => void;
  onShare: (channel: Channel) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  channel,
  isFavorite,
  onToggleFavorite,
  onSelectChannel,
  onShare,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const thumbnail = useSingleChannelThumbnail(channel.id);
  const isToday = thumbnail ? thumbnail.dateString === getTodayDateString() : false;

  // Generate distinct elegant color gradients for channel avatars/posters
  const getGradient = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hues = [
      'from-red-600 to-rose-900',
      'from-blue-600 to-indigo-900',
      'from-amber-600 to-orange-900',
      'from-emerald-600 to-teal-900',
      'from-purple-600 to-violet-900',
      'from-pink-600 to-rose-900',
      'from-cyan-600 to-blue-900',
    ];
    return hues[hash % hues.length];
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(channel.url || window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowMenu(false);
    }, 1500);
  };

  const formatViewers = (count?: number) => {
    if (!count) return '۱۲.۴K';
    if (count > 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div 
      className="flex flex-col group cursor-pointer text-right"
      onClick={() => onSelectChannel(channel)}
    >
      {/* 16:9 Thumbnail Shell */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#181818] border border-[#272727] group-hover:rounded-none group-hover:border-[#383838] transition-all duration-200 shadow-sm">
        {/* Real Daily Video Screenshot (or dynamic studio gradient if not captured yet) */}
        {thumbnail?.dataUrl ? (
          <div className="w-full h-full relative overflow-hidden bg-black">
            <img
              src={thumbnail.dataUrl}
              alt={channel.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {/* Subtle bottom gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

            {/* Watermark Logo & Channel Name */}
            <div className="absolute bottom-2.5 right-2 z-20 flex items-center gap-1.5 pointer-events-none">
              <div className="w-5 h-5 rounded-md bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Tv size={12} className="text-white" />
              </div>
              <span className="text-xs font-bold text-white drop-shadow truncate max-w-[130px]">
                {channel.name}
              </span>
            </div>

            {/* YouTube Play Icon on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 z-20">
              <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl pl-1 transform group-hover:scale-110 transition-transform">
                <Play size={24} fill="currentColor" />
              </div>
            </div>
          </div>
        ) : (
          /* Dynamic Studio Gradient Card Canvas */
          <div className={`w-full h-full bg-gradient-to-tr ${getGradient(channel.name)} flex flex-col items-center justify-center p-4 relative`}>
            {/* Subtle geometric pattern overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Central Logo & Typography */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Tv size={28} className="text-white drop-shadow-md" />
              </div>
              <div className="mt-2.5 font-black text-lg text-white drop-shadow tracking-wide max-w-[200px] truncate">
                {channel.name}
              </div>
              {channel.nameEn && (
                <div className="text-[11px] font-semibold text-white/80 uppercase tracking-widest truncate max-w-[180px]">
                  {channel.nameEn}
                </div>
              )}
            </div>

            {/* YouTube Play Icon on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 z-20">
              <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl pl-1 transform group-hover:scale-110 transition-transform">
                <Play size={24} fill="currentColor" />
              </div>
            </div>
          </div>
        )}

        {/* Top-Right Badge: Live pulsating badge */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 bg-red-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-md backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>زنده</span>
        </div>

        {/* Top-Left Badge: Stream Quality */}
        <div className="absolute top-2.5 left-2.5 z-20 bg-black/70 backdrop-blur-md text-[#e1e1e1] text-[10px] font-bold px-2 py-0.5 rounded border border-white/10">
          HD 1080p
        </div>

        {/* Screenshot Date Badge (When thumbnail exists) */}
        {thumbnail && (
          <div className="absolute bottom-2 left-2 z-20 bg-emerald-950/85 border border-emerald-500/40 backdrop-blur-md text-emerald-300 text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
            <Camera size={11} />
            <span>{isToday ? 'شات امروز' : 'شات دیروز'}</span>
          </div>
        )}

        {/* Bottom-Right Overlay: Viewers Counter (shown when no thumbnail text collision or at left) */}
        {!thumbnail && (
          <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 bg-black/80 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded">
            <Eye size={12} className="text-red-400" />
            <span>{formatViewers(channel.viewers)} بیننده</span>
          </div>
        )}
      </div>

      {/* Video Details & Meta */}
      <div className="flex gap-3 mt-3 px-0.5">
        {/* Channel Avatar Circle */}
        <div className="shrink-0 mt-0.5">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(channel.name)} flex items-center justify-center text-white text-xs font-bold border border-white/20 shadow-sm`}>
            {channel.name.slice(0, 2)}
          </div>
        </div>

        {/* Title, Channel Name, Views */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm md:text-[15px] font-bold text-[#f1f1f1] leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {channel.name}
            {channel.nameEn && (
              <span className="text-[#aaaaaa] font-normal text-xs mr-1.5">
                ({channel.nameEn})
              </span>
            )}
          </h3>

          <div className="flex items-center gap-1 mt-1 text-xs text-[#aaaaaa]">
            <span className="hover:text-white transition-colors">{channel.category}</span>
            <CheckCircle2 size={13} className="text-[#3ea6ff] shrink-0" />
            <span>·</span>
            <span>{channel.subscribers || '۳۵۰K'} دنبال‌کننده</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#888888] mt-0.5">
            <span>{channel.satellite || 'یاه‌ست ۵۲.۵E'}</span>
            <span>·</span>
            <span>پخش ۲۴ ساعته</span>
          </div>
        </div>

        {/* 3-Dots Action Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 text-[#aaaaaa] hover:text-white hover:bg-[#272727] rounded-full transition-colors"
            title="گزینه‌ها"
            aria-label="گزینه‌ها"
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <div 
              className="absolute left-0 top-8 w-52 bg-[#282828] border border-[#3f3f3f] rounded-xl shadow-2xl py-1.5 z-40 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  onToggleFavorite(channel.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-[#383838] text-right text-[#f1f1f1] transition-colors"
              >
                <Heart size={15} className={isFavorite ? 'text-red-500 fill-red-500' : ''} />
                <span>{isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onShare(channel);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-[#383838] text-right text-[#f1f1f1] transition-colors"
              >
                <Share2 size={15} />
                <span>اشتراک‌گذاری شبکه</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-[#383838] text-right text-[#f1f1f1] transition-colors"
              >
                <Copy size={15} />
                <span>{copied ? 'لینک کپی شد!' : 'کپی آدرس استریم'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
