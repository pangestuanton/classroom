import React from 'react';

interface ScheduleFilterProps {
  activeDay: string;
  onChangeDay: (day: string) => void;
}

export const ScheduleFilter: React.FC<ScheduleFilterProps> = ({ activeDay, onChangeDay }) => {
  const filters = [
    { name: 'Semua Hari', value: 'semua' },
    { name: 'Hari Ini', value: 'today' },
    { name: 'Senin', value: 'Senin' },
    { name: 'Selasa', value: 'Selasa' },
    { name: 'Rabu', value: 'Rabu' },
    { name: 'Kamis', value: 'Kamis' },
    { name: 'Jumat', value: 'Jumat' }
  ];

  return (
    <div className="flex items-center gap-xs overflow-x-auto pb-xxs max-w-full -webkit-overflow-scrolling-touch scrollbar-none">
      {filters.map((day) => {
        const isActive = activeDay === day.value;
        return (
          <button
            key={day.value}
            onClick={() => onChangeDay(day.value)}
            className={`flex-shrink-0 typo-caption py-xs px-md rounded-pill transition-smooth active-press ${
              isActive
                ? 'bg-primary text-white font-semibold'
                : 'bg-canvas text-ink-muted-80 border border-hairline hover:bg-canvas-parchment hover:text-ink'
            }`}
          >
            {day.name}
          </button>
        );
      })}
    </div>
  );
};
