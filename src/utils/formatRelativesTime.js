import {
  format,
  formatDistanceToNowStrict,
  isToday,
  isYesterday,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const GERMANY_TZ = 'Europe/Berlin';

export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const germanyDate = toZonedTime(date, GERMANY_TZ);

  if (isToday(germanyDate)) {
    const minutesAgo = differenceInMinutes(new Date(), germanyDate);

    if (minutesAgo < 1) return 'just now';
    if (minutesAgo < 5) return `${minutesAgo} minutes ago`;

    return format(germanyDate, 'HH:mm');
  }

  if (isYesterday(germanyDate)) return 'yesterday';

  const daysAgo = differenceInDays(new Date(), germanyDate);
  const weeksAgo = differenceInWeeks(new Date(), germanyDate);
  const monthsAgo = differenceInMonths(new Date(), germanyDate);
  const yearsAgo = differenceInYears(new Date(), germanyDate);

  if (daysAgo < 7) return `${daysAgo} days ago`;
  if (weeksAgo < 5) return `${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
  if (monthsAgo < 12) return `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
  if (yearsAgo < 5) return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;

  // Older than that — show exact German local date
  return format(germanyDate, 'dd MMM yyyy, HH:mm', { locale: undefined });
}
