import React, { createContext, useContext } from 'react';
import { useNightMode, NightModeState } from '@/hooks/useNightMode';

const NightModeContext = createContext<NightModeState>({
  isNightMode: false,
  isAutoEnabled: true,
  timerMinutes: null,
  toggleManual: () => {},
  setAutoEnabled: () => {},
  setTimer: () => {},
});

export function NightModeProvider({ children }: { children: React.ReactNode }) {
  const state = useNightMode();
  return (
    <NightModeContext.Provider value={state}>
      {children}
    </NightModeContext.Provider>
  );
}

export function useNightModeContext() {
  return useContext(NightModeContext);
}
