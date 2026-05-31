'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskCard } from '../../components/TaskCard';
import { LoadingState } from '../../components/LoadingState';
import { ICONS } from '../../lib/constants';
import { getDeadlineStatus } from '../../lib/utils';

type FilterType = 'semua' | 'aktif' | 'deadline' | 'selesai' | string;

export default function TasksPage() {
  const { tasks, completedTaskIds, toggleTaskComplete, syncTasks, isLoading, courses, isLoggedIn } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>('semua');

  // 1. Course filter mapping
  const uniqueCourses = useMemo(() => {
    // Unique list of courses that actually have tasks associated with them
    const courseIds = new Set(tasks.map(t => t.courseId));
    return courses.filter(c => courseIds.has(c.id));
  }, [tasks, courses]);

  // 2. Filter tasks based on active status filter or course filter
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (activeFilter === 'aktif') {
      result = result.filter(t => !completedTaskIds.includes(t.id));
    } else if (activeFilter === 'deadline') {
      result = result.filter(t => {
        const isCompleted = completedTaskIds.includes(t.id);
        const status = getDeadlineStatus(t.dueDate);
        return !isCompleted && (status === 'near' || status === 'passed');
      });
    } else if (activeFilter === 'selesai') {
      result = result.filter(t => completedTaskIds.includes(t.id));
    } else if (activeFilter.startsWith('course:')) {
      const courseId = activeFilter.replace('course:', '');
      result = result.filter(t => t.courseId === courseId);
    }

    // Sort: Incomplete first, then by soonest deadline
    return result.sort((a, b) => {
      const aCompleted = completedTaskIds.includes(a.id);
      const bCompleted = completedTaskIds.includes(b.id);
      
      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1;
      }
      
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, completedTaskIds, activeFilter]);

  return (
    <div className="space-y-xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-md gap-md">
        <div>
          <h1 className="typo-display-md text-ink font-semibold leading-tight">Daftar Tugas</h1>
          <p className="typo-caption text-ink-muted-48 mt-[2px]">
            Kelola tugas kuliah Anda dan pantau tanggal pengumpulan
          </p>
        </div>

        {isLoggedIn && (
          <button
            onClick={syncTasks}
            disabled={isLoading}
            className="flex items-center justify-center gap-xs bg-primary hover:bg-primary-focus disabled:bg-primary/50 text-white font-semibold typo-caption-strong py-xs px-md rounded-pill transition-smooth active-press self-start sm:self-center"
          >
            <span 
              className={`w-4 h-4 flex items-center justify-center ${isLoading ? 'animate-spin' : ''}`}
              dangerouslySetInnerHTML={{ __html: ICONS.sync }}
            />
            {isLoading ? 'Sinkronisasi...' : 'Sinkronisasi'}
          </button>
        )}
      </div>

      {/* Filter Control Section */}
      <div className="space-y-sm">
        {/* Status Filters */}
        <div className="flex items-center gap-xs overflow-x-auto pb-xxs max-w-full -webkit-overflow-scrolling-touch scrollbar-none">
          <button
            onClick={() => setActiveFilter('semua')}
            className={`flex-shrink-0 typo-caption py-xs px-md rounded-pill transition-smooth active-press ${
              activeFilter === 'semua'
                ? 'bg-primary text-white font-semibold'
                : 'bg-canvas text-ink-muted-80 border border-hairline hover:bg-canvas-parchment'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveFilter('aktif')}
            className={`flex-shrink-0 typo-caption py-xs px-md rounded-pill transition-smooth active-press ${
              activeFilter === 'aktif'
                ? 'bg-primary text-white font-semibold'
                : 'bg-canvas text-ink-muted-80 border border-hairline hover:bg-canvas-parchment'
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => setActiveFilter('deadline')}
            className={`flex-shrink-0 typo-caption py-xs px-md rounded-pill transition-smooth active-press ${
              activeFilter === 'deadline'
                ? 'bg-primary text-white font-semibold'
                : 'bg-canvas text-ink-muted-80 border border-hairline hover:bg-canvas-parchment'
            }`}
          >
            Deadline Dekat
          </button>
          <button
            onClick={() => setActiveFilter('selesai')}
            className={`flex-shrink-0 typo-caption py-xs px-md rounded-pill transition-smooth active-press ${
              activeFilter === 'selesai'
                ? 'bg-primary text-white font-semibold'
                : 'bg-canvas text-ink-muted-80 border border-hairline hover:bg-canvas-parchment'
            }`}
          >
            Selesai
          </button>

          {/* Vertical Divider */}
          <div className="h-6 w-[1px] bg-hairline flex-shrink-0 mx-xxs" />

          {/* Dynamic Course Filters */}
          {uniqueCourses.map((course) => {
            const courseFilterVal = `course:${course.id}`;
            const isActive = activeFilter === courseFilterVal;
            return (
              <button
                key={course.id}
                onClick={() => setActiveFilter(courseFilterVal)}
                className={`flex-shrink-0 typo-caption py-xs px-md rounded-pill transition-smooth active-press ${
                  isActive
                    ? 'bg-primary text-white font-semibold'
                    : 'bg-canvas text-ink-muted-80 border border-hairline hover:bg-canvas-parchment'
                }`}
              >
                {course.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Content */}
      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="w-full">
          {filteredTasks.length === 0 ? (
            <div className="bg-canvas border border-hairline p-xxl rounded-lg text-center py-[80px]">
              <span 
                className="w-12 h-12 text-ink-muted-48 opacity-40 block mx-auto mb-xs"
                dangerouslySetInnerHTML={{ __html: ICONS.inbox }}
              />
              <h4 className="typo-tagline text-ink font-semibold">Tidak Ada Tugas</h4>
              <p className="typo-body text-ink-muted-48 mt-xxs">
                Tidak ada tugas yang cocok dengan kriteria filter saat ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isCompleted={completedTaskIds.includes(task.id)}
                  onToggleComplete={() => toggleTaskComplete(task.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
