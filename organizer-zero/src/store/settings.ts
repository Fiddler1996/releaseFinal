// store/settings.ts
import type { AppSettings as CoreAppSettings } from '../types';

export type AppSettings = CoreAppSettings & {
  autoLockTimeout?: number; // minutes; 0 or undefined disables
  requireAuth?: boolean; // future use for stronger secrets
};

const SETTINGS_KEY = 'oz_settings';

class SettingsManager {
  private getStored(): Partial<AppSettings> {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return {};
      return JSON.parse(raw) as Partial<AppSettings>;
    } catch {
      return {};
    }
  }

  public getSettings(): Partial<AppSettings> {
    return this.getStored();
  }

  public getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] | undefined {
    const settings = this.getStored();
    return settings[key];
  }

  public setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    const current = this.getStored();
    const updated = { ...current, [key]: value } as Partial<AppSettings>;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  public updateSettings(patch: Partial<AppSettings>): void {
    const current = this.getStored();
    const updated = { ...current, ...patch } as Partial<AppSettings>;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}

export const settingsManager = new SettingsManager();