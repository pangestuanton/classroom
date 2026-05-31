export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 19) return 'Selamat Sore';
  return 'Selamat Malam';
}

export function getTodayName(): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[new Date().getDay()];
}

export function getDayName(date: Date): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[date.getDay()];
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[monthIndex];
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Tidak ada deadline';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Tidak ada deadline';

  const day = date.getDate();
  const month = getMonthName(date.getMonth());
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

export function getRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  // Strip hours/mins/secs/ms to calculate diff in full days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const hoursLeft = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (hoursLeft > 0) return `Hari ini (${hoursLeft} jam lagi)`;
    return 'Hari ini';
  }
  if (diffDays === 1) return 'Besok';
  if (diffDays === 2) return 'Lusa';
  if (diffDays > 2) return `${diffDays} hari lagi`;
  if (diffDays === -1) return 'Kemarin';
  return `${Math.abs(diffDays)} hari yang lalu`;
}

export function getDeadlineStatus(dateStr: string | null, nearDays = 3): 'none' | 'near' | 'passed' {
  if (!dateStr) return 'none';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'none';

  const now = new Date();
  if (date < now) return 'passed';

  const diffTime = date.getTime() - now.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays <= nearDays) return 'near';
  return 'none';
}
