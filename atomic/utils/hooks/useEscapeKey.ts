import { useEffect } from '../../.deps.ts';

export function useEscapeKey(onEscape: () => void) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onEscape();
      }
    }

    addEventListener('keydown', handleKey);
    return () => removeEventListener('keydown', handleKey);
  }, [onEscape]);
}
