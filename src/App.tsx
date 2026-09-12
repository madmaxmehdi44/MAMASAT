import React, { useState, useEffect, useMemo } from 'react';
import { CHANNELS_DATA } from './data/channels';
import type { Channel, ActiveTab } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CategoryChips } from './components/CategoryChips';
import { VideoCard } from './components/VideoCard';
import { WatchPage } from './components/WatchPage';
import { ShareModal } from './components/ShareModal';
import { SatelliteGuideModal } from './components/SatelliteGuideModal';
import { 
  Heart, History, Radio, Sparkles, Tv, Flame, 
  Trash2, Compass, Film, Trophy, Music2 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'همه' },
  { id: 'live', label: '🔴 پخش زنده' },
  { id: 'اخبار', label: 'اخبار داغ' },
  { id: 'شبکه های جم', label: 'شبکه‌های جم (GEM)' },
  { id: 'فیلم و سریال', label: 'فیلم و سریال' },
  { id: 'ورزش', label: 'ورزش و فوتبال' },
  { id: 'موزیک', label: 'موزیک و نماهنگ' },
  { id: 'سرگرمی', label: 'سرگرمی' },
  { id: 'کودک', label: 'کودک و انیمیشن' },
  { id: 'رادیو', label: 'رادیو' },
  { id: 'popular', label: '⭐ پربیننده‌ترین‌ها' },
  { id: 'iran', label: '🇮🇷 بدون فیلترشکن' },
];

export default function App() {
  const [channels] = useState<Channel[]>(CHANNELS_DATA);

  // Read initial channel & view mode from URL params or localStorage for instant refresh resilience
  const initialData = useMemo(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const watchParam = urlParams.get('watch');
      const tabParam = (urlParams.get('tab') as ActiveTab) || 'home';
      const viewParam = urlParams.get('view') as 'watch' | 'browse' | null;

      if (watchParam) {
        const channelId = parseInt(watchParam, 10);
        const found = CHANNELS_DATA.find((c) => c.id === channelId);
        if (found) {
          return {
            channel: found,
            viewMode: (viewParam === 'browse' ? 'browse' : 'watch') as 'watch' | 'browse',
            tab: tabParam,
          };
        }
      }

      // Check saved active stream from localStorage
      const saved = localStorage.getItem('momsat_active_stream');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.channelId) {
          const found = CHANNELS_DATA.find((c) => c.id === parsed.channelId);
          if (found) {
            return {
              channel: found,
              viewMode: (parsed.isMinimized ? 'browse' : 'watch') as 'watch' | 'browse',
              tab: (parsed.activeTab as ActiveTab) || 'home',
            };
          }
        }
      }
    } catch (err) {
      console.error('Error recovering stream state:', err);
    }
    return {
      channel: null,
      viewMode: 'browse' as 'watch' | 'browse',
      tab: 'home' as ActiveTab,
    };
  }, []);

  const [playingChannel, setPlayingChannel] = useState<Channel | null>(initialData.channel);
  const [viewMode, setViewMode] = useState<'watch' | 'browse'>(initialData.viewMode);
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialData.tab);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [shareChannel, setShareChannel] = useState<Channel | null>(null);
  const [satelliteGuideOpen, setSatelliteGuideOpen] = useState<boolean>(false);

  // Favorites state
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('momsat_favorites_v2');
      return saved ? JSON.parse(saved) : [112, 89, 103, 104];
    } catch {
      return [112, 89, 103, 104];
    }
  });

  // Watch History state
  const [history, setHistory] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('momsat_history_v2');
      return saved ? JSON.parse(saved) : (initialData.channel ? [initialData.channel.id] : []);
    } catch {
      return [];
    }
  });

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('momsat_favorites_v2', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('momsat_history_v2', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Synchronize playing channel and URL/localStorage so page refresh never loses the stream
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (playingChannel) {
        url.searchParams.set('watch', playingChannel.id.toString());
        if (viewMode === 'browse') {
          url.searchParams.set('view', 'browse');
          url.searchParams.set('tab', activeTab);
        } else {
          url.searchParams.delete('view');
          url.searchParams.delete('tab');
        }

        // Save active channel in localStorage
        localStorage.setItem('momsat_active_stream', JSON.stringify({
          channelId: playingChannel.id,
          channelName: playingChannel.name,
          isMinimized: viewMode === 'browse',
          activeTab: activeTab,
          timestamp: Date.now(),
        }));
      } else {
        url.searchParams.delete('watch');
        url.searchParams.delete('view');
        url.searchParams.delete('tab');
        localStorage.removeItem('momsat_active_stream');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  }, [playingChannel, viewMode, activeTab]);

  // Handle channel selection: switch to watch page and play channel
  const handleSelectChannel = (channel: Channel) => {
    setPlayingChannel(channel);
    setViewMode('watch');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Add to history
    setHistory((prev) => {
      const filtered = prev.filter((id) => id !== channel.id);
      return [channel.id, ...filtered].slice(0, 40);
    });
  };

  // Toggle favorite status
  const handleToggleFavorite = (channelId: number) => {
    setFavorites((prev) => 
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId]
    );
  };

  // When user clicks Home / Logo: go to home view while keeping current stream playing in the miniplayer
  const handleGoHome = () => {
    setActiveTab('home');
    setSelectedCategory('all');
    setSearchQuery('');
    if (playingChannel) {
      setViewMode('browse'); // Minimizes to corner, never stops playback!
    }
  };

  // Filter channels based on search, tab, and category
  const filteredChannels = useMemo(() => {
    let list = [...channels];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
          c.category.toLowerCase().includes(q) ||
          (c.satellite && c.satellite.toLowerCase().includes(q)) ||
          (c.frequency && c.frequency.includes(q))
      );
    }

    // Active tab filters
    if (activeTab === 'favorites') {
      return list.filter((c) => favorites.includes(c.id));
    }

    if (activeTab === 'history') {
      const historyMap = new Map(list.map((c) => [c.id, c]));
      return history.map((id) => historyMap.get(id)).filter((c): c is Channel => Boolean(c));
    }

    if (activeTab === 'live') {
      return list.sort((a, b) => b.popular - a.popular);
    }

    if (activeTab === 'explore') {
      return list.slice().reverse();
    }

    // Category chips filter
    if (selectedCategory === 'popular') {
      return list.sort((a, b) => b.popular - a.popular);
    } else if (selectedCategory === 'iran') {
      return list.filter((c) => c.iran || !c.vpn);
    } else if (selectedCategory === 'live') {
      return list;
    } else if (selectedCategory !== 'all') {
      return list.filter((c) => c.category === selectedCategory || c.categoryEn === selectedCategory);
    }

    return list;
  }, [channels, activeTab, selectedCategory, searchQuery, favorites, history]);

  // Featured channels for sidebar
  const featuredChannels = useMemo(() => {
    return channels.slice().sort((a, b) => b.popular - a.popular).slice(0, 15);
  }, [channels]);

  // Recommendations for the watch page
  const watchRecommendations = useMemo(() => {
    if (!playingChannel) return featuredChannels;
    return channels
      .filter((c) => c.id !== playingChannel.id)
      .sort((a, b) => {
        if (a.category === playingChannel.category && b.category !== playingChannel.category) return -1;
        if (b.category === playingChannel.category && a.category !== playingChannel.category) return 1;
        return b.popular - a.popular;
      })
      .slice(0, 15);
  }, [channels, playingChannel, featuredChannels]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0f0f0f] text-[#f1f1f1]' : 'bg-[#f9f9f9] text-[#0f0f0f]'} flex flex-col font-['Vazirmatn','Plus_Jakarta_Sans',sans-serif] transition-colors duration-200`}>
      {/* 1. Header (Sticky Top) */}
      <Header
        onToggleSidebar={() => setSidebarExpanded(!sidebarExpanded)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectChannel={handleSelectChannel}
        channels={channels}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenSatelliteGuide={() => setSatelliteGuideOpen(true)}
        favoritesCount={favorites.length}
        onGoToFavorites={() => {
          setActiveTab('favorites');
          setSelectedCategory('all');
          if (playingChannel) {
            setViewMode('browse'); // Minimizes to corner, never stops playback!
          }
        }}
        onGoHome={handleGoHome}
      />

      {/* 2. Main Layout Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible / Mini Sidebar */}
        <Sidebar
          expanded={sidebarExpanded}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'satellite') {
              setSatelliteGuideOpen(true);
            } else {
              setActiveTab(tab);
              if (playingChannel) {
                setViewMode('browse'); // Minimizes to corner, never stops playback!
              }
            }
          }}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setActiveTab('home');
            if (playingChannel) {
              setViewMode('browse'); // Minimizes to corner, never stops playback!
            }
          }}
          favoritesCount={favorites.length}
          featuredChannels={featuredChannels}
          onSelectChannel={handleSelectChannel}
          activeChannelId={playingChannel?.id}
        />

        {/* 3. Content Area */}
        <main className="flex-1 overflow-y-auto min-w-0 relative">
          {/* PERSISTENT WATCH PAGE & VIDEO PLAYER:
              Remains mounted in the React tree whenever playingChannel is active.
              When viewMode === 'browse', it transforms into a floating miniplayer in the bottom corner.
              The <video> DOM element is NEVER destroyed, ensuring zero interruption when navigating! */}
          {playingChannel && (
            <WatchPage
              channel={playingChannel}
              recommendations={watchRecommendations}
              isFavorite={favorites.includes(playingChannel.id)}
              onToggleFavorite={handleToggleFavorite}
              onSelectChannel={handleSelectChannel}
              onShare={setShareChannel}
              onOpenSatelliteGuide={() => setSatelliteGuideOpen(true)}
              onBackToHome={handleGoHome}
              isMinimized={viewMode === 'browse'}
              onMaximize={() => setViewMode('watch')}
              onCloseMiniPlayer={() => {
                setPlayingChannel(null);
                setViewMode('browse');
              }}
              onToggleMinimize={() => {
                setViewMode(viewMode === 'watch' ? 'browse' : 'watch');
              }}
            />
          )}

          {/* YouTube Browse & Cards View (Visible when in Browse mode) */}
          {viewMode === 'browse' && (
            <div className="p-3 md:p-6 text-right">
              {/* YouTube Filter Chips (only on Home or Explore) */}
              {(activeTab === 'home' || activeTab === 'explore') && !searchQuery && (
                <CategoryChips
                  categories={CATEGORIES}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              )}

              {/* View Header Title */}
              <div className="flex items-center justify-between mt-3 mb-5 px-1">
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                    {activeTab === 'favorites' && (
                      <>
                        <Heart className="text-red-500 fill-red-500" size={24} />
                        <span>شبکه‌های مورد علاقه من ({filteredChannels.length})</span>
                      </>
                    )}
                    {activeTab === 'history' && (
                      <>
                        <History className="text-blue-400" size={24} />
                        <span>تاریخچه تماشای اخیر ({filteredChannels.length})</span>
                      </>
                    )}
                    {activeTab === 'live' && (
                      <>
                        <Radio className="text-red-500" size={24} />
                        <span>پخش زنده ماهواره‌ای (۳۴۰+ کانال فعال)</span>
                      </>
                    )}
                    {activeTab === 'explore' && (
                      <>
                        <Compass className="text-amber-400" size={24} />
                        <span>کاوش و کشف شبکه‌های تلویزیونی</span>
                      </>
                    )}
                    {activeTab === 'home' && (
                      <>
                        <Sparkles className="text-red-500" size={22} />
                        <span>
                          {searchQuery
                            ? `نتایج جستجو برای: «${searchQuery}» (${filteredChannels.length} شبکه)`
                            : selectedCategory !== 'all'
                            ? `شبکه‌های دسته ${CATEGORIES.find((c) => c.id === selectedCategory)?.label || selectedCategory} (${filteredChannels.length})`
                            : `پخش زنده ۳۴۰+ شبکه ماهواره‌ای فارسی و بین‌المللی`}
                        </span>
                      </>
                    )}
                  </h1>
                  <p className="text-xs text-[#888888] mt-1">
                    پخش روان و مستقیم با موتور اختصاصی HLS و سرورهای آینه‌ای ضد فیلتر · با تغییر صفحه پخش متوقف نمی‌شود
                  </p>
                </div>

                {/* History Clear button */}
                {activeTab === 'history' && history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setHistory([])}
                    className="px-3 py-1.5 rounded-lg bg-[#272727] hover:bg-red-600/30 text-xs font-semibold text-[#f1f1f1] hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer border border-[#383838]"
                  >
                    <Trash2 size={14} />
                    <span>پاک کردن تاریخچه</span>
                  </button>
                )}
              </div>

              {/* Channels Grid */}
              {filteredChannels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-6">
                  {filteredChannels.map((ch) => (
                    <VideoCard
                      key={ch.id}
                      channel={ch}
                      isFavorite={favorites.includes(ch.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onSelectChannel={handleSelectChannel}
                      onShare={setShareChannel}
                    />
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#1e1e1e] flex items-center justify-center text-[#888888] mb-4">
                    <Tv size={32} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    شبکه‌ای با این مشخصات یافت نشد
                  </h3>
                  <p className="text-xs text-[#888888] max-w-sm mb-4">
                    می‌توانید عبارت جستجو را تغییر دهید یا دسته‌بندی «همه» را انتخاب کنید.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setActiveTab('home');
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                  >
                    نمایش همه شبکه‌ها
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 4. Share Modal */}
      {shareChannel && (
        <ShareModal
          channel={shareChannel}
          onClose={() => setShareChannel(null)}
        />
      )}

      {/* 5. Satellite Guide Modal */}
      {satelliteGuideOpen && (
        <SatelliteGuideModal
          channels={channels}
          onClose={() => setSatelliteGuideOpen(false)}
          onSelectChannel={handleSelectChannel}
        />
      )}
    </div>
  );
}
