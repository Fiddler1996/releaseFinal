import React, { useEffect, useState } from 'react';
import { useCalendar } from '../../store/hooks';
import { addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { Button } from '../ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  useEffect(() => {
    setCalendarView('month');
  }, [setCalendarView]);

  const base = new Date(currentDate);
  const monthStart = startOfMonth(base);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const handleDateClick = (date: Date) => {
    setModalDate(date);
  };

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

      days.push(
        <div
          key={clone.toISOString()}
          role="button"
          tabIndex={0}
          onClick={() => handleDateClick(clone)}
          className={`flex flex-col p-2 border cursor-pointer transition-all duration-200 min-h-[60px] hover:bg-gray-100 dark:hover:bg-gray-700
            ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700 opacity-60'} 
            ${isToday ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-500 shadow-md ring-1 ring-blue-300 dark:ring-blue-600' : 'border-gray-300 dark:border-gray-600'}
          `}
        >
          <span className={`text-xs font-semibold ${isToday ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
            {clone.getDate()}
          </span>

          {events.length > 0 && (
            <div className="mt-1 flex flex-col gap-0.5">
              {events.slice(0, 3).map((ev: CalendarEvent) => (
                <span
                  key={ev.id}
                  className="block truncate text-[10px] bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 rounded px-1 border border-blue-300 dark:border-blue-700"
                  title={ev.title}
                >
                  {ev.title}
                </span>
              ))}
              {events.length > 3 && (
                <span className="text-[10px] text-gray-600 dark:text-gray-400">+{events.length - 3} ещё</span>
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between p-3 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <Button onClick={() => navigateCalendar('prev')}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-semibold text-gray-900 dark:text-white capitalize text-lg">
          {base.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </h2>
        <Button onClick={() => navigateCalendar('next')}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
        <Button onClick={goToToday}>Сегодня</Button>
      </div>

      <div className="grid grid-cols-7 text-xs font-medium text-center border-b bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
      </div>

      <div className="relative flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        {rows}

        {/* Modal with day events */}
        {modalDate && (
          <>
            <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setModalDate(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm">
                    {modalDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-xl" onClick={() => setModalDate(null)}>×</button>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {getEventsForDate(modalDate.toISOString().split('T')[0]).length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">Нет событий</div>
                  ) : (
                    getEventsForDate(modalDate.toISOString().split('T')[0]).map((ev) => (
                      <div key={ev.id} className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-750/50">
                        <div className="text-sm font-medium truncate">{ev.title}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{ev.start} — {ev.end}</div>
                        {ev.description && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ev.description}</div>}
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-3 text-right">
                  <button className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600" onClick={() => setModalDate(null)}>Закрыть</button>
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
