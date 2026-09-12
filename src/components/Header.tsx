import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Search, Bell, Moon, Sun, Tv, X, Mic, Check, 
  Satellite, Heart, Flame, ShieldAlert, Sparkles, SlidersHorizontal,
  Settings, Shield, Send, Radio, Wifi
} from 'lucide-react';
import type { Channel } from '../types';
import { useSettings } from '../utils/useSettings';

interface HeaderProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectChannel: (channel: Channel) => void;
  channels: Channel[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSatelliteGuide: () => void;
  onOpenSettings: () => void;
  favoritesCount: number;
  onGoToFavorites: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onSelectChannel,
  channels,
  darkMode,
  onToggleDarkMode,
  onOpenSatelliteGuide,
  onOpenSettings,
  favoritesCount,
  onGoToFavorites,
  onGoHome,
}) => {
  const { settings, isProxyActive, activeProxyLabel } = useSettings();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Suggestions matching search query
  const suggestions = searchQuery.trim().length > 0 
    ? channels
        .filter(c => 
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.nameEn && c.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
          c.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 8)
    : [];

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVoiceSearch = () => {
    setVoiceActive(true);
    setTimeout(() => {
      setVoiceActive(false);
    }, 2500);
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-3 md:px-5 h-14 bg-[#0f0f0f] border-b border-[#272727] text-white">
      {/* Right side in RTL: Hamburger menu & Logo */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button
          id="btn-toggle-sidebar"
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-full hover:bg-[#272727] active:bg-[#3f3f3f] text-[#f1f1f1] transition-colors"
          title="منوی راهنما"
          aria-label="منو"
        >
          <Menu size={22} />
        </button>

        <button
          id="btn-logo-home"
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-1.5 group select-none text-right"
          title="صفحه اصلی MOMSAT YouTube TV"
        >
          {/* YouTube-style Play Badge */}
          <div className="relative flex items-center justify-center w-8 h-6 bg-[#ff0000] rounded-lg shadow-sm group-hover:bg-[#cc0000] transition-colors">
            <div className="w-0 h-0 border-y-[4.5px] border-y-transparent border-l-[8px] border-l-white ml-0.5" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold tracking-tight text-xl font-['Plus_Jakarta_Sans'] text-white">
              MOMSAT
            </span>
            <span className="text-xs font-bold text-[#ff0000] tracking-wider uppercase font-['Plus_Jakarta_Sans']">
              TV
            </span>
            <span className="bg-[#ff0000]/20 text-[#ff4e4e] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#ff0000]/30 mr-1 hidden sm:inline-block">
              زنده
            </span>
          </div>
        </button>
      </div>

      {/* Center: YouTube Search Bar */}
      <div 
        ref={searchContainerRef}
        className="relative flex-1 max-w-[620px] mx-2 md:mx-6 hidden sm:flex items-center"
      >
        <div className="flex items-center w-full rounded-full border border-[#303030] bg-[#121212] focus-within:border-[#1c62b9] focus-within:ring-1 focus-within:ring-[#1c62b9] overflow-hidden transition-all">
          <div className="relative flex-1 flex items-center pr-3.5 pl-2">
            <input
              id="input-youtube-search"
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="جستجو در بین ۳۴۰+ شبکه ماهواره‌ای، نام، فرکانس یا دسته..."
              className="w-full py-2 bg-transparent text-sm text-[#f1f1f1] placeholder-[#888888] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  setShowSuggestions(false);
                }}
                className="p-1 text-[#aaaaaa] hover:text-white rounded-full transition-colors"
                title="پاک کردن جستجو"
              >
                <X size={16} />
              </button>
            )}
            {!searchQuery && (
              <span className="text-[11px] text-[#717171] border border-[#3f3f3f] rounded px-1.5 py-0.5 pointer-events-none hidden md:inline">
                /
              </span>
            )}
          </div>

          <button
            id="btn-search-submit"
            type="button"
            className="px-5 py-2.5 bg-[#222222] hover:bg-[#2a2a2a] border-r border-[#303030] text-[#f1f1f1] flex items-center justify-center transition-colors shrink-0"
            title="جستجو"
          >
            <Search size={18} />
          </button>
        </div>

        {/* Voice Search Button */}
        <button
          id="btn-voice-search"
          type="button"
          onClick={handleVoiceSearch}
          className={`mr-2 p-2.5 rounded-full ${
            voiceActive ? 'bg-red-600 text-white animate-pulse' : 'bg-[#222222] hover:bg-[#2a2a2a] text-[#f1f1f1]'
          } transition-colors shrink-0`}
          title={voiceActive ? 'در حال گوش دادن...' : 'جستجوی صوتی'}
        >
          <Mic size={18} />
        </button>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-12 inset-x-0 bg-[#212121] border border-[#383838] rounded-2xl shadow-2xl py-2 z-50 max-h-[380px] overflow-y-auto">
            <div className="px-3 py-1.5 text-xs text-[#aaaaaa] font-medium border-b border-[#303030] mb-1">
              پیشنهادهای سریع شبکه‌ها
            </div>
            {suggestions.map((channel) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => {
                  onSelectChannel(channel);
                  setShowSuggestions(false);
                }}
                className="w-full px-4 py-2.5 flex items-center justify-between text-right hover:bg-[#303030] transition-colors text-sm group"
              >
                <div className="flex items-center gap-3">
                  <Search size={15} className="text-[#888888] group-hover:text-[#f1f1f1]" />
                  <div>
                    <span className="text-[#f1f1f1] font-medium">{channel.name}</span>
                    {channel.nameEn && (
                      <span className="text-[#888888] text-xs mr-2">({channel.nameEn})</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#181818] text-[#aaaaaa]">
                    {channel.category}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Left side in RTL: Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Quick Connection / Proxy Status Pill */}
        <button
          id="btn-header-proxy-status"
          type="button"
          onClick={onOpenSettings}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
            settings.nationalIntranetOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : isProxyActive
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30 shadow-xs'
              : 'bg-[#222222] text-[#cccccc] border-[#333333] hover:bg-[#2c2c2c] hover:text-white'
          }`}
          title={`وضعیت شبکه: ${activeProxyLabel} - کلیک برای تغییر تنظیمات و پروکسی`}
        >
          {settings.nationalIntranetOnly ? (
            <Radio size={13} className="text-amber-400 animate-pulse" />
          ) : isProxyActive ? (
            <Shield size={13} className="text-sky-400 fill-sky-400/20 animate-pulse" />
          ) : (
            <Wifi size={13} className="text-emerald-400" />
          )}
          <span className="hidden sm:inline">
            {settings.nationalIntranetOnly
              ? 'اینترنت ملی'
              : isProxyActive
              ? 'پروکسی فعال'
              : 'مستقیم'}
          </span>
        </button>

        {/* Satellite Guide Button */}
        <button
          id="btn-open-satellite-guide"
          type="button"
          onClick={onOpenSatelliteGuide}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#222222] hover:bg-[#2c2c2c] text-xs font-semibold text-[#f1f1f1] border border-[#303030] transition-colors cursor-pointer"
          title="مشاهده فرکانس‌های ماهواره‌ای"
        >
          <Satellite size={14} className="text-[#ff4e4e]" />
          <span>فرکانس‌ها</span>
        </button>

        {/* Favorites Quick Button */}
        <button
          id="btn-header-favorites"
          type="button"
          onClick={onGoToFavorites}
          className="relative p-2 rounded-full hover:bg-[#272727] text-[#f1f1f1] transition-colors cursor-pointer"
          title="علاقه‌مندی‌های من"
        >
          <Heart size={20} className={favoritesCount > 0 ? 'text-red-500 fill-red-500' : ''} />
          {favoritesCount > 0 && (
            <span className="absolute top-1 -right-0.5 flex items-center justify-center min-w-[17px] h-[17px] px-1 bg-red-600 text-[10px] font-bold rounded-full text-white">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            id="btn-notifications"
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-[#272727] text-[#f1f1f1] transition-colors cursor-pointer"
            title="اعلان‌های زنده"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 bg-[#212121] border border-[#383838] rounded-2xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#333333] mb-2">
                <span className="text-sm font-bold text-white">اعلان‌های پخش زنده</span>
                <span className="text-[11px] text-red-400 font-medium">۳ پخش مهم</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] cursor-pointer transition-colors">
                  <div className="font-semibold text-white">پخش زنده اخبار ایران اینترنشنال</div>
                  <div className="text-[#aaaaaa] mt-0.5">پوشش لحظه‌ای رویدادهای روز با کیفیت Full HD</div>
                </div>
                <div className="p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] cursor-pointer transition-colors">
                  <div className="font-semibold text-white">سریال‌های شبانه شبکه جم سریس</div>
                  <div className="text-[#aaaaaa] mt-0.5">قسمت جدید با دوبله فارسی اختصاصی</div>
                </div>
                <div className="p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] cursor-pointer transition-colors">
                  <div className="font-semibold text-white">مسابقه فوتبال شبکه ورزش</div>
                  <div className="text-[#aaaaaa] mt-0.5">پخش مستقیم لیگ برتر بدون تاخیر</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          id="btn-header-settings"
          type="button"
          onClick={onOpenSettings}
          className="relative p-2 rounded-full hover:bg-[#272727] text-[#f1f1f1] transition-colors cursor-pointer"
          title="تنظیمات کامل سایت و پروکسی تلگرام"
        >
          <Settings size={20} />
          {isProxyActive && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
          )}
        </button>

        {/* Dark/Light Theme Toggle */}
        <button
          id="btn-theme-toggle"
          type="button"
          onClick={onToggleDarkMode}
          className="p-2 rounded-full hover:bg-[#272727] text-[#f1f1f1] transition-colors cursor-pointer"
          title={darkMode ? 'تغییر به تم روشن' : 'تغییر به تم دارک یوتیوب'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User / Channel Avatar */}
        <div className="relative">
          <button
            id="btn-user-profile"
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent hover:ring-white/40 transition-all cursor-pointer"
            title="حساب کاربری و تنظیمات سرور"
          >
            MS
          </button>

          {showUserMenu && (
            <div className="absolute left-0 mt-2 w-64 bg-[#212121] border border-[#383838] rounded-2xl shadow-2xl p-3 z-50 text-right">
              <div className="flex items-center gap-3 pb-3 border-b border-[#333333]">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-sm">
                  MS
                </div>
                <div>
                  <div className="text-sm font-bold text-white">کاربر ویژه MOMSAT</div>
                  <div className="text-[11px] text-[#aaaaaa]">کیفیت پلیر: خودکار (Auto 1080p)</div>
                </div>
              </div>
              <div className="pt-2 space-y-1 text-xs text-[#dddddd]">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-red-600/15 hover:bg-red-600 text-white font-bold transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Settings size={14} />
                    <span>تنظیمات کامل و پروکسی</span>
                  </span>
                  <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded">
                    {isProxyActive ? 'پروکسی فعال' : 'تنظیمات'}
                  </span>
                </button>

                <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#2c2c2c] cursor-pointer">
                  <span>وضعیت اتصال:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    isProxyActive ? 'text-sky-400' : 'text-emerald-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isProxyActive ? 'bg-sky-500 animate-pulse' : 'bg-emerald-500'}`} />
                    {isProxyActive ? 'پروکسی فعال' : 'اتصال مستقیم'}
                  </span>
                </div>
                <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#2c2c2c] cursor-pointer">
                  <span>تعداد شبکه‌ها:</span>
                  <span className="text-white font-bold">{channels.length} شبکه</span>
                </div>
                <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#2c2c2c] cursor-pointer">
                  <span>موتور پخش:</span>
                  <span className="text-blue-400 font-medium">HLS.js Adaptive v1.6</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
