import { Task } from '../types/task';

export const getDummyTasks = (): Task[] => {
  const now = new Date();
  
  return [
    {
      id: 'dummy-1',
      title: 'Tugas Praktikum Algoritma #3',
      description: 'Implementasikan algoritma sorting (bubble sort, merge sort, quick sort) dalam bahasa C++. Sertakan analisis kompleksitas waktu.',
      courseId: 'course-1',
      courseName: 'Algoritma & Pemrograman',
      dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Besok
      link: '#',
      status: 'todo'
    },
    {
      id: 'dummy-2',
      title: 'Laporan Praktikum Basis Data',
      description: 'Buat laporan tentang normalisasi database hingga 3NF. Gunakan studi kasus sistem akademik.',
      courseId: 'course-2',
      courseName: 'Basis Data',
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Lusa
      link: '#',
      status: 'todo'
    },
    {
      id: 'dummy-3',
      title: 'Quiz Jaringan Komputer Bab 4',
      description: 'Quiz online tentang TCP/IP, subnetting, dan routing. Pastikan sudah membaca modul bab 4.',
      courseId: 'course-3',
      courseName: 'Jaringan Komputer',
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 Hari lagi
      link: '#',
      status: 'doing'
    },
    {
      id: 'dummy-4',
      title: 'Makalah Matematika Diskrit',
      description: 'Tulis makalah tentang aplikasi teori graf dalam kehidupan nyata. Minimal 10 halaman, format IEEE.',
      courseId: 'course-4',
      courseName: 'Matematika Diskrit',
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 Hari lagi
      link: '#',
      status: 'todo'
    },
    {
      id: 'dummy-5',
      title: 'Project Website Pemrograman Web',
      description: 'Buat website portofolio responsive menggunakan HTML, CSS, dan JavaScript. Harus memiliki minimal 3 halaman.',
      courseId: 'course-5',
      courseName: 'Pemrograman Web',
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 Hari lagi
      link: '#',
      status: 'todo'
    },
    {
      id: 'dummy-6',
      title: 'UTS Sistem Operasi',
      description: 'Ujian tengah semester mencakup materi proses, thread, scheduling, dan deadlock.',
      courseId: 'course-6',
      courseName: 'Sistem Operasi',
      dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 Hari lagi
      link: '#',
      status: 'todo'
    },
    {
      id: 'dummy-7',
      title: 'Tugas Kecerdasan Buatan',
      description: 'Implementasikan algoritma A* untuk penyelesaian puzzle 8-puzzle. Sertakan dokumentasi dan analisis.',
      courseId: 'course-7',
      courseName: 'Kecerdasan Buatan',
      dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Kemarin (Terlambat)
      link: '#',
      status: 'todo'
    },
    {
      id: 'dummy-8',
      title: 'Review Paper Statistika',
      description: 'Review 3 paper jurnal tentang penerapan statistika dalam data science. Gunakan format APA.',
      courseId: 'course-8',
      courseName: 'Statistika',
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 Hari lagi
      link: '#',
      status: 'done'
    }
  ];
};

export const getDummyCourses = () => {
  return [
    { id: 'course-1', name: 'Algoritma & Pemrograman' },
    { id: 'course-2', name: 'Basis Data' },
    { id: 'course-3', name: 'Jaringan Komputer' },
    { id: 'course-4', name: 'Matematika Diskrit' },
    { id: 'course-5', name: 'Pemrograman Web' },
    { id: 'course-6', name: 'Sistem Operasi' },
    { id: 'course-7', name: 'Kecerdasan Buatan' },
    { id: 'course-8', name: 'Statistika' }
  ];
};
