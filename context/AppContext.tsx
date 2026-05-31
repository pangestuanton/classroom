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
  login: () => void;
  logout: () => void;
  syncTasks: () => Promise<void>;
  toggleTaskComplete: (taskId: string) => void;
  resetCompletedTasks: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<GoogleUserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [gapiInited, setGapiInited] = useState(false);

  // 1. Load completed task IDs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_completed');
      if (saved) {
        setCompletedTaskIds(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load completed task IDs:', e);
    }
    
    // Load local tasks if they exist
    try {
      const savedTasks = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_tasks');
      const savedCourses = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_courses');
      const savedUser = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_user');
      const savedLogin = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_is_logged_in');
      
      if (savedTasks && savedCourses && savedUser && savedLogin === 'true') {
        setTasks(JSON.parse(savedTasks));
        setCourses(JSON.parse(savedCourses));
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      } else {
        // Default fallback to dummy
        setTasks(getDummyTasks());
        setCourses(getDummyCourses());
      }
    } catch (e) {
      console.warn('Failed to load cached application data:', e);
      setTasks(getDummyTasks());
      setCourses(getDummyCourses());
    }
  }, []);

  // 2. Initialize Google SDKs
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    
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
              // 1. Fetch profile info
              const profile = await fetchUserInfo(authResponse.access_token);
              setUser(profile);
              setIsLoggedIn(true);
              localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_user', JSON.stringify(profile));
              localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_is_logged_in', 'true');
              
              // 2. Fetch classroom content
              const fetchedCourses = await getClassroomCourses();
              setCourses(fetchedCourses);
              localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_courses', JSON.stringify(fetchedCourses));
              
              const fetchedTasks = await getAllClassroomTasks(fetchedCourses);
              setTasks(fetchedTasks);
              localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_tasks', JSON.stringify(fetchedTasks));
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
        if (checkInterval) clearInterval(checkInterval);
      }
    };

    // Try immediately
    initClient();

    // Or poll until loaded (since next/script executes in background)
    checkInterval = setInterval(initClient, 100);
    
    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

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
    signOutGoogle(() => {
      setIsLoggedIn(false);
      setUser(null);
      setTasks(getDummyTasks());
      setCourses(getDummyCourses());
      localStorage.removeItem(CONFIG.LOCAL_STORAGE_KEY + '_user');
      localStorage.removeItem(CONFIG.LOCAL_STORAGE_KEY + '_courses');
      localStorage.removeItem(CONFIG.LOCAL_STORAGE_KEY + '_tasks');
      localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_is_logged_in', 'false');
    });
  };

  // Manual tasks synchronization
  const syncTasks = async () => {
    if (!isLoggedIn) return;
    setIsLoading(true);
    try {
      const fetchedCourses = await getClassroomCourses();
      setCourses(fetchedCourses);
      localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_courses', JSON.stringify(fetchedCourses));

      const fetchedTasks = await getAllClassroomTasks(fetchedCourses);
      setTasks(fetchedTasks);
      localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_tasks', JSON.stringify(fetchedTasks));
    } catch (err) {
      console.error('Manual tasks sync failed:', err);
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
        login,
        logout,
        syncTasks,
        toggleTaskComplete,
        resetCompletedTasks
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
