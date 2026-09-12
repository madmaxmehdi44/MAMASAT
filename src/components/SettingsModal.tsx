import React, { useState } from 'react';
import { 
  X, Shield, ShieldCheck, Wifi, WifiOff, Globe, Server, 
  Zap, Download, Upload, RotateCcw, Check, Copy, ExternalLink, 
  AlertTriangle, Gauge, Sliders, Eye, Activity, Send, 
  Smartphone, Plus, Trash2, RefreshCw, Radio, HardDrive, Moon, Sun, Layers
} from 'lucide-react';
import type { AppSettings, TelegramProxyConfig, ProxyType } from '../types';
import { parseTelegramProxyLink, testProxyPing, DEFAULT_TELEGRAM_PROXIES, DEFAULT_SETTINGS } from '../utils/settingsStorage';
import { useSettings } from '../utils/useSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: AppSettings;
  onUpdateSettings?: (updates: Partial<AppSettings>) => void;
  onResetSettings?: () => void;
  favoritesCount?: number;
  historyCount?: number;
  onClearHistory?: () => void;
}

type TabType = 'proxy' | 'playback' | 'appearance' | 'storage' | 'guide';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings: propSettings,
  onUpdateSettings: propOnUpdateSettings,
  onResetSettings: propOnResetSettings,
  favoritesCount = 0,
  historyCount = 0,
  onClearHistory = () => {},
}) => {
  const fallbackHook = useSettings();
  const settings = propSettings || fallbackHook.settings || DEFAULT_SETTINGS;
  const onUpdateSettings = propOnUpdateSettings || fallbackHook.updateSettings;
  const onResetSettings = propOnResetSettings || fallbackHook.resetSettings;

  const [activeTab, setActiveTab] = useState<TabType>('proxy');
  const [tgLinkInput, setTgLinkInput] = useState('');
  const [tgInputError, setTgInputError] = useState('');
  const [isTestingAllPings, setIsTestingAllPings] = useState(false);
  const [testingProxyId, setTestingProxyId] = useState<string | null>(null);
  const [copySuccessToast, setCopySuccessToast] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  // Add Telegram proxy link
  const handleAddTelegramProxy = (e: React.FormEvent) => {
    e.preventDefault();
    setTgInputError('');
    if (!tgLinkInput.trim()) return;

    const parsed = parseTelegramProxyLink(tgLinkInput);
    if (!parsed) {
      setTgInputError('فرمت لینک نامعتبر است. نمونه: tg://proxy?server=...&port=... یا host:port:secret');
      return;
    }

    const newProxy: TelegramProxyConfig = {
      id: `tg-custom-${Date.now()}`,
      ...parsed,
      pingMs: null,
      lastTested: Date.now(),
      isCustom: true,
    };

    const updated = [newProxy, ...settings.telegramProxies];
    onUpdateSettings({
      telegramProxies: updated,
      selectedTelegramProxyId: newProxy.id,
      proxyMode: 'telegram',
    });

    setTgLinkInput('');
    // Immediately test ping for this new proxy
    testSingleProxyPing(newProxy.id, newProxy.server, newProxy.port);
  };

  // Test single proxy ping
  const testSingleProxyPing = async (id: string, server: string, port: number) => {
    setTestingProxyId(id);
    const latency = await testProxyPing({ server, port });
    const updated = settings.telegramProxies.map((p) =>
      p.id === id ? { ...p, pingMs: latency, lastTested: Date.now() } : p
    );
    onUpdateSettings({ telegramProxies: updated });
    setTestingProxyId(null);
  };

  // Test all proxies
  const handleTestAllProxies = async () => {
    setIsTestingAllPings(true);
    const updatedList = [...settings.telegramProxies];

    for (let i = 0; i < updatedList.length; i++) {
      const p = updatedList[i];
      setTestingProxyId(p.id);
      const ping = await testProxyPing({ server: p.server, port: p.port });
      updatedList[i] = { ...p, pingMs: ping, lastTested: Date.now() };
    }

    onUpdateSettings({ telegramProxies: updatedList });
    setTestingProxyId(null);
    setIsTestingAllPings(false);
  };

  // Delete custom proxy
  const handleDeleteProxy = (id: string) => {
    const filtered = settings.telegramProxies.filter((p) => p.id !== id);
    let nextSelected = settings.selectedTelegramProxyId;
    if (nextSelected === id) {
      nextSelected = filtered[0]?.id || 'tg-mirror-1';
    }
    onUpdateSettings({
      telegramProxies: filtered,
      selectedTelegramProxyId: nextSelected,
    });
  };

  // Export settings & favorites to JSON
  const handleExport = () => {
    try {
      const exportData = {
        app: 'MOMSAT YouTube TV',
        version: '2.5',
        exportedAt: new Date().toISOString(),
        settings,
        favorites: JSON.parse(localStorage.getItem('momsat_favorites_v2') || '[]'),
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `momsat-settings-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  // Import settings from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.settings) {
          onUpdateSettings(parsed.settings);
        }
        if (parsed.favorites && Array.isArray(parsed.favorites)) {
          localStorage.setItem('momsat_favorites_v2', JSON.stringify(parsed.favorites));
        }
        alert('تنظیمات و لیست علاقه‌مندی‌ها با موفقیت بازیابی شدند.');
      } catch {
        alert('فایل بارگذاری شده نامعتبر است.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#1a1a1a] border border-[#333333] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d2d2d] bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>تنظیمات پیشرفته و پروکسی ضد فیلتر</span>
                <span className="text-[11px] font-medium bg-red-600/30 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                  MOMSAT Engine
                </span>
              </h2>
              <p className="text-xs text-[#999999]">
                پیکربندی پروکسی مشابه تلگرام، تنظیمات اینترنت ملی و کنترل کیفیت پخش ۳۴۰+ کانال
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#2c2c2c] text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
            title="بستن پنجره"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 pb-2 border-b border-[#2a2a2a] bg-[#141414] overflow-x-auto select-none scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('proxy')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'proxy'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-[#aaaaaa] hover:bg-[#222222] hover:text-white'
            }`}
          >
            <Send size={16} />
            <span>پروکسی و ضد فیلتر</span>
            {settings.proxyMode !== 'direct' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('playback')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'playback'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-[#aaaaaa] hover:bg-[#222222] hover:text-white'
            }`}
          >
            <Gauge size={16} />
            <span>کیفیت و پخش ویدیو</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-[#aaaaaa] hover:bg-[#222222] hover:text-white'
            }`}
          >
            <Eye size={16} />
            <span>ظاهر و رابط کاربری</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'storage'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-[#aaaaaa] hover:bg-[#222222] hover:text-white'
            }`}
          >
            <HardDrive size={16} />
            <span>حافظه و پشتیبان‌گیری</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-[#aaaaaa] hover:bg-[#222222] hover:text-white'
            }`}
          >
            <ExternalLink size={16} />
            <span>راهنمای رفع فیلتر تلگرام</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm">
          {/* ================= TAB 1: PROXY & ANTI-FILTER ================= */}
          {activeTab === 'proxy' && (
            <div className="space-y-6">
              {/* Emergency Banner: National Intranet Mode */}
              <div className={`p-4 rounded-2xl border transition-all ${
                settings.nationalIntranetOnly 
                  ? 'bg-amber-950/40 border-amber-500/50' 
                  : 'bg-[#222222] border-[#333333]'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      settings.nationalIntranetOnly ? 'bg-amber-600 text-white' : 'bg-[#2f2f2f] text-[#888888]'
                    }`}>
                      <Radio size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">حالت اینترنت ملی (قطع اینترنت بین‌الملل)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          سرورهای داخلی ایران
                        </span>
                      </div>
                      <p className="text-xs text-[#aaaaaa] mt-1 leading-relaxed">
                        در صورت قطع یا اختلال شدید دسترسی به اینترنت خارجی، این گزینه را فعال کنید تا فقط شبکه‌های دارای سرورهای داخلی و مستقیم در دیتاسنترهای ایران (بدون نیاز به اینترنت آزاد) نمایش داده شوند.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={settings.nationalIntranetOnly}
                      onChange={(e) => onUpdateSettings({ nationalIntranetOnly: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#383838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
                  </label>
                </div>
              </div>

              {/* Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-[#aaaaaa] uppercase tracking-wider mb-2">
                  روش اتصال و مسیریابی استریم (Connection Mode)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Option 1: Direct */}
                  <div
                    onClick={() => onUpdateSettings({ proxyMode: 'direct' })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      settings.proxyMode === 'direct'
                        ? 'bg-red-600/15 border-red-500 text-white shadow-md'
                        : 'bg-[#222222] border-[#333333] text-[#cccccc] hover:border-[#444444]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Wifi size={18} className={settings.proxyMode === 'direct' ? 'text-red-500' : 'text-[#888888]'} />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        settings.proxyMode === 'direct' ? 'border-red-500 bg-red-600' : 'border-[#555555]'
                      }`}>
                        {settings.proxyMode === 'direct' && <Check size={10} className="text-white" />}
                      </div>
                    </div>
                    <div className="font-bold text-sm text-white">اتصال مستقیم</div>
                    <div className="text-[11px] text-[#888888] mt-0.5">بدون واسطه (مناسب اینترنت آزاد)</div>
                  </div>

                  {/* Option 2: Cloud Anti-Filter */}
                  <div
                    onClick={() => onUpdateSettings({ proxyMode: 'cloud_antifilter' })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      settings.proxyMode === 'cloud_antifilter'
                        ? 'bg-red-600/15 border-red-500 text-white shadow-md'
                        : 'bg-[#222222] border-[#333333] text-[#cccccc] hover:border-[#444444]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Globe size={18} className={settings.proxyMode === 'cloud_antifilter' ? 'text-red-500' : 'text-[#888888]'} />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        settings.proxyMode === 'cloud_antifilter' ? 'border-red-500 bg-red-600' : 'border-[#555555]'
                      }`}>
                        {settings.proxyMode === 'cloud_antifilter' && <Check size={10} className="text-white" />}
                      </div>
                    </div>
                    <div className="font-bold text-sm text-white">پروکسی ابری ضد فیلتر</div>
                    <div className="text-[11px] text-[#888888] mt-0.5">مسیریابی هوشمند Cloudflare / CORS</div>
                  </div>

                  {/* Option 3: Telegram Proxy */}
                  <div
                    onClick={() => onUpdateSettings({ proxyMode: 'telegram' })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      settings.proxyMode === 'telegram'
                        ? 'bg-red-600/15 border-red-500 text-white shadow-md'
                        : 'bg-[#222222] border-[#333333] text-[#cccccc] hover:border-[#444444]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Send size={18} className={settings.proxyMode === 'telegram' ? 'text-sky-400' : 'text-[#888888]'} />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        settings.proxyMode === 'telegram' ? 'border-sky-500 bg-sky-600' : 'border-[#555555]'
                      }`}>
                        {settings.proxyMode === 'telegram' && <Check size={10} className="text-white" />}
                      </div>
                    </div>
                    <div className="font-bold text-sm text-white">پروکسی تلگرام (MTProto)</div>
                    <div className="text-[11px] text-[#888888] mt-0.5">مشابه پروتکل تلگرام و SOCKS5</div>
                  </div>

                  {/* Option 4: Custom Proxy */}
                  <div
                    onClick={() => onUpdateSettings({ proxyMode: 'custom' })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      settings.proxyMode === 'custom'
                        ? 'bg-red-600/15 border-red-500 text-white shadow-md'
                        : 'bg-[#222222] border-[#333333] text-[#cccccc] hover:border-[#444444]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Sliders size={18} className={settings.proxyMode === 'custom' ? 'text-red-500' : 'text-[#888888]'} />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        settings.proxyMode === 'custom' ? 'border-red-500 bg-red-600' : 'border-[#555555]'
                      }`}>
                        {settings.proxyMode === 'custom' && <Check size={10} className="text-white" />}
                      </div>
                    </div>
                    <div className="font-bold text-sm text-white">پروکسی سفارشی</div>
                    <div className="text-[11px] text-[#888888] mt-0.5">آدرس Worker یا پورت لوکال</div>
                  </div>
                </div>
              </div>

              {/* Automatic Fallback Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#222222] border border-[#333333]">
                <div>
                  <div className="font-bold text-white text-sm">سوئیچ خودکار به پروکسی هنگام قطعی (Auto-Failover)</div>
                  <div className="text-xs text-[#888888] mt-0.5">
                    اگر استریم مستقیم به دلیل فیلترینگ یا خطای شبکه قطع شد، پلیر فوراً بدون توقف روی پروکسی ضد فیلتر سوئیچ می‌کند.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.autoProxyFallback}
                    onChange={(e) => onUpdateSettings({ autoProxyFallback: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#383838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
                </label>
              </div>

              {/* Telegram Proxy Manager Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#202020] border border-[#333333] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#2d2d2d]">
                  <div className="flex items-center gap-2">
                    <Send size={18} className="text-sky-400" />
                    <span className="font-bold text-white text-base">مدیریت پروکسی‌های تلگرامی (Telegram Proxies)</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestAllProxies}
                    disabled={isTestingAllPings}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2b2b2b] hover:bg-[#383838] text-xs font-bold text-[#f1f1f1] border border-[#444444] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={isTestingAllPings ? 'animate-spin text-sky-400' : ''} />
                    <span>{isTestingAllPings ? 'در حال تست...' : 'تست پینگ همه'}</span>
                  </button>
                </div>

                {/* Add proxy link input */}
                <form onSubmit={handleAddTelegramProxy} className="space-y-2">
                  <label className="block text-xs font-medium text-[#aaaaaa]">
                    افزودن لینک پروکسی تلگرام جدید (Paste Telegram Proxy):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      value={tgLinkInput}
                      onChange={(e) => setTgLinkInput(e.target.value)}
                      placeholder="tg://proxy?server=...&port=443&secret=... یا https://t.me/proxy?..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#161616] border border-[#383838] text-white text-xs font-mono placeholder:text-[#666666] focus:outline-none focus:border-sky-500 transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Plus size={16} />
                      <span>افزودن</span>
                    </button>
                  </div>
                  {tgInputError && (
                    <div className="text-xs text-red-400 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      <span>{tgInputError}</span>
                    </div>
                  )}
                </form>

                {/* Telegram Proxies List */}
                <div className="space-y-2 pt-1">
                  {settings.telegramProxies.map((proxy) => {
                    const isSelected = settings.selectedTelegramProxyId === proxy.id && settings.proxyMode === 'telegram';
                    const isTesting = testingProxyId === proxy.id;

                    return (
                      <div
                        key={proxy.id}
                        onClick={() => {
                          onUpdateSettings({
                            selectedTelegramProxyId: proxy.id,
                            proxyMode: 'telegram',
                          });
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-sky-950/30 border-sky-500 text-white shadow-sm'
                            : 'bg-[#181818] border-[#2c2c2c] hover:border-[#3d3d3d] text-[#dddddd]'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-sky-400 bg-sky-500' : 'border-[#555555]'
                          }`}>
                            {isSelected && <Check size={10} className="text-white" />}
                          </div>

                          <div className="truncate text-right">
                            <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-2 truncate">
                              <span>{proxy.title}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-sky-300 font-mono">
                                {proxy.protocol?.toUpperCase() || 'MTPROTO'}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-[#888888] truncate mt-0.5" dir="ltr">
                              {proxy.server}:{proxy.port}
                            </div>
                          </div>
                        </div>

                        {/* Actions: Ping, Test, Delete */}
                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {/* Ping Badge */}
                          <button
                            type="button"
                            onClick={() => testSingleProxyPing(proxy.id, proxy.server, proxy.port)}
                            disabled={isTesting}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#252525] hover:bg-[#303030] text-[11px] font-mono text-[#cccccc] border border-[#3a3a3a] transition-colors cursor-pointer"
                            title="کلیک برای اندازه‌گیری مجدد پینگ"
                          >
                            {isTesting ? (
                              <RefreshCw size={11} className="animate-spin text-sky-400" />
                            ) : (
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  proxy.pingMs === null
                                    ? 'bg-neutral-500'
                                    : proxy.pingMs < 100
                                    ? 'bg-emerald-500'
                                    : proxy.pingMs < 300
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}
                              />
                            )}
                            <span>{proxy.pingMs ? `${proxy.pingMs}ms` : 'تست پینگ'}</span>
                          </button>

                          {/* Delete if custom */}
                          {proxy.isCustom && (
                            <button
                              type="button"
                              onClick={() => handleDeleteProxy(proxy.id)}
                              className="p-1.5 rounded-lg text-[#888888] hover:text-red-400 hover:bg-red-900/20 transition-colors cursor-pointer"
                              title="حذف پروکسی"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cloud Anti-Filter Provider Selector */}
              {settings.proxyMode === 'cloud_antifilter' && (
                <div className="p-4 rounded-2xl bg-[#202020] border border-[#333333] space-y-3">
                  <label className="block text-xs font-bold text-[#aaaaaa]">
                    ارائه‌دهنده سرویس ابری ضد فیلتر (Cloud Proxy Engine):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'corsproxy', name: 'CORSProxy CDN (Cloudflare)', speed: 'سریع‌ترین' },
                      { id: 'allorigins', name: 'AllOrigins Relay', speed: 'پایدار' },
                      { id: 'codetabs', name: 'CodeTabs Gateway', speed: 'پشتیبان' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onUpdateSettings({ cloudProxyProvider: p.id as any })}
                        className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                          settings.cloudProxyProvider === p.id
                            ? 'bg-red-600/20 border-red-500 text-white font-bold'
                            : 'bg-[#181818] border-[#303030] text-[#aaaaaa] hover:border-[#444444]'
                        }`}
                      >
                        <div className="text-white font-medium">{p.name}</div>
                        <div className="text-[10px] text-emerald-400 mt-1">کیفیت: {p.speed}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Proxy URL input */}
              {settings.proxyMode === 'custom' && (
                <div className="p-4 rounded-2xl bg-[#202020] border border-[#333333] space-y-2">
                  <label className="block text-xs font-bold text-[#aaaaaa]">
                    آدرس درگاه پروکسی سفارشی (Custom Proxy Endpoint):
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settings.customProxyUrl}
                    onChange={(e) => onUpdateSettings({ customProxyUrl: e.target.value })}
                    placeholder="https://my-cloudflare-worker.workers.dev/?url="
                    className="w-full px-3.5 py-2 rounded-xl bg-[#161616] border border-[#383838] text-white text-xs font-mono placeholder:text-[#666666] focus:outline-none focus:border-red-500"
                  />
                  <p className="text-[11px] text-[#888888]">
                    آدرس باید پارامتر استریم را دریافت کند. مانند Cloudflare Worker اختصاصی یا درگاه معکوس Nginx.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: PLAYBACK & VIDEO ================= */}
          {activeTab === 'playback' && (
            <div className="space-y-6">
              {/* Default Quality */}
              <div>
                <label className="block text-xs font-bold text-[#aaaaaa] uppercase tracking-wider mb-2">
                  کیفیت پیش‌فرض پخش استریم (Default Resolution)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {[
                    { id: 'auto', label: 'خودکار (Auto)', desc: 'تطبیق با سرعت' },
                    { id: '1080p', label: 'Full HD 1080p', desc: 'بالاترین وضوح' },
                    { id: '720p', label: 'HD 720p', desc: 'کیفیت عالی' },
                    { id: '480p', label: 'SD 480p', desc: 'مصرف متعادل' },
                    { id: '360p', label: 'Low 360p', desc: 'اینترنت ضعیف' },
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => onUpdateSettings({ defaultQuality: q.id as any })}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                        settings.defaultQuality === q.id
                          ? 'bg-red-600/20 border-red-500 text-white font-bold'
                          : 'bg-[#222222] border-[#333333] text-[#cccccc] hover:border-[#444444]'
                      }`}
                    >
                      <div className="text-white font-bold">{q.label}</div>
                      <div className="text-[10px] text-[#888888] mt-0.5">{q.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Saver Mode */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#222222] border border-[#333333]">
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>حالت صرفه‌جویی در مصرف حجم اینترنت (Data Saver)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      کاهش مصرف داده
                    </span>
                  </div>
                  <div className="text-xs text-[#888888] mt-1 leading-relaxed">
                    با فعال‌سازی این حالت، بیت‌ریت استریم بهینه شده و حداکثر کیفیت روی 480p تنظیم می‌شود تا حجم بسته اینترنت شما حفظ شود.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.dataSaver}
                    onChange={(e) => onUpdateSettings({ dataSaver: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#383838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              {/* Buffer Size */}
              <div>
                <label className="block text-xs font-bold text-[#aaaaaa] uppercase tracking-wider mb-2">
                  حجم بافرینگ پیش‌بارگذاری (Buffer Depth)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { sec: 5, title: 'شروع آنی (۵ ثانیه)', desc: 'شروع فوری، مناسب فوتبال و اخبار' },
                    { sec: 15, title: 'استاندارد یوتیوب (۱۵ ثانیه)', desc: 'تعادل عالی بین سرعت و پایداری' },
                    { sec: 30, title: 'ضد قطعی و لگ (۳۰ ثانیه)', desc: 'مناسب اینترنت‌های با قطعی مقطعی' },
                  ].map((b) => (
                    <button
                      key={b.sec}
                      type="button"
                      onClick={() => onUpdateSettings({ bufferLengthSeconds: b.sec })}
                      className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                        settings.bufferLengthSeconds === b.sec
                          ? 'bg-red-600/20 border-red-500 text-white font-bold'
                          : 'bg-[#222222] border-[#333333] text-[#cccccc] hover:border-[#444444]'
                      }`}
                    >
                      <div className="text-white font-bold text-xs sm:text-sm">{b.title}</div>
                      <div className="text-[11px] text-[#888888] mt-1">{b.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Low Latency Default */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#222222] border border-[#333333]">
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <Zap size={16} className="text-amber-400" />
                    <span>حالت فوق‌العاده کم‌تاخیر به صورت پیش‌فرض (Low Latency HLS)</span>
                  </div>
                  <div className="text-xs text-[#888888] mt-1 leading-relaxed">
                    پخش همزمان و بلادرنگ وقایع زنده با کمترین تاخیر زمانی نسبت به فرستنده ماهواره‌ای.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.lowLatencyDefault}
                    onChange={(e) => onUpdateSettings({ lowLatencyDefault: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#383838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                </label>
              </div>

              {/* Auto Switch Broken Sources */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#222222] border border-[#333333]">
                <div>
                  <div className="font-bold text-white text-sm">سوئیچ خودکار سرور در صورت خرابی (Auto Backup Server)</div>
                  <div className="text-xs text-[#888888] mt-1">
                    در صورت قطع ارتباط با سرور اول، بلافاصله و بدون وقفه به سرور پشتیبان دوم متصل می‌شود.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.autoSwitchBrokenSources}
                    onChange={(e) => onUpdateSettings({ autoSwitchBrokenSources: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#383838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
                </label>
              </div>
            </div>
          )}

          {/* ================= TAB 3: APPEARANCE & UI ================= */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-[#aaaaaa] uppercase tracking-wider mb-2">
                  پوسته رابط کاربری (Theme)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ theme: 'dark' })}
                    className={`p-4 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                      settings.theme === 'dark'
                        ? 'bg-red-600/20 border-red-500 text-white font-bold'
                        : 'bg-[#222222] border-[#333333] text-[#cccccc] hover:border-[#444444]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                      <Moon size={20} />
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-white">تم تیره یوتیوب (Dark Mode)</div>
                      <div className="text-xs text-[#888888] mt-0.5">کاهش خستگی چشم و مصرف باتری</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ theme: 'light' })}
                    className={`p-4 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                      settings.theme === 'light'
                        ? 'bg-red-600/20 border-red-500 text-white font-bold'
                        : 'bg-[#222222] border-[#333333] text-[#cccccc] hover:border-[#444444]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-300 flex items-center justify-center text-neutral-900">
                      <Sun size={20} />
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-white">تم روشن (Light Mode)</div>
                      <div className="text-xs text-[#888888] mt-0.5">وضوح بالا در محیط‌های پرنور</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Floating MiniPlayer */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#222222] border border-[#333333]">
                <div>
                  <div className="font-bold text-white text-sm">مینی‌پلیر شناور در مرور صفحات (Floating MiniPlayer)</div>
                  <div className="text-xs text-[#888888] mt-1">
                    هنگام بازگشت به صفحه اصلی یا کاوش کانال‌ها، پخش زنده در گوشه پایین تصویر بدون قطعی ادامه یابد.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.enableMiniplayer}
                    onChange={(e) => onUpdateSettings({ enableMiniplayer: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#383838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
                </label>
              </div>

              {/* Show Stats Overlay */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#222222] border border-[#333333]">
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <Activity size={16} className="text-sky-400" />
                    <span>نمایش آمار فنی پلیر (Stats for Nerds)</span>
                  </div>
                  <div className="text-xs text-[#888888] mt-1">
                    نمایش دائمی اطلاعات فنی استریم، فریم‌ریت، بیت‌ریت، حجم بافر و پینگ روی تصویر پلیر.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.showStatsOverlay}
                    onChange={(e) => onUpdateSettings({ showStatsOverlay: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#383838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600" />
                </label>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#222222] border border-[#333333]">
                <div>
                  <div className="font-bold text-white text-sm">کاهش انیمیشن‌ها (Reduce Motion)</div>
                  <div className="text-xs text-[#888888] mt-1">
                    غیرفعال کردن ترنزیشن‌های سنگین برای روان‌تر شدن در گوشی‌ها و تلویزیون‌های ضعیف.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.lowMotion}
                    onChange={(e) => onUpdateSettings({ lowMotion: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#383838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
                </label>
              </div>
            </div>
          )}

          {/* ================= TAB 4: STORAGE & BACKUP ================= */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              {/* Storage Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-[#222222] border border-[#333333]">
                  <div className="text-[#aaaaaa]">شبکه‌های مورد علاقه</div>
                  <div className="text-xl font-bold text-white mt-1">{favoritesCount} کانال</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#222222] border border-[#333333]">
                  <div className="text-[#aaaaaa]">تاریخچه تماشا</div>
                  <div className="text-xl font-bold text-white mt-1">{historyCount} مورد</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#222222] border border-[#333333]">
                  <div className="text-[#aaaaaa]">پروکسی‌های ثبت شده</div>
                  <div className="text-xl font-bold text-white mt-1">{settings.telegramProxies.length} سرور</div>
                </div>
              </div>

              {/* Clear History */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#222222] border border-[#333333]">
                <div>
                  <div className="font-bold text-white text-sm">پاک‌سازی تاریخچه تماشا</div>
                  <div className="text-xs text-[#888888] mt-1">حذف تمام کانال‌های تماشا شده اخیر از حافظه مرورگر</div>
                </div>
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2d2d2d] hover:bg-red-900/40 text-xs font-bold text-[#dddddd] hover:text-red-400 border border-[#3d3d3d] transition-colors cursor-pointer"
                >
                  پاک‌سازی تاریخچه
                </button>
              </div>

              {/* Export and Import */}
              <div className="p-4 rounded-2xl bg-[#202020] border border-[#333333] space-y-4">
                <div>
                  <div className="font-bold text-white text-sm">پشتیبان‌گیری و بازیابی تنظیمات (Backup & Restore)</div>
                  <div className="text-xs text-[#888888] mt-0.5">
                    می‌توانید تنظیمات پروکسی، ارائه‌دهنده‌ها و کانال‌های مورد علاقه خود را در قالب یک فایل JSON دانلود کرده یا روی دستگاه دیگر وارد کنید.
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow"
                  >
                    <Download size={15} />
                    <span>{exportSuccess ? 'فایل دانلود شد ✓' : 'دانلود فایل پشتیبان (Export)'}</span>
                  </button>

                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2c2c2c] hover:bg-[#383838] text-[#f1f1f1] text-xs font-bold border border-[#444444] transition-colors cursor-pointer">
                    <Upload size={15} />
                    <span>بارگذاری فایل پشتیبان (Import)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset to Default */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-red-950/20 border border-red-900/40">
                <div>
                  <div className="font-bold text-red-300 text-sm">بازنشانی به تنظیمات اولیه کارخانه (Factory Reset)</div>
                  <div className="text-xs text-[#aaaaaa] mt-1">
                    همه تنظیمات پروکسی و گزینه‌های سفارشی به حالت پیش‌فرض برمی‌گردند.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('آیا از بازنشانی همه تنظیمات به حالت اولیه اطمینان دارید؟')) {
                      onResetSettings();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600 text-xs font-bold text-red-200 hover:text-white border border-red-500/40 transition-colors cursor-pointer"
                >
                  بازنشانی تنظیمات
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 5: TELEGRAM BYPASS GUIDE ================= */}
          {activeTab === 'guide' && (
            <div className="space-y-5 text-xs text-[#cccccc] leading-relaxed">
              <div className="p-4 rounded-2xl bg-[#222222] border border-[#333333] space-y-2">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <Send size={16} className="text-sky-400" />
                  <span>راهنمای استفاده از پروکسی تلگرام برای کاربرانی که به اینترنت آزاد دسترسی ندارند</span>
                </div>
                <p>
                  در کشورهایی مانند ایران که فیلترینگ شدید اعمال می‌شود و برخی شبکه‌ها (مانند ایران اینترنشنال، بی‌بی‌سی، منوتو، جم و ورزش خارجی) مسدود هستند، شما می‌توانید از این راهکارها برای پخش زنده بدون قطعی استفاده کنید:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-[#1e1e1e] border border-[#2d2d2d] space-y-1.5">
                  <div className="font-bold text-white text-sm text-sky-400">۱. استفاده از پروکسی‌های ابری داخلی (پیشنهادی)</div>
                  <p className="text-[#aaaaaa]">
                    کافیست در تب «پروکسی و ضد فیلتر»، گزینه <b>«پروکسی ابری ضد فیلتر»</b> را فعال کنید. این سیستم ترافیک استریم‌ها را از شبکه توزیع محتوای Cloudflare عبور داده و بدون نیاز به نصب فیلترشکن، تصویر را بارگذاری می‌کند.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-[#1e1e1e] border border-[#2d2d2d] space-y-1.5">
                  <div className="font-bold text-white text-sm text-amber-400">۲. پیست کردن لینک پروکسی تلگرام (Telegram Proxy Link)</div>
                  <p className="text-[#aaaaaa]">
                    هر لینک پروکسی فعالی که در کانال‌های تلگرامی ارسال می‌شود (با پیشوند <code className="text-white font-mono">tg://proxy?server=...</code> یا <code className="text-white font-mono">https://t.me/proxy?...</code>) را کپی کرده و در کادر بالای تب پروکسی قرار دهید تا به لیست سرورهای فعال اضافه شود.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-[#1e1e1e] border border-[#2d2d2d] space-y-1.5">
                  <div className="font-bold text-white text-sm text-emerald-400">۳. اتصال از طریق پورت محلی Clash یا v2rayN</div>
                  <p className="text-[#aaaaaa]">
                    اگر در کامپیوتر یا گوشی خود برنامه Clash، v2rayN، Nekoray یا Sing-box دارید، می‌توانید در بخش پروکسی تلگرام از سرور پیش‌فرض <b>پروکسی ساکس ۵ تلگرام (پورت 10808 یا 7890)</b> استفاده کنید.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-[#1e1e1e] border border-[#2d2d2d] space-y-1.5">
                  <div className="font-bold text-white text-sm text-rose-400">۴. زمان قطع کامل اینترنت (حالت شبکه ملی)</div>
                  <p className="text-[#aaaaaa]">
                    اگر اینترنت بین‌الملل به کلی قطع شد، با زدن سوئیچ <b>«حالت اینترنت ملی»</b>، بلافاصله به شبکه‌هایی دسترسی خواهید داشت که از سرورهای واقع در دیتاسنترهای داخل کشور استریم می‌شوند.
                  </p>
                </div>
              </div>

              {/* Fast Tips */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-[#999999] flex items-center justify-between">
                <span>میانبر کیبورد: فشردن کلید <b className="text-white font-mono">P</b> برای روشن/خاموش کردن سریع پروکسی</span>
                <span className="text-sky-400">پشتیبانی ۲۴/۷ MOMSAT</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#2d2d2d] bg-[#161616]">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#888888]">وضعیت اتصال:</span>
            <span className={`font-bold flex items-center gap-1.5 ${
              settings.nationalIntranetOnly
                ? 'text-amber-400'
                : settings.proxyMode !== 'direct'
                ? 'text-sky-400'
                : 'text-emerald-400'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                settings.nationalIntranetOnly
                  ? 'bg-amber-400'
                  : settings.proxyMode !== 'direct'
                  ? 'bg-sky-400'
                  : 'bg-emerald-400'
              }`} />
              {settings.nationalIntranetOnly
                ? 'اینترنت ملی (سرور داخلی)'
                : settings.proxyMode !== 'direct'
                ? 'پروکسی ضد فیلتر فعال'
                : 'اتصال مستقیم (آنلاین)'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md hover:shadow-red-600/20"
          >
            ذخیره و بستن
          </button>
        </div>
      </div>
    </div>
  );
};
