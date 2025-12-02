import { describeWeatherCode, useWeather } from '../hooks/useWeather';
import { useSystemLocation } from '../hooks/useSystemLocation';

interface WeatherWidgetProps {
  latitude?: number;
  longitude?: number;
  locationLabel?: string;
}

const formatTemperature = (value: number) => `${Math.round(value)}°F`;
const formatWindSpeed = (value: number) => `${Math.round(value)} mph`;

export const WeatherWidget = ({ latitude: propLat, longitude: propLon, locationLabel }: WeatherWidgetProps) => {
  const hasManualCoords = propLat !== undefined && propLon !== undefined;
  const manualCoords = hasManualCoords
    ? { latitude: propLat!, longitude: propLon! }
    : null;
  const systemLocation = useSystemLocation({ enabled: !hasManualCoords });
  const coords = manualCoords ?? systemLocation.coords;
  const locationStatus = hasManualCoords ? 'ready' : systemLocation.status;
  const autoLabel = hasManualCoords ? null : systemLocation.label;
  const displayLabel = locationLabel ?? autoLabel ?? (hasManualCoords ? null : 'Current Location');

  const { data, isLoading, error } = useWeather(
    coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}
  );

  if (!coords) {
    if (locationStatus === 'error') {
      return (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-red-300">Unable to determine your location automatically.</p>
          {systemLocation.error && <p className="text-xs text-red-200">{systemLocation.error}</p>}
          <button
            type="button"
            onClick={systemLocation.retry}
            className="mt-2 rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-200 hover:bg-red-300/10"
          >
            Retry detection
          </button>
        </div>
      );
    }

    return <p className="text-gray-400">Determining your location...</p>;
  }

  // Show the loading text only during the initial fetch (when no data yet exists)
  if (isLoading && !data) {
    return <p className="text-gray-400">Fetching weather...</p>;
  }

  if (error || !data) {
    return <p className="text-red-300">Unable to load weather data.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {displayLabel && (
        <p className="text-sm uppercase tracking-wide text-gray-400">{displayLabel}</p>
      )}
      <div className="flex items-end gap-3">
        <p className="text-5xl font-bold text-white">{formatTemperature(data.temperature)}</p>
        <div className="flex flex-col text-gray-400">
          <p>Feels like {formatTemperature(data.apparentTemperature)}</p>
          {data.windSpeed !== undefined && (
            <p>Wind {formatWindSpeed(data.windSpeed)}</p>
          )}
        </div>
      </div>
      <p className="text-lg text-blue-200">{describeWeatherCode(data.weatherCode)}</p>
    </div>
  );
};
