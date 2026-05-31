/* ============================================================
   ANTUGAS — Academic Productivity Dashboard
   Main Application Script
   ============================================================ */

/* ============================
   1. CONFIGURATION
   ============================ */
const CONFIG = {
  // Google API credentials — replace with your own
  // See: https://console.cloud.google.com/
  CLIENT_ID: '460364343692-e4jtpob6vgsvuq4legvhioa5r6s3ckl0.apps.googleusercontent.com',
  API_KEY: 'AIzaSyAqt6x_MAJPyQqV1yaEp7xU57I7pkhpYxU',
  DISCOVERY_DOC: 'https://classroom.googleapis.com/$discovery/rest?version=v1',
  SCOPES: [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.me.readonly'
  ].join(' '),

  // App settings
  DEADLINE_NEAR_DAYS: 3,
  TOAST_DURATION: 3000,
  LOCAL_STORAGE_KEY: 'antugas_data'
};


/* ============================
   2. APPLICATION STATE
   ============================ */
const state = {
  currentPage: 'dashboard',
  isLoggedIn: false,
  isLoading: false,
  user: null,
  tokenClient: null,
  gapiInited: false,
  gisInited: false,

  // Data
  courses: [],
  tasks: [],
  completedTaskIds: new Set(),

  // Filters
  taskFilter: 'semua',
  dayFilter: 'semua'
};


/* ============================
   3. SCHEDULE DATA
   Loaded from js/data.js (SCHEDULE_DATABASE)
   ============================ */

// Load schedule from localStorage or use database from data.js
function getSchedule() {
  const saved = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_schedule');
  return saved ? JSON.parse(saved) : SCHEDULE_DATABASE;
}


/* ============================
   4. DUMMY DATA (FALLBACK)
   Used when Google Classroom API is unavailable
   ============================ */
function getDummyTasks() {
  const now = new Date();
  return [
    {
      id: 'dummy-1',
      title: 'Tugas Praktikum Algoritma #3',
      description: 'Implementasikan algoritma sorting (bubble sort, merge sort, quick sort) dalam bahasa C++. Sertakan analisis kompleksitas waktu.',
      courseId: 'course-1',
      courseName: 'Algoritma & Pemrograman',
      dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      link: '#',
      status: 'CREATED'
    },
    {
      id: 'dummy-2',
      title: 'Laporan Praktikum Basis Data',
      description: 'Buat laporan tentang normalisasi database hingga 3NF. Gunakan studi kasus sistem akademik.',
      courseId: 'course-2',
      courseName: 'Basis Data',
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      link: '#',
      status: 'CREATED'
    },
    {
      id: 'dummy-3',
      title: 'Quiz Jaringan Komputer Bab 4',
      description: 'Quiz online tentang TCP/IP, subnetting, dan routing. Pastikan sudah membaca modul bab 4.',
      courseId: 'course-3',
      courseName: 'Jaringan Komputer',
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      link: '#',
      status: 'CREATED'
    },
    {
      id: 'dummy-4',
      title: 'Makalah Matematika Diskrit',
      description: 'Tulis makalah tentang aplikasi teori graf dalam kehidupan nyata. Minimal 10 halaman, format IEEE.',
      courseId: 'course-4',
      courseName: 'Matematika Diskrit',
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      link: '#',
      status: 'CREATED'
    },
    {
      id: 'dummy-5',
      title: 'Project Website Pemrograman Web',
      description: 'Buat website portofolio responsive menggunakan HTML, CSS, dan JavaScript. Harus memiliki minimal 3 halaman.',
      courseId: 'course-5',
      courseName: 'Pemrograman Web',
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      link: '#',
      status: 'CREATED'
    },
    {
      id: 'dummy-6',
      title: 'UTS Sistem Operasi',
      description: 'Ujian tengah semester mencakup materi proses, thread, scheduling, dan deadlock.',
      courseId: 'course-6',
      courseName: 'Sistem Operasi',
      dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      link: '#',
      status: 'CREATED'
    },
    {
      id: 'dummy-7',
      title: 'Tugas Kecerdasan Buatan',
      description: 'Implementasikan algoritma A* untuk penyelesaian puzzle 8-puzzle. Sertakan dokumentasi dan analisis.',
      courseId: 'course-7',
      courseName: 'Kecerdasan Buatan',
      dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      link: '#',
      status: 'CREATED'
    },
    {
      id: 'dummy-8',
      title: 'Review Paper Statistika',
      description: 'Review 3 paper jurnal tentang penerapan statistika dalam data science. Gunakan format APA.',
      courseId: 'course-8',
      courseName: 'Statistika',
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      link: '#',
      status: 'CREATED'
    }
  ];
}

function getDummyCourses() {
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
}


/* ============================
   5. GOOGLE CLASSROOM API
   ============================ */

/** Initialize the Google API client library */
function initGapiClient() {
  if (typeof gapi === 'undefined') {
    console.warn('Google API client library not loaded');
    return;
  }
  gapi.load('client', async () => {
    try {
      await gapi.client.init({
        apiKey: CONFIG.API_KEY,
        discoveryDocs: [CONFIG.DISCOVERY_DOC]
      });
      state.gapiInited = true;
      maybeEnableAuth();
    } catch (err) {
      console.warn('GAPI init failed:', err);
      loadDummyData();
    }
  });
}

/** Initialize Google Identity Services */
function initGIS() {
  if (typeof google === 'undefined' || !google.accounts) {
    console.warn('Google Identity Services not loaded');
    return;
  }
  try {
    state.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CONFIG.CLIENT_ID,
      scope: CONFIG.SCOPES,
      callback: handleAuthResponse
    });
    state.gisInited = true;
    maybeEnableAuth();
  } catch (err) {
    console.warn('GIS init failed:', err);
    loadDummyData();
  }
}

/** Check if both GAPI and GIS are ready */
function maybeEnableAuth() {
  if (state.gapiInited && state.gisInited) {
    renderNavActions();
  }
}

/** Handle the OAuth response */
function handleAuthResponse(response) {
  if (response.error) {
    console.error('Auth error:', response.error);
    showToast('Login gagal. Menggunakan data demo.');
    loadDummyData();
    return;
  }
  state.isLoggedIn = true;
  fetchUserInfo();
  fetchClassroomData();
}

/** Login with Google */
function handleLogin() {
  if (!state.tokenClient) {
    showToast('Google API belum siap. Menggunakan data demo.');
    loadDummyData();
    return;
  }

  if (gapi.client.getToken() === null) {
    state.tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    state.tokenClient.requestAccessToken({ prompt: '' });
  }
}

/** Logout */
function handleLogout() {
  const token = gapi.client.getToken();
  if (token) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
  }
  state.isLoggedIn = false;
  state.user = null;
  state.courses = [];
  state.tasks = [];
  renderNavActions();
  loadDummyData();
  showToast('Berhasil logout');
}

/** Fetch user info from Google */
async function fetchUserInfo() {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { 'Authorization': 'Bearer ' + gapi.client.getToken().access_token }
    });
    const data = await response.json();
    state.user = {
      name: data.name || 'Mahasiswa',
      email: data.email || '',
      picture: data.picture || ''
    };
    renderNavActions();
    renderDashboard();
  } catch (err) {
    console.warn('Failed to fetch user info:', err);
  }
}

/** Fetch all classroom data */
async function fetchClassroomData() {
  state.isLoading = true;
  renderLoading();

  try {
    // Fetch courses
    const coursesResponse = await gapi.client.classroom.courses.list({
      courseStates: ['ACTIVE'],
      pageSize: 20
    });

    const courses = coursesResponse.result.courses || [];
    state.courses = courses.map(c => ({
      id: c.id,
      name: c.name
    }));

    // Fetch coursework for each course
    const allTasks = [];
    for (const course of state.courses) {
      try {
        const cwResponse = await gapi.client.classroom.courses.courseWork.list({
          courseId: course.id,
          pageSize: 30,
          orderBy: 'dueDate desc'
        });

        const courseWork = cwResponse.result.courseWork || [];
        for (const cw of courseWork) {
          allTasks.push({
            id: cw.id,
            title: cw.title || 'Tanpa Judul',
            description: cw.description || '',
            courseId: course.id,
            courseName: course.name,
            dueDate: cw.dueDate ? buildDateFromDue(cw.dueDate, cw.dueTime) : null,
            link: cw.alternateLink || '#',
            status: cw.state || 'CREATED'
          });
        }
      } catch (cwErr) {
        console.warn(`Failed to fetch coursework for ${course.name}:`, cwErr);
      }
    }

    state.tasks = allTasks;
    state.isLoading = false;
    showToast('Data berhasil disinkronisasi');
    renderAll();

  } catch (err) {
    console.error('Classroom API error:', err);
    state.isLoading = false;
    showToast('Gagal mengambil data. Menggunakan data demo.');
    loadDummyData();
  }
}

/** Build a Date from Google Classroom's dueDate/dueTime objects */
function buildDateFromDue(dueDate, dueTime) {
  if (!dueDate) return null;
  const year = dueDate.year;
  const month = (dueDate.month || 1) - 1;
  const day = dueDate.day || 1;
  const hours = dueTime ? (dueTime.hours || 0) : 23;
  const minutes = dueTime ? (dueTime.minutes || 0) : 59;
  return new Date(year, month, day, hours, minutes).toISOString();
}


/* ============================
   6. DATA MANAGEMENT
   ============================ */

/** Load dummy data as fallback */
function loadDummyData() {
  state.courses = getDummyCourses();
  state.tasks = getDummyTasks();
  renderAll();
}

/** Load completed task IDs from localStorage */
function loadCompletedTasks() {
  try {
    const saved = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_completed');
    if (saved) {
      state.completedTaskIds = new Set(JSON.parse(saved));
    }
  } catch (e) {
    console.warn('Failed to load completed tasks:', e);
  }
}

/** Save completed task IDs to localStorage */
function saveCompletedTasks() {
  try {
    localStorage.setItem(
      CONFIG.LOCAL_STORAGE_KEY + '_completed',
      JSON.stringify([...state.completedTaskIds])
    );
  } catch (e) {
    console.warn('Failed to save completed tasks:', e);
  }
}

/** Toggle task completion */
function toggleTaskComplete(taskId) {
  if (state.completedTaskIds.has(taskId)) {
    state.completedTaskIds.delete(taskId);
  } else {
    state.completedTaskIds.add(taskId);
  }
  saveCompletedTasks();
  renderAll();
}

/** Reset all local data */
function resetLocalData() {
  state.completedTaskIds = new Set();
  localStorage.removeItem(CONFIG.LOCAL_STORAGE_KEY + '_completed');
  showToast('Data lokal berhasil direset');
  renderAll();
}

/** Check if a task is completed */
function isTaskCompleted(taskId) {
  return state.completedTaskIds.has(taskId);
}


/* ============================
   7. UTILITY FUNCTIONS
   ============================ */

/** Get Indonesian day name */
function getDayName(date) {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[date.getDay()];
}

/** Get Indonesian month name */
function getMonthName(month) {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return months[month];
}

/** Format date for display */
function formatDate(isoString) {
  if (!isoString) return 'Tidak ada deadline';
  const date = new Date(isoString);
  const day = date.getDate();
  const month = getMonthName(date.getMonth());
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

/** Format relative time */
function getRelativeTime(isoString) {
  if (!isoString) return '';
  const now = new Date();
  const target = new Date(isoString);
  const diffMs = target - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} hari yang lalu`;
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Besok';
  if (diffDays <= 7) return `${diffDays} hari lagi`;
  return `${diffDays} hari lagi`;
}

/** Check deadline proximity */
function getDeadlineStatus(isoString) {
  if (!isoString) return 'none';
  const now = new Date();
  const target = new Date(isoString);
  const diffMs = target - now;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return 'passed';
  if (diffDays <= CONFIG.DEADLINE_NEAR_DAYS) return 'near';
  return 'normal';
}

/** Get greeting based on time */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

/** Get today's Indonesian day name */
function getTodayName() {
  return getDayName(new Date());
}

/** SVG Icons (inline, per DESIGN.md — no icon library) */
const ICONS = {
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  externalLink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  google: '<svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>'
};


/* ============================
   8. RENDERING FUNCTIONS
   ============================ */

/** Render everything */
function renderAll() {
  renderDashboard();
  renderTasks();
  renderSchedule();
  renderSettings();
}

/** Render the navigation actions (login button or user info) */
function renderNavActions() {
  const container = document.getElementById('nav-actions');
  if (!container) return;

  if (state.isLoggedIn && state.user) {
    container.innerHTML = `
      <span class="nav-user-name">${state.user.name}</span>
      <div class="nav-avatar" title="${state.user.name}" id="nav-avatar">
        ${state.user.picture
          ? `<img src="${state.user.picture}" alt="${state.user.name}">`
          : `<div class="nav-avatar-initial">${state.user.name.charAt(0)}</div>`
        }
      </div>
      <button class="btn-logout" id="btn-logout">Logout</button>
    `;
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
  } else {
    container.innerHTML = `
      <button class="btn-google" id="btn-login">
        ${ICONS.google}
        <span>Login</span>
      </button>
    `;
    document.getElementById('btn-login').addEventListener('click', handleLogin);
  }
}

/** Render loading state */
function renderLoading() {
  const targets = ['dashboard-tasks', 'tasks-grid'];
  targets.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = '<div class="loading-spinner"></div>';
    }
  });
}


/* ---- DASHBOARD ---- */

function renderDashboard() {
  // Greeting
  const greetingEl = document.getElementById('dashboard-greeting');
  if (greetingEl) {
    const userName = state.user ? `, ${state.user.name.split(' ')[0]}` : '';
    greetingEl.textContent = getGreeting() + userName;
  }

  // Date
  const dateEl = document.getElementById('dashboard-date');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = `${getDayName(now)}, ${now.getDate()} ${getMonthName(now.getMonth())} ${now.getFullYear()}`;
  }

  // Stats
  renderStats();

  // Upcoming tasks
  renderDashboardTasks();

  // Today's schedule
  renderDashboardSchedule();
}

function renderStats() {
  const activeTasks = state.tasks.filter(t => !isTaskCompleted(t.id));
  const completedTasks = state.tasks.filter(t => isTaskCompleted(t.id));
  const nearDeadline = activeTasks.filter(t => getDeadlineStatus(t.dueDate) === 'near' || getDeadlineStatus(t.dueDate) === 'passed');
  const todaySchedule = getSchedule().find(s => s.day === getTodayName());
  const todayClassCount = todaySchedule ? todaySchedule.courses.length : 0;

  setStatValue('stat-active-value', activeTasks.length);
  setStatValue('stat-done-value', completedTasks.length);
  setStatValue('stat-deadline-value', nearDeadline.length);
  setStatValue('stat-today-classes-value', todayClassCount);
}

function setStatValue(elementId, value) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = value;
}

function renderDashboardTasks() {
  const container = document.getElementById('dashboard-tasks');
  if (!container) return;

  const activeTasks = state.tasks
    .filter(t => !isTaskCompleted(t.id))
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    })
    .slice(0, 4);

  if (activeTasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        ${ICONS.inbox}
        <div class="empty-title">Tidak Ada Tugas</div>
        <div class="empty-description">Semua tugas telah selesai!</div>
      </div>
    `;
    return;
  }

  container.innerHTML = activeTasks.map(task => renderTaskCard(task, true)).join('');
  attachTaskCardListeners(container);
}

function renderDashboardSchedule() {
  const container = document.getElementById('dashboard-schedule');
  if (!container) return;

  const todayName = getTodayName();
  const schedule = getSchedule();
  const todaySchedule = schedule.find(s => s.day === todayName);

  if (!todaySchedule || todaySchedule.courses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        ${ICONS.calendar}
        <div class="empty-title">Tidak Ada Kelas</div>
        <div class="empty-description">Tidak ada jadwal kuliah hari ini.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = todaySchedule.courses.map(course => renderScheduleCard(course)).join('');
}


/* ---- TASKS PAGE ---- */

function renderTasks() {
  const container = document.getElementById('tasks-grid');
  if (!container) return;

  let filteredTasks = [...state.tasks];

  // Apply filter
  switch (state.taskFilter) {
    case 'aktif':
      filteredTasks = filteredTasks.filter(t => !isTaskCompleted(t.id));
      break;
    case 'deadline':
      filteredTasks = filteredTasks.filter(t => {
        const status = getDeadlineStatus(t.dueDate);
        return !isTaskCompleted(t.id) && (status === 'near' || status === 'passed');
      });
      break;
    case 'selesai':
      filteredTasks = filteredTasks.filter(t => isTaskCompleted(t.id));
      break;
    default:
      // Check if it's a course filter
      if (state.taskFilter.startsWith('course:')) {
        const courseId = state.taskFilter.replace('course:', '');
        filteredTasks = filteredTasks.filter(t => t.courseId === courseId);
      }
      break;
  }

  // Sort by deadline (soonest first)
  filteredTasks.sort((a, b) => {
    // Completed tasks go to end
    const aCompleted = isTaskCompleted(a.id);
    const bCompleted = isTaskCompleted(b.id);
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;

    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  if (filteredTasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        ${ICONS.inbox}
        <div class="empty-title">Tidak Ada Tugas</div>
        <div class="empty-description">Tidak ada tugas yang cocok dengan filter ini.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredTasks.map(task => renderTaskCard(task, false)).join('');
  attachTaskCardListeners(container);

  // Add course filter pills dynamically
  renderCourseFilters();
}

function renderTaskCard(task, compact) {
  const completed = isTaskCompleted(task.id);
  const deadlineStatus = getDeadlineStatus(task.dueDate);
  let cardClass = 'task-card';
  if (completed) cardClass += ' completed';
  else if (deadlineStatus === 'passed') cardClass += ' deadline-passed';
  else if (deadlineStatus === 'near') cardClass += ' deadline-near';

  const deadlineClass = deadlineStatus === 'near' ? 'near' : (deadlineStatus === 'passed' ? 'passed' : '');
  const relativeTime = getRelativeTime(task.dueDate);

  return `
    <div class="${cardClass}" data-task-id="${task.id}">
      <div class="task-header">
        <div>
          <div class="task-course">${task.courseName}</div>
          <div class="task-title">${task.title}</div>
        </div>
        ${completed
          ? '<span class="badge badge-success">Selesai</span>'
          : (deadlineStatus === 'passed'
            ? '<span class="badge badge-danger">Terlambat</span>'
            : (deadlineStatus === 'near'
              ? '<span class="badge badge-warning">Segera</span>'
              : ''))
        }
      </div>
      ${!compact && task.description ? `<div class="task-description">${task.description}</div>` : ''}
      <div class="task-meta">
        <div class="task-deadline ${deadlineClass}">
          ${ICONS.clock}
          <span>${task.dueDate ? formatDate(task.dueDate) : 'Tidak ada deadline'}</span>
          ${relativeTime ? `<span class="task-relative-time">(${relativeTime})</span>` : ''}
        </div>
        <div class="task-actions">
          ${task.link && task.link !== '#'
            ? `<a href="${task.link}" target="_blank" rel="noopener noreferrer" class="btn-icon" title="Buka di Classroom">${ICONS.externalLink}</a>`
            : ''
          }
          <button class="btn-icon task-toggle-btn${completed ? ' task-completed' : ''}" data-task-id="${task.id}"
                  title="${completed ? 'Tandai belum selesai' : 'Tandai selesai'}">
            ${ICONS.check}
          </button>
        </div>
      </div>
    </div>
  `;
}

function attachTaskCardListeners(container) {
  container.querySelectorAll('.task-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = btn.getAttribute('data-task-id');
      toggleTaskComplete(taskId);
      const wasCompleted = !isTaskCompleted(taskId);
      showToast(wasCompleted ? 'Tugas ditandai belum selesai' : 'Tugas ditandai selesai ✓');
    });
  });
}

function renderCourseFilters() {
  const filterBar = document.getElementById('task-filters');
  if (!filterBar) return;

  // Remove existing course pills
  filterBar.querySelectorAll('[data-filter^="course:"]').forEach(el => el.remove());

  // Add course pills
  const uniqueCourses = [...new Map(state.courses.map(c => [c.id, c])).values()];
  uniqueCourses.forEach(course => {
    const pill = document.createElement('button');
    pill.className = 'filter-pill';
    if (state.taskFilter === `course:${course.id}`) {
      pill.classList.add('active');
    }
    pill.setAttribute('data-filter', `course:${course.id}`);
    pill.textContent = course.name;
    filterBar.appendChild(pill);
  });

  // Re-attach filter listeners
  attachTaskFilterListeners();
}


/* ---- SCHEDULE PAGE ---- */

function renderSchedule() {
  const container = document.getElementById('schedule-container');
  if (!container) return;

  const schedule = getSchedule();
  const todayName = getTodayName();
  let filteredSchedule = schedule;

  if (state.dayFilter === 'today') {
    filteredSchedule = schedule.filter(s => s.day === todayName);
  } else if (state.dayFilter !== 'semua') {
    filteredSchedule = schedule.filter(s => s.day === state.dayFilter);
  }

  if (filteredSchedule.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        ${ICONS.calendar}
        <div class="empty-title">Tidak Ada Jadwal</div>
        <div class="empty-description">Tidak ada jadwal kuliah untuk hari yang dipilih.</div>
      </div>
    `;
    return;
  }

  // Filter out days with no courses
  filteredSchedule = filteredSchedule.filter(s => s.courses.length > 0);

  if (filteredSchedule.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        ${ICONS.calendar}
        <div class="empty-title">Tidak Ada Jadwal</div>
        <div class="empty-description">Tidak ada jadwal kuliah untuk hari yang dipilih.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredSchedule.map(daySchedule => {
    const isToday = daySchedule.day === todayName;
    return `
      <div class="schedule-day-group ${isToday ? 'today' : ''}">
        <div class="schedule-day-label">
          ${daySchedule.day}
          ${isToday ? '<span class="today-badge">Hari Ini</span>' : ''}
        </div>
        ${daySchedule.courses.map(course => renderScheduleCard(course)).join('')}
      </div>
    `;
  }).join('');
}

function renderScheduleCard(course) {
  const sksLabel = course.sks ? `${course.sks} SKS` : '';
  const codeLabel = course.code || '';
  const classLabel = course.class || '';

  return `
    <div class="schedule-card">
      <div class="schedule-time">${course.time}</div>
      <div class="schedule-info">
        <div class="schedule-course-name">${course.name}</div>
        <div class="schedule-meta-badges">
          ${codeLabel ? `<span class="badge badge-primary">${codeLabel}</span>` : ''}
          ${sksLabel ? `<span class="badge badge-primary">${sksLabel}</span>` : ''}
          ${classLabel ? `<span class="badge badge-primary">Kelas ${classLabel}</span>` : ''}
        </div>
        <div class="schedule-detail">
          <span>${ICONS.user} ${course.lecturer}</span>
          <span>${ICONS.mapPin} ${course.room}</span>
        </div>
      </div>
      ${course.link
        ? `<a href="${course.link}" target="_blank" rel="noopener noreferrer" class="schedule-room-link">Buka Link</a>`
        : '<span class="schedule-room-link schedule-offline">Offline</span>'
      }
    </div>
  `;
}


/* ---- SETTINGS PAGE ---- */

function renderSettings() {
  const container = document.getElementById('settings-account-content');
  if (!container) return;

  if (state.isLoggedIn && state.user) {
    container.innerHTML = `
      <div class="google-account-info">
        <div class="avatar">
          ${state.user.picture
            ? `<img src="${state.user.picture}" alt="${state.user.name}">`
            : state.user.name.charAt(0)
          }
        </div>
        <div class="account-details">
          <div class="account-name">${state.user.name}</div>
          <div class="account-email">${state.user.email}</div>
        </div>
      </div>
      <div class="settings-row settings-row-no-border">
        <div>
          <div class="settings-label">Status Koneksi</div>
          <div class="settings-description">Terhubung dengan Google Classroom</div>
        </div>
        <span class="badge badge-success">Terhubung</span>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-label">Logout</div>
          <div class="settings-description">Putuskan koneksi dengan Google Classroom</div>
        </div>
        <button class="btn-pearl" id="btn-settings-logout">Logout</button>
      </div>
    `;
    const logoutBtn = document.getElementById('btn-settings-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  } else {
    container.innerHTML = `
      <div class="settings-row settings-row-no-border">
        <div>
          <div class="settings-label">Hubungkan Akun Google</div>
          <div class="settings-description">Login untuk mengambil tugas dari Google Classroom</div>
        </div>
        <button class="btn-primary btn-sm" id="btn-settings-login">
          ${ICONS.google}
          Login dengan Google
        </button>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-label">Status</div>
          <div class="settings-description">Saat ini menggunakan data demo</div>
        </div>
        <span class="badge badge-warning">Demo</span>
      </div>
    `;
    const loginBtn = document.getElementById('btn-settings-login');
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
  }
}


/* ============================
   9. NAVIGATION (SPA)
   ============================ */

function navigateTo(pageName) {
  // Update state
  state.currentPage = pageName;

  // Update pages visibility
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Update nav active states (both desktop and mobile)
  document.querySelectorAll('.nav-menu-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-page') === pageName) {
      item.classList.add('active');
    }
  });

  // Close mobile menu
  closeMobileMenu();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function attachNavigationListeners() {
  // Desktop and mobile nav items
  document.querySelectorAll('.nav-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.getAttribute('data-page');
      if (page) navigateTo(page);
    });
  });

  // "View all" buttons on dashboard
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.getAttribute('data-goto');
      if (page) navigateTo(page);
    });
  });
}


/* ============================
   10. HAMBURGER MENU
   ============================ */

function initHamburgerMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const overlay = document.getElementById('nav-overlay');

  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
  }

  if (overlay) {
    overlay.addEventListener('click', closeMobileMenu);
  }
}

function toggleMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('nav-overlay');

  const isOpen = hamburger.classList.contains('active');

  if (isOpen) {
    closeMobileMenu();
  } else {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('visible');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('nav-overlay');

  if (hamburger) {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  if (mobileMenu) mobileMenu.classList.remove('visible');
  if (overlay) overlay.classList.remove('visible');
  document.body.style.overflow = '';
}


/* ============================
   11. FILTER INTERACTIONS
   ============================ */

function attachTaskFilterListeners() {
  const filterBar = document.getElementById('task-filters');
  if (!filterBar) return;

  filterBar.querySelectorAll('.filter-pill').forEach(pill => {
    // Remove old listeners by cloning
    const newPill = pill.cloneNode(true);
    pill.parentNode.replaceChild(newPill, pill);

    newPill.addEventListener('click', () => {
      // Update active state
      filterBar.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      newPill.classList.add('active');

      // Update filter
      state.taskFilter = newPill.getAttribute('data-filter');
      renderTasks();
    });
  });
}

function attachDayFilterListeners() {
  const filterBar = document.getElementById('day-filters');
  if (!filterBar) return;

  filterBar.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      // Update active state
      filterBar.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      // Update filter
      state.dayFilter = pill.getAttribute('data-day');
      renderSchedule();
    });
  });
}


/* ============================
   12. TOAST NOTIFICATIONS
   ============================ */

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('leaving');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, CONFIG.TOAST_DURATION);
}


/* ============================
   13. SETTINGS INTERACTIONS
   ============================ */

function attachSettingsListeners() {
  const syncBtn = document.getElementById('btn-sync-tasks');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      if (state.isLoggedIn) {
        fetchClassroomData();
      } else {
        showToast('Login terlebih dahulu untuk sinkronisasi');
        loadDummyData();
      }
    });
  }

  const resetBtn = document.getElementById('btn-reset-data');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetLocalData);
  }
}


/* ============================
   14. INITIALIZATION
   ============================ */

function init() {
  // Load saved data
  loadCompletedTasks();

  // Initialize navigation
  attachNavigationListeners();
  initHamburgerMenu();

  // Initialize filters
  attachTaskFilterListeners();
  attachDayFilterListeners();

  // Initialize settings
  attachSettingsListeners();

  // Initialize Google APIs (with safety checks)
  const hasValidClientId = CONFIG.CLIENT_ID && !CONFIG.CLIENT_ID.includes('YOUR_');
  if (hasValidClientId) {
    // Wait for scripts to load, then init
    if (typeof gapi !== 'undefined') {
      initGapiClient();
    } else {
      window.addEventListener('load', () => {
        if (typeof gapi !== 'undefined') initGapiClient();
      });
    }

    if (typeof google !== 'undefined' && google.accounts) {
      initGIS();
    } else {
      window.addEventListener('load', () => {
        if (typeof google !== 'undefined' && google.accounts) initGIS();
      });
    }
  }

  // Render with dummy data initially (will be replaced if API succeeds)
  renderNavActions();
  loadDummyData();

  // Log status
  if (!hasValidClientId) {
    console.info(
      '%c[Antugas] Menggunakan data demo. Untuk integrasi Google Classroom, atur CLIENT_ID dan API_KEY di js/script.js',
      'color: #0066cc; font-weight: bold;'
    );
  }
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
