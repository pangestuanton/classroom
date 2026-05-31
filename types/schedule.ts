export interface CourseSchedule {
  code: string;
  name: string;
  time: string;
  sks: number;
  class: string;
  room: string;
  lecturer: string;
  link: string;
}

export interface DaySchedule {
  day: string;
  courses: CourseSchedule[];
}
