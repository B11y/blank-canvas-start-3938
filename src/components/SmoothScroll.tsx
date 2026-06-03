import { useEffect } from 'react';
import Lenis from 'lenis';
import { useDesktop } from '@/hooks/useDesktop';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function SmoothScroll() {
  const isDesktop = useDesktop(1024);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isDesktop || reducedMotion) return;

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isDesktop, reducedMotion]);

  return null;
}
