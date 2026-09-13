import { useSyncExternalStore, useCallback } from 'react';
import type { AppSettings } from '../types';
import { 
  getSettingsSnapshot, 
  subscribeToSettings, 
  saveSettings, 
  DEFAULT_SETTINGS 
} from './settingsStorage';

export function useSettings() {
  const settings = useSyncExternalStore(
    subscribeToSettings,
    getSettingsSnapshot,
    getSettingsSnapshot
  );

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    const current = getSettingsSnapshot();
    const next: AppSettings = { ...current, ...updates };
    saveSettings(next);
  }, []);

  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
  }, []);

  const isProxyActive = settings.proxyMode !== 'direct';

  const activeProxyLabel = (() => {
    if (settings.nationalIntranetOnly) return 'شبکه ملی اطلاعات (ایران)';
    if (settings.proxyMode === 'direct') return 'اتصال مستقیم (عادی)';
    if (settings.proxyMode === 'cloud_antifilter') return 'پروکسی ابری ضد فیلتر';
    if (settings.proxyMode === 'telegram') {
      const active = settings.telegramProxies?.find((p) => p.id === settings.selectedTelegramProxyId);
      return active ? active.title : 'پروکسی تلگرام';
    }
    if (settings.proxyMode === 'custom') return 'پروکسی اختصاصی';
    return 'اتصال مستقیم';
  })();

  return {
    settings,
    updateSettings,
    resetSettings,
    isProxyActive,
    activeProxyLabel,
  };
}

