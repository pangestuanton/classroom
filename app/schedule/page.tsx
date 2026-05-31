'use client';

import React, { useState, useMemo } from 'react';
import { ScheduleCard } from '../../components/ScheduleCard';
import { ScheduleFilter } from '../../components/ScheduleFilter';
import { DUMMY_SCHEDULE } from '../../data/dummySchedule';
import { getTodayName } from '../../lib/utils';
import { ICONS } from '../../lib/constants';

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState<string>('semua');
  const todayName = getTodayName();

  const filteredSchedule = useMemo(() => {
    let result = DUMMY_SCHEDULE;

    // Filter day-specific items
    if (activeDay === 'today') {
      result = DUMMY_SCHEDULE.filter(s => s.day === todayName);
    } else if (activeDay !== 'semua') {
      result = DUMMY_SCHEDULE.filter(s => s.day === activeDay);
    }

    // Hide days with empty class lists, unless specifically filtered
    return result.filter(s => s.courses.length > 0);
  }, [activeDay, todayName]);

  return (
    <div className="space-y-xl">
      {/* Page Header */}
      <div className="border-b border-hairline pb-md">
        <h1 className="typo-display-md text-ink font-semibold leading-tight">Jadwal Kuliah</h1>
        <p className="typo-caption text-ink-muted-48 mt-[2px]">
          Pantau jadwal mata kuliah mingguan dan tautan ruang perkuliahan Anda
        </p>
      </div>

      {/* Filter Tabs */}
      <ScheduleFilter
        activeDay={activeDay}
        onChangeDay={setActiveDay}
      />

      {/* Schedule Lists Grid */}
      <div className="space-y-xl w-full">
        {filteredSchedule.length === 0 ? (
          <div className="bg-canvas border border-hairline p-xxl rounded-lg text-center py-[80px]">
            <span 
              className="w-12 h-12 text-ink-muted-48 opacity-40 block mx-auto mb-xs"
              dangerouslySetInnerHTML={{ __html: ICONS.schedule }}
            />
            <h4 className="typo-tagline text-ink font-semibold">Tidak Ada Jadwal</h4>
            <p className="typo-body text-ink-muted-48 mt-xxs">
              Tidak ada jadwal perkuliahan untuk kriteria filter yang Anda pilih.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-xl">
            {filteredSchedule.map((dayGroup) => {
              const isToday = dayGroup.day === todayName;
              return (
                <div key={dayGroup.day} className="space-y-md">
                  <div className="flex items-center gap-xs border-b border-divider-soft pb-xs select-none">
                    <h2 className="typo-tagline text-ink font-semibold">{dayGroup.day}</h2>
                    {isToday && (
                      <span className="badge text-[12px] bg-primary text-white font-semibold py-[2px] px-xs rounded-pill">
                        Hari Ini
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-md">
                    {dayGroup.courses.map((course) => (
                      <ScheduleCard
                        key={course.code}
                        course={course}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
