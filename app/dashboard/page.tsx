'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { DashboardCard } from '../../components/DashboardCard';
import { TaskCard } from '../../components/TaskCard';
import { ScheduleCard } from '../../components/ScheduleCard';
import { ICONS } from '../../lib/constants';
import { getGreeting, getTodayName, getDayName, getMonthName, getDeadlineStatus } from '../../lib/utils';
import { DUMMY_SCHEDULE } from '../../data/dummySchedule';

export default function DashboardPage() {
  const { tasks, completedTaskIds, toggleTaskComplete } = useApp();

  // 1. Calculate stats
  const stats = useMemo(() => {
    const activeTasks = tasks.filter(t => !completedTaskIds.includes(t.id));
    const completedTasks = tasks.filter(t => completedTaskIds.includes(t.id));
    const nearDeadline = activeTasks.filter(t => {
      const status = getDeadlineStatus(t.dueDate);
      return status === 'near' || status === 'passed';
    });

    const todayName = getTodayName();
    const todaySchedule = DUMMY_SCHEDULE.find(s => s.day === todayName);
    const todayClassCount = todaySchedule ? todaySchedule.courses.length : 0;

    return {
      activeCount: activeTasks.length,
      completedCount: completedTasks.length,
      nearDeadlineCount: nearDeadline.length,
      todayClassCount,
      todayCourses: todaySchedule ? todaySchedule.courses : []
    };
  }, [tasks, completedTaskIds]);

  // 2. Filter upcoming active tasks (limit to 4, sorted by soonest deadline)
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(t => !completedTaskIds.includes(t.id))
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 4);
  }, [tasks, completedTaskIds]);

  // 3. Greeting and date info
  const { user } = useApp();
  const userName = user ? `, ${user.name.split(' ')[0]}` : '';
  const now = new Date();
  const dateStr = `${getDayName(now)}, ${now.getDate()} ${getMonthName(now.getMonth())} ${now.getFullYear()}`;

  return (
    <div className="space-y-xl">
      {/* Hero Header */}
      <div className="pb-md border-b border-hairline">
        <h1 className="typo-display-md text-ink leading-tight">
          {getGreeting()}{userName}
        </h1>
        <p className="typo-body text-ink-muted-48 mt-[4px] font-normal">
          {dateStr}
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        <DashboardCard
          value={stats.activeCount}
          label="Tugas Aktif"
          iconSvg={ICONS.task}
          variant="primary"
        />
        <DashboardCard
          value={stats.completedCount}
          label="Tugas Selesai"
          iconSvg={ICONS.check}
          variant="success"
        />
        <DashboardCard
          value={stats.nearDeadlineCount}
          label="Deadline Dekat"
          iconSvg={ICONS.clock}
          variant="warning"
        />
        <DashboardCard
          value={stats.todayClassCount}
          label="Kelas Hari Ini"
          iconSvg={ICONS.schedule}
          variant="info"
        />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-xl">
        {/* Upcoming Tasks Column */}
        <div className="space-y-md">
          <div className="flex items-center justify-between border-b border-divider-soft pb-xs">
            <h2 className="typo-tagline text-ink font-semibold">Tugas Mendekati Deadline</h2>
            <Link href="/tasks" className="text-primary hover:text-primary-focus typo-caption font-semibold transition-smooth">
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-md">
            {upcomingTasks.length === 0 ? (
              <div className="bg-canvas border border-hairline p-xl rounded-lg text-center py-[48px]">
                <span 
                  className="w-12 h-12 text-ink-muted-48 opacity-40 block mx-auto mb-xs"
                  dangerouslySetInnerHTML={{ __html: ICONS.inbox }}
                />
                <h4 className="typo-caption-strong text-ink font-semibold">Tidak Ada Tugas Aktif</h4>
                <p className="typo-caption text-ink-muted-48 mt-xxs">Semua tugas Anda telah selesai dikerjakan!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                {upcomingTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isCompleted={completedTaskIds.includes(task.id)}
                    onToggleComplete={() => toggleTaskComplete(task.id)}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's Schedule Column */}
        <div className="space-y-md">
          <div className="flex items-center justify-between border-b border-divider-soft pb-xs">
            <h2 className="typo-tagline text-ink font-semibold">Jadwal Hari Ini</h2>
            <Link href="/schedule" className="text-primary hover:text-primary-focus typo-caption font-semibold transition-smooth">
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-md">
            {stats.todayCourses.length === 0 ? (
              <div className="bg-canvas border border-hairline p-xl rounded-lg text-center py-[48px]">
                <span 
                  className="w-12 h-12 text-ink-muted-48 opacity-40 block mx-auto mb-xs"
                  dangerouslySetInnerHTML={{ __html: ICONS.schedule }}
                />
                <h4 className="typo-caption-strong text-ink font-semibold">Tidak Ada Kelas</h4>
                <p className="typo-caption text-ink-muted-48 mt-xxs">Tidak ada jadwal kuliah untuk hari ini.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-md">
                {stats.todayCourses.map(course => (
                  <ScheduleCard
                    key={course.code}
                    course={course}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
