import React from 'react';
import { 
  Home, Compass, Radio, Heart, History, Satellite, Film, 
  Tv, Trophy, Music2, Sparkles, Smile, Globe2, ChevronRight,
  Flame, CheckCircle2
} from 'lucide-react';
import type { ActiveTab, Channel } from '../types';

interface SidebarProps {
  expanded: boolean;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  favoritesCount: number;
  featuredChannels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  activeChannelId?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  expanded,
  activeTab,
  onSelectTab,
  selectedCategory,
  onSelectCategory,
  favoritesCount,
  featuredChannels,
  onSelectChannel,
  activeChannelId,
}) => {
  const mainNavItems = [
    { id: 'home' as ActiveTab, label: 'خانه', icon: Home },
    { id: 'explore' as ActiveTab, label: 'کاوش', icon: Compass },
    { id: 'live' as ActiveTab, label: 'پخش زنده', icon: Radio, badge: 'زنده' },
    { id: 'favorites' as ActiveTab, label: 'علاقه‌مندی‌ها', icon: Heart, count: favoritesCount },
    { id: 'history' as ActiveTab, label: 'تاریخچه تماشا', icon: History },
    { id: 'satellite' as ActiveTab, label: 'راهنمای ماهواره', icon: Satellite },
  ];

  const categories = [
    { id: 'all', label: 'همه دسته‌ها', icon: Sparkles },
    { id: 'اخبار', label: 'اخبار و اطلاع‌رسانی', icon: Tv },
    { id: 'شبکه های جم', label: 'شبکه‌های جم (GEM)', icon: Film },
    { id: 'فیلم و سریال', label: 'فیلم و سریال', icon: Film },
    { id: 'ورزش', label: 'ورزش و فوتبال', icon: Trophy },
    { id: 'موزیک', label: 'موزیک و نماهنگ', icon: Music2 },
    { id: 'سرگرمی', label: 'سرگرمی و تفریح', icon: Flame },
    { id: 'کودک', label: 'کودک و نوجوان', icon: Smile },
    { id: 'رادیو', label: 'ایستگاه‌های رادیویی', icon: Radio },
  ];

  // If collapsed: YouTube mini-sidebar (icons stacked with small label)
  if (!expanded) {
    return (
      <aside className="w-[72px] shrink-0 bg-[#0f0f0f] border-l border-[#272727] py-3 hidden md:flex flex-col items-center gap-1 z-30 select-none">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-[64px] h-[72px] flex flex-col items-center justify-center gap-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'bg-[#272727] text-white font-semibold'
                  : 'text-[#aaaaaa] hover:bg-[#202020] hover:text-[#f1f1f1]'
              }`}
              title={item.label}
            >
              <Icon size={22} className={isActive ? 'text-red-500' : ''} />
              <span className="text-[10px] leading-tight text-center truncate max-w-[60px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </aside>
    );
  }

  // Expanded full sidebar
  return (
    <aside className="w-60 shrink-0 bg-[#0f0f0f] border-l border-[#272727] p-3 overflow-y-auto z-30 select-none text-right">
      {/* Primary navigation */}
      <div className="space-y-1 pb-3 border-b border-[#272727]">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-[#272727] text-white font-bold' 
                  : 'text-[#f1f1f1] hover:bg-[#202020]'
              }`}
            >
              <div className="flex items-center gap-4">
                <Icon size={20} className={isActive ? 'text-red-500' : 'text-[#f1f1f1]'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-red-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && item.count > 0 && (
                <span className="text-xs text-[#aaaaaa] bg-[#222222] px-2 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Categories section */}
      <div className="py-3 border-b border-[#272727]">
        <div className="px-3 pb-2 text-xs font-bold text-[#aaaaaa] uppercase tracking-wider">
          دسته‌بندی‌های پخش
        </div>
        <div className="space-y-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#272727] text-white font-bold'
                    : 'text-[#cccccc] hover:bg-[#202020] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} className={isSelected ? 'text-red-500' : 'text-[#888888]'} />
                  <span>{cat.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured / Top Persian TV Channels */}
      <div className="py-3">
        <div className="px-3 pb-2 text-xs font-bold text-[#aaaaaa] uppercase tracking-wider">
          شبکه‌های پربیننده
        </div>
        <div className="space-y-1">
          {featuredChannels.slice(0, 8).map((ch) => {
            const isCurrent = activeChannelId === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSelectChannel(ch)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                  isCurrent 
                    ? 'bg-red-600/20 text-red-400 font-bold border border-red-500/30' 
                    : 'text-[#e1e1e1] hover:bg-[#202020]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-700 flex items-center justify-center text-[10px] font-bold text-white border border-[#333333] shrink-0">
                    {ch.name.slice(0, 2)}
                  </div>
                  <div className="truncate text-right">
                    <div className="truncate font-medium flex items-center gap-1">
                      {ch.name}
                      <CheckCircle2 size={12} className="text-blue-400 shrink-0" />
                    </div>
                    <div className="text-[10px] text-[#888888] truncate">{ch.category}</div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-[#272727] px-3 text-[11px] text-[#717171] leading-relaxed">
        <p className="font-semibold text-[#888888]">MOMSAT YouTube TV</p>
        <p className="mt-1">طراحی شده با الهام از معماری و ظرافت یوتیوب برای پخش زنده ۳۴۰+ شبکه ماهواره‌ای</p>
        <p className="mt-2 text-[10px]">نسخه ۲.۴ · پایدار و بدون قطعی</p>
      </div>
    </aside>
  );
};
