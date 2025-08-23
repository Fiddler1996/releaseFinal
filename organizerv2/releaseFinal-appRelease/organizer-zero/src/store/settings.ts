// store/settings.ts
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils';

// ==== THEME TYPES ====
export type Theme = 'light' | 'dark' | 'auto';

// ==== SETTINGS INTERFACE ====
export interface AppSettings {
  // Тема
  theme: Theme;
  
  // Календарь
  weekStartsOn: 0 | 1; // 0 - воскресенье, 1 - понедельник
  timeFormat: '12h' | '24h';
  dateFormat: 'short' | 'medium' | 'long';
  
  // Уведомления
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  
  // Интерфейс
  animationsEnabled: boolean;
  compactMode: boolean;
  autoSave: boolean;
  
  // Новые настройки безопасности
  autoLockTimeout: number; // в минутах, 0 = отключено
  requireAuth: boolean;
}

// ==== DEFAULT SETTINGS ====
export const defaultSettings: AppSettings = {
  theme: 'auto',
  weekStartsOn: 1, // Понедельник
  timeFormat: '24h',
  dateFormat: 'medium',
  notificationsEnabled: true,
  soundEnabled: true,
  animationsEnabled: true,
  compactMode: false,
  autoSave: true,
  autoLockTimeout: 0, // Отключено по умолчанию
  requireAuth: false // Отключено по умолчанию
};

// ==== SETTINGS MANAGER CLASS ====
class SettingsManager {
  private readonly STORAGE_KEY = 'organizer_settings';
  private settings: AppSettings;
  private listeners: Set<(settings: AppSettings) => void> = new Set();

  constructor() {
    this.settings = this.loadSettings();
    this.applyTheme();
  }

  /**
   * Загружает настройки из localStorage
   */
  private loadSettings(): AppSettings {
    const stored = safeLocalStorageGet(this.STORAGE_KEY, {});
    return { ...defaultSettings, ...stored };
  }

  /**
   * Сохраняет настройки в localStorage
   */
  private saveSettings(): void {
    safeLocalStorageSet(this.STORAGE_KEY, this.settings);
    this.notifyListeners();
  }

  /**
   * Уведомляет слушателей об изменениях
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }

  /**
   * Применяет тему к документу
   */
  private applyTheme(): void {
    const theme = this.resolveTheme();
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Устанавливаем CSS-переменные для темы
    if (theme === 'dark') {
      root.style.setProperty('--bg', '#0f172a'); // slate-900
      root.style.setProperty('--fg', '#ffffff');
      root.style.setProperty('--bg-secondary', '#1e293b'); // slate-800
      root.style.setProperty('--bg-tertiary', '#334155'); // slate-700
      root.style.setProperty('--border', '#475569'); // slate-600
      root.style.setProperty('--text-primary', '#f1f5f9'); // slate-100
      root.style.setProperty('--text-secondary', '#cbd5e1'); // slate-300
      root.style.setProperty('--text-muted', '#94a3b8'); // slate-400
    } else {
      root.style.setProperty('--bg', '#ffffff');
      root.style.setProperty('--fg', '#0f172a');
      root.style.setProperty('--bg-secondary', '#f8fafc'); // slate-50
      root.style.setProperty('--bg-tertiary', '#e2e8f0'); // slate-200
      root.style.setProperty('--border', '#cbd5e1'); // slate-300
      root.style.setProperty('--text-primary', '#0f172a'); // slate-900
      root.style.setProperty('--text-secondary', '#334155'); // slate-700
      root.style.setProperty('--text-muted', '#64748b'); // slate-500
    }
  }

  /**
   * Определяет фактическую тему (учитывая 'auto')
   */
  private resolveTheme(): 'light' | 'dark' {
    if (this.settings.theme === 'auto') {
      try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } catch {
        return 'dark'; // fallback
      }
    }
    return this.settings.theme;
  }

  // ==== PUBLIC METHODS ====

  /**
   * Получает текущие настройки
   */
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  /**
   * Получает конкретную настройку
   */
  getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  /**
   * Обновляет настройки
   */
  updateSettings(updates: Partial<AppSettings>): void {
    const oldTheme = this.settings.theme;
    this.settings = { ...this.settings, ...updates };
    
    // Если изменилась тема, применяем её
    if ('theme' in updates && updates.theme !== oldTheme) {
      this.applyTheme();
    }
    
    this.saveSettings();
  }

  /**
   * Сбрасывает настройки к значениям по умолчанию
   */
  resetSettings(): void {
    this.settings = { ...defaultSettings };
    this.applyTheme();
    this.saveSettings();
  }

  /**
   * Переключает тему
   */
  toggleTheme(): 'light' | 'dark' {
    const currentResolved = this.resolveTheme();
    const newTheme = currentResolved === 'dark' ? 'light' : 'dark';
    this.updateSettings({ theme: newTheme });
    return newTheme;
  }

  /**
   * Получает разрешённую тему
   */
  getCurrentTheme(): 'light' | 'dark' {
    return this.resolveTheme();
  }

  /**
   * Подписывается на изменения настроек
   */
  subscribe(listener: (settings: AppSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Экспортирует настройки
   */
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Импортирует настройки
   */
  importSettings(settingsJson: string): boolean {
    try {
      const importedSettings = JSON.parse(settingsJson);
      
      // Валидация импортированных настроек
      const validatedSettings: Partial<AppSettings> = {};
      
      Object.keys(defaultSettings).forEach(key => {
        const settingKey = key as keyof AppSettings;
        if (importedSettings[settingKey] !== undefined) {
          validatedSettings[settingKey] = importedSettings[settingKey];
        }
      });
      
      this.updateSettings(validatedSettings);
      return true;
    } catch (error) {
      console.warn('Failed to import settings:', error);
      return false;
    }
  }
}

// ==== SINGLETON INSTANCE ====
export const settingsManager = new SettingsManager();

// ==== REACT HOOK ====
export const useSettings = () => {
  const [settings, setSettings] = React.useState<AppSettings>(
    settingsManager.getSettings()
  );

  React.useEffect(() => {
    return settingsManager.subscribe(setSettings);
  }, []);

  return {
    settings,
    updateSettings: settingsManager.updateSettings.bind(settingsManager),
    resetSettings: settingsManager.resetSettings.bind(settingsManager),
    toggleTheme: settingsManager.toggleTheme.bind(settingsManager),
    getCurrentTheme: settingsManager.getCurrentTheme.bind(settingsManager),
    exportSettings: settingsManager.exportSettings.bind(settingsManager),
    importSettings: settingsManager.importSettings.bind(settingsManager)
  };
};

// ==== THEME UTILITIES ====
export const getThemeClasses = (theme?: 'light' | 'dark') => {
  const currentTheme = theme || settingsManager.getCurrentTheme();
  
  return {
    bg: currentTheme === 'dark' ? 'bg-slate-900' : 'bg-white',
    bgSecondary: currentTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-50',
    bgTertiary: currentTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200',
    text: currentTheme === 'dark' ? 'text-slate-100' : 'text-slate-900',
    textSecondary: currentTheme === 'dark' ? 'text-slate-300' : 'text-slate-700',
    textMuted: currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    border: currentTheme === 'dark' ? 'border-slate-600' : 'border-slate-300',
    ring: currentTheme === 'dark' ? 'ring-slate-600' : 'ring-slate-300'
  };
};

// Импорт React для хука
import React from 'react';