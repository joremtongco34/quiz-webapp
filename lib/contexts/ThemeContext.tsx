'use client';

import { createContext, useContext, ReactNode } from 'react';

type Theme = 'flat' | 'colorful';

const ThemeContext = createContext<Theme>('flat');

export function ThemeProvider({ children }: { children: ReactNode }) {
  // NEXT_PUBLIC_ env vars are available in client components in Next.js
  const theme = (process.env.NEXT_PUBLIC_DESIGN_THEME as Theme) || 'flat';
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
