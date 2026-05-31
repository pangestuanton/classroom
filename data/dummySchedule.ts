import { DaySchedule } from '../types/schedule';

export const DUMMY_SCHEDULE: DaySchedule[] = [
  {
    day: 'Senin',
    courses: [
      {
        code: 'WU25-00004',
        name: 'Agama Islam',
        time: '09.20 - 11.05',
        sks: 2,
        class: 'R2',
        room: 'GK2 403',
        lecturer: 'Yoga Anjas Pratama, M.Pd.',
        link: ''
      },
      {
        code: 'IF25-12004',
        name: 'Matematika Diskrit',
        time: '13.00 - 14.45',
        sks: 4,
        class: 'RB',
        room: 'GK2 124',
        lecturer: 'Radhinka Bagaskara, S.Si.Kom., M.Si., M.Sc.',
        link: ''
      }
    ]
  },
  {
    day: 'Selasa',
    courses: [
      {
        code: 'WI25-00004',
        name: 'Pengenalan Komputasi',
        time: '08.00 - 09.40',
        sks: 2,
        class: 'T16',
        room: 'LABKOM TPB 1 (LABTEK 3 LT. 3)',
        lecturer: 'I Wayan Wiprayoga Wisesa, S.Kom., M.Kom.',
        link: ''
      },
      {
        code: 'IF25-12004',
        name: 'Matematika Diskrit',
        time: '13.00 - 14.45',
        sks: 4,
        class: 'RB',
        room: 'GK2 223',
        lecturer: 'Radhinka Bagaskara, S.Si.Kom., M.Si., M.Sc.',
        link: ''
      }
    ]
  },
  {
    day: 'Rabu',
    courses: [
      {
        code: 'IF25-12003',
        name: 'Algoritma dan Struktur Data',
        time: '07.30 - 10.10',
        sks: 4,
        class: 'RA',
        room: 'GK2 315',
        lecturer: 'Rajif Agung Yunmar, S.Kom., M.Cs.',
        link: ''
      },
      {
        code: 'IF25-12005',
        name: 'Organisasi dan Arsitektur Komputer',
        time: '14.50 - 16.35',
        sks: 2,
        class: 'RC',
        room: 'GK2 328',
        lecturer: 'Eko Dwi Nugroho, S.Kom., M.Cs.',
        link: ''
      }
    ]
  },
  {
    day: 'Kamis',
    courses: [
      {
        code: 'IF25-12006',
        name: 'Matriks dan Ruang Vektor',
        time: '09.20 - 12.00',
        sks: 3,
        class: 'RC',
        room: 'GK2 308',
        lecturer: 'Mohamad Idris, S.Si., M.Sc.',
        link: ''
      },
      {
        code: 'IF25-12007',
        name: 'Sistem Operasi',
        time: '13.00 - 15.40',
        sks: 3,
        class: 'RD',
        room: 'GK2 305',
        lecturer: 'Ilham Firman Ashari, S.Kom., M.T.',
        link: ''
      }
    ]
  },
  {
    day: 'Jumat',
    courses: []
  }
];
