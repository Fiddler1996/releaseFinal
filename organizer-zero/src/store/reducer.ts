// store/reducer.ts
import type { AppState, AppAction, TimeBlock, Notification } from '../types';

// ==== INITIAL STATE ====
export const initialState: AppState = {
  timeBlocks: [
    {
      id: '1',
      title: 'Утренняя практика фортепиано',
      start: '09:00',
      end: '10:30',
      date: new Date().toISOString().split('T')[0],
      type: 'practice',
      description: 'Работа над гаммами и этюдами Черни',
      location: 'Музыкальная комната',
      priority: 'high',
      tags: ['фортепиано', 'техника'],
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  notifications: [
    {
      id: '1',
      type: 'success',
      title: 'Добро пожаловать!',
      message: 'Organizer Zero v3.4 готов к работе с модульной архитектурой',
      timestamp: new Date().toISOString(),
      autoRemove: true
    }
  ],
  mode: 'planning',
  currentDate: new Date().toISOString().split('T')[0],
  activeView: 'calendar',
  selectedTimeBlock: null,
  isEditModalOpen: false,
  searchQuery: '',
  settings: {
    notificationsEnabled: true,
    autoSave: true,
    defaultReminder: 15,
    calendarView: 'month',
    weekStartsOn: 1,
    timeFormat: '24h',
    soundEnabled: false,
    animationsEnabled: true
  },
  loading: { isLoading: false },
  error: null,
  calendarDate: new Date(),
  calendarView: 'month',
  selectedDateRange: null
};

// ==== REDUCER ====
export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: { isLoading: false } };

    case 'ADD_TIME_BLOCK': {
      const newTimeBlock: TimeBlock = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const sortedTimeBlocks = [...state.timeBlocks, newTimeBlock].sort((a, b) => 
        a.date.localeCompare(b.date) || a.start.localeCompare(b.start)
      );

      const successNotification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'success',
        title: 'Событие добавлено',
        message: `"${newTimeBlock.title}" успешно создано`,
        timestamp: new Date().toISOString(),
        autoRemove: true
      };

      return {
        ...state,
        timeBlocks: sortedTimeBlocks,
        notifications: [successNotification, ...state.notifications],
        loading: { isLoading: false }
      };
    }

    case 'UPDATE_TIME_BLOCK': {
      const updatedTimeBlocks = state.timeBlocks.map(tb =>
        tb.id === action.payload.id 
          ? { ...tb, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : tb
      );
      
      const successNotification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'info',
        title: 'Событие обновлено',
        message: 'Изменения сохранены',
        timestamp: new Date().toISOString(),
        autoRemove: true
      };

      return { 
        ...state, 
        timeBlocks: updatedTimeBlocks, 
        notifications: [successNotification, ...state.notifications],
        loading: { isLoading: false } 
      };
    }

    case 'DELETE_TIME_BLOCK': {
      const deletedBlock = state.timeBlocks.find(tb => tb.id === action.payload);
      const deleteNotification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'info',
        title: 'Событие удалено',
        message: deletedBlock ? `"${deletedBlock.title}" было удалено` : 'Событие было удалено',
        timestamp: new Date().toISOString(),
        autoRemove: true
      };
      
      return {
        ...state,
        timeBlocks: state.timeBlocks.filter(tb => tb.id !== action.payload),
        notifications: [deleteNotification, ...state.notifications],
        selectedTimeBlock: state.selectedTimeBlock?.id === action.payload ? null : state.selectedTimeBlock
      };
    }

    case 'TOGGLE_TIME_BLOCK_COMPLETE': {
      const toggledBlock = state.timeBlocks.find(tb => tb.id === action.payload);
      const newCompletedState = !toggledBlock?.completed;
      
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'success',
        title: newCompletedState ? 'Событие выполнено' : 'Событие отмечено как невыполненное',
        message: toggledBlock ? `"${toggledBlock.title}" ${newCompletedState ? 'завершено' : 'возвращено в работу'}` : '',
        timestamp: new Date().toISOString(),
        autoRemove: true
      };

      return {
        ...state,
        timeBlocks: state.timeBlocks.map(tb =>
          tb.id === action.payload 
            ? { ...tb, completed: newCompletedState, updatedAt: new Date().toISOString() }
            : tb
        ),
        notifications: [notification, ...state.notifications]
      };
    }

    case 'ADD_NOTIFICATION': {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString()
      };
      return {
        ...state,
        notifications: [notification, ...state.notifications.slice(0, 9)] // Limit to 10 notifications
      };
    }

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case 'CLEAR_ALL_NOTIFICATIONS':
      return { ...state, notifications: [] };

    case 'SET_MODE':
      return { ...state, mode: action.payload };

    case 'SET_CURRENT_DATE':
      return { ...state, currentDate: action.payload };

    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };

    case 'SET_SELECTED_TIME_BLOCK':
      return { ...state, selectedTimeBlock: action.payload };

    case 'SET_EDIT_MODAL_OPEN':
      return { ...state, isEditModalOpen: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'UPDATE_SETTINGS': {
      const updatedSettings = { ...state.settings, ...action.payload };
      return { ...state, settings: updatedSettings };
    }

    case 'SET_CALENDAR_DATE':
      return { 
        ...state, 
        calendarDate: action.payload,
        currentDate: action.payload.toISOString().split('T')[0]
      };

    case 'SET_CALENDAR_VIEW':
      return { 
        ...state, 
        calendarView: action.payload,
        settings: { ...state.settings, calendarView: action.payload }
      };

    case 'NAVIGATE_CALENDAR': {
      const newDate = new Date(state.calendarDate);
      const { calendarView } = state;
      
      if (calendarView === 'month') {
        newDate.setMonth(newDate.getMonth() + (action.payload === 'next' ? 1 : -1));
      } else if (calendarView === 'week') {
        newDate.setDate(newDate.getDate() + (action.payload === 'next' ? 7 : -7));
      } else if (calendarView === 'day') {
        newDate.setDate(newDate.getDate() + (action.payload === 'next' ? 1 : -1));
      } else if (calendarView === 'agenda') {
        newDate.setDate(newDate.getDate() + (action.payload === 'next' ? 1 : -1));
      }
      
      return {
        ...state,
        calendarDate: newDate,
        currentDate: newDate.toISOString().split('T')[0]
      };
    }

    case 'GO_TO_TODAY': {
      const today = new Date();
      return {
        ...state,
        calendarDate: today,
        currentDate: today.toISOString().split('T')[0]
      };
    }

    case 'GO_TO_DATE': {
      return {
        ...state,
        calendarDate: action.payload,
        currentDate: action.payload.toISOString().split('T')[0]
      };
    }

    default:
      return state;
  }
};