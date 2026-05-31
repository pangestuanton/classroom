'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { ICONS } from '../../lib/constants';

export default function SettingsPage() {
  const { isLoggedIn, user, login, logout, resetCompletedTasks, syncTasks, isLoading } = useApp();

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mereset data penyelesaian tugas lokal?')) {
      resetCompletedTasks();
      alert('Data penyelesaian tugas berhasil di-reset!');
    }
  };

  return (
    <div className="space-y-xl">
      {/* Page Header */}
      <div className="border-b border-hairline pb-md">
        <h1 className="typo-display-md text-ink font-semibold leading-tight">Pengaturan</h1>
        <p className="typo-caption text-ink-muted-48 mt-[2px]">
          Kelola akun Google Classroom, preferensi data, dan informasi aplikasi
        </p>
      </div>

      <div className="space-y-xl max-w-3xl">
        {/* Section: Google Account */}
        <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
          <div className="bg-surface-pearl px-lg py-md border-b border-hairline">
            <h2 className="typo-caption-strong text-ink font-semibold">Koneksi Akun Google</h2>
          </div>
          
          <div className="p-lg space-y-md">
            {isLoggedIn && user ? (
              <>
                <div className="flex items-center gap-md bg-canvas-parchment p-md rounded-md border border-hairline">
                  {user.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="w-12 h-12 rounded-full object-cover border border-hairline"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-[17px]">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="typo-body-strong text-ink">{user.name}</h3>
                    <p className="typo-caption text-ink-muted-48">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-divider-soft pt-md">
                  <div>
                    <h4 className="typo-body-strong text-ink">Status Koneksi</h4>
                    <p className="typo-caption text-ink-muted-48 mt-xxs">Terhubung dengan Google Classroom API</p>
                  </div>
                  <span className="badge text-[12px] bg-success-bg text-success font-semibold px-xs py-1 rounded-pill">
                    Terhubung
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-divider-soft pt-md">
                  <div>
                    <h4 className="typo-body-strong text-ink">Logout</h4>
                    <p className="typo-caption text-ink-muted-48 mt-xxs">Putuskan koneksi dengan Google Classroom</p>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-surface-pearl hover:bg-canvas-parchment text-ink typo-caption-strong py-xs px-md border border-hairline rounded-md transition-smooth active-press"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="typo-body-strong text-ink">Hubungkan dengan Google Classroom</h3>
                    <p className="typo-caption text-ink-muted-48 mt-xxs">
                      Masuk untuk mengambil data kelas dan tugas secara real-time
                    </p>
                  </div>
                  <button
                    onClick={login}
                    className="bg-primary hover:bg-primary-focus text-white typo-caption-strong py-2 px-md rounded-pill flex items-center gap-xs transition-smooth active-press"
                  >
                    <span dangerouslySetInnerHTML={{ __html: ICONS.google }} />
                    Login dengan Google
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-divider-soft pt-md">
                  <div>
                    <h4 className="typo-body-strong text-ink">Status Aplikasi</h4>
                    <p className="typo-caption text-ink-muted-48 mt-xxs">Saat ini berjalan menggunakan data demo</p>
                  </div>
                  <span className="badge text-[12px] bg-warning-bg text-warning font-semibold px-xs py-1 rounded-pill">
                    Mode Demo
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section: Data and Sync */}
        <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
          <div className="bg-surface-pearl px-lg py-md border-b border-hairline">
            <h2 className="typo-caption-strong text-ink font-semibold">Data & Sinkronisasi</h2>
          </div>
          
          <div className="p-lg space-y-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="typo-body-strong text-ink">Sinkronisasi Data</h3>
                <p className="typo-caption text-ink-muted-48 mt-xxs">
                  Ambil data tugas terbaru dari Google Classroom API
                </p>
              </div>
              <button
                onClick={syncTasks}
                disabled={!isLoggedIn || isLoading}
                className="bg-primary hover:bg-primary-focus disabled:bg-primary/40 disabled:cursor-not-allowed text-white typo-caption-strong py-xs px-md rounded-pill flex items-center gap-xs transition-smooth active-press"
              >
                <span 
                  className={`w-4 h-4 flex items-center justify-center ${isLoading ? 'animate-spin' : ''}`}
                  dangerouslySetInnerHTML={{ __html: ICONS.sync }}
                />
                {isLoading ? 'Sinkronisasi...' : 'Sinkronisasi'}
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-divider-soft pt-md">
              <div>
                <h3 className="typo-body-strong text-ink">Reset Data Lokal</h3>
                <p className="typo-caption text-ink-muted-48 mt-xxs">
                  Hapus status tugas selesai dan setel ulang ke konfigurasi awal
                </p>
              </div>
              <button
                onClick={handleResetData}
                className="bg-surface-pearl hover:bg-canvas-parchment text-ink typo-caption-strong py-xs px-md border border-hairline rounded-md transition-smooth active-press"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>

        {/* Section: About */}
        <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
          <div className="bg-surface-pearl px-lg py-md border-b border-hairline">
            <h2 className="typo-caption-strong text-ink font-semibold">Tentang Aplikasi</h2>
          </div>
          
          <div className="p-lg space-y-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="typo-body-strong text-ink">Antugas Academic Dashboard</h3>
                <p className="typo-caption text-ink-muted-48 mt-xxs">Asisten akademik pengingat tugas kuliah</p>
              </div>
              <span className="typo-body text-ink font-semibold">v1.0.0</span>
            </div>

            <div className="flex items-center justify-between border-t border-divider-soft pt-md">
              <div>
                <h3 className="typo-body-strong text-ink">Teknologi Pendukung</h3>
                <p className="typo-caption text-ink-muted-48 mt-xxs">
                  Next.js, TypeScript, React, Google Classroom API, Google GIS SDK
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
