// store/hooks.ts
import { useCallback, useMemo } from 'react';
import { useAppContext } from './context';
import type { TimeBlock, CalendarEvent, ViewType, AppMode, CalendarView } from '../types';
import { normalizeEventText } from '../utils/parsers';
import { isToday, isTomorrow } from '../utils/formatters';

// ==== TIME BLOCKS HOOKS ====

/**
 * Хук для работы с временными блоками
 */
export const useTimeBlocks = () => {
  const { state, dispatch } = useAppContext();

  const addTimeBlock = useCallback((timeBlockData: Omit<TimeBlock, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true, loadingText: 'Добавление события...' } });
    
    // Симуляция async операции
    setTimeout(() => {
      dispatch({ type: 'ADD_TIME_BLOCK', payload: timeBlockData });
    }, 300);
  }, [dispatch]);

  const updateTimeBlock = useCallback((id: string, updates: Partial<TimeBlock>) => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true, loadingText: 'Обновление события...' } });
    
    setTimeout(() => {
      dispatch({ type: 'UPDATE_TIME_BLOCK', payload: { id, updates } });
    }, 200);
  }, [dispatch]);

  const deleteTimeBlock = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TIME_BLOCK', payload: id });
  }, [dispatch]);

  const toggleTimeBlockComplete = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_TIME_BLOCK_COMPLETE', payload: id });
  }, [dispatch]);

  return {
    timeBlocks: state.timeBlocks,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    toggleTimeBlockComplete,
    loading: state.loading
  };
};

// ==== CALENDAR HOOKS ====

/**
 * Хук для работы с календарем
 */
export const useCalendar = () => {
  const { state, dispatch, getEventsForDate, getEventsForRange, getEventsForMonth } = useAppContext();

  const navigateCalendar = useCallback((direction: 'prev' | 'next') => {
    dispatch({ type: 'NAVIGATE_CALENDAR', payload: direction });
  }, [dispatch]);

  const goToToday = useCallback(() => {
    dispatch({ type: 'GO_TO_TODAY' });
  }, [dispatch]);

  const goToDate = useCallback((date: Date) => {
    dispatch({ type: 'GO_TO_DATE', payload: date });
  }, [dispatch]);

  const setCalendarView = useCallback((view: CalendarView) => {
    dispatch({ type: 'SET_CALENDAR_VIEW', payload: view });
  }, [dispatch]);

  const setCurrentDate = useCallback((dateString: string) => {
    dispatch({ type: 'SET_CURRENT_DATE', payload: dateString });
  }, [dispatch]);

  // Мемоизированные вычисления
  const currentEvents = useMemo(() => 
    getEventsForDate(state.currentDate), 
    [getEventsForDate, state.currentDate]
  );

  const todayEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return getEventsForDate(today);
  }, [getEventsForDate]);

  const tomorrowEvents = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return getEventsForDate(tomorrowStr);
  }, [getEventsForDate]);

  return {
    calendarDate: state.calendarDate,
    calendarView: state.calendarView,
    currentDate: state.currentDate,
    currentEvents,
    todayEvents,
    tomorrowEvents,
    navigateCalendar,
    goToToday,
    goToDate,
    setCalendarView,
    setCurrentDate,
    getEventsForDate,
    getEventsForRange,
    getEventsForMonth
  };
};

// ==== SEARCH AND FILTER HOOKS ====

/**
 * Хук для поиска и фильтрации событий
 */
export const useSearch = () => {
  const { state, dispatch } = useAppContext();

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, [dispatch]);

  // Фильтрованные события на основе поискового запроса
  const filteredTimeBlocks = useMemo(() => {
    if (!state.searchQuery.trim()) return state.timeBlocks;

    const normalizedQuery = normalizeEventText(state.searchQuery);
    
    return state.timeBlocks.filter(timeBlock => {
      const searchableText = [
        timeBlock.title,
        timeBlock.description || '',
        timeBlock.location || '',
        ...(timeBlock.tags || [])
      ].join(' ');

      const normalizedText = normalizeEventText(searchableText);
      return normalizedText.includes(normalizedQuery);
    });
  }, [state.timeBlocks, state.searchQuery]);

  return {
    searchQuery: state.searchQuery,
    setSearchQuery,
    filteredTimeBlocks
  };
};

// ==== NOTIFICATIONS HOOKS ====

/**
 * Хук для работы с уведомлениями
 */
export const useNotifications = () => {
  const { state, dispatch, playNotificationSound } = useAppContext();

  const addNotification = useCallback((notification: {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    autoRemove?: boolean;
  }) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, [dispatch]);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  }, [dispatch]);

  return {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    playNotificationSound
  };
};

// ==== NAVIGATION HOOKS ====

/**
 * Хук для навигации между видами
 */
export const useNavigation = () => {
  const { state, dispatch } = useAppContext();

  const setActiveView = useCallback((view: ViewType) => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
  }, [dispatch]);

  const setMode = useCallback((mode: AppMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, [dispatch]);

  return {
    activeView: state.activeView,
    mode: state.mode,
    setActiveView,
    setMode
  };
};

// ==== MODAL HOOKS ====

/**
 * Хук для работы с модальными окнами
 */
export const useModal = () => {
  const { state, dispatch } = useAppContext();

  const openEditModal = useCallback((timeBlock?: TimeBlock) => {
    if (timeBlock) {
      dispatch({ type: 'SET_SELECTED_TIME_BLOCK', payload: timeBlock });
    }
    dispatch({ type: 'SET_EDIT_MODAL_OPEN', payload: true });
  }, [dispatch]);

  const closeEditModal = useCallback(() => {
    dispatch({ type: 'SET_EDIT_MODAL_OPEN', payload: false });
    dispatch({ type: 'SET_SELECTED_TIME_BLOCK', payload: null });
  }, [dispatch]);

  return {
    isEditModalOpen: state.isEditModalOpen,
    selectedTimeBlock: state.selectedTimeBlock,
    openEditModal,
    closeEditModal
  };
};

// ==== SETTINGS HOOKS ====

/**
 * Хук для работы с настройками приложения
 */
export const useSettings = () => {
  const { state, dispatch } = useAppContext();

  const updateSettings = useCallback((updates: Partial<typeof state.settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
  }, [dispatch]);

  const toggleNotifications = useCallback(() => {
    updateSettings({ notificationsEnabled: !state.settings.notificationsEnabled });
  }, [state.settings.notificationsEnabled, updateSettings]);

  const toggleAutoSave = useCallback(() => {
    updateSettings({ autoSave: !state.settings.autoSave });
  }, [state.settings.autoSave, updateSettings]);

  const toggleSound = useCallback(() => {
    updateSettings({ soundEnabled: !state.settings.soundEnabled });
  }, [state.settings.soundEnabled, updateSettings]);

  const toggleAnimations = useCallback(() => {
    updateSettings({ animationsEnabled: !state.settings.animationsEnabled });
  }, [state.settings.animationsEnabled, updateSettings]);

  return {
    settings: state.settings,
    updateSettings,
    toggleNotifications,
    toggleAutoSave,
    toggleSound,
    toggleAnimations
  };
};

// ==== ANALYTICS HOOKS ====

/**
 * Хук для аналитических данных
 */
export const useAnalytics = () => {
  const { state } = useAppContext();

  const analytics = useMemo(() => {
    const totalEvents = state.timeBlocks.length;
    const completedEvents = state.timeBlocks.filter(tb => tb.completed).length;
    const todayEvents = state.timeBlocks.filter(tb => isToday(tb.date)).length;
    const tomorrowEvents = state.timeBlocks.filter(tb => isTomorrow(tb.date)).length;
    const practiceEvents = state.timeBlocks.filter(tb => tb.type === 'practice').length;
    
    const completionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;
    
    const eventsByType = state.timeBlocks.reduce((acc, tb) => {
      acc[tb.type] = (acc[tb.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents,
      completedEvents,
      todayEvents,
      tomorrowEvents,
      practiceEvents,
      completionRate,
      eventsByType
    };
  }, [state.timeBlocks]);

  return analytics;
};

// ==== THEME HOOK ====

/**
 * Хук для управления темой (light/dark)
 */
export const useTheme = () => {
  const getStored = () => {
    try { return localStorage.getItem('theme') as 'light' | 'dark' | null; } catch { return null; }
  };

  const applyTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try { localStorage.setItem('theme', theme); } catch {}
  };

  const init = () => {
    const stored = getStored();
    if (stored) {
      applyTheme(stored);
      return stored;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme: 'light' | 'dark' = prefersDark ? 'dark' : 'light';
    applyTheme(theme);
    return theme;
  };

  const toggle = () => {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    return next;
  };

  return { initTheme: init, toggleTheme: toggle };
};