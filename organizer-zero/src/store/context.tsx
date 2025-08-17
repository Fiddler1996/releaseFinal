// store/context.tsx
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { AppContextType, CalendarEvent } from '../types';
import { appReducer, initialState } from './reducer';
import { AUTO_REMOVE_DELAY } from '../utils/constants';

// ==== CONTEXT CREATION ====
const AppContext = createContext<AppContextType | null>(null);

// ==== CUSTOM HOOK FOR CONTEXT ====
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// ==== APP PROVIDER COMPONENT ====
interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ==== EVENT UTILITIES ====
  
  /**
   * Получает события для конкретной даты
   */
  const getEventsForDate = useCallback((date: string): CalendarEvent[] => {
    return state.timeBlocks
      .filter(tb => tb.date === date)
      .map(tb => ({
        ...tb,
        startDateTime: new Date(`${tb.date}T${tb.start}`),
        endDateTime: new Date(`${tb.date}T${tb.end}`),
        duration: calculateDuration(tb.start, tb.end)
      }))
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [state.timeBlocks]);

  /**
   * Получает события для диапазона дат
   */
  const getEventsForRange = useCallback((start: Date, end: Date): CalendarEvent[] => {
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    return state.timeBlocks
      .filter(tb => tb.date >= startStr && tb.date <= endStr)
      .map(tb => ({
        ...tb,
        startDateTime: new Date(`${tb.date}T${tb.start}`),
        endDateTime: new Date(`${tb.date}T${tb.end}`),
        duration: calculateDuration(tb.start, tb.end)
      }))
      .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  }, [state.timeBlocks]);

  /**
   * Получает события для конкретного месяца
   */
  const getEventsForMonth = useCallback((year: number, month: number): CalendarEvent[] => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return getEventsForRange(start, end);
  }, [getEventsForRange]);

  // ==== NOTIFICATION SOUND ====
  
  /**
   * Воспроизводит звук уведомления
   */
  const playNotificationSound = useCallback(() => {
    if (!state.settings.soundEnabled) return;
    
    try {
      // Создаем простой звуковой сигнал с помощью Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Настройки звука
      oscillator.frequency.value = 800; // Частота 800Hz
      oscillator.type = 'sine';
      
      // Плавное нарастание и затухание
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, [state.settings.soundEnabled]);

  // ==== AUTO-REMOVE NOTIFICATIONS EFFECT ====
  
  useEffect(() => {
    const autoRemoveNotifications = state.notifications.filter(n => n.autoRemove);
    
    if (autoRemoveNotifications.length === 0) return;
    
    // Воспроизводим звук для новых уведомлений
    const latestNotification = autoRemoveNotifications[0];
    const notificationAge = Date.now() - new Date(latestNotification.timestamp).getTime();
    
    if (notificationAge < 1000 && state.settings.soundEnabled) {
      playNotificationSound();
    }
    
    // Устанавливаем таймеры для автоудаления
    const timeouts = autoRemoveNotifications.map(notification => {
      const age = Date.now() - new Date(notification.timestamp).getTime();
      const delay = Math.max(0, AUTO_REMOVE_DELAY - age);
      
      return setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
      }, delay);
    });
    
    // Очищаем таймеры при размонтировании или изменении уведомлений
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [state.notifications, state.settings.soundEnabled, playNotificationSound]);

  // ==== AUTO-SAVE EFFECT ====
  
  useEffect(() => {
    if (state.settings.autoSave && state.timeBlocks.length > 0) {
      // В реальном приложении здесь был бы API вызов для сохранения
      console.log('Auto-saving data...', {
        timeBlocksCount: state.timeBlocks.length,
        timestamp: new Date().toISOString()
      });
    }
  }, [state.timeBlocks, state.settings.autoSave]);

  // ==== CONTEXT VALUE ====
  
  const contextValue: AppContextType = {
    state,
    dispatch,
    getEventsForDate,
    getEventsForRange,
    getEventsForMonth,
    playNotificationSound
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// ==== UTILITY FUNCTIONS ====

/**
 * Вычисляет продолжительность между двумя временами в минутах
 */
function calculateDuration(startTime: string, endTime: string): number {
  try {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return Math.max(0, endTotalMinutes - startTotalMinutes);
  } catch (error) {
    console.warn('Error calculating duration:', error);
    return 0;
  }
}

// ==== EXPORTS ====
export default AppContext;