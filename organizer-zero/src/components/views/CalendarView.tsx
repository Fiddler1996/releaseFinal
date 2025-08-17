import React, { useEffect } from 'react';
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

  useEffect(() => {
    setCalendarView('month');
  }, [setCalendarView]);

  const base = new Date(currentDate);
  const monthStart = startOfMonth(base);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const handleDateClick = (date: Date) => {
    setCurrentDate(date.toISOString().split('T')[0]);
    setCalendarView('day');
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
      const isSelected = dayKey === currentDate;

      days.push(
        <div
          key={clone.toISOString()}
          role="button"
          aria-selected={isSelected}
          tabIndex={0}
          onClick={() => handleDateClick(clone)}
          className={`flex flex-col p-1 border cursor-pointer transition-all duration-100 
            ${isCurrentMonth ? '' : 'opacity-40'} 
            ${isToday ? 'bg-blue-100' : ''} 
            ${isSelected ? 'ring-2 ring-blue-500 rounded-md' : ''}
          `}
        >
          <span className="text-xs font-medium">
            {formatDate(clone, 'short')}
          </span>

          {events.length > 0 && (
            <div className="mt-1 flex flex-col gap-0.5">
              {events.slice(0, 3).map((ev: CalendarEvent) => (
                <span
                  key={ev.id}
                  className="block truncate text-[10px] bg-blue-200 rounded px-1"
                  title={ev.title}
                >
                  {ev.title}
                </span>
              ))}
              {events.length > 3 && (
                <span className="text-[10px] text-gray-500">+{events.length - 3} ещё</span>
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
      <div className="flex items-center justify-between p-2 border-b">
        <Button onClick={() => navigateCalendar('prev')}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-semibold">
          {base.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </h2>
        <Button onClick={() => navigateCalendar('next')}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center p-2">
        <Button onClick={goToToday}>Сегодня</Button>
      </div>

      <div className="grid grid-cols-7 text-xs font-medium text-center border-b">
        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
      </div>

      <div className="flex-1 overflow-y-auto">{rows}</div>
    </div>
  );
};

export default CalendarView;
