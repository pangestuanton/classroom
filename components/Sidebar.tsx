'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { ICONS } from '../lib/constants';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isLoggedIn, user, login, logout } = useApp();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: ICONS.dashboard },
    { name: 'Tugas', path: '/tasks', icon: ICONS.task },
    { name: 'Jadwal Kuliah', path: '/schedule', icon: ICONS.schedule },
    { name: 'Pengaturan', path: '/settings', icon: ICONS.settings }
  ];

  return (
    <aside className="hidden lg:flex flex-col fixed top-[44px] left-0 bottom-0 w-[260px] bg-canvas border-r border-hairline py-lg px-md z-40">
      {/* Navigation menu list */}
      <nav className="flex-1 space-y-xxs">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-sm py-[10px] px-sm rounded-sm typo-body-strong transition-smooth active-press ${
                isActive
                  ? 'text-primary bg-primary/5'
                  : 'text-ink-muted-80 hover:text-ink hover:bg-canvas-parchment'
              }`}
            >
              <span 
                className="flex-shrink-0"
                dangerouslySetInnerHTML={{ __html: item.icon }}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile footer info */}
      <div className="pt-md border-t border-divider-soft">
        {isLoggedIn && user ? (
          <div className="space-y-sm">
            <div className="flex items-center gap-xs">
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-full object-cover border border-hairline"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-[17px]">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="truncate flex-1">
                <div className="typo-caption-strong text-ink truncate">{user.name}</div>
                <div className="text-[12px] text-ink-muted-48 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full text-center bg-surface-pearl hover:bg-canvas-parchment text-ink typo-caption border border-hairline py-[8px] rounded-md transition-smooth active-press"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className="w-full bg-primary hover:bg-primary-focus text-white typo-caption-strong py-[10px] rounded-pill flex items-center justify-center gap-xs transition-smooth active-press"
          >
            <span dangerouslySetInnerHTML={{ __html: ICONS.google }} />
            Login dengan Google
          </button>
        )}
      </div>
    </aside>
  );
};
