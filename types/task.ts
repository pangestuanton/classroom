export interface Task {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  dueDate: string | null; // ISO Date string or null
  link: string;
  status: 'todo' | 'doing' | 'done';
}
