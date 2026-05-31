'use client';

import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileMenu } from './MobileMenu';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-canvas-parchment flex flex-col font-body">
      {/* Top Fixed Global Nav */}
      <Navbar 
        onHamburgerClick={toggleMobileMenu} 
        isMobileMenuOpen={isMobileMenuOpen} 
      />

      {/* Main Container Wrapper */}
      <div className="flex-1 flex w-full relative">
        {/* Left Fixed Sidebar (Desktop only) */}
        <Sidebar />

        {/* Slide-out Mobile Menu Tray */}
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={closeMobileMenu} 
        />

        {/* Content canvas pane */}
        <main className="flex-1 flex flex-col lg:pl-[260px] pt-[44px] w-full min-h-[calc(100vh-44px)]">
          <div className="flex-1 p-md sm:p-lg lg:p-xl max-w-[1440px] w-full mx-auto flex flex-col justify-between">
            <div className="w-full">
              {children}
            </div>
            
            {/* Standard Premium Footer */}
            <footer className="mt-xxl border-t border-hairline pt-xl pb-md text-center">
              <p className="typo-fine-print text-ink-muted-48">
                Antugas &copy; 2026 — Academic Productivity Dashboard
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};
