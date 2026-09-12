import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, ThumbsUp, ThumbsDown, Share2, Heart, 
  Satellite, Bell, ChevronDown, ChevronUp, MessageSquare, 
  Send, Smile, MoreHorizontal, Radio, Tv, Eye, Sparkles,
  ExternalLink, Copy, Check, Flame, Settings, Shield, Calendar, Clock
} from 'lucide-react';
import type { Channel } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { useChannelThumbnails } from '../utils/useThumbnails';
import { EPGGuide } from './EPGGuide';
import { EPGQuickBar } from './EPGQuickBar';
import { useChannelEPG } from '../utils/useChannelEPG';

interface WatchPageProps {
  channel: Channel;
  recommendations: Channel[];
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onSelectChannel: (channel: Channel) => void;
  onShare: (channel: Channel) => void;
  onOpenSatelliteGuide: () => void;
  onBackToHome: () => void;
  isMinimized?: boolean;
  onMaximize?: () => void;
  onCloseMiniPlayer?: () => void;
  onToggleMinimize?: () => void;
  onOpenSettings?: () => void;
}

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  isSuper?: boolean;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  channel,
  recommendations,
  isFavorite,
  onToggleFavorite,
  onSelectChannel,
  onShare,
  onOpenSatelliteGuide,
  onBackToHome,
  isMinimized = false,
  onMaximize,
  onCloseMiniPlayer,
  onToggleMinimize,
  onOpenSettings,
}) => {
  const [theaterMode, setTheaterMode] = useState(false);
  const thumbnails = useChannelThumbnails();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showBellMenu, setShowBellMenu] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 8000 + 1200));
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [chatVisible, setChatVisible] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [rightTab, setRightTab] = useState<'epg' | 'chat'>('epg');

  // Electronic Program Guide (EPG) hook for current channel
  const epg = useChannelEPG(channel);

  // Initial simulated live chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'علی رضا', avatar: 'AR', text: 'کیفیت پخش عالیه، بدون هیچ قطعی کار می‌کنه 👏', time: 'هم‌اکنون' },
    { id: '2', user: 'سارا رضایی', avatar: 'SR', text: 'ممنون از کیفیت Full HD سرورها 🔥', time: '۱ دقیقه قبل' },
    { id: '3', user: 'Reza_Teh', avatar: 'RT', text: 'صدای استریم خیلی شفافه، دست مریزاد', time: '۲ دقیقه قبل' },
    { id: '4', user: 'مریم کمالی', avatar: 'MK', text: 'برنامه بعدی چی پخش میشه؟', time: '۳ دقیقه قبل' },
    { id: '5', user: 'Pouya88', avatar: 'P8', text: 'سرور مناسب ایران عالی کار میکنه بدون وی‌پی‌ان ❤️', time: '۴ دقیقه قبل' },
  ]);

  // Periodic random live viewer messages for realism
  useEffect(() => {
    const interval = setInterval(() => {
      const sampleNames = ['امید', 'نیلوفر', 'کاوه', 'Farhad', 'زهرا', 'شایان', 'Mahsa_M'];
      const sampleTexts = [
        'درود بر همه بینندگان عزیز 📺',
        'کیفیت تصویر ۱۰۸۰ واقعاً باحاله!',
        'با سرعت نت معمولی هم لود میشه عالیه',
        'فرکانس یاه‌ست رو چک کردم دقیق بود',
        'این کانال واقعاً برنامه‌هاش عالیه ❤️🔥',
        'سلام به دوستان',
        'پخش زنده پایدار و روونه مرسی',
      ];
      const randomUser = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
      const initials = randomUser.slice(0, 2).toUpperCase();

      setChatMessages((prev) => [
        ...prev.slice(-30),
        {
          id: Date.now().toString(),
          user: randomUser,
          avatar: initials,
          text: randomText,
          time: 'هم‌اکنون',
        },
      ]);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      user: 'شما (You)',
      avatar: 'ME',
      text: chatInput.trim(),
      time: 'هم‌اکنون',
      isSuper: true,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  const handleLike = () => {
    if (hasLiked) {
      setHasLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setHasLiked(true);
      if (hasDisliked) setHasDisliked(false);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleDislike = () => {
    if (hasDisliked) {
      setHasDisliked(false);
    } else {
      setHasDisliked(true);
      if (hasLiked) {
        setHasLiked(false);
        setLikesCount((prev) => prev - 1);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className={isMinimized ? 'contents' : 'w-full min-h-screen bg-[#0f0f0f] text-white p-3 md:p-6 text-right'}>
      {/* 1. The Video Player (Always mounted so stream never stops) */}
      <VideoPlayer
        channel={channel}
        theaterMode={theaterMode}
        onToggleTheater={() => setTheaterMode(!theaterMode)}
        isMinimized={isMinimized}
        onMaximize={onMaximize}
        onCloseMiniPlayer={onCloseMiniPlayer}
        onToggleMinimize={onToggleMinimize}
        onOpenSettings={onOpenSettings}
      />

      {/* 2. Watch Page Body (Hidden when player is minimized in the corner) */}
      {!isMinimized && (
        <div className={`mx-auto transition-all duration-300 mt-4 ${theaterMode ? 'max-w-[1720px]' : 'max-w-7xl'}`}>
          {/* Watch Page Grid: Main Column (Info) vs Right Column (Chat + Up Next) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Video Information Section */}
            <div className={theaterMode ? 'col-span-12' : 'col-span-12 lg:col-span-8'}>
              {/* Video Title */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-red-600/20 text-red-500 text-xs font-bold px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    پخش مستقیم
                  </span>
                  <span className="text-xs text-[#aaaaaa]">{channel.category}</span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-[#f1f1f1] leading-tight">
                  {channel.name}
                  {channel.nameEn && (
                    <span className="text-base text-[#aaaaaa] font-medium mr-2">
                      — {channel.nameEn}
                    </span>
                  )}
                </h1>
              </div>

            {/* Channel Info & Interactive Action Bar (Exact YouTube Style) */}
            <div className="mt-3 py-2 flex flex-wrap items-center justify-between gap-4 border-b border-[#272727] pb-4">
              {/* Channel Profile Info & Subscribe */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white font-black text-sm border border-white/20 shadow-md">
                  {channel.name.slice(0, 2)}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-[#f1f1f1]">
                    <span>{channel.name}</span>
                    <CheckCircle2 size={15} className="text-[#3ea6ff]" />
                  </div>
                  <div className="text-xs text-[#aaaaaa]">
                    {channel.subscribers || '۳۵۰K'} دنبال‌کننده
                  </div>
                </div>

                {/* YouTube Subscribe Button */}
                <button
                  type="button"
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className={`mr-2 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                    isSubscribed
                      ? 'bg-[#272727] text-[#f1f1f1] hover:bg-[#383838]'
                      : 'bg-white text-black hover:bg-[#d9d9d9]'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <Bell size={14} className="fill-current" />
                      <span>مشترک شدید</span>
                    </>
                  ) : (
                    <span>دنبال کردن</span>
                  )}
                </button>
              </div>

              {/* Action Buttons: Like/Dislike, Share, Favorite, Satellite */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Joined Pill: Like / Dislike */}
                <div className="flex items-center rounded-full bg-[#272727] hover:bg-[#333333] border border-[#3f3f3f] overflow-hidden text-xs text-[#f1f1f1]">
                  <button
                    type="button"
                    onClick={handleLike}
                    className={`px-3 py-2 flex items-center gap-1.5 border-l border-[#3f3f3f] transition-colors cursor-pointer ${
                      hasLiked ? 'text-red-500 font-bold' : 'hover:text-white'
                    }`}
                  >
                    <ThumbsUp size={16} className={hasLiked ? 'fill-current' : ''} />
                    <span>{likesCount.toLocaleString('fa-IR')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDislike}
                    className={`px-3 py-2 flex items-center transition-colors cursor-pointer ${
                      hasDisliked ? 'text-red-500' : 'hover:text-white'
                    }`}
                    title="نمی‌پسندم"
                  >
                    <ThumbsDown size={16} className={hasDisliked ? 'fill-current' : ''} />
                  </button>
                </div>

                {/* Favorite Button */}
                <button
                  type="button"
                  onClick={() => onToggleFavorite(channel.id)}
                  className={`px-3.5 py-2 rounded-full bg-[#272727] hover:bg-[#333333] border border-[#3f3f3f] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isFavorite ? 'text-red-500 fill-red-500 font-bold' : 'text-[#f1f1f1]'
                  }`}
                  title="علاقه‌مندی"
                >
                  <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
                  <span>{isFavorite ? 'ذخیره شد' : 'علاقه‌مندی'}</span>
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={() => onShare(channel)}
                  className="px-3.5 py-2 rounded-full bg-[#272727] hover:bg-[#333333] border border-[#3f3f3f] text-xs font-medium flex items-center gap-1.5 text-[#f1f1f1] transition-colors cursor-pointer"
                  title="اشتراک‌گذاری"
                >
                  <Share2 size={16} />
                  <span>اشتراک‌گذاری</span>
                </button>

                {/* Electronic Program Guide (EPG) Button */}
                <button
                  type="button"
                  onClick={() => setRightTab(rightTab === 'epg' ? 'chat' : 'epg')}
                  className={`px-3.5 py-2 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    rightTab === 'epg'
                      ? 'bg-red-600/20 border-red-500/50 text-red-300 font-bold'
                      : 'bg-[#272727] hover:bg-[#333333] border-[#3f3f3f] text-[#f1f1f1]'
                  }`}
                  title="جدول پخش برنامه‌ها (EPG)"
                >
                  <Calendar size={16} className="text-red-500" />
                  <span>جدول پخش (EPG)</span>
                  {epg.schedule?.currentProgram && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>

                {/* Satellite Guide Button */}
                <button
                  type="button"
                  onClick={onOpenSatelliteGuide}
                  className="px-3.5 py-2 rounded-full bg-[#272727] hover:bg-[#333333] border border-[#3f3f3f] text-xs font-medium flex items-center gap-1.5 text-[#f1f1f1] transition-colors cursor-pointer"
                  title="پارامترهای فرکانس"
                >
                  <Satellite size={16} className="text-[#ff4e4e]" />
                  <span className="hidden sm:inline">فرکانس ماهواره</span>
                </button>

                {/* Settings & Proxy Button */}
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="px-3.5 py-2 rounded-full bg-[#272727] hover:bg-[#333333] border border-[#3f3f3f] text-xs font-medium flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                    title="تنظیمات پخش، بافر و پروکسی تلگرام"
                  >
                    <Settings size={16} />
                    <span>تنظیمات و پروکسی</span>
                  </button>
                )}
              </div>
            </div>

            {/* Electronic Program Guide (EPG) Quick Bar */}
            <EPGQuickBar
              schedule={epg.schedule}
              onOpenFullGuide={() => setRightTab('epg')}
              isLoading={epg.isLoading}
            />

            {/* Collapsible YouTube Description Box */}
            <div 
              className={`mt-4 p-4 rounded-2xl bg-[#212121] hover:bg-[#262626] transition-colors border border-[#2d2d2d] cursor-pointer ${
                descriptionExpanded ? '' : 'line-clamp-4'
              }`}
              onClick={() => setDescriptionExpanded(!descriptionExpanded)}
            >
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#f1f1f1] mb-2">
                <span>{(channel.viewers || 12400).toLocaleString('fa-IR')} بیننده آنلاین</span>
                <span>·</span>
                <span>کیفیت پخش: Full HD 1080p 60fps</span>
                <span>·</span>
                <span>فرمت استریم: HLS m3u8</span>
              </div>

              <div className="text-sm text-[#e1e1e1] leading-relaxed">
                {channel.description}
              </div>

              {/* Satellite Details Table */}
              <div className="mt-3 pt-3 border-t border-[#333333] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-[#181818] p-2 rounded-lg">
                  <span className="text-[#888888] block">ماهواره:</span>
                  <span className="font-bold text-white">{channel.satellite || 'یاه‌ست / هاتبرد'}</span>
                </div>
                <div className="bg-[#181818] p-2 rounded-lg">
                  <span className="text-[#888888] block">فرکانس:</span>
                  <span className="font-bold text-white">{channel.frequency || '11900 MHz'}</span>
                </div>
                <div className="bg-[#181818] p-2 rounded-lg">
                  <span className="text-[#888888] block">پلاریزاسیون:</span>
                  <span className="font-bold text-white">{channel.polarization || 'افقی (H)'}</span>
                </div>
                <div className="bg-[#181818] p-2 rounded-lg">
                  <span className="text-[#888888] block">Symbol Rate:</span>
                  <span className="font-bold text-white">{channel.symbolRate || '27500'}</span>
                </div>
              </div>

              <div className="mt-2 text-xs font-bold text-white flex items-center gap-1">
                {descriptionExpanded ? (
                  <><span>نمایش کمتر</span> <ChevronUp size={15} /></>
                ) : (
                  <><span>بیشتر</span> <ChevronDown size={15} /></>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Chat & Electronic Program Guide & Up Next Recommendations */}
          <div className={theaterMode ? 'col-span-12 mt-6' : 'col-span-12 lg:col-span-4'}>
            
            {/* Dual Tab Switcher: EPG vs Live Chat */}
            <div className="flex items-center gap-1.5 p-1 mb-3.5 rounded-2xl bg-[#1c1c1c] border border-[#2c2c2c] shadow-md">
              <button
                type="button"
                onClick={() => setRightTab('epg')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  rightTab === 'epg'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Calendar size={15} />
                <span>جدول پخش (EPG)</span>
                {epg.schedule?.programs.length ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                    {epg.schedule.programs.length}
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => setRightTab('chat')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  rightTab === 'chat'
                    ? 'bg-neutral-800 text-white shadow-xs border border-neutral-700'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <MessageSquare size={15} />
                <span>چت زنده</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-600 text-white font-bold">
                  زنده
                </span>
              </button>
            </div>

            {/* Panel 1: Full EPG Guide */}
            {rightTab === 'epg' && (
              <div className="mb-6">
                <EPGGuide
                  channel={channel}
                  schedule={epg.schedule}
                  isLoading={epg.isLoading}
                  dateOffset={epg.dateOffset}
                  onSelectDateOffset={epg.setDateOffset}
                  selectedCategory={epg.selectedCategory}
                  onSelectCategory={epg.setSelectedCategory}
                  searchQuery={epg.searchQuery}
                  onSearchChange={epg.setSearchQuery}
                  filteredPrograms={epg.filteredPrograms}
                  reminders={epg.reminders}
                  onToggleReminder={epg.toggleReminder}
                  onRefresh={epg.refresh}
                />
              </div>
            )}

            {/* Panel 2: Live Chat Panel (YouTube Authenticity) */}
            {rightTab === 'chat' && (
              <div className="rounded-2xl border border-[#272727] bg-[#181818] overflow-hidden mb-6 shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#272727] bg-[#1f1f1f]">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-red-500" />
                    <span className="text-sm font-bold text-white">چت زنده بینندگان</span>
                    <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded">
                      زنده
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChatVisible(!chatVisible)}
                    className="text-xs text-[#aaaaaa] hover:text-white transition-colors"
                  >
                    {chatVisible ? 'مخفی کردن' : 'نمایش چت'}
                  </button>
                </div>

                {chatVisible && (
                  <>
                    {/* Messages Feed */}
                    <div className="p-3 h-72 overflow-y-auto space-y-2.5 text-xs">
                      {chatMessages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex items-start gap-2.5 p-1.5 rounded-lg transition-colors ${
                            msg.isSuper ? 'bg-red-950/40 border border-red-500/30' : 'hover:bg-[#222222]'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-neutral-700 to-neutral-600 flex items-center justify-center font-bold text-[9px] text-white shrink-0">
                            {msg.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-[#e1e1e1]">{msg.user}</span>
                              <span className="text-[10px] text-[#717171]">{msg.time}</span>
                            </div>
                            <p className="text-[#cccccc] mt-0.5 break-words leading-relaxed">
                              {msg.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input Box */}
                    <form onSubmit={handleSendMessage} className="p-2 border-t border-[#272727] bg-[#1a1a1a] flex items-center gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="ارسال پیام به چت زنده..."
                        className="flex-1 bg-[#121212] border border-[#333333] rounded-full px-3 py-1.5 text-xs text-white placeholder-[#717171] focus:outline-none focus:border-red-500"
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="p-1.5 rounded-full bg-red-600 text-white disabled:opacity-40 hover:bg-red-700 transition-colors"
                        title="ارسال"
                      >
                        <Send size={15} />
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* "Up Next" / Recommended Channels Rail */}
            <div>
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm font-bold text-white">شبکه‌های مرتبط و پیشنهادی</span>
                <span className="text-xs text-[#aaaaaa]">پخش خودکار فعال</span>
              </div>

              <div className="space-y-3">
                {recommendations.slice(0, 10).map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => onSelectChannel(rec)}
                    className="flex gap-3 group cursor-pointer p-1 rounded-xl hover:bg-[#1f1f1f] transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-36 aspect-video shrink-0 rounded-xl overflow-hidden bg-[#222222] border border-[#2e2e2e]">
                      {thumbnails[rec.id]?.dataUrl ? (
                        <img 
                          src={thumbnails[rec.id].dataUrl} 
                          alt={rec.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-neutral-800 to-neutral-700 flex flex-col items-center justify-center text-center p-1">
                          <Tv size={20} className="text-white/80" />
                          <span className="text-[11px] font-bold text-white truncate max-w-[110px] mt-1">
                            {rec.name}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold px-1 rounded">
                        زنده
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#f1f1f1] leading-snug line-clamp-2 group-hover:text-red-400 transition-colors">
                        {rec.name}
                      </h4>
                      <div className="text-[11px] text-[#aaaaaa] mt-1 truncate">
                        {rec.category}
                      </div>
                      <div className="text-[10px] text-[#717171] mt-0.5">
                        {rec.sources.length} مسیر استریم · {rec.subscribers || '۳۰۰K'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
