import { ClockWidget } from './ClockWidget';
import { MediaControlWidget } from './MediaControlWidget';
import { SystemVolumeWidget } from './SystemVolumeWidget';
import { WeatherWidget } from './WeatherWidget';
import { WidgetConfig } from './types';

const getEnvNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const weatherLat = getEnvNumber(import.meta.env.VITE_WEATHER_LAT, 40.7128);
const weatherLon = getEnvNumber(import.meta.env.VITE_WEATHER_LON, -74.0060);
const weatherLabel = import.meta.env.VITE_WEATHER_LOCATION ?? 'New York City';
const clockTimezone = import.meta.env.VITE_CLOCK_TIMEZONE || undefined;

interface WidgetDependencies {
  token: string;
}

export const buildWidgetConfigs = ({ token }: WidgetDependencies): WidgetConfig[] => [
  {
    id: 'system-volume',
    title: 'System Volume',
    area: 'sidebar',
    size: 'small',
    component: SystemVolumeWidget,
    cardClassName: 'w-28 h-[420px] flex-shrink-0',
    bodyClassName: 'items-center justify-between h-full',
  },
  {
    id: 'clock',
    title: 'Clock',
    size: 'small',
    component: ClockWidget,
    props: {
      timezone: clockTimezone,
    },
  },
  {
    id: 'weather',
    title: 'Weather',
    size: 'medium',
    component: WeatherWidget,
    props: {
      latitude: weatherLat,
      longitude: weatherLon,
      locationLabel: weatherLabel,
    },
  },
  {
    id: 'media-control',
    title: 'Spotify',
    size: 'large',
    component: MediaControlWidget,
    props: {
      token,
    },
  },
];
