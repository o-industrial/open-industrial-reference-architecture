// molecules/FlyoutMenu.tsx
import { classSet, JSX, useEffect, useRef } from '../.deps.ts';

// types/menu.ts
export type MenuSeparator = { type: 'separator'; id: string };

export type MenuActionItem = {
  type: 'item';
  id: string;
  label: string;
  iconSrc?: string;
  shortcut?: string;         // e.g. "⌘S"
  disabled?: boolean;
  checked?: boolean;         // for View toggles
  payload?: Record<string, unknown>; // arbitrary info for onMenuOption
};

export type MenuSubmenu = {
  type: 'submenu';
  id: string;
  label: string;
  iconSrc?: string;
  items: MenuNode[];
};

export type MenuNode = MenuSeparator | MenuActionItem | MenuSubmenu;

export type MenuRoot = {
  id: string;        // "file" | "view" | future
  label: string;     // "File" | "View"
  items: MenuNode[]; // recursive
};

export type FlyoutMenuProps = {
  items: MenuNode[];
  level?: number;
  onPick: (item: MenuActionItem) => void;
  onRequestClose: () => void;
  alignRight?: boolean;
};

export function FlyoutMenu({
  items,
  level = 0,
  onPick,
  onRequestClose,
  alignRight,
}: FlyoutMenuProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onRequestClose();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [onRequestClose]);

  return (
    <div
      ref={ref}
      role="menu"
      class={classSet([
        '-:absolute -:z-50 -:min-w-44 -:bg-neutral-900 -:border -:border-neutral-800 -:rounded-md -:shadow-lg',
        '-:py-1 -:text-sm',
        level === 0 ? '-:mt-2' : '-:ml-0',
      ])}
      style={{
        left: alignRight ? 'auto' : '0',
        right: alignRight ? '0' : 'auto',
      }}
    >
      {items.map((n) => {
        if (n.type === 'separator') {
          return <div key={n.id} class="-:my-1 -:border-t -:border-neutral-800" />;
        }

        if (n.type === 'submenu') {
          return <SubmenuRow key={n.id} node={n} onPick={onPick} />;
        }

        // action item
        const item = n as MenuActionItem;
        return (
          <button
            key={item.id}
            role="menuitem"
            disabled={item.disabled}
            onClick={() => !item.disabled && onPick(item)}
            class={classSet([
              '-:w-full -:px-3 -:py-1.5 -:flex -:items-center -:gap-2 -:text-left',
              item.disabled
                ? '-:text-neutral-600'
                : '-:hover:bg-neutral-800 -:text-neutral-200',
            ])}
          >
            {item.iconSrc && <img src={item.iconSrc} class="-:w-4 -:h-4" alt="" />}

            <span class="-:flex-1 -:truncate">
              {item.checked ? '✓ ' : ''}{item.label}
            </span>

            {item.shortcut && (
              <span class="-:text-xs -:text-neutral-500">{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SubmenuRow({
  node,
  onPick,
}: {
  node: MenuSubmenu;
  onPick: (item: MenuActionItem) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={rowRef} class="-:relative">
      <div
        class="-:px-3 -:py-1.5 -:flex -:items-center -:gap-2 -:justify-between -:hover:bg-neutral-800 -:cursor-default"
        role="menuitem"
        aria-haspopup
      >
        <div class="-:flex -:items-center -:gap-2">
          {node.iconSrc && <img src={node.iconSrc} class="-:w-4 -:h-4" alt="" />}
          <span>{node.label}</span>
        </div>
        <span class="-:text-neutral-500">▶</span>
      </div>

      {/* nested */}
      <div
        ref={flyRef}
        class="-:absolute -:top-0 -:left-full -:ml-1"
      >
        <FlyoutMenu
          items={node.items}
          level={1}
          onPick={onPick}
          onRequestClose={() => {/* submenu closes with parent */}}
        />
      </div>
    </div>
  );
}
