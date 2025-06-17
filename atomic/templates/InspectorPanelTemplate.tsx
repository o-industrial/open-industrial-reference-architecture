import { ComponentChildren, JSX } from '../.deps.ts';

export default function InspectorPanelTemplate({
  children,
  onClose: _onClose,
}: {
  children?: ComponentChildren;
  onClose?: () => void;
}): JSX.Element {
  return (
    <aside class='relative w-full h-full flex flex-col bg-neutral-900'>
      {/* Sticky Header */}
      <header class='sticky top-0 w-full px-4 py-2 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between'>
        <h2 class='text-sm font-semibold tracking-wide text-white uppercase'>
          Inspector
        </h2>

        {
          /* {onClose && (
          <Action
            onClick={onClose}
            styleType={ActionStyleTypes.Icon}
            title="Close Inspector"
          >
            ✕
          </Action>
        )} */
        }
      </header>

      {/* Scrollable Content */}
      <div class='flex-1 overflow-y-hidden px-4 py-3 flex flex-col gap-4'>
        {children}
      </div>
    </aside>
  );
}
