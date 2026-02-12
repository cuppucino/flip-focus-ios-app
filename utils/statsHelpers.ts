import { FocusSession } from '../storage/sessionStorage';

// Get start of day (midnight) for a given timestamp
const get_start_of_day = (timestamp: number): number => {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

// Get today's sessions
export const get_today_sessions = (sessions: FocusSession[]): FocusSession[] => {
  const today_start = get_start_of_day(Date.now());
  return sessions.filter((s) => s.startTime >= today_start);
};

// Calculate total focus seconds for a set of sessions
export const get_total_seconds = (sessions: FocusSession[]): number => {
  return sessions.reduce((sum, s) => sum + s.duration, 0);
};

// Get longest session duration from a set
export const get_longest_session = (sessions: FocusSession[]): number => {
  if (sessions.length === 0) return 0;
  return Math.max(...sessions.map((s) => s.duration));
};

// Calculate current streak (consecutive days with at least 1 session)
export const get_streak = (sessions: FocusSession[]): number => {
  if (sessions.length === 0) return 0;

  const unique_days = new Set<string>();
  sessions.forEach((s) => {
    unique_days.add(new Date(s.startTime).toDateString());
  });

  const sorted_days = Array.from(unique_days)
    .map((d) => new Date(d).getTime())
    .sort((a, b) => b - a); // most recent first

  let streak = 0;
  const today = get_start_of_day(Date.now());
  const one_day = 86400000;

  // Check if today or yesterday has a session (streak must be current)
  const most_recent = sorted_days[0];
  if (most_recent < today - one_day) return 0; // streak broken

  for (let i = 0; i < sorted_days.length; i++) {
    const expected_day = today - i * one_day;
    // Allow starting from yesterday if today has no session yet
    const adjusted_day = most_recent < today ? today - one_day - i * one_day : expected_day;

    if (sorted_days[i] === adjusted_day) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// Get focus minutes per day for the last 7 days
export interface DailyFocus {
  label: string;    // day abbreviation e.g. "Mon"
  minutes: number;  // total focus minutes
  date: string;     // date string for comparison
}

export const get_weekly_data = (sessions: FocusSession[]): DailyFocus[] => {
  const days: DailyFocus[] = [];
  const day_names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const day_start = date.getTime();
    const day_end = day_start + 86400000;

    const day_sessions = sessions.filter(
      (s) => s.startTime >= day_start && s.startTime < day_end
    );

    const total_seconds = day_sessions.reduce((sum, s) => sum + s.duration, 0);

    days.push({
      label: day_names[date.getDay()],
      minutes: Math.round(total_seconds / 60),
      date: date.toDateString(),
    });
  }

  return days;
};

// Format seconds to readable string: "1h 25m" or "45m" or "30s"
export const format_duration = (total_seconds: number): string => {
  const hours = Math.floor(total_seconds / 3600);
  const minutes = Math.floor((total_seconds % 3600) / 60);
  const seconds = total_seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

// Format seconds to HH:MM:SS or MM:SS
export const format_timer = (total_seconds: number): string => {
  const hours = Math.floor(total_seconds / 3600);
  const minutes = Math.floor((total_seconds % 3600) / 60);
  const seconds = total_seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${minutes}:${pad(seconds)}`;
};

// Group sessions by date string for display
export const group_sessions_by_date = (sessions: FocusSession[]): Map<string, FocusSession[]> => {
  const grouped = new Map<string, FocusSession[]>();

  sessions.forEach((s) => {
    const key = new Date(s.startTime).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(s);
  });

  return grouped;
};
