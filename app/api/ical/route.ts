import { NextResponse } from 'next/server';

function parseIcalDate(dateRaw: string): string | null {
  const cleanRaw = dateRaw.split(';')[0].replace(/[:=]/g, '').trim();
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/.exec(cleanRaw);
  if (!match) return null;

  const [_, year, month, day, hour, minute, second, isUtc] = match;

  if (hour && minute) {
    if (isUtc) {
      return new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second || '0')
      )).toISOString();
    } else {
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second || '0')
      ).toISOString();
    }
  } else {
    // All day event, set to end of day local
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      23,
      59,
      59
    ).toISOString();
  }
}

function parseICS(icsText: string): any[] {
  // 1. Unfold lines (RFC 5545 specifies that long lines are split with a CRLF followed by a space/tab)
  const unfoldedText = icsText.replace(/\r?\n[ \t]/g, '');

  const events: any[] = [];
  const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let match;

  while ((match = eventRegex.exec(unfoldedText)) !== null) {
    const eventContent = match[1];
    
    // Parse basic tags using multi-line matching
    const summaryMatch = /SUMMARY:(.*)/.exec(eventContent);
    const descriptionMatch = /DESCRIPTION:([\s\S]*?)(?=\r?\n[A-Z\-]+[:;])/.exec(eventContent);
    const dtstartMatch = /DTSTART;?([^:]*):(.*)/.exec(eventContent);
    const dtendMatch = /DTEND;?([^:]*):(.*)/.exec(eventContent);
    const uidMatch = /UID:(.*)/.exec(eventContent);
    const urlMatch = /URL:(.*)/.exec(eventContent);

    const uid = uidMatch ? uidMatch[1].trim() : Math.random().toString(36).substring(7);
    const summary = summaryMatch ? summaryMatch[1].trim() : 'Kegiatan Moodle';
    
    // Moodle summary formatting helper: e.g. "Tugas 3 is due" -> "Tugas 3"
    let title = summary;
    if (summary.endsWith(' is due')) {
      title = summary.substring(0, summary.length - 7);
    }

    let description = '';
    if (descriptionMatch) {
      description = descriptionMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\,/g, ',')
        .replace(/\\;/g, ';')
        .trim();
    }

    // Try to extract course name from description if available
    let courseName = 'Kuliah2 ITERA';
    const courseRegex = /Course: (.*)/i;
    const courseMatch = courseRegex.exec(description);
    if (courseMatch) {
      courseName = courseMatch[1].trim();
    }

    const dateRaw = dtendMatch ? dtendMatch[2] : (dtstartMatch ? dtstartMatch[2] : '');
    const dueDate = dateRaw ? parseIcalDate(dateRaw) : null;
    const link = urlMatch ? urlMatch[1].trim() : 'https://kuliah2.itera.ac.id/';

    events.push({
      id: `itera-${uid}`,
      title,
      description,
      courseId: 'itera-moodle',
      courseName,
      dueDate,
      link,
      status: 'todo'
    });
  }

  return events;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Secure server-side fetch to bypass CORS
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Antugas Academic Assistant/1.0',
        'Accept': 'text/calendar'
      },
      next: { revalidate: 300 } // Cache feed for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch calendar from source (HTTP ${response.status})` }, { status: 502 });
    }

    const text = await response.text();
    const parsedTasks = parseICS(text);

    return NextResponse.json(parsedTasks);
  } catch (err: any) {
    console.error('iCal feed processing failed:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
