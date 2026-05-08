import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFormPersist<TFieldValues extends Record<string, any>>(
  form: UseFormReturn<TFieldValues>,
  storageKey: string = 'audit-form-state'
) {
  // Load state on mount
  useEffect(() => {
    const savedState = localStorage.getItem(storageKey);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // We use reset to set the initial values without triggering dirty state unnecessarily
        // But since we want to resume, we set it as the current values
        form.reset(parsed);
      } catch (e) {
        console.error('Failed to parse form state from localStorage', e);
      }
    }
  }, [form, storageKey]);

  // Save state on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(storageKey, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form, storageKey]);

  const clearPersistedState = () => {
    localStorage.removeItem(storageKey);
  };

  return { clearPersistedState };
}
