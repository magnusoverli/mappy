import { useState, useLayoutEffect, useRef, useCallback } from 'react';

export function useAutoWidth(content, dependencies = []) {
  const measureRef = useRef(null);
  const [width, setWidth] = useState('auto');
  const resizeObserverRef = useRef(null);

  const measure = useCallback(() => {
    if (!measureRef.current) return;
    
    // Use getBoundingClientRect for accurate measurement
    const rect = measureRef.current.getBoundingClientRect();
    const contentWidth = measureRef.current.scrollWidth;
    
    // Use the larger of the two measurements
    const measuredWidth = Math.max(rect.width, contentWidth);
    
    // Add padding for Paper component (16px each side) plus buffer
    const totalWidth = Math.ceil(measuredWidth) + 32 + 24;
    
    setWidth(`${totalWidth}px`);
  }, []);

  useLayoutEffect(() => {
    let cancelled = false;

    const performMeasurement = () => {
      if (!cancelled) {
        // Delay measurement to ensure DOM is ready
        requestAnimationFrame(() => {
          if (!cancelled) measure();
        });
      }
    };

    // Initial measurement
    performMeasurement();

    // Wait for fonts to load
    if (document.fonts && typeof document.fonts.ready?.then === 'function') {
      document.fonts.ready.then(() => {
        if (!cancelled) performMeasurement();
      });
    }

    // Set up ResizeObserver for dynamic content changes
    if (measureRef.current && window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver(() => {
        if (!cancelled) performMeasurement();
      });
      resizeObserverRef.current.observe(measureRef.current);
    }

    return () => {
      cancelled = true;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [measure, ...dependencies]);

  // Cleanup on unmount
  useLayoutEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  return { measureRef, width };
}