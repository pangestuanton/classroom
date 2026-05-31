import React from 'react';
import { CourseSchedule } from '../types/schedule';
import { ICONS } from '../lib/constants';

interface ScheduleCardProps {
  course: CourseSchedule;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ course }) => {
  return (
    <div className="bg-canvas border border-hairline p-lg rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-md transition-smooth hover:border-primary/30 select-none">
      <div className="flex items-start gap-md">
        {/* Time Badge */}
        <div className="bg-canvas-parchment text-ink typo-caption-strong border border-hairline py-xs px-sm rounded-sm font-semibold text-center min-w-[110px] flex items-center justify-center">
          {course.time}
        </div>
        
        {/* Course Info */}
        <div className="space-y-xxs">
          <h4 className="typo-body-strong text-ink">{course.name}</h4>
          
          {/* Metadata Badges */}
          <div className="flex items-center gap-xxs flex-wrap">
            {course.code && (
              <span className="badge text-[11px] font-semibold bg-primary/10 text-primary px-xxs py-[2px] rounded-pill">
                {course.code}
              </span>
            )}
            {course.sks && (
              <span className="badge text-[11px] font-semibold bg-primary/10 text-primary px-xxs py-[2px] rounded-pill">
                {course.sks} SKS
              </span>
            )}
            {course.class && (
              <span className="badge text-[11px] font-semibold bg-primary/10 text-primary px-xxs py-[2px] rounded-pill">
                Kelas {course.class}
              </span>
            )}
          </div>
          
          {/* Details (lecturer & room) */}
          <div className="flex flex-wrap items-center gap-sm typo-fine-print text-ink-muted-48 pt-xxs">
            <span className="flex items-center gap-[2px]">
              <span 
                className="w-4 h-4 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: ICONS.user }}
              />
              {course.lecturer}
            </span>
            <span className="flex items-center gap-[2px]">
              <span 
                className="w-4 h-4 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: ICONS.mapPin }}
              />
              {course.room}
            </span>
          </div>
        </div>
      </div>

      {/* Online / Offline Action Link */}
      <div className="flex-shrink-0 self-start sm:self-center">
        {course.link ? (
          <a
            href={course.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary hover:bg-primary-focus text-white typo-caption-strong py-2 px-md rounded-pill transition-smooth active-press"
          >
            Buka Link
          </a>
        ) : (
          <span className="inline-block bg-surface-pearl text-ink-muted-48 border border-divider-soft typo-caption py-2 px-md rounded-pill select-none">
            Offline
          </span>
        )}
      </div>
    </div>
  );
};
