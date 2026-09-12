import React, { useState } from 'react';
import { 
  Calendar, Clock, Bell, BellRing, Search, RefreshCw, 
  ChevronDown, ChevronUp, Trophy, Film, Newspaper, Tv, 
  Sparkles, Check, Info, Radio, Share2, Filter, AlertCircle 
} from 'lucide-react';
import type { Channel, EPGProgram, EPGProgramCategory, EPGSchedule } from '../types';

interface EPGGuideProps {
  channel: Channel;
  schedule: EPGSchedule | null;
  isLoading: boolean;
  dateOffset: number;
  onSelectDateOffset: (offset: number) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filteredPrograms: EPGProgram[];
  reminders: string[];
  onToggleReminder: (programId: string) => boolean;
  onRefresh: () => void;
}

const CATEGORIES: { id: string; label: string; icon?: React.ReactNode }[] = [
  { id: 'all', label: 'همه برنامه‌ها' },
  { id: 'sports', label: 'ورزشی', icon: <Trophy size={13} /> },
  { id: 'series', label: 'سریال', icon: <Film size={13} /> },
  { id: 'movie', label: 'سینمایی', icon: <Film size={13} /> },
  { id: 'news', label: 'خبری', icon: <Newspaper size={13} /> },
  { id: 'entertainment', label: 'سرگرمی', icon: <Sparkles size={13} /> },
  { id: 'documentary', label: 'مستند', icon: <Tv size={13} /> },
  { id: 'animation', label: 'کودک', icon: <Sparkles size={13} /> },
  { id: 'music', label: 'موسیقی', icon: <Radio size={13} /> },
];

export const EPGGuide: React.FC<EPGGuideProps> = ({
  channel,
  schedule,
  isLoading,
  dateOffset,
  onSelectDateOffset,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  filteredPrograms,
  reminders,
  onToggleReminder,
  onRefresh,
}) => {
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedProgramId((prev) => (prev === id ? null : id));
  };

  const handleReminderClick = (e: React.MouseEvent, program: EPGProgram) => {
    e.stopPropagation();
    const isSaved = onToggleReminder(program.id);
    if (isSaved) {
      setToastMessage(`🔔 یادآور برای برنامه «${program.title}» (ساعت ${program.startTime}) فعال شد.`);
    } else {
      setToastMessage(`🔕 یادآور برنامه «${program.title}» حذف شد.`);
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Determine category icon
  const getProgramIcon = (cat: EPGProgramCategory) => {
    switch (cat) {
      case 'sports':
        return <Trophy size={15} className="text-amber-400" />;
      case 'movie':
      case 'series':
        return <Film size={15} className="text-purple-400" />;
      case 'news':
        return <Newspaper size={15} className="text-sky-400" />;
      case 'documentary':
        return <Tv size={15} className="text-emerald-400" />;
      case 'music':
        return <Radio size={15} className="text-pink-400" />;
      default:
        return <Sparkles size={15} className="text-red-400" />;
    }
  };

  const nowMs = Date.now();

  return (
    <div className="rounded-2xl border border-[#272727] bg-[#181818] overflow-hidden shadow-xl flex flex-col h-full text-right select-none">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-neutral-900/95 border border-amber-500/40 text-amber-200 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <BellRing size={16} className="text-amber-400 animate-bounce" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Channel Title */}
      <div className="px-4 py-3 border-b border-[#272727] bg-[#1f1f1f] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-red-600/10 text-red-500 border border-red-500/20">
            <Calendar size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">جدول زمان‌بندی برنامه‌ها (EPG)</h3>
              <span className="text-[10px] bg-[#2d2d2d] text-neutral-300 px-1.5 py-0.5 rounded font-mono">
                ۲۴ ساعته
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              شبکه {channel.name} · {schedule?.dayLabel || 'امروز'}
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          title="بروزرسانی جدول پخش"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 2. Day Switcher Tabs */}
      <div className="p-2.5 bg-[#141414] border-b border-[#272727] flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-1">
          <button
            type="button"
            onClick={() => onSelectDateOffset(-1)}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
              dateOffset === -1 
                ? 'bg-neutral-700 text-white shadow-xs' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            دیروز
          </button>
          <button
            type="button"
            onClick={() => onSelectDateOffset(0)}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              dateOffset === 0 
                ? 'bg-red-600 text-white shadow-md' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>امروز (زنده)</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectDateOffset(1)}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
              dateOffset === 1 
                ? 'bg-neutral-700 text-white shadow-xs' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            فردا
          </button>
        </div>
      </div>

      {/* 3. Search & Category Filters */}
      <div className="p-3 border-b border-[#272727] bg-[#1a1a1a] space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="جستجوی عنوان برنامه، فیلم یا سریال..."
            className="w-full bg-[#121212] border border-[#2f2f2f] rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 hover:text-white bg-neutral-800 px-1.5 py-0.5 rounded cursor-pointer"
            >
              پاک کردن
            </button>
          )}
        </div>

        {/* Category Horizontal Scroll Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-white text-black font-bold shadow-xs'
                  : 'bg-[#252525] text-neutral-300 hover:bg-[#303030] hover:text-white'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Programs Timeline Feed */}
      <div className="p-3 overflow-y-auto max-h-[460px] space-y-2.5 divide-y divide-neutral-800/40">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw size={24} className="text-red-500 animate-spin" />
            <span className="text-xs text-neutral-400">در حال دریافت جدول زمان‌بندی برنامه‌ها...</span>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-2 text-neutral-400">
            <AlertCircle size={24} className="text-neutral-500" />
            <span className="text-xs font-bold text-neutral-300">برنامه‌ای مطابق با فیلتر شما یافت نشد</span>
            <span className="text-[11px] text-neutral-500">فیلتر دسته‌بندی یا جستجو را تغییر دهید.</span>
          </div>
        ) : (
          filteredPrograms.map((program) => {
            const isCurrent = dateOffset === 0 && program.startTimestamp <= nowMs && nowMs < program.endTimestamp;
            const isPast = dateOffset < 0 || (dateOffset === 0 && nowMs >= program.endTimestamp);
            const isUpcoming = dateOffset > 0 || (dateOffset === 0 && nowMs < program.startTimestamp);
            const isReminder = reminders.includes(program.id);
            const isExpanded = expandedProgramId === program.id;

            return (
              <div
                key={program.id}
                onClick={() => toggleExpand(program.id)}
                className={`pt-2.5 first:pt-0 transition-all rounded-xl p-2.5 cursor-pointer border ${
                  isCurrent 
                    ? 'bg-gradient-to-r from-red-950/40 via-[#221515] to-[#1c1c1c] border-red-500/50 shadow-md ring-1 ring-red-500/30' 
                    : isPast 
                      ? 'bg-[#151515]/70 border-neutral-800/40 opacity-70 hover:opacity-100 hover:bg-[#1a1a1a]' 
                      : 'bg-[#1c1c1c] border-neutral-800 hover:border-neutral-700 hover:bg-[#202020]'
                }`}
              >
                {/* Header Row: Time & Badges */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {/* Time Slot */}
                    <div className={`flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-md font-bold ${
                      isCurrent 
                        ? 'bg-red-600 text-white' 
                        : isPast 
                          ? 'bg-neutral-800 text-neutral-400' 
                          : 'bg-neutral-800 text-neutral-200'
                    }`}>
                      <Clock size={12} />
                      <span>{program.startTime} - {program.endTime}</span>
                    </div>

                    {/* Status Pill */}
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-900/40 border border-red-500/40 px-1.5 py-0.5 rounded-full">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                        </span>
                        <span>هم‌اکنون</span>
                      </span>
                    )}

                    {isPast && (
                      <span className="text-[10px] text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded">
                        پایان یافته
                      </span>
                    )}

                    {isUpcoming && dateOffset === 0 && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        برنامه آینده
                      </span>
                    )}
                  </div>

                  {/* Right side icons: Category & Reminder */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1 bg-neutral-800/80 px-1.5 py-0.5 rounded">
                      {getProgramIcon(program.category)}
                      <span className="hidden sm:inline">{program.categoryLabel}</span>
                    </span>

                    {/* Reminder toggle button for upcoming */}
                    {isUpcoming && (
                      <button
                        type="button"
                        onClick={(e) => handleReminderClick(e, program)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isReminder
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800'
                        }`}
                        title={isReminder ? 'حذف یادآور' : 'تنظیم یادآور برای این برنامه'}
                      >
                        {isReminder ? <BellRing size={14} className="fill-amber-400" /> : <Bell size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Title and details */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs md:text-sm font-bold truncate ${
                      isCurrent ? 'text-white font-extrabold' : 'text-neutral-200'
                    }`}>
                      {program.title}
                    </h4>
                    {program.subtitle && (
                      <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                        {program.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-neutral-400 mt-1">
                    <span className="text-[10px] font-mono">{program.durationMinutes} دقیقه</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>

                {/* Live progress bar for current program */}
                {isCurrent && schedule && (
                  <div className="mt-2 pt-2 border-t border-red-950/60">
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1 font-mono">
                      <span>پیشرفت برنامه: {schedule.currentProgressPercent}٪</span>
                      <span className="text-red-400 font-bold">{schedule.remainingMinutes} دقیقه باقی‌مانده</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 rounded-full"
                        style={{ width: `${schedule.currentProgressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Accordion Expand Details */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-neutral-800/80 text-xs text-neutral-300 space-y-2 animate-in fade-in duration-200">
                    <p className="text-[11px] leading-relaxed text-neutral-300">
                      {program.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                      {program.ageRating && (
                        <span className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-300 border border-neutral-700">
                          رده سنی: {program.ageRating}
                        </span>
                      )}
                      {program.seasonEpisode && (
                        <span className="bg-amber-950/50 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                          {program.seasonEpisode}
                        </span>
                      )}
                      {program.directorOrHost && (
                        <span className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">
                          {program.directorOrHost}
                        </span>
                      )}
                      {program.tags?.map((tag, idx) => (
                        <span key={idx} className="text-red-400 bg-red-950/30 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Footer Summary */}
      <div className="px-4 py-2 bg-[#151515] border-t border-[#272727] flex items-center justify-between text-[11px] text-neutral-400">
        <span>مجموع برنامه‌ها: {filteredPrograms.length}</span>
        {schedule?.nextProgram && (
          <span className="text-neutral-300 truncate max-w-[200px]">
            برنامه بعدی: {schedule.nextProgram.title} ({schedule.nextProgram.startTime})
          </span>
        )}
      </div>
    </div>
  );
};
