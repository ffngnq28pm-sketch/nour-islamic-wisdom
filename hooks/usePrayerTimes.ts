import { useState, useEffect, useCallback } from 'react';
import { AsyncStorage_like } from '@/context/storage';
import { fetchPrayerTimes, getNextPrayer, getCurrentPrayer, PrayerTimesResult } from '@/services/PrayerTimesService';

const CACHE_KEY = 'nour_prayer_times_v1';
const METHOD_KEY = 'nour_prayer_method_v1';
const DEFAULT_METHOD = 12;

interface CachedTimes {
  result: PrayerTimesResult;
  cachedAt: number;
  dateStr: string;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function usePrayerTimes() {
  const [data, setData] = useState<PrayerTimesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethodState] = useState<number>(
    Number(AsyncStorage_like.get(METHOD_KEY) || DEFAULT_METHOD)
  );

  const load = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const cached = AsyncStorage_like.get(CACHE_KEY);
      if (cached && !forceRefresh) {
        const parsed: CachedTimes = JSON.parse(cached);
        if (parsed.dateStr === todayStr()) {
          setData(parsed.result);
          setLoading(false);
          return;
        }
      }
      const result = await fetchPrayerTimes(method);
      const toCache: CachedTimes = { result, cachedAt: Date.now(), dateStr: todayStr() };
      AsyncStorage_like.set(CACHE_KEY, JSON.stringify(toCache));
      setData(result);
    } catch (e: any) {
      setError(e.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [method]);

  useEffect(() => { load(); }, []);

  const setMethod = useCallback((m: number) => {
    setMethodState(m);
    AsyncStorage_like.set(METHOD_KEY, String(m));
    load(true);
  }, [load]);

  const nextPrayer = data ? getNextPrayer(data.times) : null;
  const currentPrayer = data ? getCurrentPrayer(data.times) : null;

  return { data, loading, error, reload: () => load(true), method, setMethod, nextPrayer, currentPrayer };
}
