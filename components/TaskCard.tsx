'use client';

import React from 'react';
import { Task } from '../types/task';
import { ICONS } from '../lib/constants';
import { formatDate, getRelativeTime, getDeadlineStatus } from '../lib/utils';

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onToggleComplete: () => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  isCompleted, 
  onToggleComplete,
  compact = false 
}) => {
  const deadlineStatus = getDeadlineStatus(task.dueDate);
  const relativeTime = getRelativeTime(task.dueDate);

  const getCardClasses = () => {
    let classes = 'bg-canvas border p-lg rounded-lg transition-smooth flex flex-col justify-between ';
    if (isCompleted) {
      classes += 'border-hairline opacity-70';
    } else if (deadlineStatus === 'passed') {
      classes += 'border-danger/30 bg-danger-bg/20';
    } else if (deadlineStatus === 'near') {
      classes += 'border-warning/30 bg-warning-bg/20';
    } else {
      classes += 'border-hairline hover:-translate-y-[2px]';
    }
    return classes;
  };

  const getBadge = () => {
    if (isCompleted) {
      return <span className="badge badge-success text-[12px] bg-success-bg text-success font-semibold px-xxs py-[2px] rounded-pill">Selesai</span>;
    }
    if (deadlineStatus === 'passed') {
      return <span className="badge badge-danger text-[12px] bg-danger-bg text-danger font-semibold px-xxs py-[2px] rounded-pill">Terlambat</span>;
    }
    if (deadlineStatus === 'near') {
      return <span className="badge badge-warning text-[12px] bg-warning-bg text-warning font-semibold px-xxs py-[2px] rounded-pill">Segera</span>;
    }
    return null;
  };

  return (
    <div className={getCardClasses()}>
      <div className="w-full">
        <div className="flex items-start justify-between gap-xs mb-xs">
          <div className="truncate">
            <span className="text-[12px] font-semibold text-primary tracking-tight">{task.courseName}</span>
            <h3 className={`typo-body-strong text-ink truncate mt-[2px] ${isCompleted ? 'line-through text-ink-muted-48' : ''}`}>
              {task.title}
            </h3>
          </div>
          {getBadge()}
        </div>

        {!compact && task.description && (
          <p className="typo-caption text-ink-muted-80 mb-md line-clamp-3 whitespace-pre-line">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-divider-soft pt-sm mt-sm">
        <div className={`flex items-center gap-xxs typo-fine-print text-ink-muted-48 ${
          !isCompleted && deadlineStatus === 'passed' ? 'text-danger font-semibold' : 
          !isCompleted && deadlineStatus === 'near' ? 'text-warning font-semibold' : ''
        }`}>
          <span 
            className="w-4 h-4 flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: ICONS.clock }}
          />
          <span>{task.dueDate ? formatDate(task.dueDate) : 'Tidak ada deadline'}</span>
          {relativeTime && !isCompleted && (
            <span className="text-[11px] font-normal">({relativeTime})</span>
          )}
        </div>

        <div className="flex items-center gap-xs">
          {task.link && task.link !== '#' && (
            <a 
              href={task.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-hairline hover:bg-canvas-parchment text-ink-muted-48 hover:text-ink flex items-center justify-center transition-smooth active-press"
              title="Buka di Classroom"
            >
              <span 
                className="w-4 h-4 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: ICONS.externalLink }}
              />
            </a>
          )}
          <button
            onClick={onToggleComplete}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-smooth active-press ${
              isCompleted
                ? 'bg-success border-success text-white'
                : 'border-hairline hover:bg-canvas-parchment text-ink-muted-48 hover:text-ink'
            }`}
            title={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
          >
            <span 
              className="w-4 h-4 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: ICONS.check }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
