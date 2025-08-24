import React, { useEffect, useState } from 'react';
import { useCalendar } from '../../store/hooks';
import { addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { Button } from '../ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, formatLocalDateKey } from '../../utils/formatters';
import type { CalendarEvent } from '../../types';

const CalendarView: React.FC = () => {
  const {
    currentDate,
    setCurrentDate,
    setCalendarView,
    navigateCalendar,
    goToToday,
    goToDate,
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
      const dayKey = formatLocalDateKey(clone);

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
            ${isToday ? 'bg-blue-200/40' : ''} 
            ${isSelected ? 'ring-2 ring-blue-500 rounded-md' : ''}
          `}
        >
          <span className="text-xs font-semibold text-gray-900 dark:text-white">
            {clone.getDate()}
          </span>

          {events.length > 0 && (
            <div className="mt-1 flex flex-col gap-0.5">
              {events.slice(0, 3).map((ev: CalendarEvent) => (
                <span
                  key={ev.id}
                  className="block truncate text-[10px] bg-blue-100 text-blue-900 rounded px-1 border border-blue-200"
                  title={ev.title}
                >
                  {ev.title}
                </span>
              ))}
              {events.length > 3 && (
                <span className="text-[10px] text-gray-700 dark:text-gray-300">+{events.length - 3} ещё</span>
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b gap-2">
        <div className="flex items-center gap-1">
          <Button onClick={() => navigateCalendar('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button onClick={() => navigateCalendar('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={base.getMonth()}
            onChange={(e) => {
              const m = Number(e.target.value);
              const d = new Date(base);
              d.setMonth(m);
              d.setDate(1);
              goToDate(d);
            }}
            className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>
                {new Date(2000, i, 1).toLocaleString('ru-RU', { month: 'long' })}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={base.getFullYear()}
            onChange={(e) => {
              const y = Number(e.target.value);
              if (!isNaN(y)) {
                const d = new Date(base);
                d.setFullYear(y);
                d.setDate(1);
                goToDate(d);
              }
            }}
            className="w-24 bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="flex items-center justify-center p-2">
        <Button onClick={goToToday}>Сегодня</Button>
      </div>

      <div className="grid grid-cols-7 text-xs font-medium text-center border-b bg-gray-100 text-gray-700">
        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
      </div>

      <div className="relative flex-1 overflow-y-auto">
        {rows}

        {/* Modal with day events */}
        {modalDate && (
          <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setModalDate(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-gray-800 text-white rounded-lg border border-gray-700 shadow-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm">
                    {modalDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <button className="text-gray-400 hover:text-gray-200" onClick={() => setModalDate(null)}>×</button>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {getEventsForDate(formatLocalDateKey(modalDate)).length === 0 ? (
                    <div className="text-sm text-gray-400">Нет событий</div>
                  ) : (
                    getEventsForDate(formatLocalDateKey(modalDate)).map((ev) => (
                      <div key={ev.id} className="border border-gray-700 rounded p-2 bg-gray-750/50">
                        <div className="text-sm font-medium truncate">{ev.title}</div>
                        <div className="text-xs text-gray-300">{ev.start} — {ev.end}</div>
                        {ev.description && <div className="text-xs text-gray-400 mt-1 line-clamp-2">{ev.description}</div>}
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-3 text-right">
                  <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm" onClick={() => setModalDate(null)}>Закрыть</button>
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
