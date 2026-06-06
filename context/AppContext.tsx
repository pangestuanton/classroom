/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course, GoogleUserProfile } from '../types/classroom';
import { Task } from '../types/task';
import { getDummyTasks, getDummyCourses } from '../data/dummyTasks';
import { CONFIG } from '../lib/constants';
import {
  initializeGoogleClient,
  signInWithGoogle,
  signOutGoogle,
  fetchUserInfo,
  getClassroomCourses,
  getAllClassroomTasks,
  isGoogleSdkLoaded
} from '../lib/classroom';

interface AppContextType {
  isLoggedIn: boolean;
  user: GoogleUserProfile | null;
  courses: Course[];
  tasks: Task[];
  isLoading: boolean;
  completedTaskIds: string[];
  gapiInited: boolean;
  icalUrl: string;
  login: () => void;
  logout: () => void;
  syncTasks: () => Promise<void>;
  toggleTaskComplete: (taskId: string) => void;
  resetCompletedTasks: () => void;
  updateIcalUrl: (url: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_is_logged_in') === 'true';
    }
    return false;
  });

  const [user, setUser] = useState<GoogleUserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_user');
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
        console.warn(e);
      }
    }
    return null;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCourses = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_courses');
        if (savedCourses) return JSON.parse(savedCourses);
      } catch (e) {
        console.warn(e);
      }
    }
    return getDummyCourses();
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTasks = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_tasks');
        if (savedTasks) return JSON.parse(savedTasks);
      } catch (e) {
        console.warn(e);
      }
    }
    return getDummyTasks();
  });

  const [isLoading, setIsLoading] = useState(false);

  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCompleted = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_completed');
        return savedCompleted ? JSON.parse(savedCompleted) : [];
      } catch (e) {
        console.warn('Failed to load completed task IDs:', e);
      }
    }
    return [];
  });

  const [tokenClient, setTokenClient] = useState<any>(null);
  const [gapiInited, setGapiInited] = useState(false);

  const [icalUrl, setIcalUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_ical') || '';
      } catch (e) {
        console.warn('Failed to load iCal URL:', e);
      }
    }
    return '';
  });

  // Helper to fetch iCal tasks via Next.js server-side proxy API
  const fetchIcalTasks = async (urlToFetch: string): Promise<Task[]> => {
    if (!urlToFetch) return [];
    try {
      const response = await fetch(`/api/ical?url=${encodeURIComponent(urlToFetch)}`);
      if (response.ok) {
        return await response.json();
      } else {
        console.warn('Failed to fetch iCal tasks from Vercel proxy.');
      }
    } catch (e) {
      console.warn('Error fetching iCal tasks:', e);
    }
    return [];
  };

  // 1. Mount loader: fetches Moodle tasks on mount if not logged in (to update dummy list with fresh feed)
  useEffect(() => {
    const loadMoodleTasksOnMount = async () => {
      const savedLogin = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_is_logged_in');
      if (savedLogin !== 'true' && icalUrl) {
        try {
          const iTasks = await fetchIcalTasks(icalUrl);
          if (iTasks.length > 0) {
            setTasks(prev => {
              const nonIcal = prev.filter(t => t.courseId !== 'itera-moodle');
              return [...nonIcal, ...iTasks];
            });
          }
        } catch (e) {
          console.warn('Failed to sync Moodle tasks on mount:', e);
        }
      }
    };
    loadMoodleTasksOnMount();
  }, [icalUrl]);

  // 2. Initialize Google SDKs
  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null;
    
    const initClient = () => {
      if (isGoogleSdkLoaded()) {
        initializeGoogleClient(
          async (authResponse) => {
            if (authResponse.error) {
              console.error('Google Classroom authentication error:', authResponse.error);
              return;
            }
            
            setIsLoading(true);
            try {
              // 1. Profile
              const profile = await fetchUserInfo(authResponse.access_token);
              setUser(profile);
              setIsLoggedIn(true);
              localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_user', JSON.stringify(profile));
              localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_is_logged_in', 'true');
              
              // 2. Courses
              const fetchedCourses = await getClassroomCourses();
              setCourses(fetchedCourses);
              localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_courses', JSON.stringify(fetchedCourses));
              
              // 3. Tasks (Google Classroom)
              const classroomTasks = await getAllClassroomTasks(fetchedCourses);
              
              // 4. Tasks (Moodle iCal)
              const moodleTasks = icalUrl ? await fetchIcalTasks(icalUrl) : [];
              
              const mergedTasks = [...classroomTasks, ...moodleTasks];
              setTasks(mergedTasks);
              localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_tasks', JSON.stringify(mergedTasks));
            } catch (err) {
              console.error('Failed to sync Google Classroom data:', err);
            } finally {
              setIsLoading(false);
            }
          },
          (client) => {
            setTokenClient(client);
            setGapiInited(true);
          }
        );
        if (checkInterval) {
          clearInterval(checkInterval);
        }
      }
    };

    initClient();
    checkInterval = setInterval(initClient, 100);
    
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [icalUrl]); // Re-init when icalUrl updates to ensure sync callback captures the latest state

  // 3. Automatically synchronize completedTaskIds with API-completed tasks
  useEffect(() => {
    const apiDoneIds = tasks.filter(t => t.status === 'done').map(t => t.id);
    if (apiDoneIds.length > 0) {
      Promise.resolve().then(() => {
        setCompletedTaskIds(prev => {
          const merged = Array.from(new Set([...prev, ...apiDoneIds]));
          if (merged.length !== prev.length) {
            localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_completed', JSON.stringify(merged));
            return merged;
          }
          return prev;
        });
      });
    }
  }, [tasks]);

  // Login handler
  const login = () => {
    if (tokenClient) {
      signInWithGoogle(tokenClient);
    } else {
      console.warn('Google API is not initialized. Using Mock/Dummy data.');
    }
  };

  // Logout handler
  const logout = () => {
    signOutGoogle(async () => {
      setIsLoggedIn(false);
      setUser(null);
      
      const moodleTasks = icalUrl ? await fetchIcalTasks(icalUrl) : [];
      setTasks([...getDummyTasks(), ...moodleTasks]);
      setCourses(getDummyCourses());
      
      localStorage.removeItem(CONFIG.LOCAL_STORAGE_KEY + '_user');
      localStorage.removeItem(CONFIG.LOCAL_STORAGE_KEY + '_courses');
      localStorage.removeItem(CONFIG.LOCAL_STORAGE_KEY + '_tasks');
      localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_is_logged_in', 'false');
    });
  };

  // Centralized tasks synchronization (Moodle + Google Classroom)
  const syncTasks = async () => {
    setIsLoading(true);
    try {
      let classroomTasks: Task[] = [];
      if (isLoggedIn) {
        const fetchedCourses = await getClassroomCourses();
        setCourses(fetchedCourses);
        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_courses', JSON.stringify(fetchedCourses));

        classroomTasks = await getAllClassroomTasks(fetchedCourses);
      } else {
        classroomTasks = getDummyTasks();
      }

      // Sync Moodle tasks
      const moodleTasks = icalUrl ? await fetchIcalTasks(icalUrl) : [];

      const mergedTasks = [...classroomTasks, ...moodleTasks];
      setTasks(mergedTasks);
      localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_tasks', JSON.stringify(mergedTasks));
    } catch (err) {
      console.error('Manual tasks sync failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update iCal feed URL and trigger synchronization
  const updateIcalUrl = async (url: string) => {
    setIcalUrl(url);
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_ical', url);
    
    // Auto sync with the new URL
    setIsLoading(true);
    try {
      let classroomTasks: Task[] = [];
      if (isLoggedIn) {
        const cachedCourses = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_courses');
        const parsedCourses = cachedCourses ? JSON.parse(cachedCourses) : [];
        classroomTasks = parsedCourses.length > 0 ? await getAllClassroomTasks(parsedCourses) : [];
      } else {
        classroomTasks = getDummyTasks();
      }

      const moodleTasks = url ? await fetchIcalTasks(url) : [];
      
      const mergedTasks = [...classroomTasks, ...moodleTasks];
      setTasks(mergedTasks);
      localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_tasks', JSON.stringify(mergedTasks));
    } catch (err) {
      console.error('Failed to sync new iCal URL:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle task complete status
  const toggleTaskComplete = (taskId: string) => {
    let updated: string[];
    if (completedTaskIds.includes(taskId)) {
      updated = completedTaskIds.filter(id => id !== taskId);
    } else {
      updated = [...completedTaskIds, taskId];
    }
    setCompletedTaskIds(updated);
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_completed', JSON.stringify(updated));
  };

  // Reset all completed task overrides
  const resetCompletedTasks = () => {
    setCompletedTaskIds([]);
    localStorage.removeItem(CONFIG.LOCAL_STORAGE_KEY + '_completed');
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        user,
        courses,
        tasks,
        isLoading,
        completedTaskIds,
        gapiInited,
        icalUrl,
        login,
        logout,
        syncTasks,
        toggleTaskComplete,
        resetCompletedTasks,
        updateIcalUrl
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
