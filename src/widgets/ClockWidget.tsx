import { useEffect, useMemo, useState } from 'react';

interface ClockWidgetProps {
  timezone?: string;
  locale?: string;
}

const buildFormatter = (timezone?: string, locale?: string) =>
  new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    hourCycle: 'h12',
    timeZone: timezone,
  });

const buildDateFormatter = (timezone?: string, locale?: string) =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  });

export const ClockWidget = ({ timezone, locale }: ClockWidgetProps) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeFormatter = useMemo(() => buildFormatter(timezone, locale), [timezone, locale]);
  const dateFormatter = useMemo(() => buildDateFormatter(timezone, locale), [timezone, locale]);

  return (
    <div className="flex flex-col gap-2 text-start">
      <p className="text-3xl font-mono text-white">{timeFormatter.format(now)}</p>
      <p className="text-gray-300">{dateFormatter.format(now)}</p>
      {timezone && <p className="text-xs uppercase tracking-wide text-gray-500">{timezone}</p>}
    </div>
  );
};
