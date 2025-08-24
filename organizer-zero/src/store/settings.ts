// store/settings.ts
import type { AppSettings as TypesAppSettings } from '../types';

export type AppSettings = TypesAppSettings;

const STORAGE_KEY = 'oz_settings';

const defaultSettings = (): Partial<AppSettings> => ({
  notificationsEnabled: true,
  autoSave: true,
  defaultReminder: 15,
  calendarView: 'month',
  weekStartsOn: 1,
  timeFormat: '24h',
  soundEnabled: false,
  animationsEnabled: true,
  profileName: '',
  profileTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  profileLanguage: navigator.language || 'ru-RU',
  autoLockTimeout: 0,
  requireAuth: false
});

function load(): Partial<AppSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw);
    return { ...defaultSettings(), ...parsed };
  } catch {
    return defaultSettings();
  }
}

function save(settings: Partial<AppSettings>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

class SettingsManager {
  getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] | undefined {
    const s = load();
    return s[key] as AppSettings[K] | undefined;
  }

  setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    const s = load();
    const next = { ...s, [key]: value };
    save(next);
  }

  getAll(): Partial<AppSettings> {
    return load();
  }

  updateMany(partial: Partial<AppSettings>): void {
    const s = load();
    const next = { ...s, ...partial };
    save(next);
  }
}

export const settingsManager = new SettingsManager();