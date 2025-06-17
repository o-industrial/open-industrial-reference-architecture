import { ComponentChildren, JSX } from '../.deps.ts';

export default function TimelinePanelTemplate({
  children,
  header,
  footer,
}: {
  children?: ComponentChildren;
  header?: ComponentChildren;
  footer?: ComponentChildren;
}): JSX.Element {
  return (
    <aside class='relative w-full h-full flex flex-col bg-neutral-900'>
      {/* Sticky Header */}
      <header class='sticky top-0 z-10 w-full px-4 py-2 bg-neutral-800 border-b border-neutral-700'>
        {header ?? (
          <h2 class='text-sm font-semibold tracking-wide text-white uppercase'>
            Execution Timeline
          </h2>
        )}
      </header>

      {/* Horizontal Scroll Timeline */}
      <div class='flex-1 overflow-x-auto overflow-y-hidden px-4 py-3 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent'>
        {children}
      </div>

      {/* Optional Footer */}
      {footer && (
        <footer class='border-t border-neutral-800 px-4 py-2 bg-neutral-900 sticky bottom-0 z-10'>
          {footer}
        </footer>
      )}
    </aside>
  );
}
