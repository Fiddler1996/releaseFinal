// types/index.ts
// ==== CORE APPLICATION TYPES ====

export type AppMode = 'focus' | 'relax' | 'planning';
export type ViewType = 'schedule' | 'calendar' | 'week' | 'day' | 'agenda' | 'library' | 'analytics' | 'profile' | 'roadmap';
export type TimeBlockType = 'practice' | 'concert' | 'lesson' | 'travel' | 'meal' | 'break' | 'personal' | 'free';
export type Priority = 'low' | 'medium' | 'high';
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

// ==== DATA INTERFACES ====

export interface TimeBlock {
  id: string;
  title: string;
  start: string;
  end: string;
  date: string;
  type: TimeBlockType;
  description?: string;
  location?: string;
  priority?: Priority;
  tags?: string[];
  completed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent extends TimeBlock {
  startDateTime: Date;
  endDateTime: Date;
  duration: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  autoRemove?: boolean;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  autoSave: boolean;
  defaultReminder: number;
  calendarView: CalendarView;
  weekStartsOn: 0 | 1;
  timeFormat: '12h' | '24h';
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
}

// ==== APPLICATION STATE ====

export interface AppState {
  timeBlocks: TimeBlock[];
  notifications: Notification[];
  mode: AppMode;
  currentDate: string;
  activeView: ViewType;
  selectedTimeBlock: TimeBlock | null;
  isEditModalOpen: boolean;
  searchQuery: string;
  settings: AppSettings;
  loading: LoadingState;
  error: string | null;
  calendarDate: Date;
  calendarView: CalendarView;
  selectedDateRange: { start: Date; end: Date } | null;
}

// ==== CONTEXT INTERFACE ====

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  getEventsForDate: (date: string) => CalendarEvent[];
  getEventsForRange: (start: Date, end: Date) => CalendarEvent[];
  getEventsForMonth: (year: number, month: number) => CalendarEvent[];
  playNotificationSound: () => void;
}

// ==== ACTION TYPES ====

export type AppAction = 
  | { type: 'ADD_TIME_BLOCK'; payload: Omit<TimeBlock, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_TIME_BLOCK'; payload: { id: string; updates: Partial<TimeBlock> } }
  | { type: 'DELETE_TIME_BLOCK'; payload: string }
  | { type: 'TOGGLE_TIME_BLOCK_COMPLETE'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'SET_MODE'; payload: AppMode }
  | { type: 'SET_CURRENT_DATE'; payload: string }
  | { type: 'SET_ACTIVE_VIEW'; payload: ViewType }
  | { type: 'SET_SELECTED_TIME_BLOCK'; payload: TimeBlock | null }
  | { type: 'SET_EDIT_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_CALENDAR_DATE'; payload: Date }
  | { type: 'SET_CALENDAR_VIEW'; payload: CalendarView }
  | { type: 'NAVIGATE_CALENDAR'; payload: 'prev' | 'next' }
  | { type: 'GO_TO_TODAY' }
  | { type: 'GO_TO_DATE'; payload: Date }
  | { type: 'SET_LOADING'; payload: LoadingState }
  | { type: 'SET_ERROR'; payload: string | null };

// ==== COMPONENT PROP INTERFACES ====

export interface ButtonProps {
	children?: React.ReactNode;
	variant?: 'primary' | 'secondary' | 'danger' | 'success';
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
	icon?: React.ComponentType<{ className?: string }>;
	onClick?: () => void;
	type?: 'button' | 'submit';
	className?: string;
	loading?: boolean;
	'aria-label'?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  progress?: number;
}

export interface EventFormProps {
  timeBlock?: TimeBlock;
  onSave: (timeBlock: Omit<TimeBlock, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export interface EventListProps {
  events: CalendarEvent[];
  onEdit: (event: TimeBlock) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export interface CalendarGridProps {
  date: Date;
  view: CalendarView;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: TimeBlock) => void;
}

export interface QuickAddProps {
  onAdd: (input: string) => void;
  placeholder?: string;
  currentDate: string;
}

export interface SearchAndFilterProps {
  query: string;
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  types: TimeBlockType[];
  priorities: Priority[];
  dateRange?: { start: Date; end: Date };
  completed?: boolean;
}