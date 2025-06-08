// app/ThemeInitializer.tsx
'use client';

import { useEffect } from 'react';

export default function ThemeInitializer() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return null; // This component doesn't need to render anything
}
