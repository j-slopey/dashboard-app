import { useCallback, useEffect, useState } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

type LocationSource = 'geolocation' | 'ip' | null;

type LocationStatus = 'idle' | 'loading' | 'ready' | 'error';

interface SystemLocationState {
  coords: Coordinates | null;
  label: string | null;
  source: LocationSource;
  status: LocationStatus;
  error: string | null;
}

interface UseSystemLocationOptions {
  enabled?: boolean;
  timeoutMs?: number;
  ipFallback?: boolean;
}

const IP_LOOKUP_ENDPOINT = 'https://ipapi.co/json/';

export const useSystemLocation = (
  { enabled = true, timeoutMs = 7000, ipFallback = true }: UseSystemLocationOptions = {}
) => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<SystemLocationState>(() => ({
    coords: null,
    label: null,
    source: null,
    status: enabled ? 'loading' : 'idle',
    error: null,
  }));

  useEffect(() => {
    if (!enabled) {
      setState({ coords: null, label: null, source: null, status: 'idle', error: null });
      return;
    }

    let canceled = false;
    const abortController = new AbortController();

    const setPartialState = (update: Partial<SystemLocationState>) => {
      if (!canceled) {
        setState((prev) => ({ ...prev, ...update }));
      }
    };

    const fetchIpLocation = async (reason?: string) => {
      if (!ipFallback) {
        setPartialState({ status: 'error', error: reason ?? 'Location unavailable', source: null });
        return;
      }

      try {
        setPartialState({ status: 'loading', error: null, source: null });
        const response = await fetch(IP_LOOKUP_ENDPOINT, { signal: abortController.signal });
        if (!response.ok) {
          throw new Error(`IP lookup failed (${response.status})`);
        }
        const data = await response.json();
        if (canceled) {
          return;
        }
        const latitude = Number(data.latitude);
        const longitude = Number(data.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          throw new Error('Received invalid coordinates');
        }
        const regionParts = [data.city, data.region, data.country_name].filter(Boolean);
        setState({
          coords: { latitude, longitude },
          label: regionParts.join(', ') || 'Current Location',
          source: 'ip',
          status: 'ready',
          error: null,
        });
      } catch (error) {
        if (canceled) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        setPartialState({
          status: 'error',
          error: reason ? `${reason} - ${message}` : message,
          source: null,
        });
      }
    };

    const geolocationAvailable = typeof navigator !== 'undefined' && 'geolocation' in navigator;

    if (!geolocationAvailable) {
      fetchIpLocation('Geolocation unavailable');
      return () => {
        canceled = true;
        abortController.abort();
      };
    }

    setState({ coords: null, label: null, source: null, status: 'loading', error: null });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (canceled) {
          return;
        }
        setState({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          label: 'Current Location',
          source: 'geolocation',
          status: 'ready',
          error: null,
        });
      },
      (error) => {
        console.warn('Geolocation request failed, falling back to IP lookup:', error);
        const reason = error.message || 'Location permission denied';
        fetchIpLocation(reason);
      },
      {
        enableHighAccuracy: false,
        timeout: timeoutMs,
        maximumAge: 5 * 60 * 1000,
      }
    );

    return () => {
      canceled = true;
      abortController.abort();
    };
  }, [enabled, timeoutMs, ipFallback, attempt]);

  const retry = useCallback(() => {
    if (enabled) {
      setAttempt((prev) => prev + 1);
    }
  }, [enabled]);

  return { ...state, retry };
};
