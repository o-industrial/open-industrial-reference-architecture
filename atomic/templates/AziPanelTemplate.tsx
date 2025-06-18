import { ComponentChildren, JSX } from '../.deps.ts';
import { Action, ActionStyleTypes } from '../atoms/Action.tsx';

export function AziPanelTemplate({
  children,
  input,
  onClose,
}: {
  children?: ComponentChildren;
  input?: ComponentChildren;
  onClose?: () => void;
}): JSX.Element {
  return (
    <aside class='relative w-full h-full flex flex-col bg-neutral-900'>
      {/* Sticky Header */}
      <header class='sticky top-0 z-10 w-full px-4 py-2 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between'>
        <h2 class='text-sm font-semibold tracking-wide text-white uppercase'>
          Azi’s Understanding
        </h2>

        {onClose && (
          <Action
            onClick={onClose}
            styleType={ActionStyleTypes.Icon}
            title='Close Panel'
          >
            ✕
          </Action>
        )}
      </header>

      {/* Scrollable Message History */}
      <div class='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent px-4 py-3 flex flex-col gap-3'>
        {children}
      </div>

      {/* Input Area (Sticky Footer) */}
      {input && (
        <footer class='border-t border-neutral-800 px-4 py-3 bg-neutral-900 sticky bottom-0 z-10'>
          {input}
        </footer>
      )}
    </aside>
  );
}
