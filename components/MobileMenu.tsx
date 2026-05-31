'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { ICONS } from '../lib/constants';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { isLoggedIn, user, login, logout } = useApp();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: ICONS.dashboard },
    { name: 'Tugas', path: '/tasks', icon: ICONS.task },
    { name: 'Jadwal Kuliah', path: '/schedule', icon: ICONS.schedule },
    { name: 'Pengaturan', path: '/settings', icon: ICONS.settings }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 bg-surface-black/30 backdrop-blur-[4px] z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar Drawer */}
      <div className="fixed top-[44px] right-0 bottom-0 w-[280px] bg-canvas border-l border-hairline py-lg px-md z-50 md:hidden flex flex-col justify-between shadow-2xl animate-fade-in">
        <nav className="space-y-xxs">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-sm py-md px-sm rounded-sm typo-body-strong transition-smooth active-press ${
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

        {/* Auth profile segment */}
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
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full text-center bg-surface-pearl hover:bg-canvas-parchment text-ink typo-caption border border-hairline py-[8px] rounded-md transition-smooth active-press"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                login();
                onClose();
              }}
              className="w-full bg-primary hover:bg-primary-focus text-white typo-caption-strong py-[10px] rounded-pill flex items-center justify-center gap-xs transition-smooth active-press"
            >
              <span dangerouslySetInnerHTML={{ __html: ICONS.google }} />
              Login dengan Google
            </button>
          )}
        </div>
      </div>
    </>
  );
};
