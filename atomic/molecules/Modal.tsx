import { JSX, classSet, IntentTypes, ComponentChildren } from '../.deps.ts';
import { Action, ActionStyleTypes, useEscapeKey } from '../.exports.ts';

export type ModalProps = {
  title?: ComponentChildren;
  onClose: () => void;
  fullscreen?: boolean;
  children: JSX.Element | JSX.Element[];
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'>;

export function Modal({
  title,
  onClose,
  fullscreen = false,
  children,
  ...props
}: ModalProps): JSX.Element {
  useEscapeKey(onClose);

  return (
    <div
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        class={classSet(
          [
            'relative bg-neutral-900 border border-neutral-700 rounded-md shadow-xl overflow-hidden flex flex-col transition-all',
            fullscreen
              ? 'w-full h-full m-4'
              : 'w-full max-w-5xl max-h-[90vh] m-4',
          ],
          props
        )}
        {...props}
      >
        {/* Header */}
        <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-700">
          <h2 class="text-sm font-bold text-white uppercase tracking-wide w-full">
            {title}
          </h2>
          <Action
            title="Close"
            onClick={onClose}
            intentType={IntentTypes.Error}
            styleType={ActionStyleTypes.Icon}
          >
            ✕
          </Action>
        </div>

        {/* Scrollable Content */}
        <div class="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
