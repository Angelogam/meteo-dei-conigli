import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook that provides staggered entrance animation for lists
 */
export function useStaggerAnimation(
  itemCount: number,
  baseDelay = 50,
  enabled = true
) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled) {
      const all = new Set<number>();
      for (let i = 0; i < itemCount; i++) all.add(i);
      setVisibleItems(all);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < itemCount; i++) {
      const timer = setTimeout(() => {
        setVisibleItems((prev) => {
          const next = new Set(prev);
          next.add(i);
          return next;
        });
      }, baseDelay * i);
      timers.push(timer);
    }

    return () => timers.forEach(clearTimeout);
  }, [itemCount, baseDelay, enabled]);

  return { visibleItems };
}

/**
 * Hook for element entrance animation (intersection observer)
 */
export function useInViewAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/**
 * Hook that animates a numeric value from 0 to target
 */
export function useAnimatedNumber(target: number, duration = 600, enabled = true) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setDisplayValue(target);
      return;
    }

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (target - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, enabled]);

  return displayValue;
}
