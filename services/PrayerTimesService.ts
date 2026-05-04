import * as Location from 'expo-location';

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface PrayerTimesResult {
  times: PrayerTimes;
  city: string;
  country: string;
  date: string;
  method: number;
  latitude: number;
  longitude: number;
}

// Calculation methods
export const PRAYER_METHODS: Record<number, string> = {
  2:  'Union Monde Musulman',
  3:  'ISNA (Amérique du Nord)',
  4:  'Ligue Islamique Mondiale',
  5:  'UOIF (France)',
  12: 'Union des Organisations Islamiques de France',
};

const BASE_URL = 'https://api.aladhan.com/v1';

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; country: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'fr' } }
    );
    const data = await res.json();
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.municipality ||
      'Localisation';
    const country = data.address?.country || '';
    return { city, country };
  } catch {
    return { city: 'Localisation', country: '' };
  }
}

export async function fetchPrayerTimes(method: number = 12): Promise<PrayerTimesResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Localisation refusée');

  const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const { latitude, longitude } = loc.coords;

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

  const url = `${BASE_URL}/timings/${Math.floor(Date.now() / 1000)}?latitude=${latitude}&longitude=${longitude}&method=${method}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur API Aladhan');
  const json = await res.json();

  if (json.code !== 200) throw new Error(json.status || 'Erreur API');

  const timings = json.data.timings as PrayerTimes;
  const { city, country } = await reverseGeocode(latitude, longitude);

  return {
    times: {
      Fajr: timings.Fajr,
      Sunrise: timings.Sunrise,
      Dhuhr: timings.Dhuhr,
      Asr: timings.Asr,
      Maghrib: timings.Maghrib,
      Isha: timings.Isha,
    },
    city,
    country,
    date: dateStr,
    method,
    latitude,
    longitude,
  };
}

export function getNextPrayer(times: PrayerTimes): { name: string; arabicName: string; time: string; minutesLeft: number } {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { name: 'Fajr',    arabicName: 'الفجر',    time: times.Fajr    },
    { name: 'Dhuhr',   arabicName: 'الظهر',    time: times.Dhuhr   },
    { name: 'Asr',     arabicName: 'العصر',    time: times.Asr     },
    { name: 'Maghrib', arabicName: 'المغرب',   time: times.Maghrib },
    { name: 'Isha',    arabicName: 'العشاء',   time: times.Isha    },
  ];

  for (const prayer of prayers) {
    const [h, m] = prayer.time.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    if (prayerMinutes > currentMinutes) {
      return { ...prayer, minutesLeft: prayerMinutes - currentMinutes };
    }
  }

  // After Isha → next is Fajr tomorrow
  const [h, m] = times.Fajr.split(':').map(Number);
  const fajrMinutes = h * 60 + m;
  return {
    name: 'Fajr',
    arabicName: 'الفجر',
    time: times.Fajr,
    minutesLeft: 1440 - currentMinutes + fajrMinutes,
  };
}

export function getCurrentPrayer(times: PrayerTimes): string {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { name: 'Fajr',    time: times.Fajr    },
    { name: 'Sunrise', time: times.Sunrise  },
    { name: 'Dhuhr',   time: times.Dhuhr   },
    { name: 'Asr',     time: times.Asr     },
    { name: 'Maghrib', time: times.Maghrib },
    { name: 'Isha',    time: times.Isha    },
  ];

  let current = 'Isha';
  for (const prayer of prayers) {
    const [h, m] = prayer.time.split(':').map(Number);
    if (h * 60 + m <= currentMinutes) {
      current = prayer.name;
    }
  }
  return current;
}
