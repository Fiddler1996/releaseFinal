// store/security.ts
import React from 'react';
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils';

// ==== SECURITY TYPES ====
export interface SecurityState {
  isAuthenticated: boolean;
  sessionToken: string | null;
  sessionExpiry: number | null;
  lastActivity: number;
  autoLockEnabled: boolean;
  autoLockTimeout: number; // в минутах
}

export interface SecurityManager {
  // Состояние
  getState(): SecurityState;
  isAuthenticated(): boolean;
  
  // Аутентификация
  login(remember?: boolean): Promise<boolean>;
  logout(): void;
  
  // Сессия
  refreshSession(): void;
  checkSession(): boolean;
  
  // Активность
  updateActivity(): void;
  
  // Настройки
  setAutoLock(enabled: boolean, timeout?: number): void;
  
  // События
  subscribe(listener: (state: SecurityState) => void): () => void;
}

// ==== CONSTANTS ====
const STORAGE_KEY = 'organizer_security';
const DEFAULT_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 часа
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 минута
const MIN_AUTO_LOCK_TIMEOUT = 5; // минимум 5 минут
const MAX_AUTO_LOCK_TIMEOUT = 480; // максимум 8 часов

// ==== SECURITY MANAGER IMPLEMENTATION ====
class SecurityManagerImpl implements SecurityManager {
  private state: SecurityState;
  private listeners: Set<(state: SecurityState) => void> = new Set();
  private activityTimer: NodeJS.Timeout | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.state = this.loadState();
    this.initializeActivityTracking();
    this.startSessionCheck();
  }

  /**
   * Загружает состояние из localStorage
   */
  private loadState(): SecurityState {
    const stored = safeLocalStorageGet(STORAGE_KEY, {});
    
    return {
      isAuthenticated: false,
      sessionToken: stored.sessionToken || null,
      sessionExpiry: stored.sessionExpiry || null,
      lastActivity: stored.lastActivity || Date.now(),
      autoLockEnabled: stored.autoLockEnabled || false,
      autoLockTimeout: stored.autoLockTimeout || 30, // 30 минут по умолчанию
      ...stored
    };
  }

  /**
   * Сохраняет состояние в localStorage
   */
  private saveState(): void {
    safeLocalStorageSet(STORAGE_KEY, {
      sessionToken: this.state.sessionToken,
      sessionExpiry: this.state.sessionExpiry,
      lastActivity: this.state.lastActivity,
      autoLockEnabled: this.state.autoLockEnabled,
      autoLockTimeout: this.state.autoLockTimeout
    });
  }

  /**
   * Уведомляет слушателей об изменениях
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.state });
      } catch (error) {
        console.warn('Error in security state listener:', error);
      }
    });
  }

  /**
   * Обновляет состояние
   */
  private setState(updates: Partial<SecurityState>): void {
    this.state = { ...this.state, ...updates };
    this.saveState();
    this.notifyListeners();
  }

  /**
   * Генерирует токен сессии
   */
  private generateSessionToken(): string {
    try {
      // Используем crypto.randomUUID() если доступно
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      
      // Fallback для старых браузеров
      return 'sess_' + Date.now().toString(36) + '_' + 
             Math.random().toString(36).substr(2, 9);
    } catch (error) {
      // Последний fallback
      return 'sess_' + Date.now().toString(36) + '_' + 
             Math.random().toString(36).substr(2, 9);
    }
  }

  /**
   * Проверяет валидность сессии
   */
  private isSessionValid(): boolean {
    if (!this.state.sessionToken || !this.state.sessionExpiry) {
      return false;
    }
    
    const now = Date.now();
    
    // Проверка истечения сессии
    if (now > this.state.sessionExpiry) {
      return false;
    }
    
    // Проверка автоблокировки по неактивности
    if (this.state.autoLockEnabled && this.state.autoLockTimeout > 0) {
      const inactivityDuration = now - this.state.lastActivity;
      const lockTimeout = this.state.autoLockTimeout * 60 * 1000; // конвертация в мс
      
      if (inactivityDuration > lockTimeout) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Инициализирует отслеживание активности
   */
  private initializeActivityTracking(): void {
    // События активности пользователя
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click'
    ];
    
    const handleActivity = () => {
      if (this.state.isAuthenticated) {
        this.updateActivity();
      }
    };
    
    // Throttle для предотвращения избыточных обновлений
    let lastUpdate = 0;
    const throttleDelay = 30000; // 30 секунд
    
    const throttledHandler = () => {
      const now = Date.now();
      if (now - lastUpdate > throttleDelay) {
        lastUpdate = now;
        handleActivity();
      }
    };
    
    activityEvents.forEach(event => {
      document.addEventListener(event, throttledHandler, { passive: true });
    });
    
    // Обработка видимости страницы
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.state.isAuthenticated) {
        this.checkSession();
      }
    });
  }

  /**
   * Запускает периодическую проверку сессии
   */
  private startSessionCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(() => {
      if (this.state.isAuthenticated && !this.isSessionValid()) {
        this.logout();
      }
    }, ACTIVITY_CHECK_INTERVAL);
  }

  // ==== PUBLIC METHODS ====

  getState(): SecurityState {
    return { ...this.state };
  }

  isAuthenticated(): boolean {
    if (!this.state.sessionToken) {
      return false;
    }
    
    const sessionValid = this.isSessionValid();
    
    if (!sessionValid && this.state.isAuthenticated) {
      // Автоматический выход при недействительной сессии
      this.logout();
      return false;
    }
    
    // Обновляем состояние аутентификации
    if (sessionValid && !this.state.isAuthenticated) {
      this.setState({ isAuthenticated: true });
    }
    
    return sessionValid;
  }

  async login(remember: boolean = true): Promise<boolean> {
    try {
      const token = this.generateSessionToken();
      const expiry = remember 
        ? Date.now() + DEFAULT_SESSION_DURATION 
        : Date.now() + (4 * 60 * 60 * 1000); // 4 часа для временной сессии
      
      this.setState({
        isAuthenticated: true,
        sessionToken: token,
        sessionExpiry: expiry,
        lastActivity: Date.now()
      });
      
      console.log('User authenticated successfully', { 
        sessionDuration: remember ? '24h' : '4h',
        tokenPrefix: token.substring(0, 8) + '...'
      });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  logout(): void {
    console.log('User logged out');
    
    this.setState({
      isAuthenticated: false,
      sessionToken: null,
      sessionExpiry: null,
      lastActivity: Date.now()
    });
  }

  refreshSession(): void {
    if (this.state.sessionToken) {
      const newExpiry = Date.now() + DEFAULT_SESSION_DURATION;
      this.setState({
        sessionExpiry: newExpiry,
        lastActivity: Date.now()
      });
    }
  }

  checkSession(): boolean {
    const isValid = this.isSessionValid();
    
    if (!isValid && this.state.isAuthenticated) {
      this.logout();
    }
    
    return isValid;
  }

  updateActivity(): void {
    if (this.state.isAuthenticated) {
      this.setState({ lastActivity: Date.now() });
    }
  }

  setAutoLock(enabled: boolean, timeout?: number): void {
    const updates: Partial<SecurityState> = { autoLockEnabled: enabled };
    
    if (timeout !== undefined) {
      // Валидация timeout
      const validTimeout = Math.max(
        MIN_AUTO_LOCK_TIMEOUT, 
        Math.min(MAX_AUTO_LOCK_TIMEOUT, timeout)
      );
      updates.autoLockTimeout = validTimeout;
    }
    
    this.setState(updates);
  }

  subscribe(listener: (state: SecurityState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Очистка ресурсов
   */
  destroy(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.listeners.clear();
  }
}

// ==== SINGLETON INSTANCE ====
export const securityManager = new SecurityManagerImpl();

// ==== REACT HOOK ====
export const useSecurity = () => {
  const [state, setState] = React.useState<SecurityState>(
    securityManager.getState()
  );

  React.useEffect(() => {
    return securityManager.subscribe(setState);
  }, []);

  return {
    // Состояние
    ...state,
    
    // Методы
    login: securityManager.login.bind(securityManager),
    logout: securityManager.logout.bind(securityManager),
    checkSession: securityManager.checkSession.bind(securityManager),
    refreshSession: securityManager.refreshSession.bind(securityManager),
    setAutoLock: securityManager.setAutoLock.bind(securityManager),
    updateActivity: securityManager.updateActivity.bind(securityManager)
  };
};

// ==== UTILITY FUNCTIONS ====

/**
 * Проверяет, требуется ли аутентификация
 */
export const requiresAuth = (): boolean => {
  return !securityManager.isAuthenticated();
};

/**
 * Форматирует время до истечения сессии
 */
export const getSessionTimeRemaining = (): string => {
  const state = securityManager.getState();
  
  if (!state.sessionExpiry) {
    return 'Неизвестно';
  }
  
  const remaining = state.sessionExpiry - Date.now();
  
  if (remaining <= 0) {
    return 'Истекла';
  }
  
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  
  return `${minutes}м`;
};

/**
 * Получает информацию о последней активности
 */
export const getLastActivityInfo = (): string => {
  const state = securityManager.getState();
  const now = Date.now();
  const diff = now - state.lastActivity;
  
  if (diff < 60 * 1000) {
    return 'Только что';
  }
  
  const minutes = Math.floor(diff / (60 * 1000));
  if (minutes < 60) {
    return `${minutes} мин назад`;
  }
  
  const hours = Math.floor(minutes / 60);
  return `${hours} ч назад`;
};