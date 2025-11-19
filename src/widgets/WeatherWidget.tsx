import { describeWeatherCode, useWeather } from '../hooks/useWeather';

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  locationLabel?: string;
}

const formatTemperature = (value: number) => `${Math.round(value)}°F`;

export const WeatherWidget = ({ latitude, longitude, locationLabel }: WeatherWidgetProps) => {
  const { data, isLoading, error } = useWeather({ latitude, longitude });

  if (isLoading) {
    return <p className="text-gray-400">Fetching weather...</p>;
  }

  if (error || !data) {
    return <p className="text-red-300">Unable to load weather data.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {locationLabel && <p className="text-sm uppercase tracking-wide text-gray-400">{locationLabel}</p>}
      <div className="flex items-end gap-3">
        <p className="text-5xl font-bold text-white">{formatTemperature(data.temperature)}</p>
        <p className="text-gray-400">Feels like {formatTemperature(data.apparentTemperature)}</p>
      </div>
      <p className="text-lg text-blue-200">{describeWeatherCode(data.weatherCode)}</p>
      <div className="flex items-center gap-4 text-sm text-gray-300">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Humidity</p>
          <p className="text-white font-semibold">{data.humidity}%</p>
        </div>
      </div>
    </div>
  );
};
