export interface Source {
  id: number | string;
  title: string;
  url: string;
  referer?: string | null;
  origin?: string | null;
  country?: string | null;
  vip?: boolean;
}

export interface Channel {
  id: number;
  catId?: number;
  name: string;
  nameEn?: string;
  image?: string | null;
  url: string;
  referer?: string | null;
  origin?: string | null;
  vpn: boolean;
  iran: boolean;
  popular: number;
  vip: boolean;
  category: string;
  categoryEn?: string;
  satellite?: string | null;
  frequency?: string | null;
  polarization?: string | null;
  symbolRate?: string | null;
  subscribers?: string;
  viewers?: number;
  description?: string;
  sources: Source[];
}

export type CategoryFilter = {
  id: string;
  label: string;
  iconName?: string;
};

export type ActiveTab = 'home' | 'explore' | 'live' | 'favorites' | 'history' | 'radio' | 'satellite';

export type ProxyType = 'direct' | 'cloud_antifilter' | 'telegram' | 'custom';

export interface TelegramProxyConfig {
  id: string;
  title: string;
  server: string;
  port: number;
  secret?: string;
  protocol?: 'mtproto' | 'socks5' | 'http';
  pingMs?: number | null;
  lastTested?: number;
  isCustom?: boolean;
}

export interface AppSettings {
  // Proxy & Anti-Filtering
  proxyMode: ProxyType;
  selectedTelegramProxyId?: string;
  telegramProxies: TelegramProxyConfig[];
  customProxyUrl: string; // e.g. https://corsproxy.io/?url= or user custom worker
  cloudProxyProvider: 'corsproxy' | 'allorigins' | 'codetabs' | 'custom';
  nationalIntranetOnly: boolean; // Only show & play channels that work on Iran national intranet (شبکه ملی)
  autoProxyFallback: boolean; // Automatically switch to proxy if direct connection fails

  // Playback & Video
  defaultQuality: 'auto' | '1080p' | '720p' | '480p' | '360p';
  dataSaver: boolean; // Low bitrate & low buffer for slow / metered connections
  bufferLengthSeconds: number; // 5, 15, 30
  lowLatencyDefault: boolean;
  autoplay: boolean;
  autoSwitchBrokenSources: boolean;
  showStatsOverlay: boolean;

  // Appearance
  theme: 'dark' | 'light';
  compactMode: boolean;
  enableMiniplayer: boolean;

  // Performance
  lowMotion: boolean;
}

export type EPGProgramCategory =
  | 'movie'
  | 'series'
  | 'sports'
  | 'news'
  | 'documentary'
  | 'entertainment'
  | 'animation'
  | 'music'
  | 'religious'
  | 'talkshow'
  | 'other';

export interface EPGProgram {
  id: string;
  channelId: number;
  title: string;
  originalTitle?: string;
  subtitle?: string;
  description: string;
  startTime: string; // HH:MM (e.g. "18:30")
  endTime: string;   // HH:MM (e.g. "20:00")
  startTimestamp: number; // Unix ms
  endTimestamp: number;   // Unix ms
  durationMinutes: number;
  category: EPGProgramCategory;
  categoryLabel: string;
  ageRating?: string; // e.g. "+12", "+16", "عمومی", "کودک"
  seasonEpisode?: string; // e.g. "فصل ۲ · قسمت ۱۲"
  isLiveEvent?: boolean;
  directorOrHost?: string;
  tags?: string[];
  thumbnail?: string;
}

export interface EPGSchedule {
  channelId: number;
  channelName: string;
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // "امروز", "فردا", "دیروز"
  programs: EPGProgram[];
  currentProgram: EPGProgram | null;
  nextProgram: EPGProgram | null;
  currentProgressPercent: number; // 0 to 100
  elapsedMinutes: number;
  remainingMinutes: number;
  lastUpdated: number;
}

