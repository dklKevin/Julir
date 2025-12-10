/**
 * Custom hook for localStorage with React state synchronization.
 * Provides type-safe access to localStorage with automatic serialization.
 */

import { useState, useEffect, useCallback } from 'react';
import { safeJsonParse } from '../utils/textUtils';

/**
 * Hook for managing localStorage values with React state.
 * @param key - localStorage key
 * @param initialValue - Default value if key doesn't exist
 * @returns Tuple of [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Initialize state with value from localStorage or initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    const item = localStorage.getItem(key);
    return item !== null ? safeJsonParse<T>(item, initialValue) : initialValue;
  });

  // Update localStorage when state changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prevValue) => {
        const newValue = value instanceof Function ? value(prevValue) : value;

        if (typeof window !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(newValue));
        }

        return newValue;
      });
    },
    [key]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
    setStoredValue(initialValue);
  }, [key, initialValue]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        setStoredValue(safeJsonParse<T>(event.newValue, initialValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Simplified hook for string values in localStorage.
 * @param key - localStorage key
 * @param initialValue - Default value
 */
export function useLocalStorageString(
  key: string,
  initialValue: string = ''
): [string, (value: string) => void] {
  const [value, setValue] = useLocalStorage<string>(key, initialValue);
  return [value, setValue];
}
