import { useEffect, useState } from 'react';

export function useDesktop(minWidth = 1024) {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia(`(min-width: ${minWidth}px)`);
    const update = () => setDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, [minWidth]);

  return desktop;
}
