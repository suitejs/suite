import React, { useCallback, useRef } from 'react';

export default function useFocus<E extends HTMLElement>(elementRef: React.MutableRefObject<E>) {
  // When grabbing focus, keep track of previous activeElement
  // so that we can return focus later
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Focus the element itself
  const grab = useCallback(() => {
    requestAnimationFrame(() => {
      if (document.activeElement !== elementRef.current) {
        previousActiveElementRef.current = document.activeElement as HTMLElement;
        elementRef.current?.focus();
      }
    });
  }, [elementRef]);

  // Return focus to previous active element
  const release = useCallback((options?: FocusOptions) => {
    requestAnimationFrame(() => {
      previousActiveElementRef.current?.focus(options);
    });
  }, []);

  return { grab, release };
}
