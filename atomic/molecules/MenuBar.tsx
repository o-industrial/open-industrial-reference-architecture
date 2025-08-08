import { classSet, JSX, useState } from '../.deps.ts';
import { FlyoutMenu, MenuActionItem, MenuRoot } from './FlyoutMenu.tsx';

export type MenuBarProps = {
  menus: MenuRoot[];
  onMenuOption: (item: MenuActionItem) => void;
};

export function MenuBar({ menus, onMenuOption }: MenuBarProps): JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div class="-:relative -:flex -:items-center -:gap-3">
      {menus.map((m) => (
        <div key={m.id} class="-:relative">
          <button
            class={classSet([
              '-:px-1 -:py-0.5 -:text-neutral-300 -:hover:text-white',
              openId === m.id ? '-:underline' : '',
            ])}
            onClick={() => setOpenId(openId === m.id ? null : m.id)}
          >
            {m.label}
          </button>

          {openId === m.id && (
            <div class="-:absolute -:left-0 -:top-full">
              <FlyoutMenu
                items={m.items}
                onPick={(item) => {
                  setOpenId(null);
                  onMenuOption(item);
                }}
                onRequestClose={() => setOpenId(null)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
