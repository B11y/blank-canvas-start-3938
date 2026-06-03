import { useEffect, useState } from 'react';

export function usePointerFine() {
  const [pointerFine, setPointerFine] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setPointerFine(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return pointerFine;
}
