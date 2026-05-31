'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { ICONS } from '../lib/constants';

interface NavbarProps {
  onHamburgerClick: () => void;
  isMobileMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onHamburgerClick, isMobileMenuOpen }) => {
  const { isLoggedIn, user, login, logout } = useApp();
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Tugas', path: '/tasks' },
    { name: 'Jadwal Kuliah', path: '/schedule' },
    { name: 'Pengaturan', path: '/settings' }
  ];

  return (
    <nav 
      className="fixed top-0 left-0 right-0 h-[44px] bg-surface-black text-on-dark flex items-center justify-between px-lg z-50 transition-smooth border-b border-white/10"
      role="navigation"
      aria-label="Navigasi utama"
    >
      <div className="flex items-center gap-xs font-display font-semibold text-lg tracking-tight select-none">
        <span 
          className="w-5 h-5 flex items-center justify-center text-primary-on-dark"
          dangerouslySetInnerHTML={{ __html: ICONS.logo }}
        />
        <Link href="/dashboard" className="text-white hover:text-white/80">Antugas</Link>
      </div>

      {/* Desktop navigation links */}
      <ul className="hidden md:flex items-center gap-lg h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <li key={item.path} className="h-full flex items-center">
              <Link
                href={item.path}
                className={`text-[12px] font-normal tracking-[-0.12px] transition-smooth h-full flex items-center border-b-2 px-xxs ${
                  isActive
                    ? 'text-white border-primary'
                    : 'text-ink-muted-48 hover:text-white border-transparent'
                }`}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Right actions: Google Login or User avatar */}
      <div className="flex items-center gap-md">
        <div className="hidden sm:block">
          {isLoggedIn && user ? (
            <div className="flex items-center gap-xs">
              <span className="text-[12px] text-ink-muted-48">{user.name}</span>
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="w-7 h-7 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[12px] font-semibold text-white">
                  {user.name.charAt(0)}
                </div>
              )}
              <button 
                onClick={logout}
                className="text-[12px] text-primary-on-dark hover:underline bg-transparent"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              className="bg-primary hover:bg-primary-focus text-white text-[12px] font-normal py-1 px-3 rounded-pill flex items-center gap-xxs transition-smooth active-press"
            >
              <span dangerouslySetInnerHTML={{ __html: ICONS.google }} />
              Login
            </button>
          )}
        </div>

        {/* Hamburger (mobile only) */}
        <button 
          onClick={onHamburgerClick}
          className="md:hidden flex flex-col justify-center items-center w-[24px] h-[24px] gap-[4px] relative"
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className={`w-[18px] h-[2px] bg-white transition-smooth ${isMobileMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}`}></span>
          <span className={`w-[18px] h-[2px] bg-white transition-smooth ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-[18px] h-[2px] bg-white transition-smooth ${isMobileMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`}></span>
        </button>
      </div>
    </nav>
  );
};
