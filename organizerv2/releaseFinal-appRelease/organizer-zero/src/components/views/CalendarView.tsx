import React, { useEffect, useState, useMemo } from 'react';
import { useCalendar } from '../../store/hooks';
import { useSettings } from '../../store/settings';
import { addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, format } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, ChevronDown, X } from 'lucide-react';
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

  const { getCurrentTheme } = useSettings();
  
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const theme = getCurrentTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    setCalendarView('month');
  }, [setCalendarView]);

  // Инициализация выбранного месяца и года
  useEffect(() => {
    const baseDate = new Date(currentDate);
    setSelectedYear(baseDate.getFullYear());
    setSelectedMonth(baseDate.getMonth());
  }, [currentDate]);

  const base = new Date(currentDate);
  const monthStart = startOfMonth(base);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Текущая дата для правильной подсветки
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setCurrentDate(dateString);
    setModalDate(date);
  };

  // Исправленная функция "Сегодня"
  const handleGoToToday = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    setCurrentDate(todayString);
    goToToday();
  };

  // Обработка выбора месяца/года
  const handleMonthYearSelect = () => {
    const newDate = new Date(selectedYear, selectedMonth, 1);
    const newDateString = newDate.toISOString().split('T')[0];
    setCurrentDate(newDateString);
    setShowMonthYearPicker(false);
  };

  // Генерация списка лет (±10 от текущего года)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  }, []);

  // Названия месяцев
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const rows: React.ReactNode[] = [];
  let day = startDate;

  while (day <= endDate) {
    const days: React.ReactNode[] = [];

    for (let i = 0; i < 7; i++) {
      const clone = day;
      const dayKey = clone.toISOString().split('T')[0];

      const events = getEventsForDate(dayKey);
      const isCurrentMonth = isSameMonth(clone, monthStart);
      
      // Исправлена проверка текущего дня
      const isToday = dayKey === todayString;
      const isSelected = dayKey === currentDate;

      days.push(
        <div
          key={clone.toISOString()}
          role="button"
          aria-selected={isSelected}
          tabIndex={0}
          onClick={() => handleDateClick(clone)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleDateClick(clone);
            }
          }}
          className={`flex flex-col p-1 border cursor-pointer transition-all duration-200 min-h-[80px] md:min-h-[100px]
            ${isDark ? 'border-slate-700' : 'border-gray-200'}
            ${!isCurrentMonth ? 'opacity-40' : ''} 
            ${isToday ? 
              isDark ? 'bg-blue-900/40 ring-2 ring-blue-500' : 'bg-blue-100 ring-2 ring-blue-500' 
              : ''
            } 
            ${isSelected && !isToday ? 
              isDark ? 'ring-2 ring-slate-500 bg-slate-800' : 'ring-2 ring-gray-400 bg-gray-50' 
              : ''
            }
            ${isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}
          `}
        >
          <span className={`text-sm font-semibold ${
            isToday 
              ? isDark ? 'text-blue-300' : 'text-blue-700'
              : isDark ? 'text-slate-200' : 'text-gray-900'
          }`}>
            {clone.getDate()}
          </span>

          {events.length > 0 && (
            <div className="mt-1 flex flex-col gap-0.5 flex-1">
              {events.slice(0, 3).map((ev: CalendarEvent) => (
                <span
                  key={ev.id}
                  className={`block truncate text-[10px] px-1 py-0.5 rounded text-xs ${
                    isDark 
                      ? 'bg-blue-800/60 text-blue-200 border border-blue-700/50' 
                      : 'bg-blue-100 text-blue-900 border border-blue-200'
                  }`}
                  title={`${ev.title} (${ev.start} - ${ev.end})`}
                >
                  {ev.title}
                </span>
              ))}
              {events.length > 3 && (
                <span className={`text-[10px] ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  +{events.length - 3} ещё
                </span>
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
    <div className={`flex flex-col h-full ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Заголовок календаря */}
      <div className={`flex items-center justify-between p-4 border-b ${
        isDark ? 'border-slate-700' : 'border-gray-200'
      }`}>
        <button
          onClick={() => navigateCalendar('prev')}
          className={`p-2 rounded-lg transition-colors ${
            isDark 
              ? 'hover:bg-slate-800 text-slate-300 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
          aria-label="Предыдущий месяц"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Кликабельный заголовок месяца/года */}
        <button
          onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-lg transition-colors ${
            isDark 
              ? 'hover:bg-slate-800 text-white' 
              : 'hover:bg-gray-100 text-gray-900'
          }`}
        >
          <Calendar className="w-5 h-5" />
          {base.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          <ChevronDown className={`w-4 h-4 transition-transform ${showMonthYearPicker ? 'rotate-180' : ''}`} />
        </button>

        <button
          onClick={() => navigateCalendar('next')}
          className={`p-2 rounded-lg transition-colors ${
            isDark 
              ? 'hover:bg-slate-800 text-slate-300 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
          aria-label="Следующий месяц"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Панель быстрых действий */}
      <div className={`flex items-center justify-center p-3 border-b ${
        isDark ? 'border-slate-700' : 'border-gray-200'
      }`}>
        <button
          onClick={handleGoToToday}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isDark 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Сегодня
        </button>
      </div>

      {/* Заголовки дней недели */}
      <div className={`grid grid-cols-7 text-sm font-medium text-center py-2 border-b ${
        isDark 
          ? 'bg-slate-800 text-slate-300 border-slate-700' 
          : 'bg-gray-50 text-gray-600 border-gray-200'
      }`}>
        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
      </div>

      {/* Сетка календаря */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="min-h-full">
          {rows}
        </div>

        {/* Выпадающий список месяца/года */}
        {showMonthYearPicker && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMonthYearPicker(false)} 
            />
            <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 rounded-xl shadow-2xl border p-6 min-w-[300px] ${
              isDark 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Выберите месяц и год
                </h3>
                <button
                  onClick={() => setShowMonthYearPicker(false)}
                  className={`p-1 rounded ${
                    isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Выбор года */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Год
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className={`w-full p-2 border rounded-lg ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Выбор месяца */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Месяц
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className={`w-full p-2 border rounded-lg ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleMonthYearSelect}
                className={`w-full py-2 px-4 rounded-lg font-medium ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Перейти
              </button>
            </div>
          </>
        )}

        {/* Модальное окно с событиями дня - ИСПРАВЛЕНО ПОЗИЦИОНИРОВАНИЕ */}
        {modalDate && (
          <>
            <div 
              className="fixed inset-0 bg-black/60 z-40" 
              onClick={() => setModalDate(null)} 
            />
            
            {/* Центрированное модальное окно */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className={`w-full max-w-md max-h-[80vh] rounded-xl shadow-2xl border overflow-hidden ${
                isDark 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-gray-200'
              }`}>
                {/* Заголовок модалки */}
                <div className={`flex items-center justify-between p-4 border-b ${
                  isDark ? 'border-slate-700' : 'border-gray-200'
                }`}>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {modalDate.toLocaleDateString('ru-RU', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      weekday: 'long'
                    })}
                  </div>
                  <button 
                    className={`p-1 rounded ${
                      isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    onClick={() => setModalDate(null)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Содержимое модалки */}
                <div className="p-4 max-h-80 overflow-y-auto">
                  {getEventsForDate(modalDate.toISOString().split('T')[0]).length === 0 ? (
                    <div className={`text-center py-8 ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Нет событий на эту дату</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getEventsForDate(modalDate.toISOString().split('T')[0]).map((ev) => (
                        <div 
                          key={ev.id} 
                          className={`border rounded-lg p-3 ${
                            isDark 
                              ? 'border-slate-700 bg-slate-750/50' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className={`font-medium mb-1 ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {ev.title}
                          </div>
                          <div className={`text-sm mb-2 ${
                            isDark ? 'text-slate-300' : 'text-gray-600'
                          }`}>
                            {ev.start} — {ev.end}
                          </div>
                          {ev.description && (
                            <div className={`text-sm ${
                              isDark ? 'text-slate-400' : 'text-gray-500'
                            }`}>
                              {ev.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Футер модалки */}
                <div className={`flex justify-end p-4 border-t ${
                  isDark ? 'border-slate-700' : 'border-gray-200'
                }`}>
                  <button 
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isDark 
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
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