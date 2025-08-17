import React, { useEffect, useState } from 'react';
import { useCalendar } from '../../store/hooks';
import { addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { Button } from '../ui';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import type { CalendarEvent } from '../../types';

const CalendarView: React.FC = () => {
  const {
    currentDate,
    setCurrentDate,
    setCalendarView,
    navigateCalendar,
    goToToday,
    getEventsForDate
  } = useCalendar();

  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    setCalendarView('month');
    // Проверяем текущую тему
    setIsDarkTheme(document.documentElement.classList.contains('dark'));
    
    // Слушаем изменения темы
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          setIsDarkTheme(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, [setCalendarView]);

  const base = new Date(currentDate);
  const monthStart = startOfMonth(base);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const handleDateClick = (date: Date) => {
    setModalDate(date);
  };

  const handleMonthYearSelect = (month: number, year: number) => {
    const newDate = new Date(year, month, 1);
    setCurrentDate(newDate.toISOString().split('T')[0]);
    setShowMonthYearPicker(false);
  };

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const rows: React.ReactNode[] = [];
  let day = startDate;

  while (day <= endDate) {
    const days: React.ReactNode[] = [];

    for (let i = 0; i < 7; i++) {
      const clone = day;
      const dayKey = clone.toISOString().split('T')[0];

      const events = getEventsForDate(dayKey);
      const isCurrentMonth = isSameMonth(clone, monthStart);
      const isToday = clone.toDateString() === new Date().toDateString();
      const isSelected = dayKey === currentDate;

      days.push(
        <div
          key={clone.toISOString()}
          role="button"
          aria-selected={isSelected}
          tabIndex={0}
          onClick={() => handleDateClick(clone)}
          className={`flex flex-col p-1 border cursor-pointer transition-all duration-100 
            ${isCurrentMonth ? '' : 'opacity-50'} 
            ${isToday ? 'bg-blue-200/40 dark:bg-blue-600/40' : ''} 
            ${isSelected ? 'ring-2 ring-blue-500 rounded-md' : ''}
            ${isDarkTheme 
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
            }
          `}
        >
          <span className={`text-xs font-semibold ${
            isDarkTheme ? 'text-white' : 'text-gray-900'
          }`}>
            {clone.getDate()}
          </span>

          {events.length > 0 && (
            <div className="mt-1 flex flex-col gap-0.5">
              {events.slice(0, 3).map((ev: CalendarEvent) => (
                <span
                  key={ev.id}
                  className="block truncate text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded px-1 border border-blue-200 dark:border-blue-700"
                  title={ev.title}
                >
                  {ev.title}
                </span>
              ))}
              {events.length > 3 && (
                <span className={`text-[10px] ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>+{events.length - 3} ещё</span>
              )}
            </div>
          )}
        </div>
      );

      day = addDays(day, 1);
    }

    rows.push(
      <div className="grid grid-cols-7 gap-px" key={day.toISOString()}>
        {days}
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${
      isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className={`flex items-center justify-between p-2 border-b ${
        isDarkTheme ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <Button onClick={() => navigateCalendar('prev')}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <button
          onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <CalendarIcon className="w-4 h-4" />
          <h2 className="font-semibold capitalize">
            {base.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </h2>
        </button>
        
        <Button onClick={() => navigateCalendar('next')}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Month/Year Picker */}
      {showMonthYearPicker && (
        <div className={`p-4 border-b ${
          isDarkTheme ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="grid grid-cols-2 gap-4">
            {/* Months */}
            <div>
              <h3 className="text-sm font-medium mb-2">Месяц</h3>
              <div className="grid grid-cols-3 gap-1">
                {months.map((month, index) => (
                  <button
                    key={index}
                    onClick={() => handleMonthYearSelect(index, base.getFullYear())}
                    className={`text-xs p-2 rounded ${
                      index === base.getMonth()
                        ? 'bg-blue-500 text-white'
                        : isDarkTheme
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Years */}
            <div>
              <h3 className="text-sm font-medium mb-2">Год</h3>
              <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleMonthYearSelect(base.getMonth(), year)}
                    className={`text-xs p-2 rounded ${
                      year === base.getFullYear()
                        ? 'bg-blue-500 text-white'
                        : isDarkTheme
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`flex items-center justify-center p-2 ${
        isDarkTheme ? 'bg-gray-800' : 'bg-white'
      }`}>
        <Button onClick={goToToday}>Сегодня</Button>
      </div>

      <div className={`grid grid-cols-7 text-xs font-medium text-center border-b ${
        isDarkTheme 
          ? 'bg-gray-800 text-gray-300 border-gray-700' 
          : 'bg-gray-100 text-gray-700 border-gray-200'
      }`}>
        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
      </div>

      <div className={`relative flex-1 overflow-y-auto ${
        isDarkTheme ? 'bg-gray-900' : 'bg-white'
      }`}>
        {rows}

        {/* Modal with day events */}
        {modalDate && (
          <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setModalDate(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className={`w-full max-w-md rounded-lg border shadow-xl p-4 ${
                isDarkTheme 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-white text-gray-900 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm">
                    {modalDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <button 
                    className={`hover:opacity-70 transition-opacity ${
                      isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                    }`} 
                    onClick={() => setModalDate(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {getEventsForDate(modalDate.toISOString().split('T')[0]).length === 0 ? (
                    <div className={`text-sm ${
                      isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                    }`}>Нет событий</div>
                  ) : (
                    getEventsForDate(modalDate.toISOString().split('T')[0]).map((ev) => (
                      <div key={ev.id} className={`border rounded p-2 ${
                        isDarkTheme 
                          ? 'border-gray-700 bg-gray-750/50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="text-sm font-medium truncate">{ev.title}</div>
                        <div className={`text-xs ${
                          isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                        }`}>{ev.start} — {ev.end}</div>
                        {ev.description && (
                          <div className={`text-xs mt-1 line-clamp-2 ${
                            isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                          }`}>{ev.description}</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-3 text-right">
                  <button 
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                      isDarkTheme
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`} 
                    onClick={() => setModalDate(null)}
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
