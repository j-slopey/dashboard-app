import { useEffect, useState } from 'react';

export interface WeatherOptions {
  latitude: number;
  longitude: number;
  refreshIntervalMs?: number;
}

interface WeatherResponse {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  weatherCode: number;
  windSpeed?: number;
}

interface WeatherState {
  data: WeatherResponse | null;
  isLoading: boolean;
  error: string | null;
}

const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Heavy showers',
  95: 'Thunderstorm',
};

export const describeWeatherCode = (code: number) =>
  WEATHER_DESCRIPTIONS[code] ?? 'Unknown conditions';

export const useWeather = ({ latitude, longitude, refreshIntervalMs = 5 * 60 * 1000 }: Partial<WeatherOptions>) => {
  const [state, setState] = useState<WeatherState>({ data: null, isLoading: true, error: null });

  useEffect(() => {
    if (latitude === undefined || longitude === undefined) {
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchWeather = async () => {
      // Only set `isLoading` when no data is yet available (initial load).
      setState((prev) => ({ ...prev, isLoading: prev.data == null, error: null }));
      const url = new URL('https://api.open-meteo.com/v1/forecast');
      url.searchParams.set('latitude', latitude.toString());
      url.searchParams.set('longitude', longitude.toString());
      url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,windspeed_10m');
      // ensure wind speed units match temperature unit preference (mph)
      url.searchParams.set('windspeed_unit', 'mph');
      url.searchParams.set('temperature_unit', 'fahrenheit');
      url.searchParams.set('timezone', 'auto');

      try {
        const response = await fetch(url.toString(), { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Weather request failed (${response.status})`);
        }
        const payload = await response.json();
        const current = payload.current;
        const data: WeatherResponse = {
          temperature: current.temperature_2m,
          apparentTemperature: current.apparent_temperature,
          humidity: current.relative_humidity_2m,
          weatherCode: current.weather_code,
          windSpeed: current.windspeed_10m,
        };
        if (isMounted) {
          // only update state if the weather data is meaningfully different
          setState((prev) => {
            const prevData = prev.data;
            const equal =
              prevData &&
              prevData.temperature === data.temperature &&
              prevData.apparentTemperature === data.apparentTemperature &&
              prevData.humidity === data.humidity &&
              prevData.weatherCode === data.weatherCode &&
              (prevData.windSpeed === data.windSpeed || (prevData.windSpeed == null && data.windSpeed == null));

            if (equal) {
              // no change — keep existing data, but ensure isLoading false and error cleared
              return { ...prev, isLoading: false, error: null };
            }
            return { data, isLoading: false, error: null };
          });
        }
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          setState({ data: null, isLoading: false, error: message });
        }
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, refreshIntervalMs);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [latitude, longitude, refreshIntervalMs]);

  return state;
};
