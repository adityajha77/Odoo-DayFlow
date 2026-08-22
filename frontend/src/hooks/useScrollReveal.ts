import { useEffect, useRef } from 'react';

/**
 * Applies scroll-based reveal animations to elements with the `.reveal` class.
 * Sets `data-visible="true"` when an element enters the viewport.
 * Respects `prefers-reduced-motion: reduce` — immediately reveals all elements.
 */
export function useScrollReveal(containerRef: React.RefObject<HTMLElement | null>) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const elements = container.querySelectorAll('.reveal');

    if (prefersReducedMotion) {
      // Immediately show all elements if user prefers reduced motion
      elements.forEach((el) => {
        el.setAttribute('data-visible', 'true');
      });
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', 'true');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [containerRef]);
}

/**
 * Hook to animate a number counting up from 0 to a target value.
 * Returns the current animated value.
 */
export function useCountUp(target: number, isVisible: boolean, duration = 1500): number {
  const ref = useRef(0);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const currentRef = useRef(0);

  useEffect(() => {
    if (!isVisible) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      ref.current = target;
      currentRef.current = target;
      return;
    }

    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      currentRef.current = Math.round(eased * target);
      ref.current = currentRef.current;

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [isVisible, target, duration]);

  return ref.current;
}
