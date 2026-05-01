// Simple synchronous key-value store backed by a module-level map.
// On native this would be replaced with AsyncStorage; for web localStorage would work,
// but keeping this simple and universal so it works in all environments.
const store: Record<string, string> = {};

export const AsyncStorage_like = {
  get(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return store[key] ?? null;
  },
  set(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    } else {
      store[key] = value;
    }
  },
  remove(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    } else {
      delete store[key];
    }
  },
};
