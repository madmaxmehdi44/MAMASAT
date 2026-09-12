import { useState, useEffect, useCallback } from 'react';
import type { AppSettings } from '../types';
import { loadSettings, saveSettings, DEFAULT_SETTINGS, SETTINGS_CHANGE_EVENT } from './settingsStorage';

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<AppSettings>;
      if (customEvent.detail) {
        setSettingsState(customEvent.detail);
      } else {
        setSettingsState(loadSettings());
      }
    };

    window.addEventListener(SETTINGS_CHANGE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
    setSettingsState(DEFAULT_SETTINGS);
  }, []);

  const isProxyActive = settings.proxyMode !== 'direct';

  const activeProxyLabel = (() => {
    if (settings.nationalIntranetOnly) return 'شبکه ملی اطلاعات (ایران)';
    if (settings.proxyMode === 'direct') return 'اتصال مستقیم (عادی)';
    if (settings.proxyMode === 'cloud_antifilter') return 'پروکسی ابری ضد فیلتر';
    if (settings.proxyMode === 'telegram') {
      const active = settings.telegramProxies.find((p) => p.id === settings.selectedTelegramProxyId);
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
