import { CONFIG } from './constants';
import { Course } from '../types/classroom';
import { Task } from '../types/task';

// Extend window interface for Google APIs
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface AuthResponse {
  access_token: string;
  error?: string;
}

export function isGoogleSdkLoaded(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof window.gapi !== 'undefined' && typeof window.google !== 'undefined';
}

/** Initialize Google GAPI and GIS client */
export function initializeGoogleClient(
  onAuthResponse: (response: AuthResponse) => void,
  onInitReady: (tokenClient: any) => void
): void {
  if (typeof window === 'undefined') return;

  const { gapi, google } = window;

  if (!gapi || !google || !google.accounts) {
    console.warn('Google SDKs are not fully loaded yet.');
    return;
  }

  // 1. Initialize GAPI client
  gapi.load('client', async () => {
    try {
      await gapi.client.init({
        apiKey: CONFIG.API_KEY,
        discoveryDocs: [CONFIG.DISCOVERY_DOC]
      });

      // 2. Initialize GIS Token Client
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.CLIENT_ID,
        scope: CONFIG.SCOPES,
        callback: (resp: any) => {
          onAuthResponse(resp);
        }
      });

      onInitReady(tokenClient);
    } catch (err) {
      console.error('Failed to initialize Google API client:', err);
    }
  });
}

/** Trigger OAuth 2.0 consent flow */
export function signInWithGoogle(tokenClient: any): void {
  if (typeof window === 'undefined' || !tokenClient) return;
  const { gapi } = window;

  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

/** Revoke access tokens and clean up */
export function signOutGoogle(onLogoutSuccess: () => void): void {
  if (typeof window === 'undefined') return;
  const { gapi, google } = window;

  try {
    const token = gapi.client.getToken();
    if (token) {
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken('');
    }
  } catch (err) {
    console.warn('Token revocation failed:', err);
  }

  onLogoutSuccess();
}

/** Fetch user profile info from Google */
export async function fetchUserInfo(accessToken: string) {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await response.json();
    return {
      name: data.name || 'Mahasiswa',
      email: data.email || '',
      picture: data.picture || ''
    };
  } catch (err) {
    console.error('Failed to fetch user info:', err);
    throw err;
  }
}

/** Fetch all active Google Classroom courses */
export async function getClassroomCourses(): Promise<Course[]> {
  if (typeof window === 'undefined') return [];
  const { gapi } = window;

  const response = await gapi.client.classroom.courses.list({
    courseStates: ['ACTIVE'],
    pageSize: 20
  });

  const courses = response.result.courses || [];
  return courses.map((c: any) => ({
    id: c.id,
    name: c.name
  }));
}

/** Fetch coursework items for a specific course */
export async function getClassroomCourseWork(course: Course): Promise<Task[]> {
  if (typeof window === 'undefined') return [];
  const { gapi } = window;

  // 1. Fetch coursework list
  const response = await gapi.client.classroom.courses.courseWork.list({
    courseId: course.id,
    pageSize: 30,
    orderBy: 'dueDate desc'
  });

  const courseWork = response.result.courseWork || [];

  // 2. Fetch student submissions to check turn-in status
  let submissions: any[] = [];
  try {
    const subResponse = await gapi.client.classroom.courses.courseWork.studentSubmissions.list({
      courseId: course.id,
      courseWorkId: '-', // Wildcard for all coursework in this course
      pageSize: 100
    });
    submissions = subResponse.result.studentSubmissions || [];
  } catch (err) {
    console.warn(`Failed to fetch student submissions for course: ${course.name}`, err);
  }

  // 3. Map coursework items and determine completion status
  return courseWork.map((cw: any) => {
    // Find matching submission
    const sub = submissions.find((s: any) => s.courseWorkId === cw.id);
    // Task is completed if turned in or returned with grade
    const isSubmitted = sub && (sub.state === 'TURNED_IN' || sub.state === 'RETURNED');

    return {
      id: cw.id,
      title: cw.title || 'Tanpa Judul',
      description: cw.description || '',
      courseId: course.id,
      courseName: course.name,
      dueDate: cw.dueDate ? buildDateFromDue(cw.dueDate, cw.dueTime) : null,
      link: cw.alternateLink || '#',
      status: isSubmitted ? 'done' : 'todo'
    };
  });
}

/** Fetch coursework lists for all provided courses */
export async function getAllClassroomTasks(courses: Course[]): Promise<Task[]> {
  const allTasks: Task[] = [];

  for (const course of courses) {
    try {
      const courseTasks = await getClassroomCourseWork(course);
      allTasks.push(...courseTasks);
    } catch (err) {
      console.warn(`Failed to fetch coursework for course: ${course.name}`, err);
    }
  }

  return allTasks;
}

/** Helper to compile date from Google's separate due year, month, day, hour, and minute properties */
function buildDateFromDue(dueDate: any, dueTime: any): string | null {
  if (!dueDate) return null;
  const year = dueDate.year;
  const month = (dueDate.month || 1) - 1; // 0-indexed in JS
  const day = dueDate.day || 1;
  const hours = dueTime ? (dueTime.hours || 0) : 23;
  const minutes = dueTime ? (dueTime.minutes || 0) : 59;
  return new Date(year, month, day, hours, minutes).toISOString();
}
