import { useCallback, useEffect, useRef, useState } from 'react';

type KeyboardHandler = (event: React.KeyboardEvent) => void;

interface KeyboardAction {
  key: string;
  handler: KeyboardHandler;
  description?: string;
}

interface UseKeyboardNavigationOptions {
  actions?: KeyboardAction[];
  shouldNavigate?: boolean;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
}

export function useKeyboardNavigation({
  actions = [],
  shouldNavigate = true,
  onArrowUp,
  onArrowDown,
  onEnter,
  onEscape,
}: UseKeyboardNavigationOptions = {}) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      for (const action of actions) {
        if (event.key === action.key) {
          event.preventDefault();
          action.handler(event);
          return;
        }
      }

      if (shouldNavigate) {
        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault();
            onArrowUp?.();
            break;
          case 'ArrowDown':
            event.preventDefault();
            onArrowDown?.();
            break;
          case 'Enter':
            event.preventDefault();
            onEnter?.();
            break;
          case 'Escape':
            event.preventDefault();
            onEscape?.();
            break;
        }
      }
    },
    [actions, shouldNavigate, onArrowUp, onArrowDown, onEnter, onEscape]
  );

  return { handleKeyDown };
}

export function useFocusContainer(itemCount: number, initialIndex = 0) {
  const [focusedIndex, setFocusedIndex] = useState(initialIndex);

  const focusNext = useCallback(() => {
    setFocusedIndex((prev) => (prev + 1) % itemCount);
  }, [itemCount]);

  const focusPrev = useCallback(() => {
    setFocusedIndex((prev) => (prev - 1 + itemCount) % itemCount);
  }, [itemCount]);

  const focusIndex = useCallback((index: number) => {
    setFocusedIndex(Math.max(0, Math.min(index, itemCount - 1)));
  }, [itemCount]);

  return { focusedIndex, focusNext, focusPrev, focusIndex };
}

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

export const focusStyles = {
  default: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  highContrast: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2',
  subtle: 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1',
};