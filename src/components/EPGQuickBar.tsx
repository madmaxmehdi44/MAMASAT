import React from 'react';
import { Radio, Clock, ChevronLeft, Sparkles, Calendar, Film, Trophy, Newspaper, Tv } from 'lucide-react';
import type { EPGSchedule } from '../types';

interface EPGQuickBarProps {
  schedule: EPGSchedule | null;
  onOpenFullGuide?: () => void;
  isLoading?: boolean;
}

export const EPGQuickBar: React.FC<EPGQuickBarProps> = ({
  schedule,
  onOpenFullGuide,
  isLoading = false,
}) => {
  if (isLoading || !schedule) {
    return (
      <div className="mt-3 p-3 rounded-2xl bg-[#1e1e1e] border border-[#2b2b2b] animate-pulse flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-800" />
          <div className="space-y-1.5">
            <div className="w-32 h-3.5 bg-neutral-800 rounded" />
            <div className="w-48 h-2.5 bg-neutral-800/60 rounded" />
          </div>
        </div>
        <div className="w-24 h-6 bg-neutral-800 rounded-full" />
      </div>
    );
  }

  const { currentProgram, nextProgram, currentProgressPercent, remainingMinutes } = schedule;

  if (!currentProgram) {
    return null;
  }

  // Pick category icon
  const getCategoryIcon = () => {
    switch (currentProgram.category) {
      case 'sports':
        return <Trophy size={14} className="text-amber-400" />;
      case 'movie':
      case 'series':
        return <Film size={14} className="text-purple-400" />;
      case 'news':
        return <Newspaper size={14} className="text-sky-400" />;
      default:
        return <Tv size={14} className="text-red-400" />;
    }
  };

  return (
    <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#1c1c1c] via-[#212121] to-[#1c1c1c] border border-red-500/25 shadow-md hover:border-red-500/40 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left info: Live badge & Program title */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Live Indicator */}
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 text-[11px] font-bold border border-red-500/40">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>در حال پخش</span>
            </span>

            {/* Category Tag */}
            <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded-md border border-neutral-700/60">
              {getCategoryIcon()}
              <span>{currentProgram.categoryLabel}</span>
            </span>

            {/* Time Slot */}
            <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
              <Clock size={12} className="text-neutral-500" />
              <span>{currentProgram.startTime} تا {currentProgram.endTime}</span>
            </span>

            {currentProgram.seasonEpisode && (
              <span className="text-[10px] text-amber-300/90 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/30">
                {currentProgram.seasonEpisode}
              </span>
            )}
          </div>

          {/* Program Title */}
          <div className="flex items-center gap-2">
            <h3 className="text-sm md:text-base font-extrabold text-white truncate">
              {currentProgram.title}
            </h3>
            {currentProgram.ageRating && (
              <span className="text-[10px] text-neutral-400 border border-neutral-700 px-1 rounded">
                {currentProgram.ageRating}
              </span>
            )}
          </div>

          {/* Live Progress Bar */}
          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700/50">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${currentProgressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-neutral-400 font-mono shrink-0">
              {currentProgressPercent}٪ · {remainingMinutes} دقیقه مانده
            </span>
          </div>
        </div>

        {/* Right side: Next up & EPG button */}
        <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800/80">
          {nextProgram && (
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-neutral-400 block">برنامه بعدی ({nextProgram.startTime}):</span>
              <span className="text-xs font-semibold text-neutral-200 truncate max-w-[160px] block">
                {nextProgram.title}
              </span>
            </div>
          )}

          {onOpenFullGuide && (
            <button
              type="button"
              onClick={onOpenFullGuide}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700 shrink-0"
              title="مشاهده جدول کامل زمان‌بندی برنامه‌ها"
            >
              <Calendar size={14} className="text-red-400" />
              <span>جدول پخش (EPG)</span>
              <ChevronLeft size={14} className="text-neutral-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
