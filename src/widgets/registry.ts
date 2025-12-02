import { ClockWidget } from './ClockWidget';
import { MediaControlWidget } from './MediaControlWidget';
import { SystemVolumeWidget } from './SystemVolumeWidget';
import { WeatherWidget } from './WeatherWidget';
import { WidgetConfig } from './types';

const toNumber = (value: string | undefined) => {
  if (!value?.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const envWeatherLat = toNumber(import.meta.env.VITE_WEATHER_LAT);
const envWeatherLon = toNumber(import.meta.env.VITE_WEATHER_LON);
const envWeatherLabel = import.meta.env.VITE_WEATHER_LOCATION?.trim();
const clockTimezone = import.meta.env.VITE_CLOCK_TIMEZONE?.trim();

const hasManualWeather = envWeatherLat !== undefined && envWeatherLon !== undefined;

interface WidgetDependencies {
  token: string;
  requestSpotifyAuth: () => Promise<void> | void;
}

export const buildWidgetConfigs = ({ token, requestSpotifyAuth }: WidgetDependencies): WidgetConfig[] => [
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
    props: clockTimezone ? { timezone: clockTimezone } : {},
  },
  {
    id: 'weather',
    title: 'Weather',
    size: 'medium',
    component: WeatherWidget,
    props: {
      ...(hasManualWeather
        ? {
            latitude: envWeatherLat,
            longitude: envWeatherLon,
          }
        : {}),
      ...(envWeatherLabel ? { locationLabel: envWeatherLabel } : {}),
    },
  },
  {
    id: 'media-control',
    title: 'Spotify',
    size: 'large',
    component: MediaControlWidget,
    props: {
      token,
      onConnect: requestSpotifyAuth,
    },
    bodyClassName: 'items-center text-center',
  },
];
